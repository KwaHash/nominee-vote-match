import { NextResponse, type NextRequest } from 'next/server'
import { type Expense, type ExpenseForm } from '@/types/funds.d'
import { createSupabaseServerClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

const EXPENSE_COLUMNS = [
  'id', 'candidate_id', 'type', 'category', 'amount', 'date',
  'counterpart', 'receipt_name', 'receipt_url', 'is_public',
  'is_related_party', 'created_at', 'updated_at',
].join(', ')

// Fetch a single income/expense entry owned by the current candidate.
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です。' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('candidate_expenses')
    .select(EXPENSE_COLUMNS)
    .eq('candidate_id', user.id)
    .eq('id', params.id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ expense: (data as unknown as Expense | null) ?? null })
}

// Update an existing income/expense entry owned by the current candidate.
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です。' }, { status: 401 })
  }

  const expense = (await req.json()) as ExpenseForm

  const { error } = await supabase
    .from('candidate_expenses')
    .update({
      type: expense.type,
      category: expense.category,
      amount: expense.amount,
      // Form stores the date as yyyy/MM/dd; normalize to ISO yyyy-MM-dd for the date column.
      date: expense.date.replace(/\//g, '-'),
      counterpart: expense.counterpart,
      receipt_name: expense.receiptName,
      receipt_url: expense.receiptUrl,
      is_public: expense.isPublic,
      is_related_party: expense.isRelatedParty,
    })
    .eq('candidate_id', user.id)
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({})
}

// Delete an income/expense entry owned by the current candidate.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '認証が必要です。' }, { status: 401 })
  }

  const { error } = await supabase
    .from('candidate_expenses')
    .delete()
    .eq('candidate_id', user.id)
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({})
}
