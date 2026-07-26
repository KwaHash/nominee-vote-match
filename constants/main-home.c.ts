import { FaListUl, FaRegRegistered, FaRobot } from 'react-icons/fa'
import { GiExpense } from 'react-icons/gi'
import { MdOutlineQuestionAnswer, MdPolicy } from 'react-icons/md'
import {
  RiBook2Line, RiMoneyCnyCircleLine, RiRobot2Line,
  RiSendPlaneLine, RiUserCommunityFill, RiUserStarLine,
} from 'react-icons/ri'
import { TbDashboard } from 'react-icons/tb'
import { type MenuGroup } from '@/types/main-home.d'

export const menuGroups: MenuGroup[] = [
  {
    accent: 'blue',
    icon: TbDashboard,
    title: '今日やること',
    lead: '次に何をすべきかが、一目でわかる。',
    items: [
      {
        href: '/dashboard',
        label: 'ダッシュボード',
        note: '選挙活動のタスクを束ね、AIが今日の一手を提案します。',
        icon: RiRobot2Line,
      },
    ],
  },
  {
    accent: 'emerald',
    icon: RiBook2Line,
    title: '政策をつくる',
    lead: '一人でも、政策を鍛える。',
    items: [
      {
        href: '/policy-stance',
        label: '政策スタンス',
        note: '各争点への立場を登録。有権者の「政策で選ぶ」診断に使われます。',
        icon: MdPolicy,
      },
      {
        href: '/ai-secretary',
        label: 'AI政策秘書',
        note: '議会質問・公約・想定問答などを、AIが丁寧に下書きします。',
        icon: FaRobot,
      },
    ],
  },
  {
    accent: 'sky',
    icon: RiSendPlaneLine,
    title: '発信をつくる',
    lead: 'AIが下書き、人が承認。',
    items: [
      {
        href: '/community',
        label: 'コミュニティ',
        note: 'LINE・X・Facebook の投稿案をAIで生成し、配信を仕組み化。',
        icon: RiUserCommunityFill,
      },
      {
        href: '/public-answers',
        label: '公開質問への回答',
        note: '公開質問ボードの上位質問に回答し、運営確認を経て公開します。',
        icon: MdOutlineQuestionAnswer,
      },
    ],
  },
  {
    accent: 'violet',
    icon: RiUserStarLine,
    title: '支援者を管理する',
    lead: 'バラバラな支援者情報を、一元化。',
    items: [
      {
        href: '/supporters/create',
        label: '支援者登録',
        note: '支援タイプ・関心政策・接触履歴・次回アクションを記録します。',
        icon: FaRegRegistered,
      },
      {
        href: '/supporters/list',
        label: '支援者一覧',
        note: '登録済みの支援者を、検索・編集・確認できます。',
        icon: FaListUl,
      },
    ],
  },
  {
    accent: 'amber',
    icon: RiMoneyCnyCircleLine,
    title: '資金・成果を報告する',
    lead: '集めて、見せて、信頼に変える。',
    items: [
      {
        href: '/funds/expenses/list',
        label: '収支明細',
        note: '収入・支出を証憑つきで登録し、透明化ダッシュボードへ。',
        icon: GiExpense,
      },
    ],
  },
]
