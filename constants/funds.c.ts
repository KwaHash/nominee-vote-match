export const txTypes = ['income', 'expense'] as const

export const txTypeLabels: Record<(typeof txTypes)[number], string> = {
  income: '収入',
  expense: '支出',
}

export const incomeCategories = [
  '寄付',
  '会費',
  '政治資金パーティー',
  'クラウドファンディング',
  '自己資金',
  '政党支部からの資金',
  'その他',
] as const

export const expenseCategories = [
  '広報費',
  'チラシ',
  'Web広告',
  '動画制作',
  '事務所費',
  '人件費',
  '交通費',
  '会場費',
  '調査費',
  '政策立案費',
  'システム利用料',
  '法務・会計費',
] as const
