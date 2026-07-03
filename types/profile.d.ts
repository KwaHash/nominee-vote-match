export type ProfileWebsiteLink = {
  label: string
  url: string
}

export type WebsiteLinkEntry = ProfileWebsiteLink & { id: string }

export type ProfileCustomItem = {
  label: string
  value: string
}

export type CustomItemEntry = ProfileCustomItem & { id: string }

export type AchievementEntry = { id: string; text: string }

export interface ICandidateProfile {
  kanji_name: string
  hiragana_name: string
  avatar: string
  party: string
  birth_date: string
  election_level: string
  district: string
  position: string
  education?: string
  career?: string
  political_career?: string
  achievements?: string[]
  website?: ProfileWebsiteLink[]
  custom_items?: ProfileCustomItem[]
}

export type IProfileForm = Omit<ICandidateProfile, 'achievements' | 'website' | 'custom_items'>
