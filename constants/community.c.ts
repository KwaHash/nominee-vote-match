import { FaFacebook, FaLine, FaXTwitter } from 'react-icons/fa6'
import { type CommunityChannelMeta, type CommunityReminder } from '@/types/community.d'

export const communityChannels: CommunityChannelMeta[] = [
  {
    value: 'LINE',
    icon: FaLine,
    guide: 'LINE公式アカウントで支援者コミュニティに配信するメッセージです。親しみやすい語りかけの文体で、要点を簡潔にまとめ、最後に返信や参加を促す一言を添えてください。',
  },
  {
    value: 'X',
    icon: FaXTwitter,
    guide: 'X（旧Twitter）に投稿する短い文章です。140字程度を目安に、力強く印象に残る表現でまとめ、必要に応じてハッシュタグを添えてください。',
  },
  {
    value: 'Facebook',
    icon: FaFacebook,
    guide: 'Facebookに投稿する報告文です。活動の背景や思いが伝わる、落ち着いた誠実な文体でまとめ、コメントやシェアを促す一文を添えても構いません。',
  },
]

export const communitySegments = [
  '全員', '防災関心者', '寄付者', 'ボランティア', '子育て世帯', '地域別',
] as const

export const communityIdeas = [
  '防災政策の進捗報告',
  '支援者へのお礼',
  '週末イベント案内',
  '政策アンケート依頼',
  'クラファン残り7日告知',
]

export const communityReminders: CommunityReminder[] = [
  { when: '明日 19:00', what: 'LINEで政策アンケートを投稿' },
  { when: '3日後', what: '支援者向けの活動報告' },
  { when: '7日後', what: 'クラウドファンディング中間報告' },
  { when: '毎週月曜', what: '今週の活動予定を投稿' },
  { when: '毎月末', what: '収支・成果報告を投稿' },
]
