import { NextResponse, type NextRequest } from 'next/server'
import { type Task, type TaskForm } from '@/types/today-task.d'
import { createSupabaseServerClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

const TASK_COLUMNS = [
  'id', 'candidate_id', 'title', 'category',
  'due_date', 'status', 'created_at', 'updated_at',
].join(', ')

const toDateColumn = (value: string) => (value ? value.replace(/\//g, '-') : null)

export async function GET() {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です。' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('candidate_tasks')
    .select('*')
    .eq('candidate_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ tasks: (data as Task[] | null) ?? [] })
}

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です。' }, { status: 401 })
  }

  const task = (await req.json()) as TaskForm

  if (!task.title?.trim()) {
    return NextResponse.json({ error: 'タスク名は必須です。' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('candidate_tasks')
    .insert({
      candidate_id: user.id,
      title: task.title.trim(),
      category: task.category,
      due_date: toDateColumn(task.due_date),
      status: task.status,
    })
    .select(TASK_COLUMNS)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ task: data as unknown as Task })
}
