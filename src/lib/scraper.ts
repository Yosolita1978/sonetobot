import axios from 'axios'
import { parse } from 'node-html-parser'
import { ScrapedPoem } from '@/types/poem'

export async function scrapePoems(): Promise<ScrapedPoem[]> {
  try {
    console.log('🔍 Fetching poems from palabravirtual.com...')
    
    const response = await axios.get('https://www.palabravirtual.com/index.php?ir=select_texto.php', {
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SonetoBot/1.0)'
      }
    })
    
    console.log('📄 HTML fetched, length:', response.data.length)
    console.log('📄 Response type:', typeof response.data)
    console.log('📄 First 200 chars:', response.data.substring(0, 200))
    
    // Parse HTML (we mainly use regex anyway, so basic parsing is fine)
    const root = parse(response.data, {
      comment: false,
      blockTextElements: {
        script: true,
        noscript: true,
        style: true,
        pre: true
      }
    })
    const poems: ScrapedPoem[] = []
    
    const htmlContent = response.data
    
    console.log('🔍 Using step-by-step extraction approach...')
    
    // Step 1: Extract all poem excerpts (the working approach)
    const spanPattern = /<span[^>]*inline-block[^>]*>([\s\S]*?)<\/span>/gi
    const excerpts = []
    let spanMatch
    
    while ((spanMatch = spanPattern.exec(htmlContent)) !== null) {
      const excerpt = spanMatch[1]
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim()
      
      if (excerpt.length > 50) {
        excerpts.push(excerpt)
      }
    }
    
    console.log(`📝 Found ${excerpts.length} valid excerpts`)
    
    // Step 2: Extract titles from the poem title links (fix the pattern)
    const titlePattern = /<a[^>]*class="Conta"[^>]*href="[^"]*ver_texto[^"]*"[^>]*title="[^"]*"[^>]*>\s*<span[^>]*>\s*([^<]+)\s*<\/span>/gi
    const titles = []
    let titleMatch
    
    while ((titleMatch = titlePattern.exec(htmlContent)) !== null) {
      const title = titleMatch[1]
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim()
      
      if (title.length > 3 && !title.includes('►')) {
        titles.push(title)
      }
    }
    
    console.log(`📝 Found ${titles.length} valid titles`)
    
    // Step 3: Extract authors (fix the pattern)
    const authorPattern = /<a[^>]*class="Conta"[^>]*href="[^"]*critzt[^"]*"[^>]*>\s*<b>\s*([^<]+)\s*<\/b><\/a>/gi
    const authors = []
    let authorMatch
    
    while ((authorMatch = authorPattern.exec(htmlContent)) !== null) {
      const author = authorMatch[1]
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim()
      
      if (author.length > 3) {
        authors.push(author)
      }
    }
    
    console.log(`📝 Found ${authors.length} valid authors`)
    
    // Step 4: Match them up (take the minimum count to avoid index errors)
    const poemCount = Math.min(excerpts.length, Math.max(titles.length, authors.length), 25)
    console.log(`📝 Creating ${poemCount} poems`)
    
    for (let i = 0; i < poemCount; i++) {
      const excerpt = excerpts[i]
      const title = titles[i] || excerpt.split(' ').slice(0, 5).join(' ')
      const author = authors[i] || 'Poeta Español'
      
      poems.push({
        title: title.length > 80 ? title.substring(0, 77) + '...' : title,
        author: author,
        // For Mastodon (500 chars), allow longer excerpts (up to 350 chars)
        excerpt: excerpt.length > 350 ? excerpt.substring(0, 347) + '...' : excerpt
      })
      
      console.log(`✅ Poem ${i + 1}: "${title}" by ${author} (excerpt: ${excerpt.length} chars)`)
    }
    
    console.log(`📖 Total poems found: ${poems.length}`)
    
    // If no poems found, return fallback
    if (poems.length === 0) {
      console.log('⚠️ No poems found, using fallback')
      return [{
        title: "Poema de Emergencia",
        author: "Bot de Poesía", 
        excerpt: "En caso de que el scraping falle, aquí tienes un poema de emergencia."
      }]
    }
    
    return poems
    
  } catch (error: unknown) {
    console.error('❌ Scraping error:', error)
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      response: (error as any)?.response ? {
        status: (error as any).response.status,
        statusText: (error as any).response.statusText,
        data: typeof (error as any).response.data === 'string' ? (error as any).response.data.substring(0, 500) : (error as any).response.data
      } : undefined
    })
    
    // Return fallback on error
    return [{
      title: "Poema de Emergencia",
      author: "Bot de Poesía",
      excerpt: "En caso de que el scraping falle, aquí tienes un poema de emergencia para mantener el bot funcionando."
    }]
  }
}

export async function testScraper() {
  try {
    const poems = await scrapePoems()
    return {
      success: true,
      poemsFound: poems.length,
      samplePoem: poems[0]
    }
  } catch (error: unknown) {
    return {
      success: false,
      poemsFound: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}