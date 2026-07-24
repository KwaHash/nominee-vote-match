import { type IconType } from 'react-icons'

export type MenuAccent = 'blue' | 'emerald' | 'sky' | 'violet' | 'amber'

export interface MenuItem {
  href: string
  label: string
  note: string
  icon: IconType
}

export interface MenuGroup {
  accent: MenuAccent
  icon: IconType
  title: string
  lead: string
  items: MenuItem[]
}
