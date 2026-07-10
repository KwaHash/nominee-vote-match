export type TxType = 'income' | 'expense'

export interface ExpenseForm {
  type: TxType
  category: string
  amount: number
  date: string
  counterpart: string
  receiptName: string
  receiptUrl: string
  isPublic: boolean
  isRelatedParty: boolean
}

export interface Expense {
  id: string
  candidate_id: string
  type: TxType
  category: string
  amount: number
  date: string
  counterpart: string
  receipt_name: string
  receipt_url: string
  is_public: boolean
  is_related_party: boolean
  created_at: string
  updated_at: string
}
