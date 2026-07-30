export type RegionLevel = '市区町村' | '都道府県' | '国会'

export type CrowdfundingVisibility = '一般公開' | '限定公開'

export type CrowdfundingLegalStatus = '未確認' | '確認中' | '承認済み'

export interface CrowdfundingTheme {
  name: string
  allocation: {
    municipality: number
    prefecture: number
    national: number
  }
}

export interface ExpensePlanRow {
  id: number
  purpose: string
  amount: number | ''
}

export interface ExpensePlanItem {
  purpose: string
  amount: number
}

export interface CrowdfundingForm {
  title: string
  theme_id: string
  region_level: RegionLevel
  region_name: string
  goal: number
  expense_plan: ExpensePlanItem[]
  start_date: string
  end_date: string
  outcome: string
  support_types: string[]
  visibility: CrowdfundingVisibility
  legal_status: CrowdfundingLegalStatus
}

// Draft returned by the crowdfunding AI assistant (a subset of the form).
export interface CrowdfundingDraft {
  title: string
  goal: number
  expense_plan: ExpensePlanItem[]
  outcome: string
  support_types: string[]
}

export interface CrowdfundingDraftInput {
  theme: string
  need: string
  regionLevel: RegionLevel
  regionName: string
}

export interface Crowdfunding {
  id: string
  candidate_id: string
  title: string
  theme_id: string
  region_level: RegionLevel
  region_name: string
  goal: number
  expense_plan: ExpensePlanItem[]
  start_date: string | null
  end_date: string | null
  outcome: string
  support_types: string[]
  visibility: CrowdfundingVisibility
  legal_status: CrowdfundingLegalStatus
  created_at: string
  updated_at: string
}
