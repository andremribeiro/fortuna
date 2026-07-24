import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const providerError = searchParams.get('error_description') ?? searchParams.get('error')

  // Reason codes, not the provider's text: the login page owns the wording, so
  // nothing from the query string is ever rendered back to the user.
  if (providerError || !code) {
    if (providerError) console.error('OAuth provider error:', providerError)
    const reason = searchParams.get('error') === 'access_denied'
      ? 'denied'
      : providerError
        ? 'provider'
        : 'incomplete'
    return NextResponse.redirect(`${origin}/login?error=${reason}`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('Failed to exchange auth code:', error)
    return NextResponse.redirect(`${origin}/login?error=exchange`)
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}