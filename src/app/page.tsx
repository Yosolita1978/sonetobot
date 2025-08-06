'use client'

import { useState } from 'react'

interface ApiResponse {
  success: boolean
  message?: string
  error?: string
  results?: { scraped: number; saved: number }
  data?: { mastodonId: string; mastodonUrl: string }
}

interface FormatTestResponse {
  success: boolean;
  original?: string;
  formatted?: string;
  error?: string;
}

export default function Home() {
  const [scrapingStatus, setScrapingStatus] = useState<ApiResponse | null>(null)
  const [postingStatus, setPostingStatus] = useState<ApiResponse | null>(null)
  const [formatTest, setFormatTest] = useState<FormatTestResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState({ scrape: false, post: false, format: false })

  const handleScrape = async () => {
    setIsProcessing(prev => ({ ...prev, scrape: true }))
    setScrapingStatus(null);
    setFormatTest(null);
    
    try {
      const response = await fetch('/api/test_db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'scrape_and_save' })
      });
      const result = await response.json();
      setScrapingStatus(result);
    } catch (err) {
      setScrapingStatus({ success: false, error: err instanceof Error ? err.message : 'Client error' });
    } finally {
      setIsProcessing(prev => ({ ...prev, scrape: false }))
    }
  }

  const handlePost = async () => {
    setIsProcessing(prev => ({ ...prev, post: true }))
    setPostingStatus(null)
    setFormatTest(null);
    
    try {
      const response = await fetch('/api/post-poem', { method: 'POST' });
      const result = await response.json();
      setPostingStatus(result);
    } catch (err) {
      setPostingStatus({ success: false, error: err instanceof Error ? err.message : 'Client error' });
    } finally {
      setIsProcessing(prev => ({ ...prev, post: false }))
    }
  }

  const handleFormatTest = async () => {
    setIsProcessing(prev => ({ ...prev, format: true }));
    setFormatTest(null);
    try {
      const response = await fetch('/api/test_db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_sonnet_format' })
      });
      const result = await response.json();
      setFormatTest(result);
    } catch (err) {
      setFormatTest({ success: false, error: err instanceof Error ? err.message : 'Client error' });
    } finally {
      setIsProcessing(prev => ({ ...prev, format: false }));
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
            🤖 SonetoBot Dashboard
          </h1>
        </div>

        {/* Test Formatter Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            1. Test the New Formatter
          </h2>
          <p className="text-gray-600 mb-4">
            Fetches one poem and reformats its flat text into a sonnet structure. Displays the "before" and "after" below.
          </p>
          
          <button
            onClick={handleFormatTest}
            disabled={isProcessing.format}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            {isProcessing.format ? 'Testing...' : '🧪 Test Formatter'}
          </button>
          
          {formatTest && (
            <div className="mt-4 p-4 border rounded-lg">
              {formatTest.success ? (
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Original (from Scraper):</h3>
                    {/* BETTER COLORS: Light blue background with dark blue border */}
                    <pre className="bg-blue-50 p-3 rounded text-sm font-serif whitespace-pre-wrap border-l-4 border-blue-500 text-gray-800">
                      {formatTest.original}
                    </pre>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Formatted Result (for Mastodon):</h3>
                    {/* BETTER COLORS: Light green background with dark green border */}
                    <pre className="bg-emerald-50 p-3 rounded text-sm font-serif whitespace-pre-wrap border-l-4 border-emerald-500 text-gray-800">
                      {formatTest.formatted}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-red-600 font-semibold">
                  {formatTest.error || 'An unknown error occurred.'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Scrape New Poems Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            2. Scrape New Poems
          </h2>
          <p className="text-gray-600 mb-4">
            Fetch poems and save the flat text to the database.
          </p>
          
          <button
            onClick={handleScrape}
            disabled={isProcessing.scrape}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            {isProcessing.scrape ? 'Scraping...' : '🔍 Scrape Poems'}
          </button>
          
          {scrapingStatus && (
            <div className={`mt-4 p-4 rounded-lg ${scrapingStatus.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className={scrapingStatus.success ? 'text-green-700' : 'text-red-700'}>
                {scrapingStatus.message || scrapingStatus.error}
              </div>
            </div>
          )}
        </div>

        {/* Post to Mastodon Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            3. Post to Mastodon (Test)
          </h2>
          <p className="text-gray-600 mb-4">
            Logs a reformatted poem to the server console.
          </p>
          
          <button
            onClick={handlePost}
            disabled={isProcessing.post}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            {isProcessing.post ? 'Posting...' : '🚀 Test Post'}
          </button>
          
          {postingStatus && (
            <div className={`mt-4 p-4 rounded-lg ${postingStatus.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className={postingStatus.success ? 'text-green-700' : 'text-red-700'}>
                {postingStatus.message || postingStatus.error}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

