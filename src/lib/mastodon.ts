// lib/mastodon.ts

import { MegalodonInterface } from 'megalodon'
import generator from 'megalodon'
import { Poem } from '@/types/poem'
import { getUnusedPoem, markPoemAsUsed } from '@/lib/supabase'

// Initialize Mastodon client
let mastodonClient: MegalodonInterface | null = null

/**
 * Get or create Mastodon client instance
 */
function getMastodonClient(): MegalodonInterface {
  if (!mastodonClient) {
    const accessToken = process.env.MASTODON_ACCESS_TOKEN
    const apiUrl = process.env.MASTODON_API_URL || 'https://col.social'
    
    if (!accessToken) {
      throw new Error('MASTODON_ACCESS_TOKEN environment variable is required')
    }
    
    console.log('🔗 Connecting to Mastodon:', apiUrl)
    
    mastodonClient = generator('mastodon', apiUrl, accessToken)
  }
  
  return mastodonClient
}

/**
 * Format poem for Mastodon post
 */
function formatPoemForPost(poem: Poem): string {
  const { title, author, excerpt } = poem
  
  // Create the formatted post
  let post = `"${title}"\n\n`
  
  // Add excerpt (limit length for Mastodon)
  let poemText = excerpt
  
  // If excerpt is too long, truncate nicely
  const maxExcerptLength = 350 // Leave room for title, author, hashtags
  if (poemText.length > maxExcerptLength) {
    // Find a good breaking point (end of sentence or clause)
    const truncated = poemText.substring(0, maxExcerptLength)
    const lastPeriod = truncated.lastIndexOf('.')
    const lastComma = truncated.lastIndexOf(',')
    const lastBreak = Math.max(lastPeriod, lastComma)
    
    if (lastBreak > maxExcerptLength * 0.7) {
      poemText = truncated.substring(0, lastBreak + 1) + '...'
    } else {
      poemText = truncated + '...'
    }
  }
  
  post += poemText
  post += `\n\n— ${author}`
  
  // Add hashtags
  post += '\n\n#PoesíaEspañola #Poesía #Spanish #Poetry #Literatura'
  
  return post
}

/**
 * Post a poem to Mastodon
 */
export async function postPoem(): Promise<{
  success: boolean
  poem?: Poem
  mastodonId?: string
  error?: string
}> {
  try {
    console.log('📖 Getting unused poem for posting...')
    
    // Get an unused poem from database
    const poem = await getUnusedPoem()
    
    if (!poem) {
      return {
        success: false,
        error: 'No unused poems available. Run scraper to add more poems.'
      }
    }
    
    console.log(`🎭 Preparing to post: "${poem.title}" by ${poem.author}`)
    
    // Format poem for Mastodon
    const postContent = formatPoemForPost(poem)
    
    console.log('📝 Post content length:', postContent.length)
    
    // Get Mastodon client
    const client = getMastodonClient()
    
    // Post to Mastodon
    console.log('📮 Posting to Mastodon...')
    const response = await client.postStatus(postContent, {
      visibility: 'public'
    })
    
    if (!response.data) {
      throw new Error('Failed to post to Mastodon - no response data')
    }
    
    const mastodonPostId = response.data.id
    console.log('✅ Posted successfully! Mastodon ID:', mastodonPostId)
    
    // Mark poem as used in database
    await markPoemAsUsed(poem.id, new Date().toISOString())
    
    console.log('✅ Marked poem as used in database')
    
    return {
      success: true,
      poem: poem,
      mastodonId: mastodonPostId
    }
    
  } catch (error) {
    console.error('❌ Error posting poem:', error)
    
    let errorMessage = 'Unknown error occurred'
    
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    // Handle specific Mastodon API errors
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const apiError = error as any
      if (apiError.response?.status === 401) {
        errorMessage = 'Mastodon authentication failed - check access token'
      } else if (apiError.response?.status === 422) {
        errorMessage = 'Mastodon rejected the post - possibly duplicate or invalid content'
      } else if (apiError.response?.data?.error) {
        errorMessage = `Mastodon API error: ${apiError.response.data.error}`
      }
    }
    
    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * Test Mastodon connection without posting
 */
export async function testMastodonConnection(): Promise<{
  success: boolean
  accountInfo?: any
  error?: string
}> {
  try {
    console.log('🔍 Testing Mastodon connection...')
    
    const client = getMastodonClient()
    
    // Get account info to verify connection
    const response = await client.verifyAccountCredentials()
    
    if (!response.data) {
      throw new Error('Failed to verify Mastodon credentials')
    }
    
    const account = response.data
    console.log('✅ Connected to Mastodon as:', account.username)
    
    return {
      success: true,
      accountInfo: {
        username: account.username,
        displayName: account.display_name,
        followersCount: account.followers_count,
        statusesCount: account.statuses_count
      }
    }
    
  } catch (error) {
    console.error('❌ Mastodon connection test failed:', error)
    
    let errorMessage = 'Connection test failed'
    
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * Get posting statistics
 */
export async function getPostingStats(): Promise<{
  success: boolean
  stats?: {
    totalPosts: number
    recentPosts: any[]
  }
  error?: string
}> {
  try {
    const client = getMastodonClient()
    
    // Get recent posts from the bot account
    const response = await client.getAccountStatuses(
      (await client.verifyAccountCredentials()).data.id,
      { limit: 10 }
    )
    
    return {
      success: true,
      stats: {
        totalPosts: response.data.length,
        recentPosts: response.data.map(post => ({
          id: post.id,
          content: post.content?.substring(0, 100) + '...',
          createdAt: post.created_at
        }))
      }
    }
    
  } catch (error) {
    console.error('❌ Error getting posting stats:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}