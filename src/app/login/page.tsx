import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GoogleSignIn } from '@/components/auth/google-sign-in'

// The auth routes hand back a short reason code rather than the provider's own
// message, which is technical ("server_error") and arrives from the URL. Each
// code maps to a sentence here; the detail is logged server-side instead.
const ERROR_MESSAGES: Record<string, string> = {
  denied: 'Sign-in was cancelled.',
  provider: 'Google could not complete the sign-in. Please try again.',
  incomplete: 'That sign-in link was incomplete or had expired. Please try again.',
  exchange: 'We could not finish signing you in. Please try again.',
  start: 'We could not start sign-in. Please try again.',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  const { error } = await searchParams
  const message = error
    ? ERROR_MESSAGES[error] ?? 'Something went wrong signing in. Please try again.'
    : null

  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted p-4 dark:bg-background">
      {/* The card has to sit *above* the page in both themes, and no single token
          does that: in light, --background and --card are both pure white, so only
          --muted separates them; in dark, --muted is lighter than --card and the
          card would sink instead. Hence muted in light, background in dark. */}
      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center gap-5 text-center">
          {/* The mark is a solid black tile, so it needs a ring to hold an edge
              against the near-black card in dark mode. */}
          <Image
            src="/icon-192x192.png"
            alt=""
            width={48}
            height={48}
            priority
            className="rounded-xl ring-1 ring-border"
          />

          <div className="flex flex-col gap-1.5">
            <h1 className="text-xl font-semibold tracking-tight">Fortuna</h1>
            <p className="text-sm text-balance text-muted-foreground">
              Track spending, subscriptions and budgets in one place.
            </p>
          </div>

          {message && (
            <p
              role="alert"
              className="w-full rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {message}
            </p>
          )}

          <GoogleSignIn />

          <p className="text-xs text-muted-foreground">
            Your data is visible only to your account.
          </p>
        </div>
      </div>
    </main>
  )
}
