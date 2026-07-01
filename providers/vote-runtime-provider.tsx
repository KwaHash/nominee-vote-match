'use client'

import  { type ReactNode } from 'react'
import { AssistantRuntimeProvider, Suggestions, useAui, useLocalRuntime, type ChatModelAdapter, type ChatModelRunResult } from '@assistant-ui/react'

function toApiMessage(message: { role: string; content: unknown }) {
  const content = message.content
  return {
    role: message.role,
    content: typeof content === 'string' ? content : Array.isArray(content) ? content.map((part: { text?: string }) => part.text ?? '').join('\n') : '',
  }
}

const VoteRuntimeModelAdapter: ChatModelAdapter = {
  async *run({ messages, abortSignal }) {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages.map(toApiMessage),
      }),
      signal: abortSignal,
    })

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string }
      throw new Error(err.error ?? `Chat request failed (${res.status})`)
    }

    const reader = res.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue
        try {
          const payload = JSON.parse(trimmed) as { content: ChatModelRunResult['content'] }
          if (payload.content) {
            yield { content: payload.content } as ChatModelRunResult
          }
        } catch {
          // skip malformed lines
        }
      }
    }
    if (buffer.trim()) {
      try {
        const payload = JSON.parse(buffer.trim()) as { content: ChatModelRunResult['content'] }
        if (payload.content) yield { content: payload.content } as ChatModelRunResult
      } catch {
        // skip
      }
    }
  },
}

export function VoteRuntimeProvider({ children }: Readonly<{ children: ReactNode }>) {
  const runtime = useLocalRuntime(VoteRuntimeModelAdapter)

  const aui = useAui({
    suggestions: Suggestions([
      {
        title: '投票方法',
        label: '投票の流れ',
        prompt: '日本の選挙での投票方法と当日の流れを教えてください。',
      },
      {
        title: '期日前投票',
        label: '期日前投票とは',
        prompt: '期日前投票はどのような仕組みで、どこでできますか？',
      },
      {
        title: '選挙制度',
        label: '日本の選挙の仕組み',
        prompt: '日本の選挙制度の基本的な仕組みについて教えてください。',
      },
      {
        title: '投票率',
        label: '投票率を上げるには',
        prompt: '日本で投票率を上げるためにはどのような取り組みが有効ですか？',
      },
    ]),
  })

  return (
    <AssistantRuntimeProvider aui={aui} runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  )
}
