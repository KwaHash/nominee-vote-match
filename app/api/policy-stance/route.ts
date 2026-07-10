import { NextResponse, type NextRequest } from 'next/server'
import { type PolicyQuestionAnswer } from '@/types/policy.d'
import { createSupabaseServerClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

// Load the current user's saved policy stances (empty array if none yet).
export async function GET() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です。' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('candidate_policy_stances')
    .select('policy_stances')
    .eq('candidate_id', user.id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    policyStances: (data?.policy_stances as PolicyQuestionAnswer[]) ?? [],
  })
}

// Upsert the current user's policy stances (one row per candidate).
export async function PUT(req: NextRequest) {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です。' }, { status: 401 })
  }

  const { policyStances } = (await req.json()) as { policyStances: PolicyQuestionAnswer[] }

  const { error } = await supabase
    .from('candidate_policy_stances')
    .upsert(
      { candidate_id: user.id, policy_stances: policyStances },
      { onConflict: 'candidate_id' }
    )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({})
}
