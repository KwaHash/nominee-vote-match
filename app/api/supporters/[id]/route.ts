import { NextResponse, type NextRequest } from 'next/server'
import { type Supporter, type SupporterForm } from '@/types/supporter.d'
import { createSupabaseServerClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

const SUPPORTER_COLUMNS = [
  'id', 'candidate_id', 'name', 'kind', 'support_types', 'interests',
  'region', 'visibility', 'contact_note', 'next_action', 'created_at', 'updated_at',
].join(', ')

// Fetch a single supporter owned by the current candidate.
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です。' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('candidate_supporters')
    .select(SUPPORTER_COLUMNS)
    .eq('candidate_id', user.id)
    .eq('id', params.id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ supporter: (data as unknown as Supporter | null) ?? null })
}

// Update an existing supporter owned by the current candidate.
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です。' }, { status: 401 })
  }

  const supporter = (await req.json()) as SupporterForm

  const { error } = await supabase
    .from('candidate_supporters')
    .update({
      name: supporter.name,
      kind: supporter.kind,
      support_types: supporter.supportTypes,
      interests: supporter.interests,
      region: supporter.region,
      visibility: supporter.visibility,
      contact_note: supporter.contactNote,
      next_action: supporter.nextAction,
    })
    .eq('candidate_id', user.id)
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({})
}

// Delete a supporter owned by the current candidate.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です。' }, { status: 401 })
  }

  const { error } = await supabase
    .from('candidate_supporters')
    .delete()
    .eq('candidate_id', user.id)
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({})
}
