// app/api/test_db/route.ts

import { NextResponse } from 'next/server'
import { testDatabaseConnection, countUnusedPoems, insertPoems } from '@/lib/supabase'
import { testScraper, scrapePoems, debugScrapeHtml } from '@/lib/scraper'
import { NewPoem } from '@/types/poem'

export async function GET() {
  try {
    // Test 1: Database connection
    const dbWorks = await testDatabaseConnection()
    
    if (!dbWorks) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed'
      }, { status: 500 })
    }
    
    // Test 2: Count poems
    const poemCount = await countUnusedPoems()
    
    // Test 3: Test scraper
    const scraperTest = await testScraper()
    
    // Return simple results
    return NextResponse.json({
      success: true,
      message: 'Tests completed',
      results: {
        database: '✅ Connected',
        unused_poems: poemCount,
        scraper: scraperTest.success ? '✅ Working' : '❌ Failed',
        scraper_poems_found: scraperTest.poemsFound || 0,
        scraper_error: scraperTest.error || null
      }
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Test failed: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body
    
    switch (action) {
      case 'debug_html':
        console.log('🔍 Testing HTML fetch...')
        
        const htmlContent = await debugScrapeHtml()
        
        return NextResponse.json({
          success: true,
          message: 'HTML fetched successfully - check server console for details',
          results: {
            content_length: htmlContent.length,
            first_100_chars: htmlContent.substring(0, 100)
          }
        })
        
      case 'scrape_and_save':
        console.log('🔍 Testing full scrape and save workflow...')
        
        const poems = await scrapePoems()
        
        if (!poems || poems.length === 0) {
          return NextResponse.json({
            success: false,
            error: 'No poems found during scraping'
          }, { status: 400 })
        }
        
        // Take first 5 poems and save them
        const newPoems: NewPoem[] = poems.slice(0, 5).map(poem => ({
          title: poem.title,
          author: poem.author,
          excerpt: poem.excerpt,
          scraped_date: new Date().toISOString(),
          used: false
        }))
        
        const savedCount = await insertPoems(newPoems)
        
        return NextResponse.json({
          success: true,
          message: `Successfully scraped and saved ${savedCount} poems`,
          results: {
            scraped: poems.length,
            saved: savedCount
          }
        })
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Unknown action. Available: debug_html, scrape_and_save'
        }, { status: 400 })
    }
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'POST test failed: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}