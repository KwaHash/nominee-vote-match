'use server'

import { type Supporter, type SupporterForm } from '@/types/supporter.d'
import { createSupabaseServerClient } from '@/utils/supabase/server'

const SUPPORTER_COLUMNS = [
  'id', 'candidate_id', 'name', 'kind', 'support_types', 'interests',
  'region', 'visibility', 'contact_note', 'next_action', 'created_at', 'updated_at',
].join(', ')

// Fetch a single supporter owned by the current candidate.
export async function getSupporter(id: string): Promise<{
  data: Supporter | null
  error: string | null
}> {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: '認証が必要です。' }
  }

  const { data, error } = await supabase
    .from('candidate_supporters')
    .select(SUPPORTER_COLUMNS)
    .eq('candidate_id', user.id)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: (data as unknown as Supporter | null) ?? null, error: null }
}

// Insert a new supporter for the current candidate (one candidate -> many supporters).
export async function saveSupporter(
  supporter: SupporterForm
): Promise<{ error: string | null }> {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

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

// Update an existing supporter owned by the current candidate.
export async function updateSupporter(
  id: string,
  supporter: SupporterForm
): Promise<{ error: string | null }> {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '認証が必要です。' }
  }

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
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

// Delete a supporter owned by the current candidate.
export async function deleteSupporter(id: string): Promise<{ error: string | null }> {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '認証が必要です。' }
  }

  const { error } = await supabase
    .from('candidate_supporters')
    .delete()
    .eq('candidate_id', user.id)
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}
