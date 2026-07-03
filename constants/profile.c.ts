export const parties = [
  { id: 0, value: '全て政党', label: '全て政党' },
  { id: 1, value: '自民党', label: '自民党' },
  { id: 2, value: '中道改革', label: '中道改革' },
  { id: 3, value: '国民民主党', label: '国民民主党' },
  { id: 4, value: '参政党', label: '参政党' },
  { id: 5, value: 'みらい', label: 'みらい' },
  { id: 6, value: '日本維新', label: '日本維新' },
  { id: 7, value: '共産党', label: '共産党' },
  { id: 8, value: 'れいわ新選', label: 'れいわ新選' },
  { id: 9, value: '日本保守党', label: '日本保守党' },
  { id: 10, value: '社民党', label: '社民党' },
  { id: 11, value: '減ゆ連', label: '減ゆ連' },
  { id: 12, value: '諸派', label: '諸派' },
  { id: 13, value: '再生の道', label: '再生の道' },
  { id: 14, value: '世界平和党', label: '世界平和党' },
  { id: 15, value: '一番星', label: '一番星' },
  { id: 16, value: '未来進歩党', label: '未来進歩党' },
  { id: 17, value: '無所属', label: '無所属' },
]

export const ELECTION_LEVELS = [
  { value: '衆議院', label: '衆議院' },
  { value: '参議院', label: '参議院' },
  { value: '都道府県', label: '都道府県' },
  { value: '市区町村', label: '市区町村' },
] as const

export const POSITION_OPTIONS = [
  { value: '現職', label: '現職' },
  { value: '新人', label: '新人' },
] as const

export const WEBSITE_LINK_LABELS = ['homepage', 'facebook', 'twitter', 'youtube', 'line', 'instagram', 'tiktok', 'linkedin'] as const

export const WEBSITE_FIELD_LABELS: Record<string, string> = {
  homepage: 'ホームページ',
  facebook: 'Facebook',
  twitter: 'X (Twitter)',
  youtube: 'YouTube',
  line: 'LINE',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
} as const