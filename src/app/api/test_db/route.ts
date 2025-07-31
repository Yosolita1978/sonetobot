// app/api/test-db/route.ts

import { NextResponse } from 'next/server'
import { 
  testDatabaseConnection, 
  insertPoem, 
  getUnusedPoem, 
  countUnusedPoems,
  getAllPoems 
} from '@/lib/supabase'
import { NewPoem } from '@/types/poem'

export async function GET() {
  try {
    console.log('🧪 Starting database tests...')
    
    // Test 1: Database connection
    console.log('1. Testing database connection...')
    const connectionWorks = await testDatabaseConnection()
    
    if (!connectionWorks) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed'
      }, { status: 500 })
    }
    
    console.log('✅ Database connection successful')
    
    // Test 2: Count existing poems
    console.log('2. Counting existing poems...')
    const unusedCount = await countUnusedPoems()
    const allPoems = await getAllPoems()
    
    console.log(`📊 Found ${allPoems.length} total poems, ${unusedCount} unused`)
    
    // Test 3: Insert a test poem (only if we don't have many)
    let insertedPoem = null
    if (allPoems.length < 5) {
      console.log('3. Inserting test poem...')
      
      const testPoem: NewPoem = {
        title: 'Test Poem - ' + new Date().toISOString(),
        author: 'Test Bot',
        excerpt: 'This is a test poem created by sonetobot during database testing. You can delete this later.',
        scraped_date: new Date().toISOString(),
        used: false
      }
      
      insertedPoem = await insertPoem(testPoem)
      console.log('✅ Test poem inserted with ID:', insertedPoem?.id)
    } else {
      console.log('3. Skipping test poem insertion (already have enough poems)')
    }
    
    // Test 4: Get an unused poem
    console.log('4. Getting an unused poem...')
    const unusedPoem = await getUnusedPoem()
    
    // Test 5: Final count
    const finalUnusedCount = await countUnusedPoems()
    
    // Return test results
    return NextResponse.json({
      success: true,
      message: 'All database tests passed! 🎉',
      results: {
        connection: connectionWorks,
        total_poems: allPoems.length,
        unused_poems_before: unusedCount,
        unused_poems_after: finalUnusedCount,
        test_poem_inserted: insertedPoem ? {
          id: insertedPoem.id,
          title: insertedPoem.title,
          author: insertedPoem.author
        } : null,
        sample_unused_poem: unusedPoem ? {
          id: unusedPoem.id,
          title: unusedPoem.title,
          author: unusedPoem.author,
          used: unusedPoem.used
        } : 'No unused poems found',
        environment_check: {
          supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
          supabase_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'
        }
      }
    })
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: 'Check server console for full error details'
    }, { status: 500 })
  }
}

// Optional: Add a POST method to test specific operations
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body
    
    switch (action) {
      case 'insert_test_poem':
        const testPoem: NewPoem = {
          title: body.title || 'Manual Test Poem',
          author: body.author || 'Test Author',
          excerpt: body.excerpt || 'This is a manually inserted test poem.',
          scraped_date: new Date().toISOString(),
          used: false
        }
        
        const inserted = await insertPoem(testPoem)
        
        return NextResponse.json({
          success: true,
          message: 'Test poem inserted successfully',
          poem: inserted
        })
        
      case 'count_poems':
        const count = await countUnusedPoems()
        const total = await getAllPoems()
        
        return NextResponse.json({
          success: true,
          unused_count: count,
          total_count: total.length
        })
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Unknown action. Available actions: insert_test_poem, count_poems'
        }, { status: 400 })
    }
    
  } catch (error) {
    console.error('POST test error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}