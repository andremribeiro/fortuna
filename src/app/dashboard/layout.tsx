import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Google gives us a name and picture on the identity; both are optional, so
  // the sidebar falls back to the email it always has.
  const meta = user.user_metadata ?? {}
  const account = {
    name: (meta.full_name as string | undefined) ?? (meta.name as string | undefined) ?? null,
    email: user.email ?? '',
    avatarUrl: (meta.avatar_url as string | undefined) ?? null,
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar account={account} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6 pb-nav md:pb-6">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}