'use client'

import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { FaPlus } from 'react-icons/fa6'
import CrowdfundingItem from '@/components/item/crowdfunding-item'
import Loading from '@/components/loading-indicator'
import MainHero from '@/components/main-hero'
import PaginationItem from '@/components/pagination-item'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { crowdfundingThemes, legalStatusOptions, visibilityOptions } from '@/constants/crowdfunding.c'
import { updateDeleteDialog } from '@/stores/dialogs/dialogs.slice'
import { useAppDispatch } from '@/stores/store'
import { type Crowdfunding } from '@/types/crowdfunding.d'

const pageSizeOptions = [5, 10, 20, 50] as const
const themeOptions = ['すべて', ...crowdfundingThemes.map((t) => t.name)] as const
const visibilityFilterOptions = ['すべて', ...visibilityOptions] as const
const legalFilterOptions = ['すべて', ...legalStatusOptions] as const

const yen = (n: number) => `${n.toLocaleString('ja-JP')}円`

export default function CrowdFundingListPage() {
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [projects, setProjects] = useState<Crowdfunding[]>([])

  const [keyword, setKeyword] = useState('')
  const [theme, setTheme] = useState<string>('すべて')
  const [visibility, setVisibility] = useState<string>('すべて')
  const [legal, setLegal] = useState<string>('すべて')
  const [pageSize, setPageSize] = useState<number>(5)
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await axios.get<{ projects: Crowdfunding[] | null }>('/api/funds/crowdfunding')
        if (data.projects) {
          setProjects(data.projects)
        }
      } catch (err) {
        const message = axios.isAxiosError<{ error?: string }>(err)
          ? err.response?.data?.error ?? 'プロジェクトの取得に失敗しました。'
          : 'プロジェクトの取得に失敗しました。'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchProjects()
  }, [])

  const filtered = useMemo(() => {
    const trimmed = keyword.trim().toLowerCase()
    return projects.filter((project) => {
      if (theme !== 'すべて' && project.theme_id !== theme) return false
      if (visibility !== 'すべて' && project.visibility !== visibility) return false
      if (legal !== 'すべて' && project.legal_status !== legal) return false
      if (trimmed) {
        const haystack = [
          project.title,
          project.theme_id,
          project.region_level,
          project.region_name,
          project.outcome,
          ...project.support_types,
          ...project.expense_plan.map((item) => item.purpose),
        ]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(trimmed)) return false
      }
      return true
    })
  }, [projects, keyword, theme, visibility, legal])

  // Totals across every project (independent of filters/pagination).
  const { totalGoal, publicCount } = useMemo(() => {
    let totalGoal = 0
    let publicCount = 0
    for (const project of projects) {
      totalGoal += project.goal
      if (project.visibility === '一般公開') publicCount += 1
    }
    return { totalGoal, publicCount }
  }, [projects])

  // Reset to the first page whenever the filters or page size change.
  useEffect(() => {
    setCurrentPage(0)
  }, [keyword, theme, visibility, legal, pageSize])

  const handleDelete = (id: string) => {
    dispatch(updateDeleteDialog({
      isOpen: true,
      title: '削除',
      description: 'この政策応援ページを削除しますか？',
      onDelete: async () => {
        setIsLoading(true)
        try {
          await axios.delete(`/api/funds/crowdfunding/${id}`)
          setProjects((prev) => prev.filter((p) => p.id !== id))
        } catch (err) {
          const message = axios.isAxiosError<{ error?: string }>(err)
            ? err.response?.data?.error ?? 'プロジェクトの削除に失敗しました。'
            : 'プロジェクトの削除に失敗しました。'
          setError(message)
        }
        setIsLoading(false)
      }
    }))
  }

  const totalPages = Math.ceil(filtered.length / pageSize)
  const pageItems = filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize)

  if (isLoading) return <Loading />

  return (
    <div className='min-h-screen bg-white'>
      <MainHero
        title='政策応援一覧'
        description='作成済みの政策応援ページを検索・確認できます。'
      />

      <section className='w-full max-w-6xl mx-auto px-4 md:px-8 py-12'>
        {error && (
          <p className='mb-6 bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700'>{error}</p>
        )}

        {/* Overview */}
        <div className='mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4'>
          <div className='rounded-lg border border-gray-200 bg-white p-4'>
            <p className='text-xs text-gray-500'>プロジェクト数</p>
            <p className='mt-1 text-xl font-bold text-gray-900'>{projects.length}件</p>
          </div>
          <div className='rounded-lg border border-gray-200 bg-white p-4'>
            <p className='text-xs text-gray-500'>目標金額 合計</p>
            <p className='mt-1 text-xl font-bold text-m-blue'>{yen(totalGoal)}</p>
          </div>
          <div className='rounded-lg border border-gray-200 bg-white p-4'>
            <p className='text-xs text-gray-500'>一般公開</p>
            <p className='mt-1 text-xl font-bold text-emerald-600'>{publicCount}件</p>
          </div>
        </div>

        <div className='mb-8 flex justify-end'>
          <Button asChild
            className='h-auto rounded-full bg-m-blue px-6 py-3 text-base hover:bg-m-hover-blue transition-all duration-300'
          >
            <Link href='/funds/crowdfunding/create' className='flex items-center gap-2'>
              <FaPlus className='h-4 w-4' />
              <span>新しい政策応援ページを作成</span>
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className='mb-6 grid grid-cols-1 gap-2 md:grid-cols-5'>
          <div className='flex flex-col gap-2 md:col-span-2'>
            <Label htmlFor='cf-search' className='text-sm font-medium text-gray-800'>キーワード検索</Label>
            <Input
              id='cf-search'
              value={keyword}
              placeholder='プロジェクト名・地域・成果目標など'
              className='rounded-none'
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <div className='flex flex-col gap-2'>
            <Label className='text-sm font-medium text-gray-800'>政策テーマ</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className='rounded-none'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {themeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex flex-col gap-2'>
            <Label className='text-sm font-medium text-gray-800'>公開範囲</Label>
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger className='rounded-none'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {visibilityFilterOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex flex-col gap-2'>
            <Label className='text-sm font-medium text-gray-800'>法務確認状況</Label>
            <Select value={legal} onValueChange={setLegal}>
              <SelectTrigger className='rounded-none'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {legalFilterOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {pageItems.length > 0 ? (
          <div className='flex flex-col gap-3'>
            <div className='flex items-center justify-between'>
              <p className='flex items-center mb-2'>
                全<strong className="text-xl mx-1 text-m-blue">{filtered.length}</strong>件
              </p>
              <PaginationItem
                totalPages={totalPages}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
              <div className='flex items-center gap-2'>
                <Label htmlFor='page-size' className='whitespace-nowrap text-sm text-gray-600'>表示件数</Label>
                <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
                  <SelectTrigger id='page-size' className='w-20 rounded-none'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='flex flex-col gap-3'>
              {pageItems.map((project) => (
                <CrowdfundingItem
                  key={project.id}
                  project={project}
                  handleDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        ) : (
          <p className='bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800 rounded'>
            政策応援ページがありません。
          </p>
        )}
      </section>
    </div>
  )
}
