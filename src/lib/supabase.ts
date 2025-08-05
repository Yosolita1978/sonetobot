// lib/supabase.ts

import { createClient } from '@supabase/supabase-js'
import { Poem, NewPoem } from '@/types/poem'

// Initialize Supabase client with service role key for server operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Use service role key for server-side operations (bypasses RLS)
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Keep a public client if you need it for any client-side operations
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Insert new poems into the database
 * Returns the number of poems successfully inserted
 */
export async function insertPoems(poems: NewPoem[]): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('poems')
      .insert(poems)
      .select()

    if (error) {
      console.error('Error inserting poems:', error)
      throw new Error(`Failed to insert poems: ${error.message}`)
    }

    return data?.length || 0
  } catch (error) {
    console.error('Database insert error:', error)
    throw error
  }
}

/**
 * Insert a single poem into the database
 */
export async function insertPoem(poem: NewPoem): Promise<Poem | null> {
  try {
    const { data, error } = await supabase
      .from('poems')
      .insert(poem)
      .select()
      .single()

    if (error) {
      console.error('Error inserting poem:', error)
      throw new Error(`Failed to insert poem: ${error.message}`)
    }

    return data as Poem
  } catch (error) {
    console.error('Database insert error:', error)
    throw error
  }
}

/**
 * Get one unused poem for posting
 * Returns null if no unused poems available
 */
export async function getUnusedPoem(): Promise<Poem | null> {
  try {
    const { data, error } = await supabase
      .from('poems')
      .select('*')
      .eq('used', false)
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - no unused poems
        return null
      }
      console.error('Error fetching unused poem:', error)
      throw new Error(`Failed to fetch unused poem: ${error.message}`)
    }

    return data as Poem
  } catch (error) {
    console.error('Database fetch error:', error)
    throw error
  }
}

/**
 * Mark a poem as used after posting
 */
export async function markPoemAsUsed(poemId: number, postedDate: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('poems')
      .update({ 
        used: true, 
        posted_date: postedDate 
      })
      .eq('id', poemId)

    if (error) {
      console.error('Error marking poem as used:', error)
      throw new Error(`Failed to mark poem as used: ${error.message}`)
    }

    return true
  } catch (error) {
    console.error('Database update error:', error)
    throw error
  }
}

/**
 * Count how many unused poems are available
 */
export async function countUnusedPoems(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('poems')
      .select('*', { count: 'exact', head: true })
      .eq('used', false)

    if (error) {
      console.error('Error counting unused poems:', error)
      throw new Error(`Failed to count unused poems: ${error.message}`)
    }

    return count || 0
  } catch (error) {
    console.error('Database count error:', error)
    throw error
  }
}

/**
 * Check if a poem with the same title and author already exists
 * Helps avoid duplicates when scraping
 */
export async function poemExists(title: string, author: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('poems')
      .select('id')
      .eq('title', title)
      .eq('author', author)
      .limit(1)

    if (error) {
      console.error('Error checking poem existence:', error)
      throw new Error(`Failed to check poem existence: ${error.message}`)
    }

    return data && data.length > 0
  } catch (error) {
    console.error('Database existence check error:', error)
    throw error
  }
}

/**
 * Get all poems (for debugging/admin purposes)
 */
export async function getAllPoems(): Promise<Poem[]> {
  try {
    const { data, error } = await supabase
      .from('poems')
      .select('*')
      .order('scraped_date', { ascending: false })

    if (error) {
      console.error('Error fetching all poems:', error)
      throw new Error(`Failed to fetch all poems: ${error.message}`)
    }

    return data as Poem[]
  } catch (error) {
    console.error('Database fetch error:', error)
    throw error
  }
}

/**
 * Database health check - test if connection works
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('poems')
      .select('count')
      .limit(1)

    return !error
  } catch (error) {
    console.error('Database connection test failed:', error)
    return false
  }
}