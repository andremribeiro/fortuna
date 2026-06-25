import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('subscriptions').select('*')

  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-semibold tracking-tight">Fortuna</h1>
      {error && <p className="text-red-500">{error.message}</p>}
      {data && <p className="text-sm text-gray-400">DB connected ✓</p>}
    </main>
  )
}