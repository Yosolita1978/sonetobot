'use client';

import { useEffect, useState, Suspense } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const error = searchParams.get('error');

  useEffect(() => {
    // Check if user is already authenticated
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        router.push('/admin');
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn('github', {
        callbackUrl: '/admin',
        redirect: true,
      });
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16" style={{ background: '#ffa93a', borderRadius: '9999px', marginBottom: '1rem' }}>
          <span className="text-2xl">🔐</span>
        </div>
        <h1 className="text-2xl font-bold" style={{ color: '#303162', marginBottom: '0.5rem' }}>
          Admin Access
        </h1>
        <p style={{ color: '#7caaf0' }}>
          Sign in to manage your poetry bot
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4" style={{ background: '#ffeaea', border: '1px solid #af3f23', borderRadius: '1rem' }}>
          <div className="flex items-center" style={{ color: '#af3f23' }}>
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            <div>
              <p className="font-semibold">Access Denied</p>
              {error === 'unauthorized' && (
                <p className="text-sm mt-1">
                  This application is restricted to authorized users only.
                </p>
              )}
              {error === 'OAuthSignin' && (
                <p className="text-sm mt-1">
                  There was a problem signing you in. Please try again.
                </p>
              )}
              {error !== 'unauthorized' && error !== 'OAuthSignin' && (
                <p className="text-sm mt-1">
                  Authentication error: {error}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Login Button */}
      <button
        onClick={handleLogin}
        disabled={isLoading}
        className="w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 transform"
        style={{
          backgroundColor: isLoading ? '#d1d5db' : '#7caaf0',
          color: isLoading ? '#a1a1aa' : '#fff',
          cursor: isLoading ? 'not-allowed' : 'pointer'
        }}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Continue with GitHub
          </span>
        )}
      </button>

      {/* Info Text */}
      <div className="mt-6 text-center">
        <p className="text-sm" style={{ color: '#3e8672' }}>
          Only authorized users can access the admin dashboard.
        </p>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-xs" style={{ color: '#a1a1aa' }}>
          Spanish Poetry Automation Platform
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back to Home Link */}
        <div className="text-center mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center"
            style={{ color: '#7caaf0' }}
          >
            ← Back to Spanish Poetry Platform
          </Link>
        </div>
        {/* Wrap LoginForm in Suspense */}
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
