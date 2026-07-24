import { type IconType } from 'react-icons'

export type CommunityChannel = 'LINE' | 'X' | 'Facebook'

export interface CommunityChannelMeta {
  value: CommunityChannel
  icon: IconType
  guide: string
}

export interface CommunityReminder {
  when: string
  what: string
}
