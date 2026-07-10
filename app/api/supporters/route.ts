import { NextResponse, type NextRequest } from 'next/server'
import { type Supporter, type SupporterForm } from '@/types/supporter.d'
import { createSupabaseServerClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

// Fetch all supporters registered by the current candidate (newest first).
export async function GET() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です。' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('candidate_supporters')
    .select('*')
    .eq('candidate_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ supporters: (data as Supporter[] | null) ?? null })
}

// Insert a new supporter for the current candidate (one candidate -> many supporters).
export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です。' }, { status: 401 })
  }

  const supporter = (await req.json()) as SupporterForm

  const { error } = await supabase.from('candidate_supporters').insert({
    candidate_id: user.id,
    name: supporter.name,
    kind: supporter.kind,
    support_types: supporter.supportTypes,
    interests: supporter.interests,
    region: supporter.region,
    visibility: supporter.visibility,
    contact_note: supporter.contactNote,
    next_action: supporter.nextAction,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({})
}
