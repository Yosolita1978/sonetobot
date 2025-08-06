'use client'

import { useState } from 'react'

interface Poem {
  id: number
  title: string
  author: string
  excerpt: string
}

export function RandomPoemSection() {
  const [poem, setPoem] = useState<Poem | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasRequested, setHasRequested] = useState(false)

  const fetchRandomPoem = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/public/random-poem')
      const data = await response.json()
      if (data.success) {
        setPoem(data.poem)
        setHasRequested(true)
      }
    } catch { }
    setLoading(false)
  }

  return (
    <div className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-[#ffa93a]">
            Discover Spanish Poetry
          </h2>
          <p className="text-xl mb-8 text-[#7caaf0]">
            Experience the beauty of Spanish verse with intelligent formatting
          </p>
          <button
            onClick={fetchRandomPoem}
            disabled={loading}
            className="inline-flex items-center px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 transform"
            style={{
              backgroundColor: '#7caaf0',
              color: '#fff',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading
              ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading poem...
                </span>
              ) : (
                <span className="flex items-center">
                  <span className="text-2xl mr-2">📖</span>
                  Show me a random poem
                </span>
              )}
          </button>
        </div>

        {/* Poem Display */}
        {poem && hasRequested && (
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 mb-8"
            style={{ borderColor: '#7caaf0' }}>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-[#ffa93a] mb-2">«{poem.title}»</h3>
              <p className="text-lg font-medium" style={{ color: '#af3f23' }}>— {poem.author}</p>
            </div>
            <div className="max-w-2xl mx-auto">
              <pre className="text-[#303162] font-serif text-lg leading-relaxed whitespace-pre-wrap text-center">{poem.excerpt}</pre>
            </div>
            <div className="text-center mt-8 space-y-4">
              <button
                onClick={fetchRandomPoem}
                className="inline-flex items-center px-6 py-3 rounded-lg font-medium mr-4 shadow-md"
                style={{ backgroundColor: '#7caaf0', color: '#fff' }}
              >
                🎲 Show another poem
              </button>
              <div className="text-sm" style={{ color: '#7caaf0' }}>
                <a
                  href="https://www.palabravirtual.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  style={{ color: '#3e8672' }}>
                  Discover more poems at palabravirtual.com →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Initial State */}
        {!hasRequested && (
          <div className="text-center mt-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <span className="text-3xl">📜</span>
            </div>
            <p className="text-[#303162]">Click the button above to discover beautiful Spanish poetry</p>
          </div>
        )}
      </div>
    </div>
  )
}

