import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

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

        <div className="flex flex-col gap-3 w-full">
          <form action="/auth/login" method="POST">
            <input type="hidden" name="provider" value="github" />
            <Button type="submit" variant="outline" className="w-full">
              Continue with GitHub
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          <form action="/auth/login" method="POST">
            <input type="hidden" name="provider" value="google" />
            <Button type="submit" variant="outline" className="w-full">
              Continue with Google
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}