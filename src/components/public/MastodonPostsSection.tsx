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
        if (data.success) setPosts(data.posts)
      } catch { }
      setLoading(false)
    }
    fetchPosts()
  }, [])

  if (loading) {
    return (
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-[#ffa93a]">Recent Poetry Posts</h2>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 shadow-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-[#ffa93a]">
            Recent Poetry Posts
          </h2>
          <p className="text-xl mb-8 text-[#7caaf0]">
            Latest poems shared on Mastodon
          </p>
        </div>
        {posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map(post => (
              <div key={post.id}
                className="bg-white rounded-2xl p-6 shadow-lg border-2"
                style={{ borderColor: '#7caaf0' }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1 text-[#ffa93a]">
                      {post.poemTitle}
                    </h3>
                    <p className="text-sm text-[#3e8672]">
                      {new Date(post.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: '#7caaf0', color: '#fff' }}>
                    <span className="text-2xl">🐘</span>
                  </div>
                </div>
                <div className="mb-4">
                  <pre className="text-[#303162] font-serif text-base leading-relaxed whitespace-pre-wrap">
                    {post.content.length > 300
                      ? post.content.substring(0, post.content.lastIndexOf('\n', 300)) + '\n...'
                      : post.content}
                  </pre>
                </div>
                <div className="flex items-center justify-between">
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 rounded-lg font-medium"
                    style={{ backgroundColor: '#7caaf0', color: '#fff' }}
                  >
                    Read on Mastodon →
                  </a>
                  <div className="text-sm text-[#7caaf0]">
                    @sonetobot@col.social
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <span className="text-3xl">🐘</span>
            </div>
            <p className="text-[#303162]">No recent posts found. Check back soon for new poetry!</p>
          </div>
        )}
        <div className="text-center mt-12">
          <a
            href="https://col.social/@sonetobot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 rounded-xl font-semibold shadow-lg"
            style={{ backgroundColor: '#7caaf0', color: '#fff' }}
          >
            <span className="text-xl mr-2">🐘</span>
            Follow @sonetobot for daily poetry
          </a>
        </div>
      </div>
    </div>
  )
}

