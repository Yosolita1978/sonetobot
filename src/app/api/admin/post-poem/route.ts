import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { postPoem } from '@/lib/mastodon'

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.username !== process.env.AUTHORIZED_GITHUB_USERNAME) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized access' 
      }, { status: 401 });
    }

    const result = await postPoem()
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        data: {
          mastodonId: result.mastodonId,
          mastodonUrl: `https://col.social/@sonetobot/${result.mastodonId}`
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Post poem API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}
