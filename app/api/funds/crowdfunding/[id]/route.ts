import { NextResponse, type NextRequest } from 'next/server'
import { type Crowdfunding, type CrowdfundingForm } from '@/types/crowdfunding.d'
import { createSupabaseServerClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

const CROWDFUNDING_COLUMNS = [
  'id', 'candidate_id', 'title', 'theme_id', 'region_level', 'region_name',
  'goal', 'expense_plan', 'start_date', 'end_date', 'outcome', 'support_types',
  'visibility', 'legal_status', 'created_at', 'updated_at',
].join(', ')

// The form sends 'yyyy/MM/dd'; Postgres date columns need 'yyyy-MM-dd'.
const toDateColumn = (value: string) => (value ? value.replace(/\//g, '-') : null)

// Fetch a single crowdfunding project owned by the current candidate.
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です。' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('candidate_crowdfunding')
    .select(CROWDFUNDING_COLUMNS)
    .eq('candidate_id', user.id)
    .eq('id', params.id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ project: (data as unknown as Crowdfunding | null) ?? null })
}

// Update an existing crowdfunding project owned by the current candidate.
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です。' }, { status: 401 })
  }

  const project = (await req.json()) as CrowdfundingForm

  if (!project.title?.trim() || !(project.goal > 0)) {
    return NextResponse.json(
      { error: 'プロジェクト名と目標金額は必須です。' },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from('candidate_crowdfunding')
    .update({
      title: project.title,
      theme_id: project.theme_id,
      region_level: project.region_level,
      region_name: project.region_name,
      goal: project.goal,
      expense_plan: project.expense_plan,
      start_date: toDateColumn(project.start_date),
      end_date: toDateColumn(project.end_date),
      outcome: project.outcome,
      support_types: project.support_types,
      visibility: project.visibility,
      legal_status: project.legal_status,
    })
    .eq('candidate_id', user.id)
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({})
}

// Delete a crowdfunding project owned by the current candidate.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です。' }, { status: 401 })
  }

  const { error } = await supabase
    .from('candidate_crowdfunding')
    .delete()
    .eq('candidate_id', user.id)
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({})
}
