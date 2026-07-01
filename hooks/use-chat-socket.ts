'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import  { type ChatMessage, type ChatRole, type ServerMessage } from '@/types/chat'

const chatWsUrl = process.env.NEXT_PUBLIC_CHAT_WS_URL!

function getAccessToken() {
  const tokenData = localStorage.getItem('jwt-token')
  if (!tokenData) {
    return null
  }

  const { access_token } = JSON.parse(tokenData) as { access_token?: string }
  return access_token || null
}

export function useChatSocket(role: ChatRole) {
  const socketRef = useRef<WebSocket | null>(null)
  const listenersRef = useRef(new Set<(message: ChatMessage) => void>())
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const accessToken = getAccessToken()
    if (!accessToken) {
      setTimeout(() => {
        setError('認証情報が見つかりません。')
      }, 0)
      return
    }

    const socket = new WebSocket(chatWsUrl)
    socketRef.current = socket

    const handleMessage = (event: MessageEvent<string>) => {
      const payload = JSON.parse(event.data) as ServerMessage

      if (payload.type === 'auth_ok') {
        setIsReady(true)
        setError(null)
        return
      }

      if (payload.type === 'error') {
        setError(payload.message)
        return
      }

      if (payload.type === 'message') {
        listenersRef.current.forEach((listener) => {
          listener(payload.message)
        })
      }
    }

    socket.addEventListener('open', () => {
      socket.send(JSON.stringify({ type: 'auth', accessToken, role }))
    })
    socket.addEventListener('message', handleMessage)
    socket.addEventListener('close', () => {
      setIsReady(false)
    })

    return () => {
      socket.removeEventListener('message', handleMessage)
      socket.close()
      socketRef.current = null
      setIsReady(false)
    }
  }, [role])

  const joinConversation = useCallback((conversationId: number) => {
    const socket = socketRef.current
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return
    }

    socket.send(JSON.stringify({ type: 'join', conversationId }))
  }, [])

  const sendMessage = useCallback((conversationId: number, content: string) => {
    const socket = socketRef.current
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return
    }

    socket.send(JSON.stringify({ type: 'message', conversationId, content }))
  }, [])

  const subscribe = useCallback((handler: (message: ChatMessage) => void) => {
    listenersRef.current.add(handler)
    return () => {
      listenersRef.current.delete(handler)
    }
  }, [])

  return {
    isReady,
    error,
    joinConversation,
    sendMessage,
    subscribe,
  }
}
