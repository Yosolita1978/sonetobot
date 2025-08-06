'use client'

import { useState, useEffect } from 'react'

interface MastodonPost {
  id: string
  content: string
  url: string
  created_at: string
  poemTitle: string
}

export function MastodonPostsSection() {
  const [posts, setPosts] = useState<MastodonPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/public/mastodon-posts')
        const data = await response.json()
        
        if (data.success) {
          setPosts(data.posts)
        }
      } catch (error) {
        console.error('Failed to fetch Mastodon posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  if (loading) {
    return (
      <div className="py-16 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-red-900 mb-4">
              Recent Poetry Posts
            </h2>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-16 bg-gradient-to-r from-red-50 to-orange-50">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-red-900 mb-4">
            Recent Poetry Posts
          </h2>
          <p className="text-xl text-red-700">
            Latest poems shared on Mastodon
          </p>
        </div>

        {/* Posts List */}
        {posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <div 
                key={post.id} 
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-red-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {post.poemTitle}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(post.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🐘</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 line-clamp-3">
                    {post.content.substring(0, 200)}
                    {post.content.length > 200 ? '...' : ''}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    Read on Mastodon →
                  </a>
                  
                  <div className="text-sm text-gray-500">
                    @sonetobot@col.social
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-full mb-4">
              <span className="text-3xl">🐘</span>
            </div>
            <p className="text-gray-600">
              No recent posts found. Check back soon for new poetry!
            </p>
          </div>
        )}

        {/* Follow Link */}
        <div className="text-center mt-12">
          <a
            href="https://col.social/@sonetobot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <span className="text-xl mr-2">🐘</span>
            Follow @sonetobot for daily poetry
          </a>
        </div>
      </div>
    </div>
  )
}
