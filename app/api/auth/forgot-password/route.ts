import { NextResponse, type NextRequest } from 'next/server'
import { env } from '@/lib/config'
import { createSupabaseServerClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

// Forgot password (sends the reset email).
export async function POST(req: NextRequest) {
  const { email } = (await req.json()) as { email: string }

  const supabase = createSupabaseServerClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${env.NEXT_PUBLIC_HOST}/api/auth/callback?next=/reset-password`,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({})
}
