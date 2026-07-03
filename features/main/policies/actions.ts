'use server'

import { type PolicyQuestionAnswer } from '@/types/policy.d'
import { createSupabaseServerClient } from '@/utils/supabase/server'

// Load the current user's saved policy stances (empty array if none yet).
export async function getPolicyStance(): Promise<{
  policyStances: PolicyQuestionAnswer[];
  error: string | null;
}> {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { policyStances: [], error: '認証が必要です。' }
  }

  const { data, error } = await supabase
    .from('candidate_policy_stances')
    .select('policy_stances')
    .eq('candidate_id', user.id)
    .maybeSingle()

  if (error) {
    return { policyStances: [], error: error.message }
  }

  return {
    policyStances: (data?.policy_stances as PolicyQuestionAnswer[]) ?? [],
    error: null,
  }
}

// Upsert the current user's policy stances (one row per candidate).
export async function savePolicyStance(
  policyStances: PolicyQuestionAnswer[]
): Promise<{ error: string | null }> {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: '認証が必要です。' }
  }

  const { error } = await supabase
    .from('candidate_policy_stances')
    .upsert(
      { candidate_id: user.id, policy_stances: policyStances },
      { onConflict: 'candidate_id' }
    )
  
  if (error) {
    return { error: error.message }
  }

  return { error: null }
}
