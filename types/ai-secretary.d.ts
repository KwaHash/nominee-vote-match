import { type IconType } from 'react-icons'

export type AiToolKey = 'question' | 'pledge' | 'sns' | 'flyer' | 'qa' | 'report'

export interface AiTool {
  key: AiToolKey
  label: string
  icon: IconType
  placeholder: string
  guide: string
}
