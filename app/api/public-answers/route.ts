import { NextResponse, type NextRequest } from 'next/server'
import { type PublicQuestionAnswer } from '@/types/public-answer.d'
import { createSupabaseServerClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

// Load the current candidate's saved public-question answers (empty array if none yet).
export async function GET() {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です。' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('candidate_public_answers')
    .select('question_id, answer_text, source_url, status')
    .eq('candidate_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    publicAnswers: (data as unknown as PublicQuestionAnswer[] | null) ?? [],
  })
}

// Upsert the current candidate's answers (one row per question_id + candidate_id).
export async function PUT(req: NextRequest) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です。' }, { status: 401 })
  }

  const { publicAnswers } = (await req.json()) as { publicAnswers: PublicQuestionAnswer[] }

  const rows = publicAnswers.map((a) => ({
    candidate_id: user.id,
    question_id: a.question_id,
    answer_text: a.answer_text,
    source_url: a.source_url ?? '',
    status: a.status,
  }))

  const { error } = await supabase
    .from('candidate_public_answers')
    .upsert(rows, { onConflict: 'candidate_id,question_id' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({})
}
