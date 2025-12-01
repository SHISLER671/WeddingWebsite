// Chat Context for Wedding Website Chatbot
// Manages chat state and provides chat functionality to components

"use client"

import { createContext, useContext, useReducer, useEffect, useRef, type ReactNode } from "react"
import type { OpenRouterMessage } from "@/lib/openrouter"
import { getChatbotConfig, ERROR_MESSAGES } from "@/lib/chatbot-config"
import { handleRSVPStatusRequest } from "@/lib/rsvp-lookup"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isLoading?: boolean
}

export interface ChatState {
  isOpen: boolean
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  unreadCount: number
}

export interface ChatContextType {
  state: ChatState
  actions: {
    toggleChat: () => void
    openChat: () => void
    closeChat: () => void
    sendMessage: (message: string) => Promise<void>
    clearMessages: () => void
    markAsRead: () => void
    resetError: () => void
  }
}

type ChatAction =
  | { type: "TOGGLE_CHAT" }
  | { type: "OPEN_CHAT" }
  | { type: "CLOSE_CHAT" }
  | { type: "SEND_MESSAGE_START"; payload: string }
  | { type: "SEND_MESSAGE_SUCCESS"; payload: { id: string; content: string } }
  | { type: "SEND_MESSAGE_ERROR"; payload: string }
  | { type: "CLEAR_MESSAGES" }
  | { type: "MARK_AS_READ" }
  | { type: "RESET_ERROR" }
  | { type: "SET_LOADING"; payload: boolean }

const initialState: ChatState = {
  isOpen: false,
  messages: [],
  isLoading: false,
  error: null,
  unreadCount: 0,
}

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "TOGGLE_CHAT":
      return { ...state, isOpen: !state.isOpen }

    case "OPEN_CHAT":
      return { ...state, isOpen: true, unreadCount: 0 }

    case "CLOSE_CHAT":
      return { ...state, isOpen: false }

    case "SEND_MESSAGE_START":
      const newMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: action.payload,
        timestamp: new Date(),
      }

      const loadingMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isLoading: true,
      }

      return {
        ...state,
        messages: [...state.messages, newMessage, loadingMessage],
        isLoading: true,
        error: null,
      }

    case "SEND_MESSAGE_SUCCESS":
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id.includes("assistant") && msg.isLoading
            ? { ...msg, content: action.payload.content, isLoading: false }
            : msg,
        ),
        isLoading: false,
        unreadCount: state.isOpen ? 0 : state.unreadCount + 1,
      }

    case "SEND_MESSAGE_ERROR":
      return {
        ...state,
        messages: state.messages.filter((msg) => !msg.isLoading),
        isLoading: false,
        error: action.payload,
      }

    case "CLEAR_MESSAGES":
      return { ...state, messages: [], error: null }

    case "MARK_AS_READ":
      return { ...state, unreadCount: 0 }

    case "RESET_ERROR":
      return { ...state, error: null }

    case "SET_LOADING":
      return { ...state, isLoading: action.payload }

    default:
      return state
  }
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

