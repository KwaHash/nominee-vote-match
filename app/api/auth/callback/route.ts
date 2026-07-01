import { type NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/config'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabaseClient = createClient()
    const { error } = await supabaseClient.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabaseClient.auth.getUser()
      if (user) {
        return NextResponse.redirect(`${env.NEXT_PUBLIC_HOST}`)
      }
    }
  }

  return NextResponse.redirect(`${env.NEXT_PUBLIC_HOST}/login`)
}
