export type AnswerStatus =
  | '未回答'
  | '下書き'
  | '回答提出（運営確認へ）'
  | '回答済み（公開）'
  | '回答辞退'

// Top-voted question forwarded from the citizen-side 公開質問ボード by the admin.
export interface PublicQuestion {
  id: string
  theme_key: string
  title: string
  body: string
  placeholder: string
  votes: number
}

export interface PublicQuestionAnswer {
  question_id: string
  answer_text: string
  source_url?: string
  status: AnswerStatus
}
