'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FaChevronLeft } from 'react-icons/fa'
import { MdGroups } from 'react-icons/md'
import { getSupporter, updateSupporter } from './actions'
import Loading from '@/components/loading-indicator'
import MainHero from '@/components/main-hero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { policyThemes, supportTypes, supporterKinds, visibilityOptions } from '@/constants/supporter.c'
import { type SupporterKind, type SupporterVisibility } from '@/types/supporter.d'

const chipClassName = 'px-3 data-[state=on]:bg-green-600 data-[state=on]:text-white hover:bg-green-600 hover:text-white transition-colors duration-300 rounded-full'

const sortByReference = (values: string[], order: readonly string[]) =>
  [...values].sort((a, b) => order.indexOf(a) - order.indexOf(b))

export default function SupporterEditPage({ id }: { id: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [kind, setKind] = useState<SupporterKind>('個人')
  const [selectedSupportTypes, setSelectedSupportTypes] = useState<string[]>([])
  const [interests, setInterests] = useState<string[]>([])
  const [region, setRegion] = useState('')
  const [contactNote, setContactNote] = useState('')
  const [nextAction, setNextAction] = useState('')
  const [visibility, setVisibility] = useState<SupporterVisibility>('非公開')

  useEffect(() => {
    const fetchSupporter = async () => {
      setIsLoading(true)
      const { data, error: fetchError } = await getSupporter(id)
      if (fetchError) {
        setError(fetchError)
      } else if (!data) {
        setNotFound(true)
      } else {
        setName(data.name)
        setKind(data.kind)
        setSelectedSupportTypes(sortByReference(data.support_types ?? [], supportTypes))
        setInterests(sortByReference(data.interests ?? [], policyThemes))
        setRegion(data.region)
        setContactNote(data.contact_note)
        setNextAction(data.next_action)
        setVisibility(data.visibility)
      }
      setIsLoading(false)
    }

    void fetchSupporter()
  }, [id])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    const supporter = {
      name: name.trim(),
      kind,
      supportTypes: selectedSupportTypes,
      interests,
      region: region.trim(),
      visibility,
      contactNote: contactNote.trim(),
      nextAction: nextAction.trim(),
    }

    setIsSubmitting(true)
    const { error: updateError } = await updateSupporter(id, supporter)
    if (updateError) {
      setError(updateError)
    }
    setIsSubmitting(false)
    router.push('/supporters/list')
  }

  if (isLoading) return <Loading />

  return (
    <div className='min-h-screen bg-white'>
      <MainHero
        title='支援者編集'
        description='支援タイプ・関心政策・接触履歴・次回アクションを記録し、関係づくりに使います。'
      />

      <section className='w-full max-w-6xl mx-auto px-4 md:px-8 py-12'>
        <Link href='/supporters/list'
          className='group mb-6 inline-flex items-center gap-1 text-base font-medium text-green-700'
        >
          <FaChevronLeft className='h-4 w-4' />
          <span className='relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-green-700 after:transition-transform after:duration-300 group-hover:after:scale-x-100'>
            支援者一覧へ戻る
          </span>
        </Link>

        {notFound ? (
          <p className='bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800 rounded'>
            支援者が見つかりませんでした。
          </p>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-8'>
            <div className='overflow-hidden rounded-lg border border-gray-200 bg-white'>
              <div className='flex items-center gap-2 bg-green-600 px-4 py-3 text-white'>
                <MdGroups className='h-5 w-5' />
                <h2 className='text-base font-bold'>支援者編集</h2>
              </div>

              <div className='flex flex-col gap-6 p-6'>
                {/* Name & Kind */}
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                  <div className='flex flex-col gap-2'>
                    <Label htmlFor='supporter-name' className='text-sm font-medium text-gray-800'>支援者名</Label>
                    <Input
                      id='supporter-name'
                      value={name}
                      placeholder='例: 山田 花子 / 〇〇商工会'
                      className='rounded'
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className='flex flex-col gap-2'>
                    <Label className='text-sm font-medium text-gray-800'>区分</Label>
                    <Select value={kind}
                      onValueChange={(value) => setKind(value as SupporterKind)}
                    >
                      <SelectTrigger className='rounded'>
                        <SelectValue placeholder='区分を選択' />
                      </SelectTrigger>
                      <SelectContent>
                        {supporterKinds.map((supporterKind) => (
                          <SelectItem key={supporterKind} value={supporterKind}>
                            {supporterKind}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Support Types */}
                <div className='flex flex-col gap-2'>
                  <Label className='text-sm font-medium text-gray-800'>支援タイプ</Label>
                  <ToggleGroup
                    type='multiple'
                    value={selectedSupportTypes}
                    onValueChange={(values) => setSelectedSupportTypes(sortByReference(values, supportTypes))}
                    className='flex-wrap justify-start gap-2'
                  >
                    {supportTypes.map((t) => (
                      <ToggleGroupItem
                        key={t}
                        value={t}
                        variant='outline'
                        size='sm'
                        className={chipClassName}
                      >
                        {t}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>

                {/* Policy Interests */}
                <div className='flex flex-col gap-2'>
                  <Label className='text-sm font-medium text-gray-800'>関心政策</Label>
                  <ToggleGroup
                    type='multiple'
                    value={interests}
                    onValueChange={(values) => setInterests(sortByReference(values, policyThemes))}
                    className='flex-wrap justify-start gap-2'
                  >
                    {policyThemes.map((theme) => (
                      <ToggleGroupItem
                        key={theme}
                        value={theme}
                        variant='outline'
                        size='sm'
                        className={chipClassName}
                      >
                        {theme}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>

                {/* Region & Visibility */}
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                  <div className='flex flex-col gap-2'>
                    <Label htmlFor='supporter-region' className='text-sm font-medium text-gray-800'>地域</Label>
                    <Input
                      id='supporter-region'
                      value={region}
                      placeholder='例: 東京都渋谷区'
                      className='rounded'
                      onChange={(e) => setRegion(e.target.value)}
                    />
                  </div>

                  <div className='flex flex-col gap-2'>
                    <Label className='text-sm font-medium text-gray-800'>公開設定</Label>
                    <Select
                      value={visibility}
                      onValueChange={(value) => setVisibility(value as SupporterVisibility)}
                    >
                      <SelectTrigger className='rounded'>
                        <SelectValue placeholder='公開設定を選択' />
                      </SelectTrigger>
                      <SelectContent>
                        {visibilityOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Contact History */}
                <div className='flex flex-col gap-2'>
                  <Label htmlFor='supporter-contact' className='text-sm font-medium text-gray-800'>
                    接触履歴（面談・メール・電話・イベント等）
                  </Label>
                  <Textarea
                    id='supporter-contact'
                    rows={2}
                    value={contactNote}
                    placeholder='例: 2026/6/10 防災勉強会で名刺交換。動画編集の協力可能とのこと。'
                    className='resize-none rounded bg-background'
                    onChange={(e) => setContactNote(e.target.value)}
                  />
                </div>

                {/* Next Action */}
                <div className='flex flex-col gap-2'>
                  <Label htmlFor='supporter-next-action' className='text-sm font-medium text-gray-800'>
                    次回アクション
                  </Label>
                  <Input
                    id='supporter-next-action'
                    value={nextAction}
                    placeholder='例: 来週、動画編集の依頼を連絡'
                    className='rounded'
                    onChange={(e) => setNextAction(e.target.value)}
                  />
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
                disabled={isSubmitting || !name.trim()}
                className='w-full max-w-64 mt-4 mx-auto h-auto py-3 text-base rounded-full bg-m-blue hover:bg-m-hover-blue transform transition-all duration-300'
              >
                {isSubmitting ? '更新中...' : '更新する'}
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}
