'use client'

import { useState } from 'react'

interface ApiResponse {
  success: boolean
  message?: string
  error?: string
  results?: {
    scraped: number
    saved: number
  }
  data?: {
    poemTitle: string
    poemAuthor: string
    mastodonId: string
    mastodonUrl: string
  }
}

export default function Home() {
  const [scrapingStatus, setScrapingStatus] = useState<ApiResponse | null>(null)
  const [postingStatus, setPostingStatus] = useState<ApiResponse | null>(null)
  const [isProcessing, setIsProcessing] = useState({ scrape: false, post: false })

  // Scrape poems function
  const handleScrape = async () => {
    setIsProcessing(prev => ({ ...prev, scrape: true }))
    setScrapingStatus(null)
    
    try {
      console.log('🔍 Starting scrape request...')
      
      const response = await fetch('/api/test_db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'scrape_and_save' })
      })
      
      console.log('📡 Response status:', response.status)
      console.log('📡 Response headers:', response.headers.get('content-type'))
      
      // Always try to parse JSON first (even for error responses)
      let result
      try {
        result = await response.json()
        console.log('📋 API Response:', result)
      } catch (parseError) {
        const text = await response.text()
        console.error('❌ Failed to parse JSON:', text)
        throw new Error(`Failed to parse response as JSON. Status: ${response.status}`)
      }
      
      // Check if the API returned an error
      if (!response.ok) {
        console.error('❌ API returned error:', result)
        setScrapingStatus({
          success: false,
          error: result.error || result.message || `API error: ${response.status}`
        })
        return
      }
      
      console.log('✅ Scrape successful:', result)
      setScrapingStatus(result)
      
    } catch (err: unknown) {
      console.error('❌ Scrape error:', err)
      setScrapingStatus({
        success: false,
        error: err instanceof Error ? err.message : 'Failed to scrape poems'
      })
    } finally {
      setIsProcessing(prev => ({ ...prev, scrape: false }))
    }
  }

  // Post to Mastodon function
  const handlePost = async () => {
    setIsProcessing(prev => ({ ...prev, post: true }))
    setPostingStatus(null)
    
    try {
      console.log('🚀 Starting post request...')
      
      const response = await fetch('/api/post-poem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('📡 Response status:', response.status)
      
      // Always try to parse JSON first (even for error responses)
      let result
      try {
        result = await response.json()
        console.log('📋 API Response:', result)
      } catch (parseError) {
        const text = await response.text()
        console.error('❌ Failed to parse JSON:', text)
        throw new Error(`Failed to parse response as JSON. Status: ${response.status}`)
      }
      
      // Check if the API returned an error
      if (!response.ok) {
        console.error('❌ API returned error:', result)
        setPostingStatus({
          success: false,
          error: result.error || result.message || `API error: ${response.status}`
        })
        return
      }
      
      console.log('✅ Post successful:', result)
      setPostingStatus(result)
      
    } catch (err: unknown) {
      console.error('❌ Post error:', err)
      setPostingStatus({
        success: false,
        error: err instanceof Error ? err.message : 'Failed to post to Mastodon'
      })
    } finally {
      setIsProcessing(prev => ({ ...prev, post: false }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🤖 SonetoBot Dashboard
          </h1>
          <p className="text-gray-600">
            Your Spanish poetry bot is running! Manage poems and share them on Mastodon.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          
          {/* Scrape Poems Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Scrape New Poems</h2>
                <p className="text-gray-600">Fetch fresh poems from palabravirtual.com</p>
              </div>
            </div>
            
            <button
              onClick={handleScrape}
              disabled={isProcessing.scrape}
              className={`
                w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
                ${isProcessing.scrape 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
                }
              `}
            >
              {isProcessing.scrape ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Scraping...
                </span>
              ) : (
                '🔍 Scrape Poems'
              )}
            </button>

            {/* Scraping Results */}
            {scrapingStatus && (
              <div className={`mt-4 p-3 rounded-lg ${scrapingStatus.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                {scrapingStatus.success ? (
                  <div>
                    <div className="flex items-center text-green-800 mb-2">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span className="font-medium">Success!</span>
                    </div>
                    <p className="text-sm text-green-700">{scrapingStatus.message}</p>
                    {scrapingStatus.results && (
                      <div className="mt-2 text-xs text-green-600">
                        Scraped: {scrapingStatus.results.scraped} | Saved: {scrapingStatus.results.saved}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center text-red-800 mb-2">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                      </svg>
                      <span className="font-medium">Error</span>
                    </div>
                    <p className="text-sm text-red-700">{scrapingStatus.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Post to Mastodon Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">🐘</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Post to Mastodon</h2>
                <p className="text-gray-600">Share a random poem on your Mastodon account</p>
              </div>
            </div>
            
            <button
              onClick={handlePost}
              disabled={isProcessing.post}
              className={`
                w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
                ${isProcessing.post 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-md'
                }
              `}
            >
              {isProcessing.post ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Posting...
                </span>
              ) : (
                '🚀 Post Random Poem'
              )}
            </button>

            {/* Posting Results */}
            {postingStatus && (
              <div className={`mt-4 p-3 rounded-lg ${postingStatus.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                {postingStatus.success ? (
                  <div>
                    <div className="flex items-center text-green-800 mb-2">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span className="font-medium">Posted!</span>
                    </div>
                    <p className="text-sm text-green-700">{postingStatus.message}</p>
                    {postingStatus.data?.mastodonUrl && (
                      <a 
                        href={postingStatus.data.mastodonUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        View on Mastodon →
                      </a>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center text-red-800 mb-2">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                      </svg>
                      <span className="font-medium">Error</span>
                    </div>
                    <p className="text-sm text-red-700">{postingStatus.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={async () => {
                await handleScrape()
                setTimeout(handlePost, 2000)
              }}
              disabled={isProcessing.scrape || isProcessing.post}
              className="py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ⚡ Scrape & Post
            </button>
            
            <a
              href="https://col.social/web/@sonetobot"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-4 bg-gray-600 text-white rounded-lg font-medium text-center hover:bg-gray-700 transition-colors duration-200"
            >
              👀 View Mastodon Profile
            </a>

            <a 
              href="/api/test_db" 
              className="py-2 px-4 bg-green-600 text-white rounded-lg font-medium text-center hover:bg-green-700 transition-colors duration-200"
            >
              🔌 Test Database
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>SonetoBot - Sharing Spanish poetry one verse at a time 📖✨</p>
        </div>
      </div>
    </div>
  )
}