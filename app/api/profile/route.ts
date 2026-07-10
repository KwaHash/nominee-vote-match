import { NextResponse, type NextRequest } from 'next/server'
import { type ICandidateProfile } from '@/types/profile.d'
import { createSupabaseServerClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

const PROFILE_COLUMNS = [
  'kanji_name', 'hiragana_name', 'avatar', 'party', 'birth_date',
  'election_level', 'district', 'position', 'education', 'career',
  'political_career', 'achievements', 'website', 'custom_items',
].join(', ')

// Load the current candidate's profile (null if not saved yet).
export async function GET() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です。' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('candidate_profiles')
    .select(PROFILE_COLUMNS)
    .eq('candidate_id', user.id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ profile: (data as ICandidateProfile | null) ?? null })
}

// Upsert the current candidate's profile (one row per candidate).
export async function PUT(req: NextRequest) {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です。' }, { status: 401 })
  }

  const profile = (await req.json()) as ICandidateProfile

  const row = {
    candidate_id: user.id,
    kanji_name: profile.kanji_name,
    hiragana_name: profile.hiragana_name,
    avatar: profile.avatar,
    party: profile.party,
    birth_date: profile.birth_date,
    election_level: profile.election_level,
    district: profile.district,
    position: profile.position,
    education: profile.education ?? null,
    career: profile.career ?? null,
    political_career: profile.political_career ?? null,
    achievements: profile.achievements ?? [],
    website: profile.website ?? [],
    custom_items: profile.custom_items ?? [],
  }

  const { error } = await supabase
    .from('candidate_profiles')
    .upsert(row, { onConflict: 'candidate_id' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({})
}