interface ChatProviderProps {
  children: ReactNode
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, initialState)
  const lastMessageTimeRef = useRef<number>(0)
  const MESSAGE_RATE_LIMIT_MS = 500 // Minimum 500ms between messages (reduced from 1000ms)

  // Generate a unique ID for messages
  const generateMessageId = () => `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Chat actions
  const actions = {
    toggleChat: () => dispatch({ type: "TOGGLE_CHAT" }),
    openChat: () => dispatch({ type: "OPEN_CHAT" }),
    closeChat: () => dispatch({ type: "CLOSE_CHAT" }),

    sendMessage: async (message: string) => {
      if (!message.trim()) return

      // Safety check: Rate limiting - prevent rapid-fire requests
      const now = Date.now()
      const timeSinceLastMessage = now - lastMessageTimeRef.current
      if (timeSinceLastMessage < MESSAGE_RATE_LIMIT_MS) {
        const waitTime = Math.ceil((MESSAGE_RATE_LIMIT_MS - timeSinceLastMessage) / 1000)
        dispatch({
          type: "SEND_MESSAGE_ERROR",
          payload: `Please wait ${waitTime} second${waitTime > 1 ? 's' : ''} before sending another message.`,
        })
        return
      }
      lastMessageTimeRef.current = now

      // Safety check: Limit message length
      const MAX_MESSAGE_LENGTH = 2000
      if (message.length > MAX_MESSAGE_LENGTH) {
        dispatch({
          type: "SEND_MESSAGE_ERROR",
          payload: `Message is too long. Please keep messages under ${MAX_MESSAGE_LENGTH} characters.`,
        })
        return
      }

      // Safety check: Limit conversation length
      const MAX_CONVERSATION_MESSAGES = 50
      if (state.messages.length >= MAX_CONVERSATION_MESSAGES) {
        dispatch({
          type: "SEND_MESSAGE_ERROR",
          payload: "Conversation limit reached. Please clear the chat and start a new conversation.",
        })
        return
      }

      // Warning when approaching limit
      if (state.messages.length >= MAX_CONVERSATION_MESSAGES - 5) {
        console.warn(`[ChatContext] ⚠️ Approaching conversation limit: ${state.messages.length}/${MAX_CONVERSATION_MESSAGES}`)
      }

      console.log("💬 [ChatContext] === New Message ===")
      console.log("💬 [ChatContext] Message:", message)
      console.log("💬 [ChatContext] Current messages count:", state.messages.length)

      try {
        dispatch({ type: "SEND_MESSAGE_START", payload: message })

        const config = getChatbotConfig()
        const lowerMessage = message.toLowerCase()

        console.log("💬 [ChatContext] Chatbot config loaded:", config.name)

        // Check if this is an RSVP status request
        const isRSVPRequest =
          lowerMessage.includes("rsvp") ||
          lowerMessage.includes("check") ||
          lowerMessage.includes("status") ||
          lowerMessage.includes("confirm") ||
          lowerMessage.includes("registered") ||
          lowerMessage.includes("signed up")

        if (isRSVPRequest) {
          console.log("💬 [ChatContext] 🎯 Detected RSVP request, attempting database lookup...")
          try {
            // Handle RSVP status check
            const rsvpResponse = await handleRSVPStatusRequest(message)
            console.log("💬 [ChatContext] ✅ RSVP lookup successful")

            dispatch({
              type: "SEND_MESSAGE_SUCCESS",
              payload: {
                id: generateMessageId(),
                content: rsvpResponse,
              },
            })
            return
          } catch (rsvpError) {
            console.error("💬 [ChatContext] ❌ RSVP lookup failed:", rsvpError)
            console.log("💬 [ChatContext] Falling back to AI response...")
          }
        }

        console.log("💬 [ChatContext] 🤖 Starting AI response generation via API...")

        // Prepare conversation history
        const openRouterMessages: OpenRouterMessage[] = [
          {
            role: "system",
            content: config.systemPrompt,
          },
          ...state.messages
            .filter((msg) => !msg.isLoading)
            .map((msg) => ({
              role: msg.role,
              content: msg.content,
            }))
            .slice(-15), // Keep last 15 messages for context (increased from 10, but still limited)
          {
            role: "user",
            content: message,
          },
        ]

        console.log("💬 [ChatContext] 📋 Prepared messages for API:", {
          totalMessages: openRouterMessages.length,
          historyMessages: openRouterMessages.length - 2,
        })

        // Send to server-side API route with retry logic for rate limits
        console.log("💬 [ChatContext] 🚀 Sending to /api/chat...")
        
        let response: Response | null = null
        let retries = 0
        const maxRetries = 2
        const retryDelay = 2000 // 2 seconds
        
        while (retries <= maxRetries) {
          try {
            response = await fetch("/api/chat", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                messages: openRouterMessages,
              }),
            })

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}))
              const errorMessage = errorData.error || `API request failed: ${response.status}`
              
              // If it's a rate limit error and we have retries left, wait and retry
              if ((response.status === 429 || errorMessage.toLowerCase().includes("rate limit")) && retries < maxRetries) {
                retries++
                console.log(`💬 [ChatContext] ⏳ Rate limit hit, retrying in ${retryDelay * retries}ms (attempt ${retries}/${maxRetries})...`)
                await new Promise(resolve => setTimeout(resolve, retryDelay * retries)) // Exponential backoff
                continue
              }
              
              console.error("💬 [ChatContext] ❌ API Error:", {
                status: response.status,
                statusText: response.statusText,
                error: errorData,
                errorMessage,
                retries,
              })
              throw new Error(errorMessage)
            }
            
            // Success - break out of retry loop
            break
          } catch (fetchError) {
            // If it's a network error and we have retries left, retry
            if (retries < maxRetries && (fetchError instanceof TypeError || (fetchError instanceof Error && fetchError.message.includes("fetch")))) {
              retries++
              console.log(`💬 [ChatContext] ⏳ Network error, retrying in ${retryDelay * retries}ms (attempt ${retries}/${maxRetries})...`)
              await new Promise(resolve => setTimeout(resolve, retryDelay * retries))
              continue
            }
            throw fetchError
          }
        }

        if (!response) {
          throw new Error("Failed to get response from API after retries")
        }

        const data = await response.json()
        console.log("💬 [ChatContext] ✅ API response received")

        const assistantMessage =
          data.message || "I apologize, but I'm having trouble responding right now. Please try again."

        console.log("💬 [ChatContext] 📝 Assistant message length:", assistantMessage.length)

        const messageId = generateMessageId()

        dispatch({
          type: "SEND_MESSAGE_SUCCESS",
          payload: {
            id: messageId,
            content: assistantMessage,
          },
        })

        console.log("💬 [ChatContext] ✅ Message successfully dispatched to UI")
      } catch (error) {
        console.error("💬 [ChatContext] ❌ Message processing failed:")
        console.error("💬 [ChatContext] Error:", error)

        let errorMessage = ERROR_MESSAGES.API_ERROR

        if (error instanceof Error) {
          if (error.message.includes("network") || error.message.includes("fetch")) {
            errorMessage = ERROR_MESSAGES.NETWORK_ERROR
          } else if (error.message.includes("rate limit") || error.message.includes("429")) {
            errorMessage = ERROR_MESSAGES.RATE_LIMIT
          } else if (error.message.includes("timeout")) {
            errorMessage = ERROR_MESSAGES.TIMEOUT
          } else if (error.message.includes("API key") || error.message.includes("Unauthorized")) {
            errorMessage = "API configuration error. Please check the service configuration."
          }
        }

        console.log("💬 [ChatContext] 📢 Dispatching error to UI:", errorMessage)
        dispatch({ type: "SEND_MESSAGE_ERROR", payload: errorMessage })
      }
    },

    clearMessages: () => dispatch({ type: "CLEAR_MESSAGES" }),
    markAsRead: () => dispatch({ type: "MARK_AS_READ" }),
    resetError: () => dispatch({ type: "RESET_ERROR" }),
  }

  // Add welcome message when chat is first opened
  useEffect(() => {
    if (state.isOpen && state.messages.length === 0) {
      const config = getChatbotConfig()
      const welcomeMessage: ChatMessage = {
        id: generateMessageId(),
        role: "assistant",
        content: config.welcomeMessage,
        timestamp: new Date(),
      }

      // Small delay to make it feel natural
      const timer = setTimeout(() => {
        dispatch({
          type: "SEND_MESSAGE_SUCCESS",
          payload: {
            id: welcomeMessage.id,
            content: welcomeMessage.content,
          },
        })
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [state.isOpen, state.messages.length])

  // Auto-dismiss errors after 5 seconds
  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => {
        actions.resetError()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [state.error])

  const contextValue: ChatContextType = {
    state,
    actions,
  }

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
}

export function useChat(): ChatContextType {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}

// Custom hooks for specific chat functionality
export function useChatState() {
  const { state } = useChat()
  return state
}

export function useChatActions() {
  const { actions } = useChat()
  return actions
}

export function useChatMessage(id: string) {
  const { state } = useChat()
  return state.messages.find((msg) => msg.id === id)
}

// Hook for managing quick actions
export function useQuickActions() {
  const { actions } = useChat()
  const config = getChatbotConfig()

  const handleQuickAction = (action: string) => {
    actions.sendMessage(action)
  }

  return {
    quickActions: config.quickActions,
    handleQuickAction,
  }
}

// Hook for managing suggested questions
export function useSuggestedQuestions() {
  const { actions } = useChat()
  const config = getChatbotConfig()

  const handleSuggestedQuestion = (question: string) => {
    actions.sendMessage(question)
  }

  return {
    suggestedQuestions: config.suggestedQuestions,
    handleSuggestedQuestion,
  }
}
