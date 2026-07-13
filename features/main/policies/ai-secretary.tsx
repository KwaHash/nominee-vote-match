'use client'

import { useState } from 'react'
import { FaCheck, FaRegCopy, FaSpinner, FaWandMagicSparkles } from 'react-icons/fa6'
import { MdOutlineSmartToy } from 'react-icons/md'
import MainHero from '@/components/main-hero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { aiTools } from '@/constants/ai-secretary.c'
import { type AiTool, type AiToolKey } from '@/types/ai-secretary.d'

const buildSystemPrompt = (tool: AiTool) =>
  `あなたは、日本の政治家・候補者を長年支えてきた、経験豊かな政策秘書です。
これから、ご指定のテーマにもとづいて「${tool.label}」の文章を作成します。

【文章の条件】
・日本語を母語とする書き手による、自然で流暢な文章にしてください。
・丁寧語を基調としながら、読み手の心に響く、魅力的で説得力のある表現を心がけてください。
・AIが書いたと分かるような、機械的・紋切り型・当たり障りのない言い回しは避けてください。
・具体的で、体温の感じられる、人間らしい言葉を選んでください。
・事実に反する断定や過度な誇張は避け、有権者の信頼を損なわないようにしてください。
・完成した本文のみを出力し、前置きや解説、注釈は書かないでください。

【今回作成する文章】
${tool.guide}`

const AISecretaryPage = () => {
  const [tool, setTool] = useState<AiToolKey>('question')
  const [topic, setTopic] = useState('')
  const [output, setOutput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const current = aiTools.find((t) => t.key === tool) ?? aiTools[0]

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
            { role: 'system', content: buildSystemPrompt(current) },
            { role: 'user', content: `テーマ・キーワード：「${theme}」` },
          ],
        }),
      })

      if (!response.ok || !response.body) {
        throw new Error('文章の生成に失敗しました。')
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
            // Ignore partial/non-JSON lines.
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
      setError(err instanceof Error ? err.message : '文章の生成に失敗しました。')
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
        title='AI政策秘書'
        description={
          <>
            議会質問案・公約・SNS投稿・想定問答などの作成を、AIがお手伝いします。<br />
            テーマを入力するだけで、そのまま使える文章のたたき台をご用意します。
          </>
        }
      />

      <section className='w-full max-w-4xl mx-auto px-4 md:px-8 py-12'>
        <div className='space-y-6'>
          {/* Tool selector */}
          <div className='flex flex-col gap-2'>
            <Label className='text-sm font-medium text-gray-800'>作成する文章を選択</Label>
            <ToggleGroup
              type='single'
              value={tool}
              onValueChange={(value) => {
                if (!value) return
                setTool(value as AiToolKey)
                setOutput('')
                setError('')
              }}
              className='grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6'
            >
              {aiTools.map((t) => {
                const Icon = t.icon
                return (
                  <ToggleGroupItem
                    key={t.key}
                    value={t.key}
                    variant='outline'
                    className='flex h-auto flex-col items-center gap-1.5 rounded-lg px-2 py-3 data-[state=on]:border-green-600 data-[state=on]:bg-green-50 data-[state=on]:text-green-700'
                  >
                    <Icon className='h-6 w-6' />
                    <span className='text-xs font-medium'>{t.label}</span>
                  </ToggleGroupItem>
                )
              })}
            </ToggleGroup>
          </div>

          {/* Input */}
          <div className='overflow-hidden rounded-lg border border-gray-200 bg-white'>
            <div className='flex items-center gap-2 bg-green-600 px-4 py-3 text-white'>
              <MdOutlineSmartToy className='h-5 w-5' />
              <h2 className='text-base font-bold'>{current.label}を作成</h2>
            </div>
            <div className='flex flex-col gap-2 p-6'>
              <Label htmlFor='ai-topic' className='text-sm font-medium text-gray-800'>
                テーマ・キーワード
              </Label>
              <div className='flex flex-col gap-2 sm:flex-row'>
                <Input
                  id='ai-topic'
                  value={topic}
                  placeholder={current.placeholder}
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
          </div>

          {error && (
            <p className='bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700'>{error}</p>
          )}

          {/* Output */}
          {(isGenerating || output) && (
            <div className='overflow-hidden rounded-lg border border-gray-200 bg-white'>
              <div className='flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3'>
                <h2 className='text-sm font-bold text-gray-900'>生成結果</h2>
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
              <div className='p-5'>
                {output ? (
                  <p className='whitespace-pre-wrap text-sm leading-relaxed text-gray-800'>{output}</p>
                ) : (
                  <p className='flex items-center gap-2 text-sm text-gray-500'>
                    <FaSpinner className='h-4 w-4 animate-spin' />
                    文章を生成しています...
                  </p>
                )}
              </div>
            </div>
          )}

          <p className='text-center text-xs text-gray-400'>
            ※ 生成された文章はたたき台です。内容をご確認のうえ、ご自身の言葉に調整してご利用ください。
          </p>
        </div>
      </section>
    </div>
  )
}

export default AISecretaryPage
