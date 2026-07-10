'use server'

import { type Supporter, type SupporterForm } from '@/types/supporter.d'
import { createSupabaseServerClient } from '@/utils/supabase/server'

// Fetch all supporters registered by the current candidate (newest first).
export async function getSupporters(): Promise<{
  data: Supporter[]
  error: string | null
}> {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { data: [], error: '認証が必要です。' }
  }

  const { data, error } = await supabase
    .from('candidate_supporters')
    .select('*')
    .eq('candidate_id', user.id)
    .order('created_at', { ascending: false })
  
  if (error) {
    return { data: [], error: error.message }
  }

  return { data: (data ?? []) as Supporter[], error: null }
}

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
    .select('*')
    .eq('candidate_id', user.id)
    .eq('id', id)
    .limit(1)

  if (error) {
    return { data: null, error: error.message }
  }

  const rows = (data ?? []) as Supporter[]
  return { data: rows[0] ?? null, error: null }
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
