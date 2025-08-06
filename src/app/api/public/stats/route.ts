import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Get total poems count
    const { count: totalPoems, error: totalError } = await supabase
      .from('poems')
      .select('*', { count: 'exact', head: true })

    if (totalError) {
      throw new Error(`Failed to count total poems: ${totalError.message}`)
    }

    // Get posted poems count
    const { count: postedPoems, error: postedError } = await supabase
      .from('poems')
      .select('*', { count: 'exact', head: true })
      .eq('used', true)

    if (postedError) {
      throw new Error(`Failed to count posted poems: ${postedError.message}`)
    }

    // Get unused poems count
    const { count: unusedPoems, error: unusedError } = await supabase
      .from('poems')
      .select('*', { count: 'exact', head: true })
      .or('used.is.null,used.eq.false')

    if (unusedError) {
      throw new Error(`Failed to count unused poems: ${unusedError.message}`)
    }

    // Get most recent posted poem date
    const { data: recentPoem, error: recentError } = await supabase
      .from('poems')
      .select('posted_date')
      .eq('used', true)
      .not('posted_date', 'is', null)
      .order('posted_date', { ascending: false })
      .limit(1)
      .single()

    // Don't throw error if no recent poem found
    const lastPostDate = recentError ? null : recentPoem?.posted_date

    return NextResponse.json({
      success: true,
      stats: {
        totalPoems: totalPoems || 0,
        postedPoems: postedPoems || 0,
        unusedPoems: unusedPoems || 0,
        lastPostDate: lastPostDate
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch stats'
    }, { status: 500 })
  }
}
