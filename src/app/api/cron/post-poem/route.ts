import { NextResponse } from 'next/server'
import { postPoem } from '@/lib/mastodon'

export async function POST(request: Request) {
  // 1. Verify the cron secret token
  const authHeader = request.headers.get('authorization')
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`

  if (!authHeader || authHeader !== expectedToken) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // 2. Check that CRON_SECRET is actually configured
  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      { success: false, error: 'CRON_SECRET not configured' },
      { status: 500 }
    )
  }

  try {
    // 3. Call the existing postPoem function
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
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Cron post-poem error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}
