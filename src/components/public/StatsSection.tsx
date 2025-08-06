'use client'

import { useState, useEffect } from 'react'

interface Stats {
  totalPoems: number
  postedPoems: number
  unusedPoems: number
  lastPostDate: string | null
}

export function StatsSection() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/public/stats')
        const data = await response.json()
        
        if (data.success) {
          setStats(data.stats)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="py-16 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-lg animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-16 bg-gradient-to-r from-amber-50 to-orange-50">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-amber-900 mb-4">
            Poetry in Numbers
          </h2>
          <p className="text-xl text-amber-700">
            Building a digital archive of Spanish literary heritage
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Total Poems */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-amber-100">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
              <span className="text-3xl">📚</span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {stats?.totalPoems?.toLocaleString() || '0'}
            </div>
            <div className="text-lg text-gray-600">
              Poems Collected
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Curated from classical and contemporary Spanish literature
            </div>
          </div>

          {/* Posted Poems */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-amber-100">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
              <span className="text-3xl">🐘</span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {stats?.postedPoems?.toLocaleString() || '0'}
            </div>
            <div className="text-lg text-gray-600">
              Poems Shared
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Beautiful verses shared on Mastodon with intelligent formatting
            </div>
          </div>

          {/* Unused Poems */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-amber-100">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6">
              <span className="text-3xl">⏳</span>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {stats?.unusedPoems?.toLocaleString() || '0'}
            </div>
            <div className="text-lg text-gray-600">
              Poems Waiting
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Ready to be discovered and shared with poetry lovers
            </div>
          </div>
        </div>

        {/* Last Post Date */}
        {stats?.lastPostDate && (
          <div className="text-center mt-12">
            <p className="text-amber-700">
              Last poem shared: {new Date(stats.lastPostDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
