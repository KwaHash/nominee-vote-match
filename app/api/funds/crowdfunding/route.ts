import { NextResponse, type NextRequest } from 'next/server'
import { type Crowdfunding, type CrowdfundingForm } from '@/types/crowdfunding.d'
import { createSupabaseServerClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

const toDateColumn = (value: string) => (value ? value.replace(/\//g, '-') : null)

export async function GET() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です。' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('candidate_crowdfunding')
    .select('*')
    .eq('candidate_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ projects: (data as Crowdfunding[] | null) ?? null })
}

export async function POST(req: NextRequest) {
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

  const { error } = await supabase.from('candidate_crowdfunding').insert({
    candidate_id: user.id,
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

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({})
}
