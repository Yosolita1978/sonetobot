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
    const { data, error } = await supabase
      .from('poems')
      .insert(poems)
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
 * Gets one completely random poem from the database, used or not.
 * This is ideal for testing the formatter.
 */
export async function getRandomPoem(): Promise<Poem | null> {
  try {
    // THE FIX: Call the new database function 'get_any_random_poem'
    const { data, error } = await supabase
      .rpc('get_any_random_poem')
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // This code means no rows were found
        return null;
      }
      throw new Error(`Failed to fetch random poem: ${error.message}`);
    }
    return data as Poem | null;
  } catch (error) {
    throw error;
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
      throw new Error(`Failed to mark poem as used: ${error.message}`)
    }
    return true
  } catch (error) {
    throw error
  }
}

// --- Other helper functions remain unchanged ---
export async function countUnusedPoems(): Promise<number> { /* ... */ return 0 }
export async function poemExists(title: string, author: string): Promise<boolean> { /* ... */ return false }
export async function testDatabaseConnection(): Promise<boolean> { /* ... */ return true }