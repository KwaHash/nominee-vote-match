import {
  MdOutlineAccountBalance, MdOutlineArticle, MdOutlineBarChart,
  MdOutlineNewspaper, MdOutlineQuestionAnswer, MdOutlineSmartphone,
} from 'react-icons/md'
import { type AiTool } from '@/types/ai-secretary.d'

export const aiTools: AiTool[] = [
  {
    key: 'question',
    label: '議会質問案',
    icon: MdOutlineAccountBalance,
    placeholder: '例: 避難所への蓄電池の配備',
    guide: '議会の本会議や委員会で行う一般質問の原稿です。①現状の課題認識、②これまでの行政の取り組みへの評価、③財源・期限・手順を明確にした具体的な提案、④当局に求める答弁、という流れで、筋の通った質問を組み立ててください。',
  },
  {
    key: 'pledge',
    label: '公約案',
    icon: MdOutlineArticle,
    placeholder: '例: 子育て世帯の負担軽減',
    guide: '有権者にお約束する公約文です。めざす姿、具体的に実行すること、財源の考え方、達成までの期限、進捗をどう検証・公開していくのかを、有権者が信頼を寄せられる形でまとめてください。',
  },
  {
    key: 'sns',
    label: 'SNS投稿案',
    icon: MdOutlineSmartphone,
    placeholder: '例: 地域の防災訓練に参加しました',
    guide: 'X（旧Twitter）などのSNSに投稿する短い文章です。日々の活動や思いが伝わる、親しみやすく共感を呼ぶ文面にしてください。必要に応じてハッシュタグを添えても構いません。',
  },
  {
    key: 'flyer',
    label: 'チラシ文章',
    icon: MdOutlineNewspaper,
    placeholder: '例: 公共入札の透明化',
    guide: '選挙・活動チラシに掲載する文章です。心に残るキャッチコピーと本文で構成し、有権者の目を引き、主張がひと目で伝わる、力強くも誠実な文章にしてください。',
  },
  {
    key: 'qa',
    label: '想定問答',
    icon: MdOutlineQuestionAnswer,
    placeholder: '例: 増税の賛否について',
    guide: '記者会見や街頭での質疑を想定した問答集です。有権者やメディアから寄せられそうな質問をいくつか想定し、それぞれに結論からお答えする、誠実で分かりやすい回答をご用意ください。',
  },
  {
    key: 'report',
    label: '活動レポート',
    icon: MdOutlineBarChart,
    placeholder: '例: 6月の議会活動の報告',
    guide: '後援者や有権者へお届けする活動報告です。今期の主な活動、具体的な成果、これから取り組むことを、感謝の気持ちが伝わる丁寧な文章でまとめてください。',
  },
]
