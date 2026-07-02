export type PolicyImportance = 'high' | 'mid' | 'low'

export type PolicyQuestionAnswer = {
  question: string
  answer: string
  importance?: PolicyImportance | ''
  evidence_url?: string
  note?: string
}