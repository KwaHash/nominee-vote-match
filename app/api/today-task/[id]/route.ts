import { NextResponse, type NextRequest } from 'next/server'
import { type TaskForm } from '@/types/today-task.d'
import { createSupabaseServerClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

const toDateColumn = (value: string) => (value ? value.replace(/\//g, '-') : null)

// Update a task owned by the current candidate (status cycling included).
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です。' }, { status: 401 })
  }

  const task = (await req.json()) as TaskForm

  if (!task.title?.trim()) {
    return NextResponse.json({ error: 'タスク名は必須です。' }, { status: 400 })
  }

  const { error } = await supabase
    .from('candidate_tasks')
    .update({
      title: task.title.trim(),
      category: task.category,
      due_date: toDateColumn(task.due_date),
      status: task.status,
    })
    .eq('candidate_id', user.id)
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({})
}

// Delete a task owned by the current candidate.
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です。' }, { status: 401 })
  }

  const { error } = await supabase
    .from('candidate_tasks')
    .delete()
    .eq('candidate_id', user.id)
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({})
}
