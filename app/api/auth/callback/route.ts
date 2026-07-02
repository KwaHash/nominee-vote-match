import { type NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/config'
import { createSupabaseServerClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  const nextParam = searchParams.get('next')
  const next = nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/'

  if (code) {
    const supabaseClient = createSupabaseServerClient()
    const { error } = await supabaseClient.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${env.NEXT_PUBLIC_HOST}${next}`)
    }
  }

  return NextResponse.redirect(`${env.NEXT_PUBLIC_HOST}/login`)
}
