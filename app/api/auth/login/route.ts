import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

// Log in with email and password (sets the session cookie on success).
export async function POST(req: NextRequest) {
  const { email, password } = (await req.json()) as { email: string; password: string }

  const supabase = createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }

  return NextResponse.json({})
}
