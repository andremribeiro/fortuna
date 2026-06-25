import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-2xl font-semibold tracking-tight">Fortuna</h1>
        <p className="text-sm text-gray-500">Sign in to continue</p>
        <div className="flex flex-col gap-3 w-full">
          <form action="/auth/login" method="POST">
            <input type="hidden" name="provider" value="github" />
            <button
              type="submit"
              className="w-full rounded-md border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              Continue with GitHub
            </button>
          </form>
          <form action="/auth/login" method="POST">
            <input type="hidden" name="provider" value="google" />
            <button
              type="submit"
              className="w-full rounded-md border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              Continue with Google
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}