'use client'

import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { FaCheck, FaRegThumbsUp } from 'react-icons/fa6'
import { MdForum } from 'react-icons/md'
import LoadingIndicator from '@/components/loading-indicator'
import MainHero from '@/components/main-hero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  answeredStatuses, answerStatusClassName, answerStatusOptions, publicQuestions,
} from '@/constants/public-answer.c'
import { cn } from '@/lib/utils'
import { type AnswerStatus, type PublicQuestionAnswer } from '@/types/public-answer.d'

const defaultAnswers: PublicQuestionAnswer[] = publicQuestions.map((q) => ({
  question_id: q.id,
  answer_text: '',
  source_url: '',
  status: '未回答',
}))

const PublicAnswersPage = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [answers, setAnswers] = useState(defaultAnswers)

  useEffect(() => {
    const fetchPublicAnswers = async () => {
      setIsLoading(true)
      try {
        const { data: { publicAnswers } } = await axios.get<{ publicAnswers: PublicQuestionAnswer[] }>('/api/public-answers')
        if (publicAnswers.length) {
          setAnswers(
            publicQuestions.map((q) => {
              const entry = publicAnswers.find((a) => a.question_id === q.id)
              return {
                question_id: q.id,
                answer_text: entry?.answer_text ?? '',
                source_url: entry?.source_url ?? '',
                status: entry?.status ?? '未回答',
              }
            })
          )
        }
      } catch (err) {
        const message = axios.isAxiosError<{ error?: string }>(err)
          ? err.response?.data?.error ?? '公開質問の取得に失敗しました。' : '公開質問の取得に失敗しました。'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchPublicAnswers()
  }, [])

  const setAnswerText = (questionId: string, answer_text: string) => {
    setAnswers((prev) =>
      prev.map((item) => (item.question_id === questionId ? { ...item, answer_text } : item))
    )
  }

  const setSourceUrl = (questionId: string, source_url: string) => {
    setAnswers((prev) =>
      prev.map((item) => (item.question_id === questionId ? { ...item, source_url } : item))
    )
  }

  const setAnswerStatus = (questionId: string, status: AnswerStatus) => {
    setAnswers((prev) =>
      prev.map((item) => (item.question_id === questionId ? { ...item, status } : item))
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const missingText = answers.find((a) => a.status === '回答提出（運営確認へ）' && a.answer_text.trim() === '')
    if (missingText) {
      setError('提出する回答には、回答本文を入力してください。')
      return
    }

    const editedAnswers = answers.map((a) => ({
      question_id: a.question_id,
      answer_text: a.answer_text.trim(),
      source_url: a.source_url?.trim() || undefined,
      status: a.status,
    }))

    setIsSubmitting(true)
    try {
      await axios.put('/api/public-answers', { publicAnswers: editedAnswers })
      setSuccess('回答を保存しました。提出済みの回答は、運営確認後に国民側ボードへ公開されます。')
    } catch (err) {
      const message = axios.isAxiosError<{ error?: string }>(err)
        ? err.response?.data?.error ?? '回答の保存に失敗しました。' : '回答の保存に失敗しました。'
      setError(message)
    }
    setIsSubmitting(false)
  }

  const answered = useMemo(
    () => answers.filter((a) => answeredStatuses.includes(a.status)).length,
    [answers]
  )
  const progress = Math.round((answered / publicQuestions.length) * 100)
  const hasInput = answers.some((a) => a.status !== '未回答' || a.answer_text.trim() !== '')

  if (isLoading) {
    return <LoadingIndicator />
  }

  return (
    <div className='min-h-screen bg-white'>
      <MainHero
        title='公開質問への回答'
        description={
          <>
            有権者の「公開質問ボード」で投票上位となった質問が、運営から全候補者へ同一条件で届いています。<br />
            提出した回答は、運営確認ののち「回答済み」として国民側ボードに公開されます。
          </>
        }
      />

      <section className='w-full max-w-6xl mx-auto px-4 md:px-8 py-12'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <p className='rounded border border-blue-200 bg-blue-50 p-4 text-xs text-blue-800 leading-5'>
            回答を提出すると、運営確認ののち国民側ボードに「回答済み」として公開されます（未回答は「未回答」と表示されます）。
            全候補者同一条件・中立運用です。<br />
            ※ 回答は運営確認後に公開されます。誹謗中傷・虚偽・特定の有権者への利益供与を示唆する内容は公開されません。<br />
            ※ 選挙運動の期間・方法（公職選挙法）にご注意ください。電子メールでの選挙運動はできません。
          </p>

          {/* Progress Bar */}
          <div className='sticky top-20 z-10 rounded border border-gray-200 bg-white/95 p-4 backdrop-blur'>
            <div className='mb-2 flex items-center justify-between text-sm'>
              <span className='font-medium text-gray-700'>回答状況 {answered} / {publicQuestions.length} 件</span>
              <span className='font-semibold text-green-600'>{progress}%</span>
            </div>
            <div className='h-2 w-full overflow-hidden rounded-full bg-gray-100'>
              <div
                className='h-full rounded-full bg-green-600 transition-all duration-300'
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Public Questions */}
          <div className='overflow-hidden rounded-lg border border-gray-200 bg-white'>
            <div className='flex items-center gap-2 bg-green-600 px-4 py-3 text-white'>
              <MdForum className='h-5 w-5' />
              <h2 className='text-base font-bold'>公開質問</h2>
            </div>
            <div className='flex flex-col gap-2 p-6'>
              {publicQuestions.map((q, index) => {
                const current = answers.find((a) => a.question_id === q.id)
                const status = current?.status ?? '未回答'
                const isAnswered = answeredStatuses.includes(status)
                return (
                  <div key={q.id} className='rounded-sm border border-border overflow-hidden'>
                    <div className='bg-muted p-3 border-b border-border'>
                      <div className='flex items-start gap-3'>
                        <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold bg-green-600 text-white'>
                          {isAnswered ? <FaCheck className='h-3.5 w-3.5' /> : index + 1}
                        </span>
                        <div className='flex flex-col gap-2'>
                          <p className='font-bold text-sm leading-relaxed'>{q.title}</p>
                          <div className='flex flex-wrap items-center gap-3 text-xs text-gray-500'>
                            <span className='rounded bg-gray-100 px-2 py-0.5 font-bold text-gray-600'>{q.theme_key}</span>
                            <span className='flex items-center gap-1'><FaRegThumbsUp className='h-3 w-3' />{q.votes}票</span>
                            <span className={cn('rounded-full px-2 py-0.5 font-semibold', answerStatusClassName[status])}>{status}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='flex flex-col gap-4 px-4 py-3'>
                      <p className='text-sm leading-relaxed text-gray-600'>{q.body}</p>
                      <div className='flex flex-col gap-2'>
                        <Label htmlFor={`${q.id}-answer`} className='text-sm font-medium text-gray-800'>回答本文</Label>
                        <Textarea
                          id={`${q.id}-answer`}
                          rows={5}
                          value={current?.answer_text ?? ''}
                          placeholder={q.placeholder}
                          className='resize-none rounded-none bg-background'
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAnswerText(q.id, e.target.value)}
                        />
                      </div>

                      <div className='flex flex-col gap-2'>
                        <Label htmlFor={`${q.id}-source`} className='text-sm font-medium text-gray-800'>公式リンク・添付資料URL（任意）</Label>
                        <Input
                          id={`${q.id}-source`}
                          type='url'
                          inputMode='url'
                          value={current?.source_url ?? ''}
                          placeholder='https://...'
                          className='rounded-none'
                          onChange={(e) => setSourceUrl(q.id, e.target.value)}
                        />
                      </div>

                      <div className='flex flex-col gap-2'>
                        <Label className='text-sm font-medium text-gray-800'>回答ステータス</Label>
                        <ToggleGroup
                          type='single'
                          value={status === '未回答' ? '' : status}
                          onValueChange={(value) => setAnswerStatus(q.id, (value || '未回答') as AnswerStatus)}
                          className='flex-wrap justify-start gap-2'
                        >
                          {answerStatusOptions.map((option) => (
                            <ToggleGroupItem
                              key={option}
                              value={option}
                              variant='outline'
                              size='sm'
                              className='px-3 py-1.5 h-auto text-xs data-[state=on]:bg-green-600 data-[state=on]:text-white hover:bg-green-700 hover:text-white transition-colors duration-300 rounded-full'
                            >
                              {option}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </div>
                    </div>
                  </div>
                )
              })}
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
              disabled={isSubmitting || !hasInput}
              className='w-full max-w-64 mt-4 mx-auto h-auto py-3 text-base rounded-full bg-m-blue hover:bg-m-hover-blue transform transition-all duration-300'
            >
              {isSubmitting ? '保存中...' : '回答を保存'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default PublicAnswersPage
