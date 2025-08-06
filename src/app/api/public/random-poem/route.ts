import { NextResponse } from 'next/server'
import { getRandomPoem } from '@/lib/supabase'

export async function GET() {
  try {
    const poem = await getRandomPoem()
    
    if (!poem) {
      return NextResponse.json({
        success: false,
        error: 'No poems available'
      }, { status: 404 })
    }

    // Return poem data for public display
    return NextResponse.json({
      success: true,
      poem: {
        title: poem.title,
        author: poem.author,
        excerpt: poem.excerpt,
        id: poem.id
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch random poem'
    }, { status: 500 })
  }
}
