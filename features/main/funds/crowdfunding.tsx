'use client'

import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { FaPlus, FaSpinner, FaWandMagicSparkles, FaXmark } from 'react-icons/fa6'
import { MdOutlineDescription, MdOutlineFlag, MdOutlineGavel, MdOutlinePayments, MdOutlineSmartToy } from 'react-icons/md'
import MainHero from '@/components/main-hero'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { crowdfundingThemes, legalStatusOptions, regionLevels, visibilityOptions } from '@/constants/crowdfunding.c'
import { supportTypes } from '@/constants/supporter.c'
import { cn } from '@/lib/utils'
import {
  type CrowdfundingForm, type CrowdfundingLegalStatus,
  type CrowdfundingVisibility, type ExpensePlanRow, type RegionLevel,
} from '@/types/crowdfunding.d'
import {
  CAMPAIGN_DATE_FORMAT, CAMPAIGN_DATE_FROM_YEAR, CAMPAIGN_DATE_TO_YEAR,
  formatCampaignDate, parseCampaignDate, requestCrowdfundingDraft, sortSupportTypes,
} from '@/utils/crowdfunding.u'

const yen = (n: number) => `¥${n.toLocaleString('ja-JP')}`

const legalActiveClassName: Record<string, string> = {
  未確認: 'data-[state=on]:bg-gray-200 data-[state=on]:border-gray-200 data-[state=on]:text-gray-700',
  確認中: 'data-[state=on]:bg-amber-100 data-[state=on]:border-amber-100 data-[state=on]:text-amber-700',
  承認済み: 'data-[state=on]:bg-emerald-100 data-[state=on]:border-emerald-100 data-[state=on]:text-emerald-700',
}

interface DateFieldProps {
  id?: string
  value: string
  onChange: (value: string) => void
  disabled?: (date: Date) => boolean
}

