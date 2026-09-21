import axios from 'axios'
import he from 'he'
import { ScrapedPoem } from '@/types/poem'

const BASE_URL = 'https://www.palabravirtual.com'
const MAX_POEMS_PER_SCRAPE = 15
const REQUEST_DELAY_MS = 300

// Clean flat text (for titles and authors only)
function cleanRawText(rawHtml: string): string {
  if (!rawHtml) return ''
  const text = rawHtml.replace(/<[^>]*>/g, '');
  const decoded = he.decode(text);
  return decoded.replace(/\s+/g, ' ').trim();
}

// Convert poem HTML to text preserving line breaks from <br> tags
function cleanPoemHtml(html: string): string {
  if (!html) return ''

  let text = html

  // The HTML source has patterns like: text<br />\n (br tag + source newline)
  // Replace <br> followed by optional whitespace/newline with a single \n
  text = text.replace(/<br\s*\/?>\s*\n?/gi, '\n')

  // Strip remaining HTML tags
  text = text.replace(/<[^>]*>/g, '')

  // Decode HTML entities
  text = he.decode(text)

  // Normalize spaces on each line (but preserve newlines)
  text = text
    .split('\n')
    .map(line => line.replace(/\s+/g, ' ').trim())
    .join('\n')

  // Collapse 3+ consecutive newlines to double (stanza break)
  text = text.replace(/\n{3,}/g, '\n\n')

  // Remove leading/trailing empty lines
  text = text.trim()

  return text
}

// Strip source attribution lines from the end of poem text
// e.g. "De: Gualbet dans le rêve des autres..." or "Poema proporcionado por..."
function stripAttribution(text: string): string {
  const lines = text.split('\n')

  // Walk backwards and remove attribution lines
  while (lines.length > 0) {
    const last = lines[lines.length - 1].trim()
    if (
      last === '' ||
      /^De:\s/i.test(last) ||
      /^Poema\s+proporcionado/i.test(last) ||
      /^Fuente:/i.test(last) ||
      /^Tomado\s+de/i.test(last) ||
      /^\/.*/i.test(last)  // lines starting with / (bilingual title continuations)
    ) {
      lines.pop()
    } else {
      break
    }
  }

  return lines.join('\n').trim()
}

// Poem pages all declare charset=UTF-8, but some are really UTF-8 and others
// are really ISO-8859-1 (Latin-1). Try strict UTF-8 first (it throws on
// invalid bytes), and fall back to Latin-1 when it fails.
function decodeHtml(bytes: ArrayBuffer): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    return Buffer.from(bytes).toString('latin1')
  }
}

// Small delay helper for rate limiting
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Discover poem links from the listing page
async function discoverPoemLinks(): Promise<Array<{ url: string; title: string; author: string }>> {
  const response = await axios.get(`${BASE_URL}/index.php?ir=select_texto.php`, {
    timeout: 20000,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SonetoBot/1.0)' }
  })

  // NOTE: the listing page really is served as UTF-8, so we let axios decode
  // it. Individual poem pages are mixed UTF-8 / Latin-1 (see decodeHtml).
  // Don't switch this to latin1 or titles break.
  const html: string = response.data
  const poems: Array<{ url: string; title: string; author: string }> = []

  // Extract title links: <a class="Conta" href="index.php?ir=ver_texto.php&pid=...&t=...&p=Author+Name">Title</a>
  const linkPattern = /<a[^>]*class="Conta"[^>]*href="(index\.php\?ir=ver_texto\.php[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi
  const links: Array<{ href: string; title: string }> = []
  let linkMatch
  while ((linkMatch = linkPattern.exec(html)) !== null) {
    const href = linkMatch[1]
    const title = cleanRawText(linkMatch[2])
    if (title.length > 1 && !title.includes('►')) {
      links.push({ href, title })
    }
  }

  // Extract author from the URL's p= parameter
  for (const link of links) {
    const authorMatch = link.href.match(/[&?]p=([^&]+)/)
    if (authorMatch) {
      const author = decodeURIComponent(authorMatch[1].replace(/\+/g, ' '))
      poems.push({
        url: `${BASE_URL}/${link.href}`,
        title: link.title,
        author
      })
    }
  }

  return poems
}

