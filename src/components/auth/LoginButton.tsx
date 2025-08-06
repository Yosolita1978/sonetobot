'use client'

import { signIn, useSession } from 'next-auth/react'
import Link from 'next/link'

export function LoginButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-400 rounded-lg cursor-not-allowed">
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading...
      </div>
    )
  }

  if (session) {
    return (
      <Link 
        href="/admin"
        className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
      >
        🔧 Admin Dashboard
      </Link>
    )
  }

  return (
    <button
      onClick={() => signIn('github', { callbackUrl: '/admin' })}
      className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
    >
      🔐 Admin Login
    </button>
  )
}