const DateField = ({ id, value, onChange, disabled }: DateFieldProps) => {
  const selectedDate = parseCampaignDate(value)
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          id={id}
          className={cn('h-10 w-full justify-start rounded text-left font-normal', !value && 'text-muted-foreground')}
        >
          {selectedDate ? format(selectedDate, CAMPAIGN_DATE_FORMAT, { locale: ja }) : '日付を選択'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='single'
          captionLayout='dropdown'
          startMonth={new Date(CAMPAIGN_DATE_FROM_YEAR, 0)}
          endMonth={new Date(CAMPAIGN_DATE_TO_YEAR, 11)}
          selected={selectedDate}
          onSelect={(date) => onChange(date ? formatCampaignDate(date) : '')}
          disabled={disabled}
          defaultMonth={selectedDate}
          locale={ja}
          formatters={{
            formatMonthDropdown: (month) => format(month, 'M月', { locale: ja }),
            formatYearDropdown: (year) => format(year, 'yyyy年', { locale: ja }),
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
  )
}

export default function CrowdFundingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [title, setTitle] = useState('')
  const [themeId, setThemeId] = useState(crowdfundingThemes[0].name)
  const [regionLevel, setRegionLevel] = useState<RegionLevel>('都道府県')
  const [regionName, setRegionName] = useState('')
  const [goal, setGoal] = useState<number | ''>('')
  const [rows, setRows] = useState<ExpensePlanRow[]>([{ id: 1, purpose: '', amount: '' }])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [outcome, setOutcome] = useState('')
  const [selectedSupportTypes, setSelectedSupportTypes] = useState<string[]>(['寄付'])
  const [visibility, setVisibility] = useState<CrowdfundingVisibility>('一般公開')
  const [legal, setLegal] = useState<CrowdfundingLegalStatus>('未確認')
  const [aiNeed, setAiNeed] = useState('')
  const [isDrafting, setIsDrafting] = useState(false)
  const [aiError, setAiError] = useState('')

  // Default the start date to today (set after mount to avoid SSR hydration mismatch).
  useEffect(() => {
    setStartDate(formatCampaignDate(new Date()))
    setEndDate(formatCampaignDate(new Date()))
  }, [])

  const theme = useMemo(
    () => crowdfundingThemes.find((t) => t.name === themeId) ?? crowdfundingThemes[0],
    [themeId]
  )

  const planTotal = useMemo(
    () => rows.reduce((sum, r) => sum + (typeof r.amount === 'number' ? r.amount : 0), 0),
    [rows]
  )
  const goalNum = typeof goal === 'number' ? goal : 0
  const diff = planTotal - goalNum

  const updateRow = (id: number, patch: Partial<ExpensePlanRow>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  const addRow = () =>
    setRows((prev) => [...prev, { id: Math.max(0, ...prev.map((r) => r.id)) + 1, purpose: '', amount: '' }])
  const removeRow = (id: number) =>
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev))

  // Draft assistant: asks the chat API to fill the form from the policy theme + a described need.
  const aiFill = async () => {
    if (isDrafting) return

    setAiError('')
    setIsDrafting(true)

    try {
      const draft = await requestCrowdfundingDraft({
        theme: theme.name,
        need: aiNeed.trim(),
        regionLevel,
        regionName: regionName.trim(),
      })

      setTitle(draft.title)
      if (draft.goal > 0) setGoal(draft.goal)
      if (draft.expense_plan.length > 0) {
        setRows(draft.expense_plan.map((item, i) => ({ id: i + 1, ...item })))
      }
      if (draft.outcome) setOutcome(draft.outcome)
      if (draft.support_types.length > 0) setSelectedSupportTypes(draft.support_types)
    } catch (err) {
      setAiError(err instanceof Error ? err.message : '下書きの生成に失敗しました。')
    }

    setIsDrafting(false)
  }

  const canSave = title.trim() !== '' && goalNum > 0

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!canSave) return

    const project: CrowdfundingForm = {
      title: title.trim(),
      theme_id: themeId,
      region_level: regionLevel,
      region_name: regionName.trim(),
      goal: goalNum,
      expense_plan: rows
        .filter((r) => r.purpose.trim() !== '' && typeof r.amount === 'number')
        .map((r) => ({ purpose: r.purpose.trim(), amount: r.amount as number })),
      start_date: startDate,
      end_date: endDate,
      outcome: outcome.trim(),
      support_types: selectedSupportTypes,
      visibility,
      legal_status: legal,
    }

    setIsSubmitting(true)
    try {
      await axios.post('/api/funds/crowdfunding', project)
      setSuccess('政策応援ページを保存しました。')
    } catch (err) {
      const message = axios.isAxiosError<{ error?: string }>(err) ? 
        err.response?.data?.error ?? 'プロジェクトの保存に失敗しました。' : 'プロジェクトの保存に失敗しました。'
      setError(message)
    }
    setIsSubmitting(false)
  }

  return (
    <div className='min-h-screen bg-white'>
      <MainHero
        title='政策応援'
        description={
          <>
            政策単位で「応援ページ」を立ち上げます。<br />
            献金・ボランティア・拡散・意見など、政策ごとの支援を募ります。
          </>
        }
      />

      <section className='w-full max-w-4xl mx-auto px-4 md:px-8 py-12'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <p className='rounded border border-amber-200 bg-amber-50 p-4 text-[13px] leading-relaxed text-amber-800'>
            献金・寄付・選挙運動に関する取り扱いは、政治資金規正法・公職選挙法等の確認が必要です。
            公開前に必ず専門家または選挙管理委員会等にご確認ください。
          </p>

          {/* Draft assistant */}
          <div className='overflow-hidden rounded-lg border border-gray-200 bg-white'>
            <div className='flex items-center gap-2 bg-green-600 px-4 py-3 text-white'>
              <MdOutlineSmartToy className='h-5 w-5' />
              <h2 className='text-base font-bold'>クラファン作成AI</h2>
            </div>
            <div className='flex flex-col gap-3 p-6'>
              <p className='text-xs text-gray-600'>
                政策テーマ（下で選択）と困りごとを入れると、タイトル・目標金額・支出計画・成果・支援タイプの下書きを自動で埋めます。
              </p>
              <div className='flex flex-col gap-2 sm:flex-row'>
                <Input
                  value={aiNeed}
                  placeholder='困りごと（例: 避難所の電源が足りない）'
                  className='rounded-none'
                  onChange={(e) => setAiNeed(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      void aiFill()
                    }
                  }}
                />
                <Button
                  type='button'
                  onClick={() => void aiFill()}
                  disabled={isDrafting}
                  className='shrink-0 gap-1.5 rounded bg-m-blue hover:bg-m-hover-blue transition-all duration-300'
                >
                  {isDrafting ? (
                    <><FaSpinner className='h-4 w-4 animate-spin' /> 生成中...</>
                  ) : (
                    <><FaWandMagicSparkles className='h-4 w-4' /> AIで下書き</>
                  )}
                </Button>
              </div>
              {aiError && <p className='text-xs text-m-red'>{aiError}</p>}
            </div>
          </div>

          {/* Basic info */}
          <div className='overflow-hidden rounded-lg border border-gray-200 bg-white'>
            <div className='flex items-center gap-2 bg-green-600 px-4 py-3 text-white'>
              <MdOutlineDescription className='h-5 w-5' />
              <h2 className='text-base font-bold'>基本情報</h2>
            </div>
            <div className='flex flex-col gap-6 p-6'>
              <div className='flex flex-col gap-2'>
                <Label htmlFor='cf-title' className='text-sm font-medium text-gray-800'>プロジェクト名</Label>
                <Input
                  id='cf-title'
                  value={title}
                  placeholder='例: 東京都の避難所に蓄電池・通信・トイレを整備する政策提言'
                  className='rounded-none'
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className='flex flex-col gap-2'>
                <Label className='text-sm font-medium text-gray-800'>政策テーマ</Label>
                <Select value={themeId} onValueChange={(value) => value && setThemeId(value)}>
                  <SelectTrigger className='rounded-none'>
                    <SelectValue placeholder='政策テーマを選択' />
                  </SelectTrigger>
                  <SelectContent>
                    {crowdfundingThemes.map((t) => (
                      <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='flex flex-col gap-2'>
                  <Label className='text-sm font-medium text-gray-800'>対象地域レベル</Label>
                  <Select
                    value={regionLevel}
                    onValueChange={(value) => value && setRegionLevel(value as RegionLevel)}
                  >
                    <SelectTrigger className='rounded-none'>
                      <SelectValue placeholder='地域レベルを選択' />
                    </SelectTrigger>
                    <SelectContent>
                      {regionLevels.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='flex flex-col gap-2'>
                  <Label htmlFor='cf-region' className='text-sm font-medium text-gray-800'>地域名（任意）</Label>
                  <Input
                    id='cf-region'
                    value={regionName}
                    placeholder='例: 東京都 / 渋谷区'
                    className='rounded-none'
                    onChange={(e) => setRegionName(e.target.value)}
                  />
                </div>
              </div>

              {/* Standard regional allocation */}
              <div className='rounded bg-green-50 p-4'>
                <p className='mb-2 text-xs font-medium text-green-800'>
                  「{theme.name}」の標準地域配分（寄付配分の目安）
                </p>
                <div className='flex h-3 w-full overflow-hidden rounded-full'>
                  <div className='bg-green-600' style={{ width: `${theme.allocation.municipality}%` }} />
                  <div className='bg-green-400' style={{ width: `${theme.allocation.prefecture}%` }} />
                  <div className='bg-green-300' style={{ width: `${theme.allocation.national}%` }} />
                </div>
                <div className='mt-1.5 flex justify-between text-xs text-green-700'>
                  <span>市区町村 {theme.allocation.municipality}%</span>
                  <span>都道府県 {theme.allocation.prefecture}%</span>
                  <span>国会 {theme.allocation.national}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Goal & expense plan */}
          <div className='overflow-hidden rounded-lg border border-gray-200 bg-white'>
            <div className='flex items-center gap-2 bg-green-600 px-4 py-3 text-white'>
              <MdOutlinePayments className='h-5 w-5' />
              <h2 className='text-base font-bold'>目標金額・支出計画</h2>
            </div>
            <div className='flex flex-col gap-6 p-6'>
              <div className='flex flex-col gap-2'>
                <Label htmlFor='cf-goal' className='text-sm font-medium text-gray-800'>目標金額（円）</Label>
                <Input
                  id='cf-goal'
                  type='number'
                  min={0}
                  inputMode='numeric'
                  value={goal}
                  placeholder='例: 3000000'
                  className='rounded-none'
                  onChange={(e) => setGoal(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>

              <div className='flex flex-col gap-2'>
                <Label className='text-sm font-medium text-gray-800'>支出計画（何に使うか）</Label>
                <div className='flex flex-col gap-2'>
                  {rows.map((r) => (
                    <div key={r.id} className='flex items-center gap-2'>
                      <Input
                        value={r.purpose}
                        placeholder='用途（例: 政策調査）'
                        className='flex-1 rounded-none'
                        onChange={(e) => updateRow(r.id, { purpose: e.target.value })}
                      />
                      <Input
                        type='number'
                        min={0}
                        inputMode='numeric'
                        value={r.amount}
                        placeholder='金額'
                        className='w-32 rounded-none sm:w-40'
                        onChange={(e) =>
                          updateRow(r.id, { amount: e.target.value === '' ? '' : Number(e.target.value) })
                        }
                      />
                      <Button
                        type='button'
                        size='icon'
                        variant='ghost'
                        onClick={() => removeRow(r.id)}
                        disabled={rows.length === 1}
                        aria-label='行を削除'
                        className='shrink-0 text-gray-400 hover:text-m-red transform duration-300 hover:bg-transparent w-auto h-auto p-2 rounded-full'
                      >
                        <FaXmark className='h-4 w-4' />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type='button'
                  variant='ghost'
                  onClick={addRow}
                  className='mt-1 w-fit gap-1.5 rounded text-green-700 hover:bg-green-50 hover:text-green-700'
                >
                  <FaPlus className='h-3.5 w-3.5' />
                  <span>項目を追加</span>
                </Button>
              </div>

              {/* Total vs goal */}
              <div className='flex flex-col gap-1 rounded bg-gray-50 p-4 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>支出計画 合計</span>
                  <span className='font-semibold text-gray-900'>{yen(planTotal)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>目標金額</span>
                  <span className='font-semibold text-gray-900'>{yen(goalNum)}</span>
                </div>
                {goalNum > 0 && (
                  <div
                    className={cn(
                      'mt-1 flex justify-between border-t border-gray-200 pt-2 font-semibold',
                      diff === 0 ? 'text-emerald-600' : diff > 0 ? 'text-rose-600' : 'text-amber-600'
                    )}
                  >
                    <span>{diff === 0 ? '目標と一致' : diff > 0 ? '計画が超過' : '未割当'}</span>
                    <span>{diff === 0 ? '✓' : yen(Math.abs(diff))}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Period, outcome, support types */}
          <div className='overflow-hidden rounded-lg border border-gray-200 bg-white'>
            <div className='flex items-center gap-2 bg-green-600 px-4 py-3 text-white'>
              <MdOutlineFlag className='h-5 w-5' />
              <h2 className='text-base font-bold'>期間・成果・支援タイプ</h2>
            </div>
            <div className='flex flex-col gap-6 p-6'>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='flex flex-col gap-2'>
                  <Label htmlFor='cf-start' className='text-sm font-medium text-gray-800'>開始日</Label>
                  <DateField id='cf-start' value={startDate} onChange={setStartDate} />
                </div>
                <div className='flex flex-col gap-2'>
                  <Label htmlFor='cf-end' className='text-sm font-medium text-gray-800'>終了日</Label>
                  <DateField
                    id='cf-end'
                    value={endDate}
                    onChange={setEndDate}
                    disabled={(date) => {
                      const start = parseCampaignDate(startDate)
                      return start ? date < start : false
                    }}
                  />
                </div>
              </div>

              <div className='flex flex-col gap-2'>
                <Label htmlFor='cf-outcome' className='text-sm font-medium text-gray-800'>成果目標</Label>
                <Textarea
                  id='cf-outcome'
                  rows={4}
                  value={outcome}
                  placeholder='例: 都議会への質問・提言書の作成、地域説明会の開催'
                  className='resize-none rounded-none bg-background'
                  onChange={(e) => setOutcome(e.target.value)}
                />
              </div>

              <div className='flex flex-col gap-2'>
                <Label className='text-sm font-medium text-gray-800'>募集する支援タイプ</Label>
                <ToggleGroup
                  type='multiple'
                  value={selectedSupportTypes}
                  onValueChange={(values) => setSelectedSupportTypes(sortSupportTypes(values))}
                  className='flex-wrap justify-start gap-2'
                >
                  {supportTypes.map((t) => (
                    <ToggleGroupItem
                      key={t}
                      value={t}
                      variant='outline'
                      size='sm'
                      className='px-3 data-[state=on]:bg-green-600 data-[state=on]:text-white hover:bg-gray-400 hover:text-white transition-colors duration-300 rounded-full'
                    >
                      {t}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            </div>
          </div>

          {/* Visibility & legal */}
          <div className='overflow-hidden rounded-lg border border-gray-200 bg-white'>
            <div className='flex items-center gap-2 bg-green-600 px-4 py-3 text-white'>
              <MdOutlineGavel className='h-5 w-5' />
              <h2 className='text-base font-bold'>公開範囲・法務確認</h2>
            </div>
            <div className='flex flex-col gap-6 p-6'>
              <div className='flex flex-col gap-2'>
                <Label className='text-sm font-medium text-gray-800'>公開範囲</Label>
                <ToggleGroup
                  type='single'
                  value={visibility}
                  onValueChange={(value) => value && setVisibility(value as CrowdfundingVisibility)}
                  className='grid grid-cols-2 gap-2'
                >
                  {visibilityOptions.map((option) => (
                    <ToggleGroupItem
                      key={option}
                      value={option}
                      variant='outline'
                      className='flex-1 rounded-none border data-[state=on]:border-green-600 data-[state=on]:bg-green-50 data-[state=on]:text-green-700 py-2 h-auto'
                    >
                      {option}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              <div className='flex flex-col gap-2'>
                <Label className='text-sm font-medium text-gray-800'>法務確認状況</Label>
                <ToggleGroup
                  type='single'
                  value={legal}
                  onValueChange={(value) => value && setLegal(value as CrowdfundingLegalStatus)}
                  className='flex-wrap justify-start gap-2'
                >
                  {legalStatusOptions.map((option) => (
                    <ToggleGroupItem
                      key={option}
                      value={option}
                      variant='outline'
                      size='sm'
                      className={cn('px-3 rounded-full transition-colors duration-300', legalActiveClassName[option])}
                    >
                      {option}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <p className='text-xs text-gray-400'>
                  ※ 政治資金規正法・公職選挙法の確認は、公開前に必ず行ってください。
                </p>
              </div>
            </div>
          </div>

          {error && (
            <p className='bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700'>{error}</p>
          )}
          {success && (
            <p className='bg-green-50 border-l-4 border-green-400 p-4 text-sm text-green-700'>{success}</p>
          )}

          <div className='flex items-start'>
            <Button
              type='submit'
              variant='default'
              disabled={isSubmitting || !canSave}
              className='w-full max-w-64 mt-4 mx-auto h-auto py-3 text-base rounded-full bg-m-blue hover:bg-m-hover-blue transform transition-all duration-300'
            >
              {isSubmitting ? '保存中...' : 'プロジェクトを保存'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}
