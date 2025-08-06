'use client'

import Image from 'next/image'
import { LoginButton } from '@/components/auth/LoginButton'

export function Hero() {
  return (
    <div className="text-center py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center mb-8">
          <Image
            src="/logosonetobot.png"
            alt="SonetoBot Logo"
            width={140}
            height={140}
            className="rounded-full shadow-xl border-4"
            style={{ borderColor: '#ffa93a' }}
            priority
          />
        </div>
        <h1 className="text-6xl md:text-7xl font-bold mb-2 text-[#ffa93a]">
          Spanish Poetry
        </h1>
        <h2 className="text-3xl md:text-4xl font-semibold mb-6 text-[#7caaf0]">
          Automation Platform
        </h2>
        <p className="text-xl md:text-2xl font-semibold mb-8 max-w-3xl mx-auto leading-relaxed text-[#af3f23]">
          <span className="font-bold text-[#ffa93a]">SonetoBot</span> automáticamente descubre, formatea y comparte la mejor poesía española en Mastodon. Trae siglos de literatura a la era digital.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="https://col.social/@sonetobot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-4 rounded-xl font-bold text-lg shadow-lg"
            style={{ backgroundColor: '#7caaf0', color: '#fff' }}
          >
            🐘 Seguir en Mastodon
          </a>
        </div>
      </div>
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative group">
          <div className="opacity-20 hover:opacity-100 transition-opacity duration-300">
            <LoginButton />
          </div>
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            Admin Access
          </div>
        </div>
      </div>
    </div>
  )
}
