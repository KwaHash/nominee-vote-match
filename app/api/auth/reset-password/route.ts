import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

// Reset password (uses the recovery session established from the email link).
export async function POST(req: NextRequest) {
  const { password } = (await req.json()) as { password: string }

  const supabase = createSupabaseServerClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({})
}
