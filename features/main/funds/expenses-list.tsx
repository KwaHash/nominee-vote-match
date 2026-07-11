'use client'

import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { FaPlus } from 'react-icons/fa6'
import ExpenseItem from '@/components/item/expense-item'
import Loading from '@/components/loading-indicator'
import MainHero from '@/components/main-hero'
import PaginationItem from '@/components/pagination-item'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { expenseCategories, incomeCategories, txTypeLabels } from '@/constants/funds.c'
import { updateDeleteDialog } from '@/stores/dialogs/dialogs.slice'
import { useAppDispatch } from '@/stores/store'
import { type Expense } from '@/types/funds.d'

const pageSizeOptions = [5, 10, 20, 50] as const
const typeOptions = ['すべて', ...Object.values(txTypeLabels)] as const
const categoryOptions = ['すべて', ...incomeCategories, ...expenseCategories] as const
const publicOptions = ['すべて', '公開', '非公開'] as const

const yen = (n: number) => `${n.toLocaleString('ja-JP')}円`

export default function FundsExpensesListPage() {
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [expenses, setExpenses] = useState<Expense[]>([])

  const [keyword, setKeyword] = useState('')
  const [type, setType] = useState<string>('すべて')
  const [category, setCategory] = useState<string>('すべて')
  const [publicity, setPublicity] = useState<string>('すべて')
  const [pageSize, setPageSize] = useState<number>(5)
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const { data } = await axios.get<{ expenses: Expense[] | null }>('/api/funds/expenses')
        if (data.expenses) {
          setExpenses(data.expenses)
        }
      } catch (err) {
        const message = axios.isAxiosError<{ error?: string }>(err)
          ? err.response?.data?.error ?? '明細の取得に失敗しました。'
          : '明細の取得に失敗しました。'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchExpenses()
  }, [])

  const filtered = useMemo(() => {
    const trimmed = keyword.trim().toLowerCase()
    return expenses.filter((expense) => {
      if (type !== 'すべて' && txTypeLabels[expense.type] !== type) return false
      if (category !== 'すべて' && expense.category !== category) return false
      if (publicity !== 'すべて' && (expense.is_public ? '公開' : '非公開') !== publicity) return false
      if (trimmed) {
        const haystack = [
          txTypeLabels[expense.type],
          expense.category,
          expense.counterpart,
          expense.receipt_name,
          expense.date,
        ]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(trimmed)) return false
      }
      return true
    })
  }, [expenses, keyword, type, category, publicity])

  // Totals across the whole ledger (independent of filters/pagination).
  const { totalIncome, totalExpense, balance } = useMemo(() => {
    let totalIncome = 0
    let totalExpense = 0
    for (const expense of expenses) {
      if (expense.type === 'income') totalIncome += expense.amount
      else totalExpense += expense.amount
    }
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense }
  }, [expenses])

  // Reset to the first page whenever the filters or page size change.
  useEffect(() => {
    setCurrentPage(0)
  }, [keyword, type, category, publicity, pageSize])

  const handleDelete = (id: string) => {
    dispatch(updateDeleteDialog({
      isOpen: true,
      title: '削除',
      description: 'この明細を削除しますか？',
      onDelete: async () => {
        setIsLoading(true)
        try {
          await axios.delete(`/api/funds/expenses/${id}`)
          setExpenses((prev) => prev.filter((e) => e.id !== id))
        } catch (err) {
          const message = axios.isAxiosError<{ error?: string }>(err)
            ? err.response?.data?.error ?? '明細の削除に失敗しました。'
            : '明細の削除に失敗しました。'
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
        title='収支明細一覧'
        description='登録済みの収入・支出を検索・確認できます。'
      />

      <section className='w-full max-w-6xl mx-auto px-4 md:px-8 py-12'>
        {error && (
          <p className='mb-6 bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700'>{error}</p>
        )}

        {/* Overview */}
        <div className='mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4'>
          <div className='rounded-lg border border-gray-200 bg-white p-4'>
            <p className='text-xs text-gray-500'>収入計</p>
            <p className='mt-1 text-xl font-bold text-emerald-600'>{yen(totalIncome)}</p>
          </div>
          <div className='rounded-lg border border-gray-200 bg-white p-4'>
            <p className='text-xs text-gray-500'>支出計</p>
            <p className='mt-1 text-xl font-bold text-rose-600'>{yen(totalExpense)}</p>
          </div>
          <div className='rounded-lg border border-gray-200 bg-white p-4'>
            <p className='text-xs text-gray-500'>残高</p>
            <p className={`mt-1 text-xl font-bold ${balance < 0 ? 'text-rose-600' : 'text-gray-900'}`}>
              {yen(balance)}
            </p>
          </div>
        </div>

        <div className='mb-8 flex justify-end'>
          <Button asChild
            className='h-auto rounded-full bg-m-blue px-6 py-3 text-base hover:bg-m-hover-blue transition-all duration-300'
          >
            <Link href='/funds/expenses/create' className='flex items-center gap-2'>
              <FaPlus className='h-4 w-4' />
              <span>新しい明細を登録</span>
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className='mb-6 grid grid-cols-1 gap-2 md:grid-cols-5'>
          <div className='flex flex-col gap-2 md:col-span-2'>
            <Label htmlFor='expense-search' className='text-sm font-medium text-gray-800'>キーワード検索</Label>
            <Input
              id='expense-search'
              value={keyword}
              placeholder='分類・支出先・証憑名など'
              className='rounded-none'
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <div className='flex flex-col gap-2'>
            <Label className='text-sm font-medium text-gray-800'>種別</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className='rounded-none'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex flex-col gap-2'>
            <Label className='text-sm font-medium text-gray-800'>分類</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className='rounded-none'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex flex-col gap-2'>
            <Label className='text-sm font-medium text-gray-800'>公開設定</Label>
            <Select value={publicity} onValueChange={setPublicity}>
              <SelectTrigger className='rounded-none'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {publicOptions.map((option) => (
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
              {pageItems.map((expense) => (
                <ExpenseItem
                  key={expense.id}
                  expense={expense}
                  handleDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        ) : (
          <p className='bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800 rounded'>
            明細がありません。
          </p>
        )}
      </section>
    </div>
  )
}
