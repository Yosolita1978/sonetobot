import { NextAuthOptions, Session } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

/**
 * Extend the session user object for username support
 * (Ensure your NextAuth type augmentation matches this)
 */
declare module "next-auth" {
  interface User {
    username?: string;
  }
  interface Session {
    user: {
      name?: string;
      email?: string;
      image?: string;
      username?: string;
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    })
  ],
  // NextAuth.js callbacks
  callbacks: {
    async signIn({ account, profile }) {
      const authorizedUsername = process.env.AUTHORIZED_GITHUB_USERNAME;
      if (account?.provider === "github") {
        // Typing GitHub profile only for 'login'
        const githubProfile = profile as { login?: string };
        const username = githubProfile?.login;
        return username === authorizedUsername;
      }
      return false;
    },
    async session({ session, token }) {
      // Add username to session.user
      if (token?.username && session?.user) {
        session.user.username = token.username as string;
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === "github") {
        const githubProfile = profile as { login?: string };
        token.username = githubProfile?.login;
      }
      return token;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
};

// Helper function to get session on server side
export async function getSession() {
  return await getServerSession(authOptions);
}

// Helper function to require authentication
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

// Helper function to check if user is authorized (single admin)
export function isAuthorizedUser(session: Session | null): boolean {
  return session?.user?.username === process.env.AUTHORIZED_GITHUB_USERNAME;
}
