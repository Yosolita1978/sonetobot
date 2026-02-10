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

// Fetch a single poem's text from its individual page
async function fetchPoemText(url: string): Promise<string | null> {
  try {
    const response = await axios.get(url, {
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SonetoBot/1.0)' }
    })

    const html: string = response.data

    // Extract poem content from <p class="ContTextod"...>...</p>
    const poemMatch = html.match(/<p\s+class="ContTextod"[^>]*>([\s\S]*?)<\/p>/i)
    if (!poemMatch) return null

    const poemText = cleanPoemHtml(poemMatch[1])
    const cleaned = stripAttribution(poemText)

    return cleaned.length > 20 ? cleaned : null
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
      const excerpt = await fetchPoemText(link.url)

      if (excerpt) {
        poems.push({
          title: link.title,
          author: link.author,
          excerpt
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
  } catch (err) {
    return { success: false, poemsFound: 0 }
  }
}
