import { NextResponse } from 'next/server'
import { env } from '@/lib/config'
import { createSupabaseServerClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

// Start the Google OAuth flow; returns the provider URL for the client to redirect to.
export async function POST() {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${env.NEXT_PUBLIC_HOST}/api/auth/callback`,
    },
  })

  if (error || !data.url) {
    return NextResponse.json(
      { error: error?.message ?? 'Googleログインに失敗しました' },
      { status: 500 }
    )
  }

  return NextResponse.json({ url: data.url })
}
