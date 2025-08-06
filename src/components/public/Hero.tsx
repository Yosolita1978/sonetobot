'use client'

import { LoginButton } from '@/components/auth/LoginButton'

export function Hero() {
  return (
    <div className="text-center py-20 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Main Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-amber-500 to-red-500 rounded-full mb-8 shadow-lg">
          <span className="text-4xl">🤖</span>
        </div>

        {/* Title */}
        <h1 className="text-6xl md:text-7xl font-bold mb-6">
          <span className="bg-gradient-to-r from-amber-600 via-red-600 to-orange-600 bg-clip-text text-transparent">
            Spanish Poetry
          </span>
          <br />
          <span className="text-amber-900">
            Automation Platform
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-amber-800 mb-8 max-w-3xl mx-auto leading-relaxed">
          <span className="font-semibold text-red-700">SonetoBot</span> automatically discovers, formats, and shares beautiful Spanish poetry on Mastodon. 
          Bringing centuries of literary heritage to the digital age.
        </p>

        {/* CTA Buttons - Admin login now discrete */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="https://col.social/@sonetobot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-semibold text-lg hover:from-red-700 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            🐘 Follow on Mastodon
          </a>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 flex justify-center space-x-8 text-4xl opacity-60">
          <span>📖</span>
          <span>✨</span>
          <span>🎭</span>
          <span>🌹</span>
        </div>
      </div>

      {/* Discrete Admin Access - Bottom Right Corner */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative group">
          {/* Small discrete button */}
          <div className="opacity-20 hover:opacity-100 transition-opacity duration-300">
            <LoginButton />
          </div>
          
          {/* Tooltip on hover */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            Admin Access
          </div>
        </div>
      </div>
    </div>
  )
}
