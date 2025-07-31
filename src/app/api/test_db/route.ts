// app/api/test_db/route.ts

import { NextResponse } from 'next/server'
import { testDatabaseConnection, countUnusedPoems, insertPoems } from '@/lib/supabase'
import { testScraper, scrapePoems } from '@/lib/scraper'
import { testMastodonConnection, postPoem } from '@/lib/mastodon'
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
    
    // Test 4: Test Mastodon connection
    console.log('4. Testing Mastodon connection...')
    const mastodonTest = await testMastodonConnection()
    
    if (!mastodonTest.success) {
      console.log('⚠️ Mastodon test failed, but continuing with other tests')
    } else {
      console.log(`✅ Connected to Mastodon as @${mastodonTest.accountInfo?.username}`)
    }
    
    // Return simple results
    return NextResponse.json({
      success: true,
      message: scraperTest.success && mastodonTest.success 
        ? 'All tests completed successfully! 🎉' 
        : 'Some tests had issues - check details below',
      results: {
        database: '✅ Connected',
        unused_poems: poemCount,
        scraper: scraperTest.success ? '✅ Working' : '❌ Failed',
        scraper_poems_found: scraperTest.poemsFound || 0,
        scraper_error: scraperTest.error || null,
        mastodon: mastodonTest.success ? '✅ Connected' : '❌ Failed',
        mastodon_account: mastodonTest.accountInfo?.username || null,
        mastodon_error: mastodonTest.error || null,
        environment_check: {
          mastodon_token: process.env.MASTODON_ACCESS_TOKEN ? '✅ Set' : '❌ Missing',
          mastodon_url: process.env.MASTODON_API_URL ? '✅ Set' : '❌ Missing'
        }
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
      case 'test_post_poem':
        console.log('🧪 Testing poem posting to Mastodon...')
        
        const postResult = await postPoem()
        
        if (!postResult.success) {
          return NextResponse.json({
            success: false,
            error: postResult.error
          }, { status: 400 })
        }
        
        return NextResponse.json({
          success: true,
          message: 'Poem posted successfully to Mastodon! 🎉',
          results: {
            posted_poem: {
              title: postResult.poem?.title,
              author: postResult.poem?.author,
              mastodon_id: postResult.mastodonId
            }
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
          error: 'Unknown action. Available: test_post_poem, scrape_and_save'
        }, { status: 400 })
    }
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'POST test failed: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}