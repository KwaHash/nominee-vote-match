'use client'

import { useEffect, useState, type ChangeEvent } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import axios from 'axios'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import Image from 'next/image'
import { Controller, useForm, useWatch, type Resolver } from 'react-hook-form'
import { BsPersonFillUp } from 'react-icons/bs'
import { FaBriefcase, FaCalendar, FaImage, FaLink, FaPlus, FaTrash, FaTrophy, FaUser } from 'react-icons/fa'
import { FiMapPin, FiTarget, FiUser } from 'react-icons/fi'
import { HiUserGroup } from 'react-icons/hi2'
import * as yup from 'yup'
import InputField from '@/components/input/input-field'
import ProfileFormItem from '@/components/item/profile-form-item'
import LoadingIndicator from '@/components/loading-indicator'
import MainHero from '@/components/main-hero'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ELECTION_LEVELS, parties, POSITION_OPTIONS, WEBSITE_LINK_LABELS, WEBSITE_FIELD_LABELS } from '@/constants/profile.c'
import { cn } from '@/lib/utils'
import {
  type AchievementEntry, type CustomItemEntry, type ICandidateProfile,
  type IProfileForm, type ProfileCustomItem, type ProfileWebsiteLink, type WebsiteLinkEntry,
} from '@/types/profile.d'
import {
  BIRTH_DATE_FORMAT, BIRTH_DATE_FROM_YEAR, BIRTH_DATE_TO_YEAR,
  createAchievementEntry, createCustomItemEntry, createWebsiteLinkEntry,
  formatBirthDate, formToProfilePayload, isProfileAvatarValue,
  MAX_PROFILE_AVATAR_SIZE_BYTES, parseBirthDate, PROFILE_AVATAR_ACCEPT,
  validateCustomItems, validateWebsiteLinks,
} from '@/utils/profile.u'

const partyOptions = parties.filter((p) => p.id !== 0)
const profileInputClass = 'w-full rounded-none border-gray-200 focus-visible:ring-[#777]'

const schema = yup.object().shape({
  kanji_name: yup.string().trim().required('氏名（漢字）は必須です'),
  hiragana_name: yup.string().trim().required('氏名（ひらがな）は必須です'),
  avatar: yup.string().trim().required('顔写真は必須です')
    .test('avatar-valid', '画像ファイルを選択してください', (value) =>
      isProfileAvatarValue(value)
    ),
  party: yup.string().trim().required('政党は必須です'),
  birth_date: yup.string().trim().required('生年月日は必須です')
    .matches(/^\d{4}\/\d{2}\/\d{2}$/, '生年月日は YYYY/MM/DD 形式で入力してください'),
  election_level: yup.string().trim().required('対象選挙は必須です'),
  district: yup.string().trim().required('選挙区は必須です'),
  position: yup.string().oneOf(['現職', '新人'] as string[]).required('立場は必須です'),
  education: yup.string().trim().optional(),
  career: yup.string().trim().optional(),
  political_career: yup.string().trim().optional(),
})

const defaultValues: IProfileForm = {
  kanji_name: '',
  hiragana_name: '',
  avatar: '',
  party: '',
  birth_date: '',
  election_level: '衆議院',
  district: '',
  position: '新人',
  education: '',
  career: '',
  political_career: '',
}

function profileToFormValues(profile: ICandidateProfile): IProfileForm {
  return {
    ...defaultValues,
    kanji_name: profile.kanji_name,
    hiragana_name: profile.hiragana_name,
    avatar: profile.avatar,
    party: profile.party,
    birth_date: profile.birth_date,
    election_level: profile.election_level ?? '衆議院',
    district: profile.district ?? '',
    position: profile.position ?? '新人',
    education: profile.education ?? '',
    career: profile.career ?? '',
    political_career: profile.political_career ?? '',
  }
}

function achievementsFromProfile(achievements: string[] | undefined): AchievementEntry[] {
  if (!achievements?.length) return [createAchievementEntry('')]
  return achievements.map((text) => createAchievementEntry(text))
}

