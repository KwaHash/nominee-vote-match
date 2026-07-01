import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: Request) {
  try {
    const { messages } = await request.json() as { messages: Array<{ role: string; content: string }> }
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages as OpenAI.ChatCompletionMessageParam[],
      stream: true,
    })

    const encoder = new TextEncoder()
    let content = ''
    const toolCalls: Array<{ id?: string; type: string; function: { name: string; arguments: string } }> = []

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta

            if (delta?.content) {
              content += delta.content
            }

            if (delta?.tool_calls) {
              for (const toolCall of delta.tool_calls) {
                if (!toolCalls[toolCall.index]) {
                  toolCalls[toolCall.index] = {
                    id: toolCall.id,
                    type: 'function',
                    function: { name: '', arguments: '' },
                  }
                }
                if (toolCall.function?.name) {
                  toolCalls[toolCall.index].function.name = toolCall.function.name
                }
                if (toolCall.function?.arguments) {
                  toolCalls[toolCall.index].function.arguments += toolCall.function.arguments
                }
              }
            }

            const payload = {
              content: [
                ...(content ? [{ type: 'text' as const, text: content }] : []),
                ...toolCalls.map((tc) => ({
                  type: 'tool-call' as const,
                  toolCallId: tc.id ?? '',
                  toolName: tc.function.name,
                  args: ((): Record<string, unknown> => {
                    try {
                      return JSON.parse(tc.function.arguments || '{}') as Record<string, unknown>
                    } catch {
                      return {}
                    }
                  })(),
                  argsText: tc.function.arguments || '{}',
                })),
              ],
            }
            controller.enqueue(encoder.encode(JSON.stringify(payload) + '\n'))
          }
        } catch (err) {
          console.error('Chat stream error:', err)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-cache' },
    })
  } catch (err) {
    console.error('Chat API error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Chat request failed' },
      { status: 500 }
    )
  }
}
