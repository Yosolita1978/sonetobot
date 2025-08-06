import { requireAuth } from '@/lib/auth-config'
import { AdminNavigation } from '@/components/admin/AdminNavigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This ensures the user is authenticated before rendering
  const session = await requireAuth()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <AdminNavigation session={session} />
      {children}
    </div>
  )
}

