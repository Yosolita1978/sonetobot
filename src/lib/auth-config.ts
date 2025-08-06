import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import type { NextAuthOptions } from "next-auth"
import GitHubProvider from "next-auth/providers/github"

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      const authorizedUsername = process.env.AUTHORIZED_GITHUB_USERNAME;
      
      if (account?.provider === "github") {
        const githubProfile = profile as any;
        const username = githubProfile?.login;
        
        if (username === authorizedUsername) {
          return true;
        } else {
          return false;
        }
      }
      
      return false;
    },
    async session({ session, token }) {
      if (token?.username) {
        session.user.username = token.username;
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === "github") {
        const githubProfile = profile as any;
        token.username = githubProfile?.login;
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: "jwt",
  },
}

// Helper function to get session on server side
export async function getSession() {
  return await getServerSession(authOptions);
}

// Helper function to require authentication
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  return session;
}

// Helper function to check if user is authorized
export function isAuthorizedUser(session: any): boolean {
  return session?.user?.username === process.env.AUTHORIZED_GITHUB_USERNAME;
}

