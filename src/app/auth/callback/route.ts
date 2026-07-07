import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const providerError = searchParams.get('error_description') ?? searchParams.get('error')

  if (providerError || !code) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(providerError ?? 'Missing auth code')}`
    )
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('Could not sign in')}`
    )
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}