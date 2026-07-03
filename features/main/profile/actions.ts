'use server'

import { type ICandidateProfile } from '@/types/profile.d'
import { createSupabaseServerClient } from '@/utils/supabase/server'

const PROFILE_COLUMNS = [
  'kanji_name', 'hiragana_name', 'avatar', 'party', 'birth_date',
  'election_level', 'district', 'position', 'education', 'career',
  'political_career', 'achievements', 'website', 'custom_items',
].join(', ')

// Load the current candidate's profile (null if not saved yet).
export async function getProfile(): Promise<{
  profile: ICandidateProfile | null;
  error: string | null;
}> {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { profile: null, error: '認証が必要です。' }
  }

  const { data, error } = await supabase
    .from('candidate_profiles')
    .select(PROFILE_COLUMNS)
    .eq('candidate_id', user.id)
    .maybeSingle()

  if (error) {
    return { profile: null, error: error.message }
  }

  return { profile: (data as ICandidateProfile | null) ?? null, error: null }
}

export async function saveProfile(
  profile: ICandidateProfile
): Promise<{ error: string | null }> {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '認証が必要です。' }
  }

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
    return { error: error.message }
  }

  return { error: null }
}
