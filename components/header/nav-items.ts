import  { type IconType } from 'react-icons'
import { FaRobot, FaListUl, FaRegRegistered } from 'react-icons/fa'
import { GiExpense } from 'react-icons/gi'
import { MdPolicy , MdOutlineQuestionAnswer } from 'react-icons/md'
import { RiUserCommunityFill , RiBook2Line, RiMoneyCnyCircleLine, RiRobot2Line, RiSendPlaneLine, RiUserStarLine , RiLogoutCircleRLine} from 'react-icons/ri'


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
  { 
    label: ' 政策',
    icon: RiBook2Line,
    subItems: [
      { href: '/policy-stance', label: '政策スタンス', icon: MdPolicy },
      { href: '/ai-secretary', label: 'AI政策秘書', icon: FaRobot },
    ],
  },
  {
    icon: RiSendPlaneLine,
    label: '発信',
    subItems: [
      { href: '/community', label: 'コミュニティ', icon: RiUserCommunityFill },
      { href: '/public-answers', label: '公開質問', icon: MdOutlineQuestionAnswer },
    ],
  },
  {
    label: '支援者',
    icon: RiUserStarLine,
    subItems: [
      { href: '/supporters/create', label: '支援者登録', icon: FaRegRegistered },
      { href: '/supporters/list', label: '支援者一覧', icon: FaListUl },
    ],
  },
  {
    label: '資金・成果',
    icon: RiMoneyCnyCircleLine,
    subItems: [
      { href: '/funds/expenses/list', label: '支出・証憑登録', icon: GiExpense },
    ],
  },
  { href: '/logout', label: 'ログアウト', icon: RiLogoutCircleRLine }
]
