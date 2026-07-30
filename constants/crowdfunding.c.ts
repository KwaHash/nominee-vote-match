import { type CrowdfundingTheme,
} from '@/types/crowdfunding.d'

export const crowdfundingThemes: CrowdfundingTheme[] = [
  { name: '防災・災害死ゼロ', allocation: { municipality: 40, prefecture: 35, national: 25 } },
  { name: '高齢者熱中症対策', allocation: { municipality: 50, prefecture: 30, national: 20 } },
  { name: '交通事故削減', allocation: { municipality: 45, prefecture: 35, national: 20 } },
  { name: '子育て・教育', allocation: { municipality: 40, prefecture: 30, national: 30 } },
  { name: '入札透明化', allocation: { municipality: 45, prefecture: 35, national: 20 } },
  { name: 'AI行政改革', allocation: { municipality: 30, prefecture: 30, national: 40 } },
  { name: '人権外交', allocation: { municipality: 5, prefecture: 10, national: 85 } },
  { name: 'エネルギー・蓄電池', allocation: { municipality: 20, prefecture: 30, national: 50 } },
  { name: '地方財政改革', allocation: { municipality: 30, prefecture: 30, national: 40 } },
  { name: '観光・温泉振興', allocation: { municipality: 35, prefecture: 35, national: 30 } },
]

export const regionLevels: string[] = [
  '市区町村', '都道府県', '国会'
] as const

export const visibilityOptions: string[] = [
  '一般公開', '限定公開'
] as const

export const legalStatusOptions: string[] = [
  '未確認', '確認中', '承認済み'
] as const
