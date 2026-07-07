export type SupporterKind = '個人' | '団体'

export type SupporterVisibility = '非公開' | '匿名' | '公開'

export interface SupporterForm {
  name: string
  kind: SupporterKind
  supportTypes: string[]
  interests: string[]
  region: string
  contactNote: string
  nextAction: string
  visibility: SupporterVisibility
}

export interface Supporter {
  id: string
  candidate_id: string
  name: string
  kind: SupporterKind
  support_types: string[]
  interests: string[]
  region: string
  visibility: SupporterVisibility
  contact_note: string
  next_action: string
  created_at: string
  updated_at: string
}
