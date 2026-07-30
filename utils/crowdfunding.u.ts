import { format, isValid, parse } from 'date-fns'
import { supportTypes } from '@/constants/supporter.c'
import { type CrowdfundingDraft, type CrowdfundingDraftInput, type ExpensePlanItem } from '@/types/crowdfunding.d'

export const CAMPAIGN_DATE_FORMAT = 'yyyy/MM/dd'
// Campaign periods run into the future, so the calendar covers this year onward.
export const CAMPAIGN_DATE_FROM_YEAR = new Date().getFullYear()
export const CAMPAIGN_DATE_TO_YEAR = new Date().getFullYear() + 3

export function parseCampaignDate(value: string): Date | undefined {
  if (!value) return undefined
  const parsed = parse(value, CAMPAIGN_DATE_FORMAT, new Date())
  return isValid(parsed) ? parsed : undefined
}

export function formatCampaignDate(date: Date): string {
  return format(date, CAMPAIGN_DATE_FORMAT)
}

/* Support types */

// Keep support types in the order declared in the constant, not in the order they were toggled.
const supportTypeOrder = new Map<string, number>(supportTypes.map((t, i) => [t, i]))

export const sortSupportTypes = (values: string[]) =>
  [...values].sort(
    (a, b) => (supportTypeOrder.get(a) ?? supportTypes.length) - (supportTypeOrder.get(b) ?? supportTypes.length)
  )

/* Draft assistant */

const DRAFT_ERROR = '下書きの生成に失敗しました。もう一度お試しください。'

const draftSystemPrompt = `あなたは、日本の政治家・候補者を長年支えてきた、経験豊かな政策秘書です。
指定された政策テーマと困りごとをもとに、政策単位のクラウドファンディング（政策応援ページ）の下書きをJSONで作成します。

【出力するJSONの形式】
{
  "title": "プロジェクト名（30〜60字程度。対象地域と課題、何をするのかが一目で分かる具体的な名称）",
  "goal": 目標金額（円・整数。1000000〜10000000の範囲で、課題の規模に見合う金額）,
  "expense_plan": [{ "purpose": "用途（例: 政策調査）", "amount": 金額（円・整数） }],
  "outcome": "成果目標（80〜150字程度。議会質問・提言書・説明会など、達成を検証できる具体的な形で）",
  "support_types": ["募集する支援タイプ"]
}

【条件】
・expense_plan は4〜7項目とし、amount の合計を goal と完全に一致させてください。
・support_types は次の選択肢の中からのみ、2〜4個選んでください: ${supportTypes.join(' / ')}
・日本語を母語とする書き手による、自然で具体的な文章にしてください。AIが書いたと分かる紋切り型の表現は避けてください。
・事実に反する断定や過度な誇張は避け、有権者の信頼を損なわないようにしてください。
・JSON以外の文字（前置き・解説・コードブロック記号）は一切出力しないでください。`

const draftUserPrompt = ({ theme, need, regionLevel, regionName }: CrowdfundingDraftInput) =>
  `政策テーマ：「${theme}」
対象地域レベル：${regionLevel}
地域名：${regionName || '未指定（テーマに合う一般的な地域像で構いません）'}
困りごと：${need || `未指定（「${theme}」で典型的な課題を想定してください）`}`

const toPositiveInt = (value: unknown) => {
  const num = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(num) && num > 0 ? Math.round(num) : 0
}

const toTrimmed = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

// The model is asked for JSON only, but strip any stray prose/fences before parsing.
const parseDraftJson = (text: string): Record<string, unknown> => {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end <= start) throw new Error(DRAFT_ERROR)
  try {
    return JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>
  } catch {
    throw new Error(DRAFT_ERROR)
  }
}

const normalizeDraft = (text: string): CrowdfundingDraft => {
  const raw = parseDraftJson(text)

  const expensePlan: ExpensePlanItem[] = (Array.isArray(raw.expense_plan) ? raw.expense_plan : [])
    .map((item) => {
      const row = (item ?? {}) as { purpose?: unknown; amount?: unknown }
      return { purpose: toTrimmed(row.purpose), amount: toPositiveInt(row.amount) }
    })
    .filter((item) => item.purpose !== '' && item.amount > 0)

  const title = toTrimmed(raw.title)
  if (!title) throw new Error(DRAFT_ERROR)

  return {
    title,
    goal: toPositiveInt(raw.goal) || expensePlan.reduce((sum, item) => sum + item.amount, 0),
    expense_plan: expensePlan,
    outcome: toTrimmed(raw.outcome),
    support_types: sortSupportTypes(
      (Array.isArray(raw.support_types) ? raw.support_types : [])
        .map(toTrimmed)
        .filter((value): value is string => (supportTypes as readonly string[]).includes(value))
    ),
  }
}

export async function requestCrowdfundingDraft(input: CrowdfundingDraftInput): Promise<CrowdfundingDraft> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: draftSystemPrompt },
        { role: 'user', content: draftUserPrompt(input) },
      ],
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok || !response.body) throw new Error(DRAFT_ERROR)

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let text = ''

  const flushLines = (final = false) => {
    const parts = buffer.split('\n')
    buffer = final ? '' : parts.pop() ?? ''
    for (const line of parts) {
      const trimmed = line.trim()
      if (!trimmed) continue
      try {
        const parsed = JSON.parse(trimmed) as { content?: { type: string; text?: string }[] }
        const textPart = parsed.content?.find((c) => c.type === 'text')
        if (typeof textPart?.text === 'string') text = textPart.text
      } catch {
        // Ignore partial/non-JSON lines.
      }
    }
  }

  let result = await reader.read()
  while (!result.done) {
    buffer += decoder.decode(result.value, { stream: true })
    flushLines()
    result = await reader.read()
  }
  buffer += decoder.decode()
  flushLines(true)

  return normalizeDraft(text)
}
