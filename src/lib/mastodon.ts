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
  
  // Create the formatted post with proper line breaks
  let post = `"${title}"\n\n`
  
  // Add excerpt (with line breaks preserved)
  let poemText = excerpt
  
  // Calculate available space for the poem
  // Mastodon limit is 500, but we need space for title, author, and hashtags
  const titleLength = title.length + 4 // quotes and newlines
  const authorLength = author.length + 4 // dash, space, and newlines
  const hashtagsLength = 50 // approximate hashtag length
  const maxExcerptLength = 500 - titleLength - authorLength - hashtagsLength - 10 // buffer
  
  // If excerpt is too long, truncate intelligently while preserving structure
  if (poemText.length > maxExcerptLength) {
    const truncated = poemText.substring(0, maxExcerptLength)
    
    // Try to break at a stanza boundary (double newline)
    const lastStanzaBreak = truncated.lastIndexOf('\n\n')
    const lastLineBreak = truncated.lastIndexOf('\n')
    const lastPeriod = truncated.lastIndexOf('.')
    const lastComma = truncated.lastIndexOf(',')
    
    // Prefer breaking at natural boundaries
    if (lastStanzaBreak > maxExcerptLength * 0.6) {
      // Break at stanza if it's not too short
      poemText = truncated.substring(0, lastStanzaBreak).trim() + '...'
    } else if (lastLineBreak > maxExcerptLength * 0.7) {
      // Break at line end if stanza break is too early
      poemText = truncated.substring(0, lastLineBreak).trim() + '...'
    } else if (lastPeriod > maxExcerptLength * 0.7) {
      // Break at sentence end
      poemText = truncated.substring(0, lastPeriod + 1).trim() + '..'
    } else if (lastComma > maxExcerptLength * 0.7) {
      // Break at clause
      poemText = truncated.substring(0, lastComma).trim() + '...'
    } else {
      // Last resort - just truncate
      poemText = truncated.trim() + '...'
    }
  }
  
  // Add the poem text with preserved formatting
  post += poemText
  
  // Add author
  post += `\n\n— ${author}`
  
  // Add hashtags
  post += '\n\n#PoesíaEspañola #Poesía #Spanish #Poetry #Literatura'
  
  // Log the formatted post for debugging
  console.log('📝 Formatted post preview:')
  console.log('---')
  console.log(post)
  console.log('---')
  console.log(`📏 Total length: ${post.length} characters`)
  
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
    console.log(`📝 Poem has ${poem.excerpt.split('\n').length} lines`)
    
    // Format poem for Mastodon
    let postContent = formatPoemForPost(poem)
    
    console.log('📝 Post content length:', postContent.length)
    
    // Validate length
    if (postContent.length > 500) {
      console.warn(`⚠️ Post content is ${postContent.length} chars, exceeding Mastodon's 500 limit!`)
      // Try to trim it more aggressively
      const lines = postContent.split('\n')
      while (postContent.length > 500 && lines.length > 5) {
        // Remove lines from the middle of the poem
        lines.splice(-4, 1) // Remove a line before the author and hashtags
        const trimmedContent = lines.join('\n')
        if (trimmedContent.length <= 500) {
          postContent = trimmedContent
          break
        }
      }
    }
    
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
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response?: { status?: number; data?: { error?: string } } }
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
  accountInfo?: {
    username: string
    displayName: string
    followersCount: number
    statusesCount: number
  }
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
    recentPosts: Array<{
      id: string
      content: string
      createdAt: string
    }>
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