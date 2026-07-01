export type ChatRole = 'assistant' | 'candidate'

export interface ChatConversation {
  id: number
  assistantId: number
  candidateId: number
  assistantEmail: string
  candidateEmail: string
  assistantName: string
  candidateName: string
  lastMessage: string | null
  lastMessageAt: string | null
  createdAt: string
}

export interface ChatMessage {
  id: number
  conversationId: number
  senderRole: ChatRole
  senderId: number
  content: string
  createdAt: string
}

export type ServerMessage =
  | { type: 'auth_ok'; userId: number; role: ChatRole }
  | { type: 'error'; message: string }
  | { type: 'joined'; conversationId: number }
  | { type: 'message'; message: ChatMessage }
