'use client'

import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { FaArrowRightLong } from 'react-icons/fa6'
import { MdOutlinePayments, MdOutlineSmartToy, MdOutlineSupport } from 'react-icons/md'
import Loading from '@/components/loading-indicator'
import MainHero from '@/components/main-hero'
import { menuGroups } from '@/constants/main-home.c'
import { policyQuestions } from '@/constants/policy.c'
import { answeredStatuses, publicQuestions } from '@/constants/public-answer.c'
import { cn } from '@/lib/utils'
import { type Crowdfunding } from '@/types/crowdfunding.d'
import { type Expense } from '@/types/funds.d'
import { type PolicyQuestionAnswer } from '@/types/policy.d'
import { type ICandidateProfile } from '@/types/profile.d'
import { type PublicQuestionAnswer } from '@/types/public-answer.d'
import { type Supporter } from '@/types/supporter.d'

const yen = (n: number) => `${n.toLocaleString('ja-JP')}円`

const chipBaseClassName = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'

// Every destination the home menu offers, minus the dashboard itself.
const quickLinks = menuGroups.flatMap((group) => group.items).filter((item) => item.href !== '/dashboard')

interface Todo {
  text: string
  href: string
}

const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [profile, setProfile] = useState<ICandidateProfile | null>(null)
  const [supporters, setSupporters] = useState<Supporter[]>([])
  const [projects, setProjects] = useState<Crowdfunding[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [stances, setStances] = useState<PolicyQuestionAnswer[]>([])
  const [publicAnswers, setPublicAnswers] = useState<PublicQuestionAnswer[]>([])

  useEffect(() => {
    const fetchAll = async () => {
      const [profileRes, supporterRes, projectRes, expenseRes, stanceRes, answerRes] = await Promise.allSettled([
        axios.get<{ profile: ICandidateProfile | null }>('/api/profile'),
        axios.get<{ supporters: Supporter[] | null }>('/api/supporters'),
        axios.get<{ projects: Crowdfunding[] | null }>('/api/funds/crowdfunding'),
        axios.get<{ expenses: Expense[] | null }>('/api/funds/expenses'),
        axios.get<{ policyStances: PolicyQuestionAnswer[] }>('/api/policy-stance'),
        axios.get<{ publicAnswers: PublicQuestionAnswer[] }>('/api/public-answers'),
      ])

      if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data.profile)
      if (supporterRes.status === 'fulfilled') setSupporters(supporterRes.value.data.supporters ?? [])
      if (projectRes.status === 'fulfilled') setProjects(projectRes.value.data.projects ?? [])
      if (expenseRes.status === 'fulfilled') setExpenses(expenseRes.value.data.expenses ?? [])
      if (stanceRes.status === 'fulfilled') setStances(stanceRes.value.data.policyStances)
      if (answerRes.status === 'fulfilled') setPublicAnswers(answerRes.value.data.publicAnswers)

      const failed = [profileRes, supporterRes, projectRes, expenseRes, stanceRes, answerRes]
        .filter((result) => result.status === 'rejected').length
      if (failed > 0) {
        setError('一部のデータを取得できませんでした。時間をおいて再度お試しください。')
      }

      setIsLoading(false)
    }

    void fetchAll()
  }, [])

  const needsAction = useMemo(
    () => supporters.filter((s) => s.next_action.trim() !== '').length,
    [supporters]
  )

  const stanceAnswered = useMemo(
    () => stances.filter((s) => s.answer.trim() !== '').length,
    [stances]
  )

  const publicAnswered = useMemo(
    () => publicAnswers.filter((a) => answeredStatuses.includes(a.status)).length,
    [publicAnswers]
  )

  const { totalIncome, totalExpense, balance } = useMemo(() => {
    let totalIncome = 0
    let totalExpense = 0
    for (const expense of expenses) {
      if (expense.type === 'income') totalIncome += expense.amount
      else totalExpense += expense.amount
    }
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense }
  }, [expenses])

  const totalGoal = useMemo(
    () => projects.reduce((sum, project) => sum + project.goal, 0),
    [projects]
  )

  // The list API returns newest first.
  const latestProject = projects[0] ?? null

  const stats = [
    {
      href: '/supporters/list',
      label: '支援者',
      value: `${supporters.length}名`,
      note: needsAction > 0 ? `要対応 ${needsAction}件` : '要対応なし',
      noteClassName: needsAction > 0 ? 'text-amber-600' : 'text-gray-400',
    },
    {
      href: '/policy-stance',
      label: '政策スタンス',
      value: `${stanceAnswered}/${policyQuestions.length}`,
      note: '回答済み',
      noteClassName: 'text-gray-400',
    },
    {
      href: '/public-answers',
      label: '公開質問',
      value: `${publicAnswered}/${publicQuestions.length}`,
      note: '回答済み',
      noteClassName: 'text-gray-400',
    },
    {
      href: '/funds/crowdfunding/list',
      label: '政策応援',
      value: `${projects.length}件`,
      note: `目標 ${yen(totalGoal)}`,
      noteClassName: 'text-gray-400',
    },
  ]

  const todos: Todo[] = []
  if (!profile?.kanji_name?.trim()) {
    todos.push({ text: 'プロフィールが未登録です。基本情報を登録すると、有権者に表示されます。', href: '/profile' })
  }
  if (needsAction > 0) {
    todos.push({ text: `要対応の支援者が ${needsAction} 件あります。連絡・依頼を進めましょう。`, href: '/supporters/list' })
  } else if (supporters.length === 0) {
    todos.push({ text: '支援者が未登録です。まずは支援者を登録し、接触履歴を残しましょう。', href: '/supporters/create' })
  }
  if (stanceAnswered < policyQuestions.length) {
    todos.push({
      text: `政策スタンスが未完成（${stanceAnswered}/${policyQuestions.length}）。埋めると有権者マッチングの精度が上がります。`,
      href: '/policy-stance',
    })
  }
  if (publicAnswered < publicQuestions.length) {
    todos.push({
      text: `未回答の公開質問が ${publicQuestions.length - publicAnswered} 件あります。回答して信頼につなげましょう。`,
      href: '/public-answers',
    })
  }
  if (projects.length === 0) {
    todos.push({
      text: '政策応援ページが未作成です。政策単位で立ち上げると支援が集まりやすくなります。',
      href: '/funds/crowdfunding/create',
    })
  }
  if (expenses.length === 0) {
    todos.push({ text: '収支明細が未登録です。証憑つきで登録し、透明化ダッシュボードへ反映しましょう。', href: '/funds/expenses/create' })
  }
  if (todos.length === 0) {
    todos.push({ text: '緊急の対応事項はありません。活動報告を投稿して、支援者との接点を増やしましょう。', href: '/community' })
  }

  if (isLoading) return <Loading />

  return (
    <div className='min-h-screen bg-white'>
      <MainHero
        title='ダッシュボード'
        description='活動の全体像と「今日やること」を一望できます'
      />

      <section className='w-full max-w-6xl mx-auto px-4 md:px-8 py-12'>
        {error && (
          <p className='mb-6 bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700'>{error}</p>
        )}

        {/* Today's suggestions */}
        <div className='overflow-hidden rounded-lg border border-gray-200 bg-white'>
          <div className='flex items-center gap-2 bg-green-600 px-4 py-3 text-white'>
            <MdOutlineSmartToy className='h-5 w-5' />
            <h2 className='text-base font-bold'>AIアシスト：今日やること</h2>
          </div>
          <div className='flex flex-col gap-2 p-6'>
            {todos.map((todo) => (
              <Link
                key={todo.href + todo.text}
                href={todo.href}
                className='group/item flex items-center gap-3 rounded border border-gray-200 p-3 transition-all duration-300 hover:border-green-200 hover:bg-green-50/60'
              >
                <span className='h-1.5 w-1.5 shrink-0 rounded-full bg-green-600' />
                <p className='min-w-0 flex-1 text-sm text-gray-800'>{todo.text}</p>
                <FaArrowRightLong className='h-4 w-4 shrink-0 text-gray-300 transition-all duration-300 group-hover/item:translate-x-1 group-hover/item:text-green-600' />
              </Link>
            ))}
            <p className='mt-1 text-xs text-gray-400'>※ 登録済みのデータから自動で判定しています。</p>
          </div>
        </div>

        {/* Activity summary */}
        <div className='mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4'>
          {stats.map((stat) => (
            <Link
              key={stat.href}
              href={stat.href}
              className='rounded-lg border border-gray-200 bg-white p-4 transition-shadow duration-300 hover:shadow-md'
            >
              <p className='text-xs text-gray-500'>{stat.label}</p>
              <p className='mt-1 text-xl font-bold text-gray-900'>{stat.value}</p>
              <p className={cn('mt-0.5 text-xs', stat.noteClassName)}>{stat.note}</p>
            </Link>
          ))}
        </div>

        {/* Income & expense */}
        <div className='mt-8 overflow-hidden rounded-lg border border-gray-200 bg-white'>
          <div className='flex items-center gap-2 bg-green-600 px-4 py-3 text-white'>
            <MdOutlinePayments className='h-5 w-5' />
            <h2 className='text-base font-bold'>収支サマリー</h2>
          </div>
          <div className='flex flex-col gap-4 p-6'>
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4'>
              <div className='rounded bg-gray-50 p-4'>
                <p className='text-xs text-gray-500'>収入計</p>
                <p className='mt-1 text-xl font-bold text-emerald-600'>{yen(totalIncome)}</p>
              </div>
              <div className='rounded bg-gray-50 p-4'>
                <p className='text-xs text-gray-500'>支出計</p>
                <p className='mt-1 text-xl font-bold text-rose-600'>{yen(totalExpense)}</p>
              </div>
              <div className='rounded bg-gray-50 p-4'>
                <p className='text-xs text-gray-500'>残高</p>
                <p className={cn('mt-1 text-xl font-bold', balance < 0 ? 'text-rose-600' : 'text-gray-900')}>
                  {yen(balance)}
                </p>
              </div>
            </div>
            <Link
              href='/funds/expenses/list'
              className='group/item inline-flex w-fit items-center gap-1.5 text-sm font-medium text-green-700'
            >
              <span>収支明細を確認する（全{expenses.length}件）</span>
              <FaArrowRightLong className='h-3.5 w-3.5 transition-transform duration-300 group-hover/item:translate-x-1' />
            </Link>
          </div>
        </div>

        {/* Latest crowdfunding project */}
        <div className='mt-8 overflow-hidden rounded-lg border border-gray-200 bg-white'>
          <div className='flex items-center gap-2 bg-green-600 px-4 py-3 text-white'>
            <MdOutlineSupport className='h-5 w-5' />
            <h2 className='text-base font-bold'>最新の政策応援</h2>
          </div>
          <div className='flex flex-col gap-3 p-6'>
            {latestProject ? (
              <>
                <div className='flex flex-wrap items-center gap-2'>
                  <h3 className='text-lg font-bold text-gray-900'>{latestProject.title}</h3>
                  <span className={cn(chipBaseClassName, 'bg-violet-100 text-violet-700')}>
                    {latestProject.theme_id}
                  </span>
                  <span className={cn(chipBaseClassName, 'bg-gray-100 text-gray-700')}>
                    {[latestProject.region_level, latestProject.region_name].filter(Boolean).join(' / ')}
                  </span>
                </div>
                <p className='text-xl font-bold text-m-blue'>目標 {yen(latestProject.goal)}</p>
                {latestProject.support_types.length > 0 && (
                  <div className='flex flex-wrap gap-2'>
                    {latestProject.support_types.map((type) => (
                      <span key={type} className={cn(chipBaseClassName, 'bg-green-100 text-green-700')}>
                        {type}
                      </span>
                    ))}
                  </div>
                )}
                <Link
                  href='/funds/crowdfunding/list'
                  className='group/item inline-flex w-fit items-center gap-1.5 text-sm font-medium text-green-700'
                >
                  <span>政策応援一覧を確認する（全{projects.length}件）</span>
                  <FaArrowRightLong className='h-3.5 w-3.5 transition-transform duration-300 group-hover/item:translate-x-1' />
                </Link>
              </>
            ) : (
              <>
                <p className='bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800 rounded'>
                  政策応援ページがまだありません。
                </p>
                <Link
                  href='/funds/crowdfunding/create'
                  className='group/item inline-flex w-fit items-center gap-1.5 text-sm font-medium text-green-700'
                >
                  <span>政策単位で応援ページを立ち上げる</span>
                  <FaArrowRightLong className='h-3.5 w-3.5 transition-transform duration-300 group-hover/item:translate-x-1' />
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className='mt-8'>
          <h2 className='mb-3 text-sm font-bold text-gray-700'>クイックリンク</h2>
          <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
            {quickLinks.map((link) => {
              const LinkIcon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className='flex items-center gap-2 rounded border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors duration-300 hover:border-green-200 hover:bg-green-50/60'
                >
                  <LinkIcon className='h-4 w-4 shrink-0 text-green-600' />
                  <span className='truncate'>{link.label}</span>
                </Link>
              )
            })}
          </div>
        </div>

        <p className='mt-6 text-center text-xs text-gray-400'>
          AIは「下書き → 確認 → 編集 → 公開／送信」。AIが勝手に公開・送信することはありません。
        </p>
      </section>
    </div>
  )
}

export default DashboardPage
