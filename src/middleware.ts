import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Get the pathname
    const pathname = req.nextUrl.pathname

    // Check if user is trying to access admin routes
    if (pathname.startsWith('/admin')) {
      // Check if user is authorized (your GitHub username)
      const isAuthorized = req.nextauth.token?.username === process.env.AUTHORIZED_GITHUB_USERNAME
      
      if (!isAuthorized) {
        // Redirect unauthorized users to login
        return NextResponse.redirect(new URL('/login?error=unauthorized', req.url))
      }
    }

    // Also protect admin API routes
    if (pathname.startsWith('/api/admin')) {
      const isAuthorized = req.nextauth.token?.username === process.env.AUTHORIZED_GITHUB_USERNAME
      
      if (!isAuthorized) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized access' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        
        // Allow access to public routes without authentication
        if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
          return true
        }
        
        // For admin routes, require authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    // Match admin routes
    '/admin/:path*',
    // Match admin API routes  
    '/api/admin/:path*'
  ]
}
