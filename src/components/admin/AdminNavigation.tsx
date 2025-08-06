'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { Session } from "next-auth"

interface AdminNavigationProps {
  session: Session | null
}


export function AdminNavigation({ session }: AdminNavigationProps) {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/admin" className="text-xl font-bold text-gray-900">
            🤖 SonetoBot Admin
          </Link>
          <Link 
            href="/" 
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            📖 View Public Site
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {session?.user?.image && (
              <img 
                src={session.user.image} 
                alt="Profile" 
                className="w-8 h-8 rounded-full"
              />
            )}
            <span className="text-gray-700 font-medium">
              {session?.user?.name || session?.user?.username}
            </span>
          </div>
          
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
