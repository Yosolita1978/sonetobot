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
        if (data.success) setStats(data.stats)
      } catch { }
      setLoading(false)
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-50 rounded-2xl p-8 shadow-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-[#ffa93a]">Poetry in Numbers</h2>
          <p className="text-xl mb-12 text-[#7caaf0]">
            Building a digital archive of Spanish literary heritage
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Poems Collected */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2" style={{ borderColor: '#ffa93a' }}>
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6"
              style={{ backgroundColor: '#7caaf0', color: '#fff' }}>
              <span className="text-3xl">📚</span>
            </div>
            <div className="text-4xl font-bold mb-2 text-[#303162]">
              {stats?.totalPoems?.toLocaleString() || '0'}
            </div>
            <div className="text-lg" style={{ color: '#3e8672' }}>
              Poems Collected
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Curated from classical and contemporary Spanish literature
            </div>
          </div>
          {/* Poems Shared */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2" style={{ borderColor: '#7caaf0' }}>
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6"
              style={{ backgroundColor: '#ffa93a', color: '#fff' }}>
              <span className="text-3xl">🐘</span>
            </div>
            <div className="text-4xl font-bold mb-2 text-[#303162]">
              {stats?.postedPoems?.toLocaleString() || '0'}
            </div>
            <div className="text-lg" style={{ color: '#7caaf0' }}>
              Poems Shared
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Beautiful verses shared on Mastodon with intelligent formatting
            </div>
          </div>
          {/* Poems Waiting */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2" style={{ borderColor: '#af3f23' }}>
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6"
              style={{ backgroundColor: '#af3f23', color: '#fff' }}>
              <span className="text-3xl">⏳</span>
            </div>
            <div className="text-4xl font-bold mb-2 text-[#303162]">
              {stats?.unusedPoems?.toLocaleString() || '0'}
            </div>
            <div className="text-lg" style={{ color: '#af3f23' }}>
              Poems Waiting
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Ready to be discovered and shared with poetry lovers
            </div>
          </div>
        </div>
        {stats?.lastPostDate && (
          <div className="text-center mt-12">
            <p className="text-[#3e8672]">
              Last poem shared:{' '}
              {new Date(stats.lastPostDate).toLocaleDateString('en-US', {
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
