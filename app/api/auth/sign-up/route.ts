import { NextResponse, type NextRequest } from 'next/server'
import { env } from '@/lib/config'
import { createSupabaseServerClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

// Register a new user.
export async function POST(req: NextRequest) {
  const { username, email, password } = (await req.json()) as {
    username: string
    email: string
    password: string
  }

  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${env.NEXT_PUBLIC_HOST}/login`,
      data: {
        display_name: username,
      },
    },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  if (data.user && data.user.identities?.length === 0) {
    return NextResponse.json(
      { error: 'このメールアドレスはすでに登録されています' },
      { status: 409 }
    )
  }

  return NextResponse.json({})
}
