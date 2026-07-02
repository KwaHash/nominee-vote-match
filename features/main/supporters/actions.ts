'use server'

import { type SupporterForm } from '@/types/supporter.d'
import { createSupabaseServerClient } from '@/utils/supabase/server'

// Insert a new supporter for the current candidate (one candidate -> many supporters).
export async function saveSupporter(
  supporter: SupporterForm
): Promise<{ error: string | null }> {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '認証が必要です。' }
  }

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
    return { error: error.message }
  }

  return { error: null }
}
