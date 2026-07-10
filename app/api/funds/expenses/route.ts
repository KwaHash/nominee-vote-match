import { NextResponse, type NextRequest } from 'next/server'
import { type Expense, type ExpenseForm } from '@/types/funds.d'
import { createSupabaseServerClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

// Fetch all income/expense entries registered by the current candidate (newest first).
export async function GET() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です。' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('candidate_expenses')
    .select('*')
    .eq('candidate_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ expenses: (data as Expense[] | null) ?? null })
}

// Insert a new income/expense entry for the current candidate (one candidate -> many entries).
export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です。' }, { status: 401 })
  }

  const expense = (await req.json()) as ExpenseForm

  const { error } = await supabase.from('candidate_expenses').insert({
    candidate_id: user.id,
    type: expense.type,
    category: expense.category,
    amount: expense.amount,
    date: expense.date.replace(/\//g, '-'),
    counterpart: expense.counterpart,
    receipt_name: expense.receiptName,
    receipt_url: expense.receiptUrl,
    is_public: expense.isPublic,
    is_related_party: expense.isRelatedParty,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({})
}
