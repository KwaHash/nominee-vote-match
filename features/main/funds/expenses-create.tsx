'use client'

import { useRef, useState } from 'react'
import axios from 'axios'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { FaFilePdf, FaImage } from 'react-icons/fa'
import { MdReceiptLong } from 'react-icons/md'
import { RiUploadCloudFill } from 'react-icons/ri'
import Loading from '@/components/loading-indicator'
import MainHero from '@/components/main-hero'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { expenseCategories, incomeCategories, txTypeLabels } from '@/constants/funds.c'
import { cn } from '@/lib/utils'
import { type ExpenseForm, type TxType } from '@/types/funds.d'
import {
  EXPENSE_DATE_FORMAT, EXPENSE_DATE_FROM_YEAR, EXPENSE_DATE_TO_YEAR,
  EXPENSE_RECEIPT_ACCEPT, formatExpenseDate, MAX_EXPENSE_RECEIPT_SIZE_BYTES,
  parseExpenseDate,
} from '@/utils/funds.u'

const typeChipClassName = 'flex-1 rounded border transition-colors duration-300'

export default function FundsExpensesCreatePage() {
  const router = useRouter()
  const [isLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [type, setType] = useState<TxType>('expense')
  const [category, setCategory] = useState<string>(expenseCategories[0])
  const [amount, setAmount] = useState<number | ''>('')
  const [date, setDate] = useState('')
  const [counterpart, setCounterpart] = useState('')
  const [receiptName, setReceiptName] = useState('')
  const [receiptType, setReceiptType] = useState('')
  const [receiptUrl, setReceiptUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isPublic, setIsPublic] = useState(true)
  const [isRelatedParty, setIsRelatedParty] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const categories = type === 'income' ? incomeCategories : expenseCategories
  const selectedDate = parseExpenseDate(date)

  const switchType = (nextType: TxType) => {
    setType(nextType)
    setCategory((nextType === 'income' ? incomeCategories : expenseCategories)[0])
  }

  const canSubmit = typeof amount === 'number' && amount > 0 && date !== ''

  const handleReceiptChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target
    const file = input.files?.[0]
    if (!file) return

    if (file.size > MAX_EXPENSE_RECEIPT_SIZE_BYTES) {
      setError('10MB以下のファイルを選択してください。')
      input.value = ''
      return
    }

    setError('')
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await axios.post<{ path: string }>('/api/upload/receipt', formData)
      setReceiptUrl(data.path)
      setReceiptName(file.name)
      setReceiptType(file.type)
    } catch (err) {
      const message = axios.isAxiosError<{ error?: string }>(err)
        ? err.response?.data?.error ?? '証憑のアップロードに失敗しました。'
        : '証憑のアップロードに失敗しました。'
      setError(message)
    } finally {
      setIsUploading(false)
      input.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    if (!canSubmit) return

    const expense: ExpenseForm = {
      type,
      category,
      amount,
      date,
      counterpart: counterpart.trim(),
      receiptName,
      receiptUrl,
      isPublic,
      isRelatedParty,
    }

    setIsSubmitting(true)
    try {
      await axios.post('/api/funds/expenses', expense)
      router.push('/funds/expenses/list')
    } catch (err) {
      const message = axios.isAxiosError<{ error?: string }>(err)
        ? err.response?.data?.error ?? '明細の登録に失敗しました。'
        : '明細の登録に失敗しました。'
      setError(message)
    }
    setIsSubmitting(false)
  }

  if (isLoading) return <Loading />

  return (
    <div className='min-h-screen bg-white'>
      <MainHero
        title='支出・証憑登録'
        description={
          <>
            収入・支出を証憑つきで登録します。<br />
            公開設定した項目が、国民向けの透明化ダッシュボードに反映されます。
          </>
        }
      />

      <section className='w-full max-w-6xl mx-auto px-4 md:px-8 py-12'>
        <form onSubmit={handleSubmit} className='space-y-8'>
          <div className='overflow-hidden rounded-lg border border-gray-200 bg-white'>
            <div className='flex items-center gap-2 bg-green-600 px-4 py-3 text-white'>
              <MdReceiptLong className='h-5 w-5' />
              <h2 className='text-base font-bold'>明細を登録</h2>
            </div>

            <div className='flex flex-col gap-6 p-6'>
              {/* Type */}
              <div className='flex flex-col gap-2'>
                <Label className='text-sm font-medium text-gray-800'>種別</Label>
                <ToggleGroup
                  type='single'
                  value={type}
                  onValueChange={(value) => value && switchType(value as TxType)}
                  className='grid grid-cols-2 gap-2 sm:gap-4 md:gap-6'
                >
                  <ToggleGroupItem
                    value='income'
                    variant='outline'
                    className={`${typeChipClassName} data-[state=on]:border-m-blue data-[state=on]:bg-m-blue data-[state=on]:text-white rounded-[2px] py-2 h-auto`}
                  >
                    {txTypeLabels.income}
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value='expense'
                    variant='outline'
                    className={`${typeChipClassName} data-[state=on]:border-rose-600 data-[state=on]:bg-rose-600 data-[state=on]:text-white rounded-[2px] py-2 h-auto`}
                  >
                    {txTypeLabels.expense}
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Category & Amount */}
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='flex flex-col gap-2'>
                  <Label className='text-sm font-medium text-gray-800'>分類</Label>
                  <Select value={category} onValueChange={(value) => value && setCategory(value)}>
                    <SelectTrigger className='rounded-none'>
                      <SelectValue placeholder='分類を選択' />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='flex flex-col gap-2'>
                  <Label htmlFor='expense-amount' className='text-sm font-medium text-gray-800'>金額（円）</Label>
                  <Input
                    id='expense-amount'
                    type='number'
                    min={0}
                    inputMode='numeric'
                    value={amount}
                    placeholder='例: 50000'
                    className='rounded-none'
                    onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Date & Counterpart */}
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='flex flex-col gap-2'>
                  <Label htmlFor='expense-date' className='text-sm font-medium text-gray-800'>日付</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type='button'
                        variant='outline'
                        id='expense-date'
                        className={cn(
                          'h-10 w-full justify-start rounded text-left font-normal',
                          !date && 'text-muted-foreground'
                        )}
                      >
                        {selectedDate
                          ? format(selectedDate, EXPENSE_DATE_FORMAT, { locale: ja })
                          : '日付を選択'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        captionLayout='dropdown'
                        startMonth={new Date(EXPENSE_DATE_FROM_YEAR, 0)}
                        endMonth={new Date(EXPENSE_DATE_TO_YEAR, 11)}
                        selected={selectedDate}
                        onSelect={(d) => setDate(d ? formatExpenseDate(d) : '')}
                        disabled={(d) => d > new Date()}
                        defaultMonth={selectedDate}
                        locale={ja}
                        formatters={{
                          formatMonthDropdown: (month) =>
                            format(month, 'M月', { locale: ja }),
                          formatYearDropdown: (year) =>
                            format(year, 'yyyy年', { locale: ja }),
                        }}
                        labels={{
                          labelMonthDropdown: () => '月を選択',
                          labelYearDropdown: () => '年を選択',
                          labelPrevious: () => '前の月',
                          labelNext: () => '次の月',
                        }}
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className='flex flex-col gap-2'>
                  <Label htmlFor='expense-counterpart' className='text-sm font-medium text-gray-800'>
                    {type === 'income' ? '寄付元 / 相手先' : '支出先'}
                  </Label>
                  <Input
                    id='expense-counterpart'
                    value={counterpart}
                    placeholder='例: 〇〇印刷株式会社'
                    className='rounded'
                    onChange={(e) => setCounterpart(e.target.value)}
                  />
                </div>
              </div>

              {/* Receipt */}
              <div className='flex flex-col gap-2'>
                <Label htmlFor='expense-receipt' className='text-sm font-medium text-gray-800'>
                  証憑（領収書・請求書・契約書）
                </Label>
                <div className='flex gap-3 flex-col md:flex-row md:items-center'>
                  <Button
                    type='button'
                    variant='outline'
                    className='rounded-none'
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <RiUploadCloudFill className='mr-2 h-4 w-4' />
                    {isUploading ? 'アップロード中...' : 'ファイルを選択'}
                  </Button>
                  {receiptUrl && (
                    <a
                      href={receiptUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-2 text-sm text-gray-500 underline-offset-2 hover:underline'
                    >
                      {receiptType === 'application/pdf'
                        ? <FaFilePdf className='h-4 w-4 text-rose-500' />
                        : <FaImage className='h-4 w-4 text-sky-500' />}
                      {receiptName}
                    </a>
                  )}
                </div>
                <Input
                  ref={fileInputRef}
                  id='expense-receipt'
                  type='file'
                  accept={EXPENSE_RECEIPT_ACCEPT}
                  className='hidden'
                  onChange={handleReceiptChange}
                />
              </div>

              {/* Publish & Related party */}
              <div className='flex flex-col gap-3'>
                <div className='flex items-center gap-2'>
                  <Checkbox
                    id='expense-public'
                    checked={isPublic}
                    onCheckedChange={(checked) => setIsPublic(checked === true)}
                  />
                  <Label htmlFor='expense-public' className='text-sm font-medium text-gray-800'>
                    透明化ダッシュボードに公開する
                  </Label>
                </div>
                <div className='flex items-center gap-2'>
                  <Checkbox
                    id='expense-related-party'
                    checked={isRelatedParty}
                    onCheckedChange={(checked) => setIsRelatedParty(checked === true)}
                  />
                  <Label htmlFor='expense-related-party' className='text-sm font-medium text-gray-800'>
                    関連当事者取引
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <p className='bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700'>{error}</p>
          )}

          <div className='flex items-start'>
            <Button
              type='submit'
              variant='default'
              disabled={isSubmitting || isUploading || !canSubmit}
              className='w-full max-w-64 mt-4 mx-auto h-auto py-3 text-base rounded-full bg-m-blue hover:bg-m-hover-blue transform transition-all duration-300'
            >
              {isSubmitting ? '登録中...' : '明細を登録'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}
