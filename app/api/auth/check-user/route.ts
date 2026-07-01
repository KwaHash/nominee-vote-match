import { createClient } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/config'

const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req: NextRequest) {
  try {
    const { email } = (await req.json()) as { email: string }

    const { data } = await supabaseAdmin.auth.admin.listUsers()

    const user = data.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    )

    if (!user) {
      return NextResponse.json({ exists: false })
    }

    const isOAuthOnly = user.identities?.every(
      (identity) => identity.provider !== 'email'
    )

    return NextResponse.json({ isExist: !isOAuthOnly })
  } catch (error) {
    return NextResponse.json({
      isExist: false,
      error: error instanceof Error ? error.message : 'Failed to check user',
    })
  }
}
