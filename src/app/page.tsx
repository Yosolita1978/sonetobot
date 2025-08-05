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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">🤖 SonetoBot Dashboard</h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900">1. Test the New Formatter</h2>
            <p className="text-gray-600 mb-4">Fetches one poem and reformats its flat text into a sonnet structure. Displays the "before" and "after" below.</p>
            <button
              onClick={handleFormatTest}
              disabled={isProcessing.format}
              className="w-full py-3 px-4 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300"
            >
              {isProcessing.format ? 'Testing...' : '🔬 Test New Formatter'}
            </button>
            {formatTest && (
                <div className="mt-4 p-3 rounded-lg bg-gray-50 border">
                    {formatTest.success ? (
                        <div>
                            <h3 className="font-semibold text-gray-800">Original (from Scraper):</h3>
                            <p className="text-sm text-gray-600 p-2 bg-gray-100 rounded mb-4 break-words">{formatTest.original}</p>
                            <h3 className="font-semibold text-gray-800">Formatted Result (for Mastodon):</h3>
                            <pre className="text-sm text-gray-800 p-2 bg-gray-100 rounded whitespace-pre-wrap">{formatTest.formatted}</pre>
                        </div>
                    ) : (
                        <p className="text-red-700">{formatTest.error || 'An unknown error occurred.'}</p>
                    )}
                </div>
            )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900">2. Scrape New Poems</h2>
            <p className="text-gray-600 mb-4">Fetch poems and save the flat text to the database.</p>
            <button
              onClick={handleScrape}
              disabled={isProcessing.scrape}
              className="w-full py-3 px-4 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
            >
              {isProcessing.scrape ? 'Scraping...' : '🔍 Scrape Poems'}
            </button>
            {scrapingStatus && (
              <div className="mt-4 p-3 rounded-lg">
                <p className={scrapingStatus.success ? 'text-green-700' : 'text-red-700'}>
                  {scrapingStatus.message || scrapingStatus.error}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900">3. Post to Mastodon (Test)</h2>
            <p className="text-gray-600 mb-4">Logs a reformatted poem to the server console.</p>
            <button
              onClick={handlePost}
              disabled={isProcessing.post}
              className="w-full py-3 px-4 rounded-lg font-medium bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-300"
            >
              {isProcessing.post ? 'Testing...' : '🚀 Test Post to Console'}
            </button>
            {postingStatus && (
              <div className="mt-4 p-3 rounded-lg">
                <p className={postingStatus.success ? 'text-green-700' : 'text-red-700'}>
                  {postingStatus.message || postingStatus.error}
                </p>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  )
}