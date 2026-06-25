import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Hello, {user.user_metadata.name ?? user.email}
        </h1>
        <p className="text-sm text-muted-foreground">
          Your dashboard is coming soon.
        </p>
        <form action="/auth/signout" method="POST">
          <Button type="submit" variant="ghost" size="sm">
            Sign out
          </Button>
        </form>
      </div>
    </main>
  )
}