function websiteLinksFromProfile(website: ProfileWebsiteLink[] | undefined): WebsiteLinkEntry[] {
  const allowedLabels: readonly string[] = WEBSITE_LINK_LABELS
  return (website ?? [])
    .filter((link) => allowedLabels.includes(link.label))
    .map((link) => createWebsiteLinkEntry(link.label, link.url))
}

function customItemsFromProfile(items: ProfileCustomItem[] | undefined): CustomItemEntry[] {
  return (items ?? []).map((item) => createCustomItemEntry(item.label, item.value))
}

const ProfilePage = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [websiteLinks, setWebsiteLinks] = useState<WebsiteLinkEntry[]>([])
  const [customItems, setCustomItems] = useState<CustomItemEntry[]>([])
  const [achievements, setAchievements] = useState<AchievementEntry[]>([createAchievementEntry('')])
  const [erroredAvatar, setErroredAvatar] = useState<string | null>(null)
  const [avatarFileName, setAvatarFileName] = useState<string | null>(null)
  const [avatarFileError, setAvatarFileError] = useState('')
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<IProfileForm>({
    resolver: yupResolver(schema) as Resolver<IProfileForm>,
    defaultValues,
  })

  const watchedValues = useWatch({ control })
  const avatarValue = watchedValues.avatar ?? ''
  const hasAvatarImage = isProfileAvatarValue(avatarValue) && erroredAvatar !== avatarValue
  const avatarFileStatus = isUploadingAvatar
    ? 'アップロード中...'
    : avatarFileName ?? (hasAvatarImage ? '登録済みの画像' : '選択されていません')

  const handleAvatarFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target
    const file = input.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setAvatarFileError('画像ファイルを選択してください。')
      input.value = ''
      return
    }
    if (file.size > MAX_PROFILE_AVATAR_SIZE_BYTES) {
      setAvatarFileError('2MB以下の画像を選択してください。')
      input.value = ''
      return
    }

    setAvatarFileError('')
    setIsUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await axios.post<{ path: string }>('/api/upload/avatar', formData)
      setValue('avatar', data.path, { shouldValidate: true, shouldDirty: true })
      setAvatarFileName(file.name)
      setErroredAvatar(null)
    } catch (err) {
      const message = axios.isAxiosError<{ error?: string }>(err)
        ? err.response?.data?.error ?? '画像のアップロードに失敗しました。'
        : '画像のアップロードに失敗しました。'
      setAvatarFileError(message)
    } finally {
      setIsUploadingAvatar(false)
      input.value = ''
    }
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get<{ profile: ICandidateProfile | null }>('/api/profile')
        if (data.profile) {
          reset(profileToFormValues(data.profile))
          setAvatarFileName(null)
          setAchievements(achievementsFromProfile(data.profile.achievements))
          setWebsiteLinks(websiteLinksFromProfile(data.profile.website))
          setCustomItems(customItemsFromProfile(data.profile.custom_items))
        }
      } catch (err) {
        const message = axios.isAxiosError<{ error?: string }>(err)
          ? err.response?.data?.error ?? 'プロフィールの取得に失敗しました。'
          : 'プロフィールの取得に失敗しました。'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchProfile()
  }, [reset])

  const onSubmit = async (data: IProfileForm) => {
    setError('')
    setSuccess('')

    const websiteError = validateWebsiteLinks(websiteLinks)
    if (websiteError) {
      setError(websiteError)
      return
    }

    const customItemsError = validateCustomItems(customItems)
    if (customItemsError) {
      setError(customItemsError)
      return
    }

    const payload = formToProfilePayload(data, websiteLinks, customItems, achievements)
    try {
      await axios.put('/api/profile', payload)
    } catch (err) {
      const message = axios.isAxiosError<{ error?: string }>(err)
        ? err.response?.data?.error ?? 'プロフィールの保存に失敗しました。'
        : 'プロフィールの保存に失敗しました。'
      setError(message)
      return
    }
    setSuccess('プロフィールを保存しました。')
  }

  const addAchievement = () => {
    setAchievements((prev) => [...prev, createAchievementEntry('')])
  }

  const removeAchievement = (id: string) => {
    setAchievements((prev) => prev.filter((item) => item.id !== id))
  }

  const updateAchievement = (id: string, text: string) => {
    setAchievements((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text } : item))
    )
  }

  const addWebsiteLink = () => {
    if (websiteLinks.length >= WEBSITE_LINK_LABELS.length) return
    const used = new Set(websiteLinks.map((link) => link.label))
    const nextLabel = WEBSITE_LINK_LABELS.find((label) => !used.has(label)) ?? ''
    setWebsiteLinks((prev) => [...prev, createWebsiteLinkEntry(nextLabel, '')])
  }

  const removeWebsiteLink = (id: string) => {
    setWebsiteLinks((prev) => prev.filter((link) => link.id !== id))
  }

  const updateWebsiteLink = (
    id: string,
    patch: Partial<Pick<ProfileWebsiteLink, 'label' | 'url'>>
  ) => {
    setWebsiteLinks((prev) =>
      prev.map((link) => (link.id === id ? { ...link, ...patch } : link))
    )
  }

  const addCustomItem = () => {
    setCustomItems((prev) => [...prev, createCustomItemEntry('', '')])
  }

  const removeCustomItem = (id: string) => {
    setCustomItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateCustomItem = (
    id: string,
    patch: Partial<Pick<ProfileCustomItem, 'label' | 'value'>>
  ) => {
    setCustomItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const canAddWebsiteLink = websiteLinks.length < WEBSITE_LINK_LABELS.length

  if (isLoading) {
    return <LoadingIndicator />
  }

  return (
    <div className='min-h-screen bg-white'>
      {/* Hero */}
      <MainHero
        title='プロフィール'
        description='ここで登録した情報が、国民向けサイトの候補者ページ・政策マッチングの土台になります。'
      />

      <section className='w-full max-w-6xl mx-auto px-4 md:px-8 py-12'>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-3'>
          {/* 基本情報 */}
          <div className='overflow-hidden rounded-lg border border-gray-200 bg-white'>
            <div className='flex items-center gap-2 bg-green-600 px-4 py-3 text-white'>
              <FaUser className='h-5 w-5 shrink-0' />
              <h2 className='text-base font-bold'>基本情報</h2>
            </div>
            <div className='grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2 p-6'>
              <ProfileFormItem
                label='氏名（漢字）'
                htmlFor='kanji_name'
                icon={FiUser}
                required
                error={errors.kanji_name?.message}
              >
                <InputField
                  id='kanji_name'
                  control={control}
                  placeholder='例：山田 太郎'
                  className={profileInputClass}
                />
              </ProfileFormItem>

              <ProfileFormItem
                label='氏名（ひらがな）'
                htmlFor='hiragana_name'
                icon={FiUser}
                required
                error={errors.hiragana_name?.message}
              >
                <InputField
                  id='hiragana_name'
                  control={control}
                  placeholder='例：やまだ たろう'
                  className={profileInputClass}
                />
              </ProfileFormItem>

              <ProfileFormItem
                label='顔写真'
                htmlFor='avatar-file'
                icon={FaImage}
                required
                error={errors.avatar?.message}
                className='md:col-span-2'
              >
                <Controller
                  name='avatar'
                  control={control}
                  render={({ field }) => <input type='hidden' {...field} value={field.value ?? ''} />}
                />
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
                  <div className='relative h-32 w-32 shrink-0 overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100'>
                    {hasAvatarImage ? (
                      <Image
                        src={avatarValue}
                        alt='顔写真プレビュー'
                        fill
                        unoptimized
                        className='object-cover'
                        onError={() => setErroredAvatar(avatarValue)}
                      />
                    ) : (
                      <div className='flex h-full w-full items-center justify-center'>
                        <FaUser className='h-14 w-14 text-gray-400' aria-hidden />
                      </div>
                    )}
                  </div>
                  <div className='flex flex-col gap-2'>
                    <input
                      id='avatar-file'
                      type='file'
                      accept={PROFILE_AVATAR_ACCEPT}
                      className='sr-only'
                      onChange={handleAvatarFileChange}
                      disabled={isUploadingAvatar}
                    />
                    <div className='flex flex-wrap items-center gap-3'>
                      <Label
                        htmlFor='avatar-file'
                        aria-disabled={isUploadingAvatar}
                        className={cn(
                          profileInputClass,
                          'inline-flex h-10 cursor-pointer items-center justify-center border bg-background px-4 text-sm font-medium text-gray-800 hover:bg-gray-50',
                          isUploadingAvatar && 'pointer-events-none opacity-50'
                        )}
                      >
                        ファイルを選択
                      </Label>
                      <span className='text-sm text-muted-foreground'>{avatarFileStatus}</span>
                    </div>
                    <p className='text-xs text-muted-foreground'>JPEG、PNG、WebP、GIF（2MB以内）</p>
                    {avatarFileError && (
                      <p className='text-xs text-m-red'>{avatarFileError}</p>
                    )}
                  </div>
                </div>
              </ProfileFormItem>

              <ProfileFormItem
                label='政党'
                htmlFor='party'
                icon={HiUserGroup}
                required
                error={errors.party?.message}
              >
                <Controller
                  name='party'
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id='party' className={cn(profileInputClass, 'h-10')}>
                        <SelectValue placeholder='政党を選択' />
                      </SelectTrigger>
                      <SelectContent>
                        {partyOptions.map((p) => (
                          <SelectItem key={p.id} value={p.value}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </ProfileFormItem>

              <ProfileFormItem
                label='生年月日'
                htmlFor='birth_date'
                icon={FaCalendar}
                required
                error={errors.birth_date?.message}
              >
                <Controller
                  name='birth_date'
                  control={control}
                  render={({ field }) => {
                    const selectedDate = parseBirthDate(field.value)
                    return (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type='button'
                            variant='outline'
                            id='birth_date'
                            className={cn(
                              profileInputClass,
                              'h-10 justify-start text-left font-normal hover:bg-gray-400 transform duration-300 ease-in-out',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {selectedDate
                              ? format(selectedDate, BIRTH_DATE_FORMAT, { locale: ja })
                              : '日付を選択'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0' align='start'>
                          <Calendar
                            mode='single'
                            captionLayout='dropdown'
                            startMonth={new Date(BIRTH_DATE_FROM_YEAR, 0)}
                            endMonth={new Date(BIRTH_DATE_TO_YEAR, 11)}
                            selected={selectedDate}
                            onSelect={(date) =>
                              field.onChange(date ? formatBirthDate(date) : '')
                            }
                            disabled={(date) => date > new Date()}
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
                    )
                  }}
                />
              </ProfileFormItem>

              <ProfileFormItem
                label='対象選挙'
                htmlFor='election_level'
                icon={FiTarget}
                required
                error={errors.election_level?.message}
              >
                <Controller
                  name='election_level'
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id='election_level' className={cn(profileInputClass, 'h-10')}>
                        <SelectValue placeholder='対象選挙を選択' />
                      </SelectTrigger>
                      <SelectContent>
                        {ELECTION_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </ProfileFormItem>

              <ProfileFormItem
                label='選挙区'
                htmlFor='district'
                icon={FiMapPin}
                required
                error={errors.district?.message}
              >
                <InputField
                  id='district'
                  control={control}
                  placeholder='例: 東京1区'
                  className={profileInputClass}
                />
              </ProfileFormItem>

              <ProfileFormItem
                label='立場'
                htmlFor='position'
                icon={BsPersonFillUp}
                required
                error={errors.position?.message}
                className='md:col-span-2'
              >
                <Controller
                  name='position'
                  control={control}
                  render={({ field }) => (
                    <ToggleGroup
                      type='single'
                      value={field.value}
                      onValueChange={(value) => {
                        if (value) field.onChange(value)
                      }}
                      className='grid grid-cols-2 gap-6'
                    >
                      {POSITION_OPTIONS.map((option) => (
                        <ToggleGroupItem
                          key={option.value}
                          value={option.value}
                          variant='outline'
                          className={cn(
                            profileInputClass,
                            'h-10 data-[state=on]:border-green-600 data-[state=on]:bg-green-600/20 data-[state=on]:text-green-600 hover:bg-green-600/10 hover:text-green-600'
                          )}
                        >
                          {option.label}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  )}
                />
              </ProfileFormItem>
            </div>
          </div>

          {/* 経歴 */}
          <div className='overflow-hidden rounded-lg border border-gray-200 bg-white'>
            <div className='flex items-center gap-2 bg-green-600 px-4 py-3 text-white'>
              <FaBriefcase className='h-5 w-5 shrink-0' />
              <h2 className='text-base font-bold'>経歴</h2>
            </div>
            <div className='flex flex-col gap-4 p-3 sm:p-6'>
              <div className='flex flex-col gap-2'>
                <Label htmlFor='education'>学歴</Label>
                <Controller
                  name='education'
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      id='education'
                      rows={2}
                      className='rounded-none resize-y'
                      placeholder='例：○○大学法学部 卒業'
                    />
                  )}
                />
              </div>

              <div className='flex flex-col gap-2'>
                <Label htmlFor='career'>職歴</Label>
                <Controller
                  name='career'
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      id='career'
                      rows={2}
                      className='rounded-none resize-y'
                      placeholder='例：○○株式会社 勤務'
                    />
                  )}
                />
              </div>

              <div className='flex flex-col gap-2'>
                <Label htmlFor='political_career'>政治歴</Label>
                <Controller
                  name='political_career'
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      id='political_career'
                      rows={2}
                      className='rounded-none resize-y'
                      placeholder='例：○○市議会議員（2期）'
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* 実績 */}
          <div className='overflow-hidden rounded-lg border border-gray-200 bg-white'>
            <div className='flex items-center gap-2 bg-green-600 px-4 py-3 text-white'>
              <FaTrophy className='h-5 w-5 shrink-0' />
              <h2 className='text-base font-bold'>実績</h2>
            </div>
            <div className='flex flex-col gap-4 p-3 sm:p-6'>
              <div className='flex items-start justify-between gap-2'>
                <p className='text-sm text-muted-foreground'>議会質問・条例・提言・活動などを1件ずつ登録できます</p>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='shrink-0 rounded-none border-gray-200 bg-white hover:bg-gray-400 transform duration-300 ease-in-out'
                  onClick={addAchievement}
                >
                  <FaPlus className='mr-1 h-3 w-3' />
                  追加
                </Button>
              </div>
              <div className='flex flex-col gap-3'>
                {achievements.map((item, index) => (
                  <div
                    key={item.id}
                    className='flex flex-col gap-2 rounded-md border border-gray-200 p-3 sm:flex-row sm:items-end'
                  >
                    <div className='flex flex-1 flex-col gap-2'>
                      <Label htmlFor={`achievement-${item.id}`} className='text-sm'>実績 {index + 1}</Label>
                      <Input
                        id={`achievement-${item.id}`}
                        value={item.text}
                        placeholder='例：2026年 都議会で防災予算の拡充を提言'
                        className={profileInputClass}
                        onChange={(e) => updateAchievement(item.id, e.target.value)}
                      />
                    </div>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='shrink-0 hover:bg-transparent text-muted-foreground hover:text-red-600 transform duration-300 ease-in-out self-end'
                      onClick={() => removeAchievement(item.id)}
                      aria-label='削除'
                    >
                      <FaTrash className='h-4 w-4' />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SNS・ウェブサイト */}
          <div className='overflow-hidden rounded-lg border border-gray-200 bg-white'>
            <div className='flex items-center gap-2 bg-green-600 px-4 py-3 text-white'>
              <FaLink className='h-5 w-5 shrink-0' />
              <h2 className='text-base font-bold'>SNS・ウェブサイト</h2>
            </div>
            <div className='flex flex-col gap-4 p-3 sm:p-6'>
              <div className='flex items-start justify-between gap-2'>
                <p className='text-sm text-muted-foreground'>追加ボタンからSNSリンクを登録できます</p>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='shrink-0 rounded-none border-gray-200 bg-white hover:bg-gray-400 transform duration-300 ease-in-out'
                  onClick={addWebsiteLink}
                  disabled={!canAddWebsiteLink}
                >
                  <FaPlus className='mr-1 h-3 w-3' />
                  追加
                </Button>
              </div>
              {websiteLinks.length > 0 && (
                <div className='flex flex-col gap-3'>
                  {websiteLinks.map((link) => (
                    <div
                      key={link.id}
                      className='flex flex-col gap-2 rounded-md border border-gray-200 p-3 sm:flex-row sm:items-end'
                    >
                      <div className='flex flex-1 flex-col gap-2 sm:max-w-[200px]'>
                        <Label htmlFor={`website-label-${link.id}`} className='text-sm'>
                          種類
                        </Label>
                        <Select
                          value={link.label || undefined}
                          onValueChange={(value) =>
                            updateWebsiteLink(link.id, { label: value })
                          }
                        >
                          <SelectTrigger
                            id={`website-label-${link.id}`}
                            className={cn(profileInputClass, 'h-10')}
                          >
                            <SelectValue placeholder='種類を選択' />
                          </SelectTrigger>
                          <SelectContent>
                            {WEBSITE_LINK_LABELS.map((label) => {
                              const isUsed = websiteLinks.some(
                                (entry) => entry.label === label && entry.id !== link.id
                              )
                              return (
                                <SelectItem key={label} value={label} disabled={isUsed}>
                                  {WEBSITE_FIELD_LABELS[label] ?? label}
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className='flex flex-[2] flex-col gap-2'>
                        <Label htmlFor={`website-url-${link.id}`} className='text-sm'>
                          URL
                        </Label>
                        <Input
                          id={`website-url-${link.id}`}
                          type='url'
                          value={link.url}
                          placeholder='https://...'
                          className={profileInputClass}
                          onChange={(e) =>
                            updateWebsiteLink(link.id, { url: e.target.value })
                          }
                        />
                      </div>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='shrink-0 hover:bg-transparent text-muted-foreground hover:text-red-600 transform duration-300 ease-in-out self-end'
                        onClick={() => removeWebsiteLink(link.id)}
                        aria-label='削除'
                      >
                        <FaTrash className='h-4 w-4' />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* その他の項目 */}
          <div className='overflow-hidden rounded-lg border border-gray-200 bg-white'>
            <div className='flex items-center gap-2 bg-green-600 px-4 py-3 text-white'>
              <FaPlus className='h-5 w-5 shrink-0' />
              <h2 className='text-base font-bold'>その他の項目</h2>
            </div>
            <div className='flex flex-col gap-4 p-3 sm:p-6'>
              <div className='flex items-start justify-between gap-2'>
                <p className='text-sm text-muted-foreground'>追加ボタンから自由な項目を登録できます</p>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='shrink-0 rounded-none border-gray-200 bg-white hover:bg-gray-400 transform duration-300 ease-in-out'
                  onClick={addCustomItem}
                >
                  <FaPlus className='mr-1 h-3 w-3' />
                  追加
                </Button>
              </div>
              {customItems.length > 0 && (
                <div className='flex flex-col gap-3'>
                  {customItems.map((item) => (
                    <div
                      key={item.id}
                      className='flex flex-col gap-2 rounded-md border border-gray-200 p-3 sm:flex-row sm:items-end'
                    >
                      <div className='flex flex-1 flex-col gap-2 sm:max-w-[200px]'>
                        <Label htmlFor={`custom-label-${item.id}`} className='text-sm'>項目名</Label>
                        <Input
                          id={`custom-label-${item.id}`}
                          value={item.label}
                          placeholder='例：所属委員会'
                          className={profileInputClass}
                          onChange={(e) =>
                            updateCustomItem(item.id, { label: e.target.value })
                          }
                        />
                      </div>
                      <div className='flex flex-[2] flex-col gap-2'>
                        <Label htmlFor={`custom-value-${item.id}`} className='text-sm'>内容</Label>
                        <Input
                          id={`custom-value-${item.id}`}
                          value={item.value}
                          placeholder='例：予算委員会'
                          className={profileInputClass}
                          onChange={(e) =>
                            updateCustomItem(item.id, { value: e.target.value })
                          }
                        />
                      </div>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='shrink-0 hover:bg-transparent text-muted-foreground hover:text-red-600 transform duration-300 ease-in-out self-end'
                        onClick={() => removeCustomItem(item.id)}
                        aria-label='削除'
                      >
                        <FaTrash className='h-4 w-4' />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
              disabled={isSubmitting}
              className='w-full max-w-64 mt-4 mx-auto h-auto py-3 text-base rounded-full bg-m-blue hover:bg-m-hover-blue transform transition-all duration-300'
            >
              {isSubmitting ? '保存中...' : 'プロフィールを保存'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default ProfilePage
