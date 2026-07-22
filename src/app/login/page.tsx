import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  const { error } = await searchParams

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-6 w-full max-w-sm px-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Fortuna</h1>
          <p className="text-sm text-muted-foreground">
            Your personal finance tracker
          </p>
        </div>

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        <form action="/auth/login" method="POST" className="w-full">
          <input type="hidden" name="provider" value="google" />
          <Button type="submit" variant="outline" className="w-full">
            Continue with Google
          </Button>
        </form>
      </div>
    </main>
  )
}