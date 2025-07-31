// lib/scraper.ts

import axios from 'axios'
import { ScrapedPoem } from '@/types/poem'

/**
 * Debug function - just fetch HTML and log it
 */
export async function debugScrapeHtml(): Promise<string> {
  const sourceUrl = 'https://www.palabravirtual.com/index.php?ir=select_texto.php'
  
  try {
    console.log('🔍 Fetching HTML from:', sourceUrl)
    
    const response = await axios.get(sourceUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SonetoBot/1.0)',
      }
    })
    
    console.log('✅ HTML fetched successfully')
    console.log('📄 Content length:', response.data.length)
    console.log('📄 Content type:', response.headers['content-type'])
    
    // Look for embedded JSON or JavaScript data that might contain poems
    const jsonPatterns = [
      /var\s+\w+\s*=\s*[\[\{][^;]+[;\}]/gi,  // JavaScript variables with arrays/objects
      /data\s*[:=]\s*[\[\{][^;]+/gi,         // data: {...} patterns
      /poems?\s*[:=]\s*[\[\{][^;]+/gi,       // poems: {...} patterns
      /texto\s*[:=]\s*[\[\{][^;]+/gi,        // texto: {...} patterns (Spanish for text)
    ]
    
    let foundData = false
    for (const pattern of jsonPatterns) {
      const matches = response.data.match(pattern)
      if (matches && matches.length > 0) {
        console.log(`📄 Found ${matches.length} potential data structures`)
        foundData = true
        
        // Show first few matches
        matches.slice(0, 3).forEach((match: string, index: number) => {
          console.log(`📄 Data structure ${index + 1}:`)
          console.log('---DATA---')
          console.log(match.substring(0, 300))
          console.log('---END DATA---')
        })
        break
      }
    }
    
    // Look for AJAX calls or fetch requests
    const ajaxPatterns = [
      /fetch\([^)]+\)/gi,
      /XMLHttpRequest[^;]+/gi,
      /\.load\([^)]+\)/gi,
      /ajax[^;]+/gi
    ]
    
    for (const pattern of ajaxPatterns) {
      const matches = response.data.match(pattern)
      if (matches && matches.length > 0) {
        console.log(`📄 Found ${matches.length} potential AJAX calls:`)
        matches.slice(0, 2).forEach((match: string) => {
          console.log('---AJAX---')
          console.log(match)
          console.log('---END AJAX---')
        })
        foundData = true
        break
      }
    }
    
    // Look for any URLs that might serve poem data
    const urlPattern = /['"]([^'"]*\.php[^'"]*|[^'"]*json[^'"]*|[^'"]*poema[^'"]*|[^'"]*texto[^'"]*)['"]/gi
    const urls = []
    let match
    while ((match = urlPattern.exec(response.data)) !== null) {
      urls.push(match[1])
    }
    
    if (urls.length > 0) {
      console.log('📄 Found potential data URLs:')
      urls.slice(0, 5).forEach(url => {
        console.log('  -', url)
      })
      foundData = true
    }
    
    if (!foundData) {
      console.log('📄 No obvious data structures found. This might require browser automation.')
      console.log('📄 The content is likely loaded after JavaScript execution.')
    }
    
    return response.data
    
  } catch (error) {
    console.error('❌ Error fetching HTML:', error)
    throw error
  }
}

/**
 * Simple scraper for testing - returns fake data for now
 */
export async function scrapePoems(): Promise<ScrapedPoem[]> {
  console.log('🧪 Using simple test scraper')
  
  // For now, just return test data
  return [
    {
      title: "Test Poem",
      author: "Test Author", 
      excerpt: "This is a test poem to verify the system works."
    }
  ]
}

/**
 * Test scraper function
 */
export async function testScraper() {
  try {
    const poems = await scrapePoems()
    return {
      success: true,
      poemsFound: poems.length,
      samplePoem: poems[0]
    }
  } catch (error) {
    return {
      success: false,
      poemsFound: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}