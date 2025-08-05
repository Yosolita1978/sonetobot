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
    
    // Step 1: Extract all poem excerpts (PRESERVING LINE BREAKS)
    const spanPattern = /<span[^>]*inline-block[^>]*>([\s\S]*?)<\/span>/gi
    const excerpts = []
    let spanMatch
    
    while ((spanMatch = spanPattern.exec(htmlContent)) !== null) {
      // IMPORTANT: Process line breaks BEFORE removing other HTML
      const excerpt = spanMatch[1]
        // First, convert <br> and <br/> tags to newlines
        .replace(/<br\s*\/?>/gi, '\n')
        // Convert </p><p> transitions to double newlines (stanza breaks)
        .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
        // Convert other block-level endings to newlines
        .replace(/<\/(div|p)>/gi, '\n')
        // Now remove all remaining HTML tags
        .replace(/<[^>]*>/g, '')
        // Decode HTML entities
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        // Clean up whitespace more carefully
        // Replace multiple spaces (but not newlines) with single space
        .replace(/[^\S\n]+/g, ' ')
        // Remove spaces at the beginning and end of lines
        .replace(/^ +/gm, '')
        .replace(/ +$/gm, '')
        // Reduce multiple consecutive newlines to maximum of 2 (for stanza breaks)
        .replace(/\n{3,}/g, '\n\n')
        .trim()
      
      if (excerpt.length > 50) {
        excerpts.push(excerpt)
        console.log(`📝 Excerpt ${excerpts.length} (first 100 chars):\n${excerpt.substring(0, 100)}...`)
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
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
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
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
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
      const title = titles[i] || excerpt.split('\n')[0].split(' ').slice(0, 5).join(' ')
      const author = authors[i] || 'Poeta Español'
      
      // For Mastodon's 500 char limit, we need to be smart about truncation
      // Try to preserve complete verses/stanzas when truncating
      let finalExcerpt = excerpt
      if (excerpt.length > 350) {
        // Try to find a good breaking point (end of a stanza or verse)
        const truncated = excerpt.substring(0, 350)
        const lastDoubleNewline = truncated.lastIndexOf('\n\n')
        const lastSingleNewline = truncated.lastIndexOf('\n')
        
        if (lastDoubleNewline > 250) {
          // Break at stanza if it's not too short
          finalExcerpt = truncated.substring(0, lastDoubleNewline) + '...'
        } else if (lastSingleNewline > 280) {
          // Break at verse line if stanza break is too early
          finalExcerpt = truncated.substring(0, lastSingleNewline) + '...'
        } else {
          // Last resort: break at sentence/clause
          const lastPeriod = truncated.lastIndexOf('.')
          const lastComma = truncated.lastIndexOf(',')
          const lastBreak = Math.max(lastPeriod, lastComma)
          
          if (lastBreak > 250) {
            finalExcerpt = truncated.substring(0, lastBreak + 1) + '...'
          } else {
            finalExcerpt = truncated + '...'
          }
        }
      }
      
      poems.push({
        title: title.length > 80 ? title.substring(0, 77) + '...' : title,
        author: author,
        excerpt: finalExcerpt
      })
      
      console.log(`✅ Poem ${i + 1}: "${title}" by ${author}`)
      console.log(`   Line breaks preserved: ${finalExcerpt.split('\n').length} lines`)
    }
    
    console.log(`📖 Total poems found: ${poems.length}`)
    
    // If no poems found, return fallback
    if (poems.length === 0) {
      console.log('⚠️ No poems found, using fallback')
      return [{
        title: "Poema de Emergencia",
        author: "Bot de Poesía", 
        excerpt: "En caso de que el scraping falle,\naquí tienes un poema de emergencia\npara mantener el bot funcionando."
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
    
    // Return fallback on error with line breaks
    return [{
      title: "Poema de Emergencia",
      author: "Bot de Poesía",
      excerpt: "En caso de que el scraping falle,\naquí tienes un poema de emergencia\npara mantener el bot funcionando\ncon versos separados correctamente."
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