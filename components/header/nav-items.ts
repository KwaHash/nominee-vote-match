import  { type IconType } from 'react-icons'
import { RiBook2Line, RiMoneyCnyCircleLine, RiRobot2Line, RiSendPlaneLine, RiUserStarLine , RiLogoutCircleRLine} from 'react-icons/ri'

export type NavItem = {
  href: string
  label: string
  icon: IconType
}

export type NavGroup = {
  label: string
  icon: IconType
  subItems: NavItem[]
}

export type NavEntry = NavItem | NavGroup

export const isNavGroup = (entry: NavEntry): entry is NavGroup =>
  'subItems' in entry

export const navItems: NavEntry[] = [
  { href: '/today-tasks', label: '今日やること', icon: RiRobot2Line },
  { href: '/policies', label: ' 政策', icon: RiBook2Line },
  { href: '/communications', label: '発信', icon: RiSendPlaneLine },
  { href: '/supporters', label: '支援者', icon: RiUserStarLine },
  { href: '/funds-results', label: '資金・成果', icon: RiMoneyCnyCircleLine },
  { href: '/logout', label: 'ログアウト', icon: RiLogoutCircleRLine }
]
