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

export default function AdminDashboard() {
  const [scrapingStatus, setScrapingStatus] = useState<ApiResponse | null>(null)
  const [postingStatus, setPostingStatus] = useState<ApiResponse | null>(null)
  const [formatTest, setFormatTest] = useState<FormatTestResponse | null>(null);
  const [fixStatus, setFixStatus] = useState<ApiResponse | null>(null);
  const [clearStatus, setClearStatus] = useState<ApiResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState({ scrape: false, post: false, format: false, fix: false, clear: false })

  // Helper function to safely parse JSON response
  const safeJsonParse = async (response: Response) => {
    const text = await response.text();
    
    if (!text) {
      throw new Error(`Empty response from server. Status: ${response.status}`);
    }
    
    if (text.startsWith('<!DOCTYPE html>')) {
      throw new Error(`Got HTML instead of JSON. API route may not exist or authentication failed. Status: ${response.status}`);
    }
    
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse JSON:', text);
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
    }
  };

  // Scrape poems function
  const handleScrape = async () => {
    setIsProcessing(prev => ({ ...prev, scrape: true }))
    setScrapingStatus(null)
    setFormatTest(null)
    
    try {
      //console.log('Making API call to /api/admin/test-db');
      const response = await fetch('/api/admin/test-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'scrape_and_save' })
      })
      
      //console.log('Response status:', response.status);
      const result = await safeJsonParse(response);
      
      if (!response.ok) {
        setScrapingStatus({
          success: false,
          error: result.error || result.message || `API error: ${response.status}`
        })
        return
      }
      
      setScrapingStatus(result)
      
    } catch (err: unknown) {
      console.error('Scrape error:', err);
      setScrapingStatus({
        success: false,
        error: err instanceof Error ? err.message : 'Failed to scrape poems'
      })
    } finally {
      setIsProcessing(prev => ({ ...prev, scrape: false }))
    }
  }

  // Fix null used values function
  const handleFixNullValues = async () => {
    setIsProcessing(prev => ({ ...prev, fix: true }))
    setFixStatus(null)
    
    try {
      //console.log('Making API call to /api/admin/test-db for fix_null_used');
      const response = await fetch('/api/admin/test-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'fix_null_used' })
      })
      
     // console.log('Fix response status:', response.status);
      const result = await safeJsonParse(response);
      
      if (!response.ok) {
        setFixStatus({
          success: false,
          error: result.error || result.message || `API error: ${response.status}`
        })
        return
      }
      
      setFixStatus(result)
      
    } catch (err: unknown) {
      console.error('Fix null values error:', err);
      setFixStatus({
        success: false,
        error: err instanceof Error ? err.message : 'Failed to fix null values'
      })
    } finally {
      setIsProcessing(prev => ({ ...prev, fix: false }))
    }
  }

  // Clear unused poems function
  const handleClearUnused = async () => {
    if (!confirm('This will delete ALL unused poems from the database. Are you sure?')) return;
    setIsProcessing(prev => ({ ...prev, clear: true }))
    setClearStatus(null)

    try {
      const response = await fetch('/api/admin/test-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear_unused' })
      })

      const result = await safeJsonParse(response);

      if (!response.ok) {
        setClearStatus({
          success: false,
          error: result.error || result.message || `API error: ${response.status}`
        })
        return
      }

      setClearStatus(result)
    } catch (err: unknown) {
      console.error('Clear unused error:', err);
      setClearStatus({
        success: false,
        error: err instanceof Error ? err.message : 'Failed to clear unused poems'
      })
    } finally {
      setIsProcessing(prev => ({ ...prev, clear: false }))
    }
  }

  // Post to Mastodon function
  const handlePost = async () => {
    setIsProcessing(prev => ({ ...prev, post: true }))
    setPostingStatus(null)
    setFormatTest(null)
    
    try {
     //console.log('Making API call to /api/admin/post-poem');
      const response = await fetch('/api/admin/post-poem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
     //console.log('Post response status:', response.status);
      const result = await safeJsonParse(response);
      
      if (!response.ok) {
        setPostingStatus({
          success: false,
          error: result.error || result.message || `API error: ${response.status}`
        })
        return
      }
      
      setPostingStatus(result)
      
    } catch (err: unknown) {
      console.error('Post error:', err);
      setPostingStatus({
        success: false,
        error: err instanceof Error ? err.message : 'Failed to post to Mastodon'
      })
    } finally {
      setIsProcessing(prev => ({ ...prev, post: false }))
    }
  }

  // Test formatter function
  const handleFormatTest = async () => {
    setIsProcessing(prev => ({ ...prev, format: true }));
    setFormatTest(null);
    try {
      //console.log('Making API call to /api/admin/test-db for format test');
      const response = await fetch('/api/admin/test-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_sonnet_format' })
      });
      
      //console.log('Format test response status:', response.status);
      const result = await safeJsonParse(response);
      setFormatTest(result);
    } catch (err) {
      console.error('Format test error:', err);
      setFormatTest({ 
        success: false, 
        error: err instanceof Error ? err.message : 'Client error' 
      });
    } finally {
      setIsProcessing(prev => ({ ...prev, format: false }));
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full mb-6">
          <span className="text-3xl">🤖</span>
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          Admin Dashboard
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Manage your Spanish poetry bot - scrape poems, test formatting, and post to Mastodon.
        </p>
      </div>

      {/* Database Fix Alert */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mr-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-yellow-800">Database Maintenance</h3>
            <p className="text-yellow-700">Fix any database inconsistencies (null values).</p>
          </div>
        </div>
        
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={handleFixNullValues}
            disabled={isProcessing.fix}
            className={`
              py-3 px-6 rounded-xl font-semibold transition-all duration-200
              ${isProcessing.fix
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-yellow-600 text-white hover:bg-yellow-700'
              }
            `}
          >
            {isProcessing.fix ? 'Fixing...' : '🔧 Fix Database Issues'}
          </button>

          <button
            onClick={handleClearUnused}
            disabled={isProcessing.clear}
            className={`
              py-3 px-6 rounded-xl font-semibold transition-all duration-200
              ${isProcessing.clear
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
              }
            `}
          >
            {isProcessing.clear ? 'Deleting...' : '🗑️ Clear Unused Poems'}
          </button>
        </div>

        {fixStatus && (
          <div className={`mt-4 p-3 rounded-xl ${fixStatus.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            {fixStatus.success ? (
              <div className="text-green-800">
                <span className="font-semibold">✅ Fixed!</span>
                <p className="text-sm mt-1">{fixStatus.message}</p>
              </div>
            ) : (
              <div className="text-red-800">
                <span className="font-semibold">❌ Error:</span>
                <p className="text-sm mt-1">{fixStatus.error}</p>
              </div>
            )}
          </div>
        )}

        {clearStatus && (
          <div className={`mt-4 p-3 rounded-xl ${clearStatus.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            {clearStatus.success ? (
              <div className="text-green-800">
                <span className="font-semibold">✅ Cleared!</span>
                <p className="text-sm mt-1">{clearStatus.message}</p>
              </div>
            ) : (
              <div className="text-red-800">
                <span className="font-semibold">❌ Error:</span>
                <p className="text-sm mt-1">{clearStatus.error}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Action Cards */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        
        {/* Scrape Poems Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-5">
              <span className="text-3xl">📚</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Scrape New Poems</h2>
              <p className="text-gray-600 mt-1">Fetch fresh poems with intelligent formatting</p>
            </div>
          </div>
          
          <button
            onClick={handleScrape}
            disabled={isProcessing.scrape}
            className={`
              w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 transform
              ${isProcessing.scrape 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed scale-95' 
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 hover:scale-105 hover:shadow-lg'
              }
            `}
          >
            {isProcessing.scrape ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Scraping poems...
              </span>
            ) : (
              '🔍 Scrape Poems'
            )}
          </button>

          {/* Scraping Results */}
          {scrapingStatus && (
            <div className={`mt-6 p-4 rounded-xl ${scrapingStatus.success ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
              {scrapingStatus.success ? (
                <div>
                  <div className="flex items-center text-emerald-800 mb-2">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span className="font-semibold">Success!</span>
                  </div>
                  <p className="text-emerald-700">{scrapingStatus.message}</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center text-red-800 mb-2">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    <span className="font-semibold">Error</span>
                  </div>
                  <p className="text-red-700">{scrapingStatus.error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Post to Mastodon Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-5">
              <span className="text-3xl">🐘</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Post to Mastodon</h2>
              <p className="text-gray-600 mt-1">Share a beautifully formatted poem</p>
            </div>
          </div>
          
          <button
            onClick={handlePost}
            disabled={isProcessing.post}
            className={`
              w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 transform
              ${isProcessing.post 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed scale-95' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:scale-105 hover:shadow-lg'
              }
            `}
          >
            {isProcessing.post ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Posting to Mastodon...
              </span>
            ) : (
              '🚀 Post Random Poem'
            )}
          </button>

          {/* Posting Results */}
          {postingStatus && (
            <div className={`mt-6 p-4 rounded-xl ${postingStatus.success ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
              {postingStatus.success ? (
                <div>
                  <div className="flex items-center text-emerald-800 mb-2">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span className="font-semibold">Posted Successfully!</span>
                  </div>
                  <p className="text-emerald-700 mb-3">{postingStatus.message}</p>
                  {postingStatus.data?.mastodonUrl && (
                    <a 
                      href={postingStatus.data.mastodonUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                    >
                      View on Mastodon →
                    </a>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center text-red-800 mb-2">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    <span className="font-semibold">Error</span>
                  </div>
                  <p className="text-red-700">{postingStatus.error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Format Test Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8 hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mr-5">
            <span className="text-3xl">🧪</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Test Poem Formatter</h2>
            <p className="text-gray-600 mt-1">Preview how poems will look when posted</p>
          </div>
        </div>
        
        <button
          onClick={handleFormatTest}
          disabled={isProcessing.format}
          className={`
            py-3 px-6 rounded-xl font-semibold transition-all duration-200 transform
            ${isProcessing.format 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 hover:scale-105'
            }
          `}
        >
          {isProcessing.format ? 'Testing...' : '🧪 Test Formatter'}
        </button>
        
        {formatTest && (
          <div className="mt-6 grid lg:grid-cols-2 gap-6">
            {formatTest.success ? (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Original (from Scraper):</h3>
                  <pre className="bg-blue-50 p-4 rounded-xl text-sm font-serif whitespace-pre-wrap border-l-4 border-blue-500 text-gray-800 max-h-64 overflow-y-auto">
                    {formatTest.original}
                  </pre>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Formatted for Mastodon:</h3>
                  <pre className="bg-emerald-50 p-4 rounded-xl text-sm font-serif whitespace-pre-wrap border-l-4 border-emerald-500 text-gray-800 max-h-64 overflow-y-auto">
                    {formatTest.formatted}
                  </pre>
                </div>
              </>
            ) : (
              <div className="col-span-2">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center text-red-800">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    <span className="font-semibold">Error: {formatTest.error}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
            ⚡
          </span>
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={async () => {
              await handleScrape()
              setTimeout(handlePost, 2000)
            }}
            disabled={isProcessing.scrape || isProcessing.post}
            className="py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            ⚡ Scrape & Post
          </button>
          
          <a
            href="https://col.social/web/@sonetobot"
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 px-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-semibold text-center hover:from-gray-700 hover:to-gray-800 transition-all duration-200 transform hover:scale-105"
          >
            👀 View Profile
          </a>

          <a 
            href="/api/admin/test-db" 
            className="py-3 px-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-semibold text-center hover:from-emerald-700 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
          >
            🔌 Test Database
          </a>

          <button
            onClick={() => window.location.reload()}
            className="py-3 px-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl font-semibold hover:from-slate-700 hover:to-slate-800 transition-all duration-200 transform hover:scale-105"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center space-x-2 text-gray-500 text-lg">
          <span>📖</span>
          <span className="font-medium">Admin Dashboard - Manage your poetry bot</span>
          <span>✨</span>
        </div>
      </div>
    </div>
  )
}

