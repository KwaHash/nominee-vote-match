'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { FaPlus } from 'react-icons/fa6'
import { getSupporters, deleteSupporter } from './actions'
import SupporterItem from '@/components/item/supporter-item'
import Loading from '@/components/loading-indicator'
import MainHero from '@/components/main-hero'
import PaginationItem from '@/components/pagination-item'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supportTypes, supporterKinds, visibilityOptions } from '@/constants/supporter.c'
import { updateDeleteDialog } from '@/stores/dialogs/dialogs.slice'
import { useAppDispatch } from '@/stores/store'
import { type Supporter } from '@/types/supporter.d'

const pageSizeOptions = [5, 10, 20, 50] as const
const supportTypeOptions = ['すべて', ...supportTypes] as const
const kindOptions = ['すべて', ...supporterKinds] as const
const visibilityFilterOptions = ['すべて', ...visibilityOptions] as const

export default function SupporterListPage() {
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [supporters, setSupporters] = useState<Supporter[]>([])

  const [keyword, setKeyword] = useState('')
  const [supportType, setSupportType] = useState<string>('すべて')
  const [kind, setKind] = useState<string>('すべて')
  const [visibility, setVisibility] = useState<string>('すべて')
  const [pageSize, setPageSize] = useState<number>(5)
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    const fetchSupporters = async () => {
      const { data, error: fetchError } = await getSupporters()
      console.log('data', data)
      if (fetchError) {
        setError(fetchError)
      } else {
        setSupporters(data)
      }
      setIsLoading(false)
    }

    void fetchSupporters()
  }, [])

  const filtered = useMemo(() => {
    const trimmed = keyword.trim()
    return supporters.filter((supporter) => {
      if (supportType !== 'すべて' && !(supporter.support_types ?? []).includes(supportType)) return false
      if (kind !== 'すべて' && supporter.kind !== kind) return false
      if (visibility !== 'すべて' && supporter.visibility !== visibility) return false
      if (trimmed) {
        const haystack = [
          supporter.name,
          supporter.region,
          supporter.contact_note,
          supporter.next_action,
          ...(supporter.support_types ?? []),
          ...(supporter.interests ?? []),
        ]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(trimmed.toLowerCase())) return false
      }
      return true
    })
  }, [supporters, keyword, supportType, kind, visibility])

  // Reset to the first page whenever the filters or page size change.
  useEffect(() => {
    setCurrentPage(0)
  }, [keyword, supportType, kind, visibility, pageSize])

  const handleDelete = (id: string) => {
    dispatch(updateDeleteDialog({
      isOpen: true,
      title: '削除',
      description: 'この支援者を削除しますか？',
      onDelete: async () => {
        setIsLoading(true)
        const { error } = await deleteSupporter(id)
        if (error) {
          setError(error)
        } else {
          setSupporters((prev) => prev.filter((s) => s.id !== id))
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
        title='支援者一覧'
        description='登録済みの支援者を検索・確認できます。'
      />

      <section className='w-full max-w-6xl mx-auto px-4 md:px-8 py-12'>
        {error && (
          <p className='mb-6 bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700'>{error}</p>
        )}

        <div className='mb-8 flex justify-end'>
          <Button asChild
            className='h-auto rounded-full bg-m-blue px-6 py-3 text-base hover:bg-m-hover-blue transition-all duration-300'
          >
            <Link href='/supporters/create' className='flex items-center gap-2'>
              <FaPlus className='h-4 w-4' />
              <span>新しい支援者を登録</span>
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className='mb-6 grid grid-cols-1 gap-2 md:grid-cols-5'>
          <div className='flex flex-col gap-2 md:col-span-2'>
            <Label htmlFor='supporter-search' className='text-sm font-medium text-gray-800'>キーワード検索</Label>
            <Input
              id='supporter-search'
              value={keyword}
              placeholder='支援者名・地域・接触履歴など'
              className='rounded-none'
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <div className='flex flex-col gap-2'>
            <Label className='text-sm font-medium text-gray-800'>支援タイプ</Label>
            <Select value={supportType} onValueChange={setSupportType}>
              <SelectTrigger className='rounded-none'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {supportTypeOptions.map((supportType) => (
                  <SelectItem key={supportType} value={supportType}>
                    {supportType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex flex-col gap-2'>
            <Label className='text-sm font-medium text-gray-800'>区分</Label>
            <Select value={kind} onValueChange={setKind}>
              <SelectTrigger className='rounded-none'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {kindOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex flex-col gap-2'>
            <Label className='text-sm font-medium text-gray-800'>公開設定</Label>
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
              {pageItems.map((supporter) => (
                <SupporterItem
                  key={supporter.id}
                  supporter={supporter}
                  handleDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        ) : (
          <p className='bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800 rounded'>
            支援者がいません。
          </p>
        )}
      </section>
    </div>
  )
}
