// src/app/api/post-poem/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { postPoem } from '@/lib/mastodon'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting Mastodon post request...')
    
    const result = await postPoem()
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully posted "${result.poem?.title}" by ${result.poem?.author}`,
        data: {
          poemTitle: result.poem?.title,
          poemAuthor: result.poem?.author,
          mastodonId: result.mastodonId,
          mastodonUrl: `${process.env.MASTODON_API_URL || 'https://col.social'}/web/statuses/${result.mastodonId}`
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 })
    }
    
  } catch (error) {
    console.error('❌ API Error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Mastodon posting API is ready',
    endpoints: {
      post: 'POST /api/post-mastodon - Post a random poem to Mastodon'
    }
  })
}