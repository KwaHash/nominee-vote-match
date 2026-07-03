import { format, isValid, parse } from 'date-fns'
import * as yup from 'yup'
import { WEBSITE_FIELD_LABELS } from '@/constants/profile.c'
import {
  type AchievementEntry, type CustomItemEntry, type ICandidateProfile,
  type IProfileForm, type WebsiteLinkEntry,
} from '@/types/profile.d'

export const BIRTH_DATE_FORMAT = 'yyyy/MM/dd'
export const BIRTH_DATE_FROM_YEAR = 1920
export const BIRTH_DATE_TO_YEAR = new Date().getFullYear()

export function parseBirthDate(value: string): Date | undefined {
  if (!value) return undefined
  const parsed = parse(value, BIRTH_DATE_FORMAT, new Date())
  return isValid(parsed) ? parsed : undefined
}

export function formatBirthDate(date: Date): string {
  return format(date, BIRTH_DATE_FORMAT)
}

/* Avatar */
export const MAX_PROFILE_AVATAR_SIZE_BYTES = 2 * 1024 * 1024
export const PROFILE_AVATAR_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'
export const PROFILE_AVATAR_MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export function isProfileAvatarValue(value: string | undefined | null): boolean {
  if (!value?.trim()) return false
  const v = value.trim()
  return (
    v.startsWith('data:image/') ||
    v.startsWith('http://') ||
    v.startsWith('https://') ||
    v.startsWith('/')
  )
}

export const getUniqueID = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

export const createWebsiteLinkEntry = (label = '', url = ''): WebsiteLinkEntry => ({
  id: getUniqueID(),
  label,
  url,
})

export const createAchievementEntry = (text = ''): AchievementEntry => ({
  id: getUniqueID(),
  text,
})

export const createCustomItemEntry = (label = '', value = ''): CustomItemEntry => ({
  id: getUniqueID(),
  label,
  value,
})

export function validateCustomItems(items: CustomItemEntry[]): string | null {
  for (const item of items) {
    const label = item.label.trim()
    const value = item.value.trim()
    if (!label) return '項目名を入力してください。'
    if (!value) return `「${label}」の内容を入力してください。`
  }
  return null
}

export function validateWebsiteLinks(links: WebsiteLinkEntry[]): string | null {
  const usedLabels = new Set<string>()
  for (const link of links) {
    const label = link.label.trim()
    const url = link.url.trim()
    if (!label) return 'SNSの種類を選択してください。'
    if (!url) return `${WEBSITE_FIELD_LABELS[label] ?? label}のURLを入力してください。`
    if (!yup.string().url().isValidSync(url)) {
      return `${WEBSITE_FIELD_LABELS[label] ?? label}のURLを正しく入力してください。`
    }
    if (usedLabels.has(label)) return '同じSNSは重複して登録できません。'
    usedLabels.add(label)
  }
  return null
}

export function formToProfilePayload(
  data: IProfileForm,
  websiteLinks: WebsiteLinkEntry[],
  customItems: CustomItemEntry[],
  achievements: AchievementEntry[]
): ICandidateProfile {
  const achievementTexts = achievements
    .map((a) => a.text.trim())
    .filter((text) => text !== '')

  const website = websiteLinks.map((link) => ({
    label: link.label.trim(),
    url: link.url.trim(),
  }))

  const items = customItems.map((item) => ({
    label: item.label.trim(),
    value: item.value.trim(),
  }))

  return {
    kanji_name: data.kanji_name.trim(),
    hiragana_name: data.hiragana_name.trim(),
    avatar: data.avatar.trim(),
    party: data.party.trim(),
    birth_date: data.birth_date.trim(),
    election_level: data.election_level?.trim() ?? '',
    district: data.district?.trim() ?? '',
    position: data.position,
    education: data.education?.trim() || undefined,
    career: data.career?.trim() || undefined,
    political_career: data.political_career?.trim() || undefined,
    website: website.length > 0 ? website : undefined,
    custom_items: items.length > 0 ? items : undefined,
    achievements: achievementTexts.length > 0 ? achievementTexts : undefined,
  }
}
