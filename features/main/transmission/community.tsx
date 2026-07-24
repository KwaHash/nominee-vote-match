'use client'

import { useState } from 'react'
import { FaCheck, FaRegBell, FaRegCopy, FaRegLightbulb, FaSpinner, FaWandMagicSparkles } from 'react-icons/fa6'
import { MdOutlineSmartToy } from 'react-icons/md'
import MainHero from '@/components/main-hero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  communityChannels, communityIdeas, communityReminders, communitySegments,
} from '@/constants/community.c'
import { cn } from '@/lib/utils'
import { type CommunityChannel, type CommunityChannelMeta } from '@/types/community.d'

const buildSystemPrompt = (channel: CommunityChannelMeta, segment: string) =>
  `あなたは、日本の政治家・候補者を支える、経験豊かなコミュニティ運営の担当者です。
  指定されたテーマにもとづいて、${channel.value}向けのコミュニティ投稿文を作成します。
  ${ segment !== '全員' ? `\n配信対象は「${segment}」の方々です。その関心や状況に寄り添った内容にしてください。` : ''}

  【文章の条件】
  ・日本語を母語とする書き手による、自然で流暢な文章にしてください。
  ・丁寧でありながら、読み手との距離が縮まる、親しみやすく魅力的な表現を心がけてください。
  ・AIが書いたと分かるような、機械的・紋切り型・当たり障りのない言い回しは避けてください。
  ・具体的で、体温の感じられる、人間らしい言葉を選んでください。
  ・完成した投稿本文のみを出力し、前置きや解説、注釈は書かないでください。

  【投稿するチャネル】
  ${channel.guide}`

