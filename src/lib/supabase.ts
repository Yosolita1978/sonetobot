// lib/supabase.ts

import { createClient } from '@supabase/supabase-js'
import { Poem, NewPoem } from '@/types/poem'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

/**
 * Insert new poems into the database
 */
export async function insertPoems(poems: NewPoem[]): Promise<number> {
  try {
    const poemsWithDefaults = poems.map(poem => ({
      ...poem,
      posted_date: null
    }));

    const { data, error } = await supabase
      .from('poems')
      .insert(poemsWithDefaults)
      .select()

    if (error) {
      throw new Error(`Failed to insert poems: ${error.message}`)
    }
    
    return data?.length || 0
  } catch (error) {
    throw error
  }
}

/**
 * Get a random unused poem from the database for posting
 * Uses posted_date IS NULL to identify unposted poems
 */
export async function getRandomUnusedPoem(): Promise<Poem | null> {
  try {
    const { count, error: countError } = await supabase
      .from('poems')
      .select('*', { count: 'exact', head: true })
      .is('posted_date', null)

    if (countError) {
      throw new Error(`Failed to count unused poems: ${countError.message}`);
    }

    if (!count || count === 0) {
      return null;
    }

    // Generate a random offset
    const randomOffset = Math.floor(Math.random() * count);

    const { data, error } = await supabase
      .from('poems')
      .select('*')
      .is('posted_date', null)
      .range(randomOffset, randomOffset)
      .limit(1);

    if (error) {
      throw new Error(`Failed to fetch random unused poem: ${error.message}`);
    }

    return data && data.length > 0 ? data[0] as Poem : null;
  } catch (error) {
    throw error;
  }
}

/**
 * Gets one completely random poem from the database (for testing formatter)
 */
export async function getRandomPoem(): Promise<Poem | null> {
  try {
    // First, get the total count of poems
    const { count, error: countError } = await supabase
      .from('poems')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      throw new Error(`Failed to count poems: ${countError.message}`);
    }

    if (!count || count === 0) {
      return null;
    }

    // Generate a random offset
    const randomOffset = Math.floor(Math.random() * count);

    // Get one poem at the random offset
    const { data, error } = await supabase
      .from('poems')
      .select('*')
      .range(randomOffset, randomOffset)
      .limit(1);

    if (error) {
      throw new Error(`Failed to fetch random poem: ${error.message}`);
    }

    return data && data.length > 0 ? data[0] as Poem : null;
  } catch (error) {
    throw error;
  }
}

/**
 * Mark a poem as used after posting
 */
export async function markPoemAsUsed(poemId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('poems')
      .update({ posted_date: new Date().toISOString() })
      .eq('id', poemId)

    if (error) {
      throw new Error(`Failed to mark poem as used: ${error.message}`)
    }
    return true
  } catch (error) {
    throw error
  }
}

/**
 * Count unused poems in database
 */
export async function countUnusedPoems(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('poems')
      .select('*', { count: 'exact', head: true })
      .is('posted_date', null)

    if (error) {
      throw new Error(`Failed to count unused poems: ${error.message}`)
    }
    return count || 0
  } catch (error) {
    throw error
  }
}

/**
 * Check if a poem already exists in database
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
      throw new Error(`Failed to check poem existence: ${error.message}`)
    }
    return data && data.length > 0
  } catch (error) {
    throw error
  }
}

/**
 * Test database connection
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('poems')
      .select('id')
      .limit(1)

    return !error
  } catch (error) {
    return false
  }
}

/**
 * Delete all unposted poems (posted_date is null)
 * Used to clear badly-formatted poems before re-scraping
 */
export async function deleteUnusedPoems(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('poems')
      .delete()
      .is('posted_date', null)
      .select('id')

    if (error) {
      throw new Error(`Failed to delete unused poems: ${error.message}`)
    }

    return data?.length || 0
  } catch (error) {
    throw error
  }
}
