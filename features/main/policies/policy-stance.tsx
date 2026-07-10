'use client'

import { useEffect, useMemo, useState } from 'react'
import { FaCheck } from 'react-icons/fa6'
import { MdPolicy } from 'react-icons/md'
import { getPolicyStance, savePolicyStance } from './actions'
import LoadingIndicator from '@/components/loading-indicator'
import MainHero from '@/components/main-hero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { importanceOptions, policyQuestions } from '@/constants/policy.c'
import  { type PolicyImportance, type PolicyQuestionAnswer } from '@/types/policy.d'

const defaultQuestionAnswers: PolicyQuestionAnswer[] = policyQuestions.map((q) => ({
  question: q.question,
  answer: '',
  importance: '',
  evidence_url: '',
  note: '',
}))

const PolicyStancePage = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [questionAnswers, setQuestionAnswers] = useState(defaultQuestionAnswers)

  useEffect(() => {
    const fetchPolicyStance = async () => {
      setIsLoading(true)
      const { policyStances, error: fetchError } = await getPolicyStance()

      if (fetchError) {
        setError(fetchError)
      } else if (policyStances.length) {
        setQuestionAnswers(
          policyQuestions.map((q) => {
            const entry = policyStances.find((a) => a.question === q.question)
            return {
              question: q.question,
              answer: entry?.answer ?? '',
              importance: entry?.importance ?? '',
              evidence_url: entry?.evidence_url ?? '',
              note: entry?.note ?? '',
            }
          })
        )
      }
      setIsLoading(false)
    }

    void fetchPolicyStance()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const answeredQuestions = questionAnswers
      .filter((a) => a.answer.trim() !== '')
      .map((a) => ({
        question: a.question,
        answer: a.answer,
        importance: a.importance || undefined,
        evidence_url: a.evidence_url?.trim() || undefined,
        note: a.note?.trim() || undefined,
      }))

    setIsSubmitting(true)
    const { error: saveError } = await savePolicyStance(answeredQuestions)
    if (saveError) {
      setError(saveError)
    } else {
      setSuccess('政策を保存しました。')
    }
    setIsSubmitting(false)
  }

  const setQuestionAnswer = (question: string, answer: string) => {
    setQuestionAnswers((prev) =>
      prev.map((item) => (item.question === question ? { ...item, answer } : item))
    )
  }

  const setQuestionNote = (question: string, note: string) => {
    setQuestionAnswers((prev) =>
      prev.map((item) => (item.question === question ? { ...item, note } : item))
    )
  }

  const setQuestionImportance = (question: string, importance: PolicyImportance | '') => {
    setQuestionAnswers((prev) =>
      prev.map((item) => (item.question === question ? { ...item, importance } : item))
    )
  }

  const setQuestionEvidenceUrl = (question: string, evidence_url: string) => {
    setQuestionAnswers((prev) =>
      prev.map((item) => (item.question === question ? { ...item, evidence_url } : item))
    )
  }

  const total = policyQuestions.length
  const answered = useMemo(
    () => questionAnswers.filter((a) => a.answer.trim() !== '').length,
    [questionAnswers]
  )
  const progress = Math.round((answered / total) * 100)
  const allAnswered = answered === total

  if (isLoading) {
    return <LoadingIndicator />
  }

  return (
    <div className='min-h-screen bg-white'>
      <MainHero
        title='政策スタンス'
        description={
          <>
            各争点へのあなたの立場を登録してください。<br />
            ここで入力した内容が、有権者の「政策で選ぶ」診断の判定に使われます。
          </>
        }
      />

      <section className='w-full max-w-6xl mx-auto px-4 md:px-8 py-12'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Progress Bar */}
          <div className='sticky top-20 z-10 rounded border border-gray-200 bg-white/95 p-4 backdrop-blur'>
            <div className='mb-2 flex items-center justify-between text-sm'>
              <span className='font-medium text-gray-700'>
                回答済み {answered} / {total} 件
              </span>
              <span className='font-semibold text-green-600'>{progress}%</span>
            </div>
            <div className='h-2 w-full overflow-hidden rounded-full bg-gray-100'>
              <div
                className='h-full rounded-full bg-green-600 transition-all duration-300'
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Policy Questions */}
          <div className='overflow-hidden rounded-lg border border-gray-200 bg-white'>
            <div className='flex items-center gap-2 bg-green-600 px-4 py-3 text-white'>
              <MdPolicy className='h-5 w-5' />
              <h2 className='text-base font-bold'>政策</h2>
            </div>
            <div className='flex flex-col gap-2 p-6'>
              {policyQuestions.map((q, index) => {
                const current = questionAnswers.find((a) => a.question === q.question)
                const isAnswered = !!current?.answer
                return (
                  <div key={q.id} className='rounded-sm border border-border overflow-hidden'>
                    <div className='bg-muted p-3 border-b border-border'>
                      <div className='flex items-center gap-3'>
                        <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold bg-green-600 text-white'>
                          {isAnswered ? <FaCheck className='h-3.5 w-3.5' /> : index + 1}
                        </span>
                        <p className='font-bold text-sm leading-relaxed'>{q.question}</p>
                      </div>
                    </div>
                    <div className='px-4 py-3'>
                      <RadioGroup
                        value={current?.answer ?? ''}
                        onValueChange={(value) => setQuestionAnswer(q.question, value)}
                        className='space-y-2'
                      >
                        {q.options.map((option) => (
                          <div key={option.value} className='flex items-center gap-3'>
                            <RadioGroupItem value={option.value} id={`q${q.id}-${option.value}`} />
                            <Label htmlFor={`q${q.id}-${option.value}`}
                              className='text-sm font-normal cursor-pointer leading-relaxed'
                            >
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>

                      {current?.answer && (
                        <div className='mt-4 flex flex-col gap-4 rounded bg-muted/50 p-3'>
                          <div className='flex flex-col gap-2'>
                            <Label className='text-sm font-medium text-gray-800'>重要度（任意）</Label>
                            <ToggleGroup
                              type='single'
                              value={current.importance ?? ''}
                              onValueChange={(value) =>
                                setQuestionImportance(q.question, value as PolicyImportance | '')
                              }
                              className='justify-start gap-2'
                            >
                              {importanceOptions.map((imp) => (
                                <ToggleGroupItem
                                  key={imp.value}
                                  value={imp.value}
                                  variant='outline'
                                  size='sm'
                                  className='px-3 data-[state=on]:bg-green-600 data-[state=on]:text-white hover:bg-green-700 hover:text-white transition-colors duration-300 rounded-full'
                                >
                                  {imp.label}
                                </ToggleGroupItem>
                              ))}
                            </ToggleGroup>
                          </div>

                          <div className='flex flex-col gap-2'>
                            <Label htmlFor={`q${q.id}-evidence`} className='text-sm font-medium text-gray-800'>根拠URL（任意）</Label>
                            <Input
                              id={`q${q.id}-evidence`}
                              type='url'
                              inputMode='url'
                              value={current.evidence_url ?? ''}
                              placeholder='https://...'
                              className='rounded'
                              onChange={(e) => setQuestionEvidenceUrl(q.question, e.target.value)}
                            />
                          </div>

                          <div className='flex flex-col gap-2'>
                            <Label htmlFor={`q${q.id}-note`}
                              className='text-sm font-medium text-gray-800'
                            >
                              有権者に伝えたい補足（任意）
                            </Label>
                            <Textarea
                              id={`q${q.id}-note`}
                              rows={2}
                              value={current.note ?? ''}
                              placeholder={q.placeholder}
                              className='resize-none rounded bg-background'
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setQuestionNote(q.question, e.target.value)}
                            />
                          </div>
                        </div>
                      )}
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
              disabled={isSubmitting || !allAnswered}
              className='w-full max-w-64 mt-4 mx-auto h-auto py-3 text-base rounded-full bg-m-blue hover:bg-m-hover-blue transform transition-all duration-300'
            >
              {isSubmitting ? '保存中...' : '政策を保存'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default PolicyStancePage