const CommunityPage = () => {
  const [channel, setChannel] = useState<CommunityChannel>('LINE')
  const [segment, setSegment] = useState<string>('全員')
  const [topic, setTopic] = useState('')
  const [output, setOutput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const currentChannel = communityChannels.find((c) => c.value === channel) ?? communityChannels[0]

  const generate = async () => {
    const theme = topic.trim()
    if (!theme || isGenerating) return

    setError('')
    setOutput('')
    setCopied(false)
    setIsGenerating(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: buildSystemPrompt(currentChannel, segment) },
            { role: 'user', content: `テーマ：「${theme}」` },
          ],
        }),
      })

      if (!response.ok || !response.body) {
        throw new Error('投稿案の生成に失敗しました。')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      const flushLines = (final = false) => {
        const parts = buffer.split('\n')
        buffer = final ? '' : parts.pop() ?? ''
        for (const line of parts) {
          const trimmed = line.trim()
          if (!trimmed) continue
          try {
            const parsed = JSON.parse(trimmed) as { content?: { type: string; text?: string }[] }
            const textPart = parsed.content?.find((c) => c.type === 'text')
            if (typeof textPart?.text === 'string') setOutput(textPart.text)
          } catch {
            
          }
        }
      }

      let result = await reader.read()
      while (!result.done) {
        buffer += decoder.decode(result.value, { stream: true })
        flushLines()
        result = await reader.read()
      }
      buffer += decoder.decode()
      flushLines(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '投稿案の生成に失敗しました。')
    } finally {
      setIsGenerating(false)
    }
  }

  const copy = async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
    } catch {
      setError('コピーに失敗しました。')
    }
  }

  return (
    <div className='min-h-screen bg-white'>
      <MainHero
        title='コミュニティ'
        description={
          <>
            投稿案のAI生成・セグメント配信・リマインダーで、コミュニティ運営を仕組み化します。<br />
            LINE・X・Facebook の投稿を、テーマから手早く形にできます。
          </>
        }
      />

      <section className='w-full max-w-4xl mx-auto px-4 md:px-8 py-12'>
        <div className='space-y-6'>
          {/* Today's ideas */}
          <div className='overflow-hidden rounded-lg border border-gray-200 bg-white'>
            <div className='flex items-center gap-2 bg-green-600 px-4 py-3 text-white'>
              <FaRegLightbulb className='h-5 w-5' />
              <h2 className='text-base font-bold'>今日の投稿候補</h2>
            </div>
            <div className='flex flex-wrap gap-2 p-6'>
              {communityIdeas.map((idea) => (
                <Button
                  key={idea}
                  type='button'
                  variant='outline'
                  onClick={() => setTopic(idea)}
                  className={cn('w-auto h-auto gap-1.5 rounded-full',
                    topic === idea && 'border-green-600 bg-green-50 text-green-700 hover:text-green-700'
                  )}
                >
                  <FaRegLightbulb className='h-3.5 w-3.5' />
                  <span className='text-sm'>{idea}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Post draft AI */}
          <div className='overflow-hidden rounded-lg border border-gray-200 bg-white'>
            <div className='flex items-center gap-2 bg-green-600 px-4 py-3 text-white'>
              <MdOutlineSmartToy className='h-5 w-5' />
              <h2 className='text-base font-bold'>投稿案AI</h2>
            </div>
            <div className='flex flex-col gap-6 p-6'>
              {/* Channel */}
              <div className='flex flex-col gap-2'>
                <Label className='text-sm font-medium text-gray-800'>チャネル</Label>
                <ToggleGroup
                  type='single'
                  value={channel}
                  onValueChange={(value) => value && setChannel(value as CommunityChannel)}
                  className='flex-wrap justify-start gap-2'
                >
                  {communityChannels.map((c) => {
                    const Icon = c.icon
                    return (
                      <ToggleGroupItem
                        key={c.value}
                        value={c.value}
                        variant='outline'
                        className='gap-1.5 rounded data-[state=on]:border-green-600 data-[state=on]:bg-green-50 data-[state=on]:text-green-700'
                      >
                        <Icon className='h-4 w-4' />
                        {c.value}
                      </ToggleGroupItem>
                    )
                  })}
                </ToggleGroup>
              </div>

              {/* Segment */}
              <div className='flex flex-col gap-2'>
                <Label className='text-sm font-medium text-gray-800'>配信セグメント</Label>
                <ToggleGroup
                  type='single'
                  value={segment}
                  onValueChange={(value) => value && setSegment(value)}
                  className='flex-wrap justify-start gap-2'
                >
                  {communitySegments.map((s) => (
                    <ToggleGroupItem
                      key={s}
                      value={s}
                      variant='outline'
                      size='sm'
                      className='px-3 data-[state=on]:bg-green-600 data-[state=on]:text-white hover:bg-green-700 hover:text-white transition-colors duration-300 rounded-full'
                    >
                      {s}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              {/* Topic + generate */}
              <div className='flex flex-col gap-2'>
                <Label htmlFor='community-topic' className='text-sm font-medium text-gray-800'>テーマ</Label>
                <div className='flex flex-col gap-2 sm:flex-row'>
                  <Input
                    id='community-topic'
                    value={topic}
                    placeholder={`例: ${communityIdeas[0]}`}
                    className='rounded'
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        void generate()
                      }
                    }}
                  />
                  <Button
                    type='button'
                    onClick={() => void generate()}
                    disabled={isGenerating || !topic.trim()}
                    className='shrink-0 gap-1.5 rounded bg-m-blue hover:bg-m-hover-blue transition-all duration-300'
                  >
                    {isGenerating ? (
                      <><FaSpinner className='h-4 w-4 animate-spin' /> 生成中...</>
                    ) : (
                      <><FaWandMagicSparkles className='h-4 w-4' /> 生成する</>
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <p className='bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700'>{error}</p>
              )}

              {/* Output */}
              {(isGenerating || output) && (
                <div className='rounded border border-gray-200'>
                  <div className='flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-2'>
                    <span className='text-xs font-medium text-gray-500'>{channel} 投稿案</span>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => void copy()}
                      disabled={!output}
                      className='gap-1.5 rounded'
                    >
                      {copied ? (
                        <><FaCheck className='h-3.5 w-3.5 text-green-600' /> コピーしました</>
                      ) : (
                        <><FaRegCopy className='h-3.5 w-3.5' /> コピー</>
                      )}
                    </Button>
                  </div>
                  <div className='p-4'>
                    {output ? (
                      <p className='whitespace-pre-wrap text-sm leading-relaxed text-gray-800'>{output}</p>
                    ) : (
                      <p className='flex items-center gap-2 text-sm text-gray-500'>
                        <FaSpinner className='h-4 w-4 animate-spin' />
                        投稿案を生成しています...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {output && (
                <p className='text-xs text-gray-400'>
                  ※ 本番では、投稿前の炎上リスクチェックと承認フロー（候補者ご本人の承認）を通します。
                </p>
              )}
            </div>
          </div>

          {/* Reminders */}
          <div className='overflow-hidden rounded-lg border border-gray-200 bg-white'>
            <div className='flex items-center gap-2 bg-green-600 px-4 py-3 text-white'>
              <FaRegBell className='h-5 w-5' />
              <h2 className='text-base font-bold'>リマインダー</h2>
            </div>
            <div className='flex flex-col gap-2 p-6'>
              {communityReminders.map((r) => (
                <div key={r.what} className='flex items-center gap-3 rounded border border-gray-100 px-3 py-2.5'>
                  <span className='shrink-0 rounded bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700'>
                    {r.when}
                  </span>
                  <span className='text-sm text-gray-700'>{r.what}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default CommunityPage
