import { type AnswerStatus, type PublicQuestion } from '@/types/public-answer.d'

export const qboardThemes = [
  '子育て・教育', '防災・安全', '財政・税金','行政改革・DX',
  '福祉・高齢者', 'まちづくり・交通', '透明性・政治姿勢'
] as const

// Statuses a candidate may set themselves (everything before admin approval).
export const answerStatusOptions = [
  '下書き', '回答提出（運営確認へ）', '回答辞退'
] as const

export const answerStatusClassName: Record<AnswerStatus, string> = {
  未回答: 'bg-gray-100 text-gray-500',
  下書き: 'bg-amber-50 text-amber-700',
  '回答提出（運営確認へ）': 'bg-emerald-50 text-emerald-700',
  '回答済み（公開）': 'bg-slate-800 text-white',
  回答辞退: 'bg-rose-50 text-rose-600',
}

export const answeredStatuses: AnswerStatus[] = [
  '下書き', '回答提出（運営確認へ）', '回答済み（公開）', '回答辞退',
]

// Questions sent by the admin to every candidate under identical conditions.
export const publicQuestions: PublicQuestion[] = [
  {
    id: '88d3d19d-ae35-40ac-8e6a-1b610412bf02',
    theme_key: '財政・税金',
    title: '杉並区の財政をどう評価し、どう改善しますか？',
    body: '今後4年間で、どの支出を増やし、どの支出を見直すか具体的に教えてください。',
    placeholder: '例: 現在の財政状況は〇〇と評価しています。今後4年間で防災と子育てへの支出を増やし、〇〇事業は段階的に見直します。財源は〇〇の削減で確保します。',
    votes: 142,
  },
  {
    id: '088b9b9a-c2d0-499f-a375-398e18afff9d',
    theme_key: '防災・安全',
    title: '災害時の死者を減らすため、最初の1年で何を優先しますか？',
    body: '避難所環境・高齢者避難・要支援者支援の優先順位を教えてください。',
    placeholder: '例: 最優先は高齢者・要支援者の避難体制です。1年目に個別避難計画を〇〇件策定し、避難所には空調と蓄電池を〇〇か所整備します。',
    votes: 98,
  },
  {
    id: '6f087be3-ca72-44b9-b4c4-4cfcca1c3e58',
    theme_key: '子育て・教育',
    title: '最初の1年で実行する子育て政策は何ですか？',
    body: '財源とあわせて、最優先の施策を教えてください。',
    placeholder: '例: 最優先は保育の受け皿拡大です。財源は〇〇の見直しで年間〇〇万円を確保し、初年度に〇〇人分を増やします。',
    votes: 76,
  },
]