// The listing URL has the author without accents ("Sara de Ibanez"), while the
// poem page shows it in capitals with accents ("SARA DE IBÁÑEZ"). Take the
// letters from the page and the capitalization from the URL. If the two names
// don't match letter for letter, keep the URL version.
function addAccentsToAuthor(urlAuthor: string, pageAuthor: string | null): string {
  if (!pageAuthor) return urlAuthor

  const page = pageAuthor.normalize('NFC').replace(/\s+/g, ' ').trim()
  const stripAccents = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

  if (page.length !== urlAuthor.length || stripAccents(page) !== stripAccents(urlAuthor)) {
    return urlAuthor
  }

  let result = ''
  for (let i = 0; i < page.length; i++) {
    const urlChar = urlAuthor[i]
    const isUpper = urlChar !== urlChar.toLowerCase()
    result += isUpper ? page[i].toUpperCase() : page[i].toLowerCase()
  }

  return result.length === urlAuthor.length ? result : urlAuthor
}

// Fetch a single poem's page and extract its text and the author's name
async function fetchPoemPage(url: string): Promise<{ excerpt: string; pageAuthor: string | null } | null> {
  try {
    const response = await axios.get(url, {
      timeout: 15000,
      responseType: 'arraybuffer',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SonetoBot/1.0)' }
    })

    // Fetch raw bytes and pick the right encoding per page (see decodeHtml).
    const html: string = decodeHtml(response.data)

    // Some pages have a dedication or epigraph in its own <p class="ContTextod">
    // block before the poem, so collect every block and join them.
    const blocks = [...html.matchAll(/<p\s+class="ContTextod"[^>]*>([\s\S]*?)<\/p>/gi)]
      .map(match => cleanPoemHtml(match[1]))
      .filter(text => text.length > 0)
    if (blocks.length === 0) return null

    const cleaned = stripAttribution(blocks.join('\n\n'))
    if (cleaned.length <= 20) return null

    // Author appears below the poem as: <p ... class="ContTitulob"><i>SARA DE IBÁÑEZ</i></p>
    const authorMatch = html.match(/class="ContTitulob"[^>]*>\s*<i>([\s\S]*?)<\/i>/i)
    const pageAuthor = authorMatch ? cleanRawText(authorMatch[1]) : null

    return { excerpt: cleaned, pageAuthor }
  } catch (error) {
    console.error(`Failed to fetch poem from ${url}:`, error)
    return null
  }
}

export async function scrapePoems(): Promise<ScrapedPoem[]> {
  try {
    // Phase A: Discover poem links from listing page
    const poemLinks = await discoverPoemLinks()

    if (poemLinks.length === 0) {
      console.error('No poem links found on listing page')
      return []
    }

    // Shuffle and limit to avoid scraping too many pages
    const shuffled = poemLinks.sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, MAX_POEMS_PER_SCRAPE)

    // Phase B: Fetch each poem's individual page
    const poems: ScrapedPoem[] = []

    for (const link of selected) {
      const page = await fetchPoemPage(link.url)

      if (page) {
        poems.push({
          title: link.title,
          author: addAccentsToAuthor(link.author, page.pageAuthor),
          excerpt: page.excerpt,
          url: link.url
        })
      }

      // Rate limit: wait between requests
      await delay(REQUEST_DELAY_MS)
    }

    return poems
  } catch (error: unknown) {
    console.error('Scraping error:', error)
    return []
  }
}

export async function testScraper() {
  try {
    const poems = await scrapePoems()
    return {
      success: poems.length > 0,
      poemsFound: poems.length,
      samplePoem: poems.length > 0 ? poems[0] : null
    }
  } catch {
    return { success: false, poemsFound: 0 }
  }
}
