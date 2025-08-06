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
    // ENSURE poems are inserted with used: false
    const poemsWithDefaults = poems.map(poem => ({
      ...poem,
      used: false,  // EXPLICITLY set to false
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
 * FIXED: Handle null values in used field
 */
export async function getRandomUnusedPoem(): Promise<Poem | null> {
  try {
    // FIXED: Check for both false AND null values (unused poems)
    const { count, error: countError } = await supabase
      .from('poems')
      .select('*', { count: 'exact', head: true })
      .or('used.is.null,used.eq.false')  // This handles both null and false

    if (countError) {
      throw new Error(`Failed to count unused poems: ${countError.message}`);
    }

    if (!count || count === 0) {
      return null;
    }

    // Generate a random offset
    const randomOffset = Math.floor(Math.random() * count);

    // FIXED: Get one poem that is either null or false for used
    const { data, error } = await supabase
      .from('poems')
      .select('*')
      .or('used.is.null,used.eq.false')  // This handles both null and false
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
      .update({ 
        used: true, 
        posted_date: new Date().toISOString()
      })
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
 * FIXED: Handle null values
 */
export async function countUnusedPoems(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('poems')
      .select('*', { count: 'exact', head: true })
      .or('used.is.null,used.eq.false')  // Count both null and false as unused

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
 * Fix all existing poems with null used values
 * Call this once to clean up your database
 */
export async function fixNullUsedValues(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('poems')
      .update({ used: false })
      .is('used', null)
      .select('id')

    if (error) {
      throw new Error(`Failed to fix null used values: ${error.message}`)
    }

    return data?.length || 0
  } catch (error) {
    throw error
  }
}
