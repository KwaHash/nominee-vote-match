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
