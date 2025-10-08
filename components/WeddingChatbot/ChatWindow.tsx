// Chat Window Component for Wedding Website
// Main chat interface with message history, input, and controls

"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Heart, Send, X, Minimize2, Maximize2, Trash2 } from "lucide-react"
import { useChat } from "@/contexts/ChatContext"
import { getChatbotConfig } from "@/lib/chatbot-config"
import ChatMessageComponent from "./ChatMessage"
import { ErrorMessage, SystemMessage } from "./ChatMessage"

interface ChatWindowProps {
  className?: string
}

export default function ChatWindow({ className = "" }: ChatWindowProps) {
  const { state, actions } = useChat()
  const [inputMessage, setInputMessage] = useState("")
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const config = getChatbotConfig()

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [state.messages])

  // Focus input when chat opens
  useEffect(() => {
    if (state.isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [state.isOpen, isMinimized])

  // Refocus input when clicking in the chat window (but not on interactive elements)
  const handleChatWindowClick = (e: React.MouseEvent) => {
    // Only refocus if clicking on non-interactive elements
    const target = e.target as HTMLElement
    const isInteractiveElement = target.closest('button, input, textarea, a, [role="button"]')

    if (!isInteractiveElement && !isMinimized) {
      inputRef.current?.focus()
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || state.isLoading) return

    const message = inputMessage.trim()
    setInputMessage("")

    try {
      await actions.sendMessage(message)
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleClearChat = () => {
    actions.clearMessages()
    setInputMessage("")
  }

  const getWindowClasses = () => {
    const baseClasses = `
      fixed z-50 bg-white rounded-2xl shadow-2xl border-2
      transition-all duration-300 ease-in-out transform
      ${isMinimized ? "h-16" : "h-[80vh] md:h-[600px]"}
      ${state.isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}
      max-h-[90vh] w-[90vw] md:w-[400px] max-w-md
    `

    const positionClasses = {
      "bottom-right": "bottom-4 md:bottom-24 right-2 md:right-6",
      "bottom-left": "bottom-4 md:bottom-24 left-2 md:left-6",
      "top-right": "top-4 md:top-24 right-2 md:right-6",
      "top-left": "top-4 md:top-24 left-2 md:left-6",
    }[config.appearance.position]

    const borderClasses = `border-rose-gold/20`

    return `${baseClasses} ${positionClasses} ${borderClasses} ${className}`
  }

  const getHeaderClasses = () => {
    return `
      flex items-center justify-between p-5 border-b border-white/30
      rounded-t-2xl cursor-pointer relative z-20
      ${isMinimized ? "rounded-b-2xl" : ""}
      bg-gradient-to-br from-jewel-fuchsia via-jewel-burgundy to-jewel-crimson text-navy
      shadow-xl backdrop-blur-md
      hover:shadow-2xl transition-all duration-300
    `
  }

  const getBodyClasses = () => {
    return `
      flex flex-col h-[calc(100%-4rem)]
      ${isMinimized ? "hidden" : "flex"}
    `
  }

  const getMessagesContainerClasses = () => {
    return `
      flex-1 overflow-y-auto p-4 space-y-4 relative z-10
      bg-gradient-to-b from-white/20 to-soft-blush/10
    `
  }

  const getInputContainerClasses = () => {
    return `
      border-t border-rose-gold/20 p-4 bg-white/90 rounded-b-2xl relative z-10
    `
  }

  if (!state.isOpen) return null

  return (
    <div
      className={getWindowClasses()}
      style={{ width: isMinimized ? "300px" : "400px" }}
      onClick={handleChatWindowClick}
    >
      {/* Background Image */}
      {!isMinimized && (
        <div className="absolute inset-0 z-0">
          <Image src="/underleaf.jpg" alt="Chat background" fill className="object-cover opacity-20 rounded-2xl" />
        </div>
      )}

      {/* Header */}
      <div
        className={getHeaderClasses()}
        onClick={(e) => {
          // Only minimize/maximize when clicking on the header area, not on buttons
          const target = e.target as HTMLElement
          const isButton = target.closest("button")
          if (!isButton) {
            setIsMinimized(!isMinimized)
          }
        }}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/30 rounded-full backdrop-blur-md shadow-lg border border-white/40">
            <Heart className="w-6 h-6 text-white fill-white/20 drop-shadow-lg" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-xl text-navy drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)] tracking-tight leading-tight">
              {config.name}
            </h3>
            {!isMinimized && (
              <p className="text-sm text-navy/90 drop-shadow-[0_1px_2px_rgba(255,255,255,0.6)] mt-0.5 font-medium">
                {config.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isMinimized && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleClearChat()
              }}
              className="p-2.5 bg-white/90 hover:bg-white rounded-xl transition-all duration-200 
                         shadow-md hover:shadow-lg border border-white/50 group
                         hover:scale-110 active:scale-95"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4 text-jewel-burgundy group-hover:text-jewel-crimson transition-colors" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsMinimized(!isMinimized)
            }}
            className="p-2.5 bg-white/90 hover:bg-white rounded-xl transition-all duration-200 
                       shadow-md hover:shadow-lg border border-white/50 group
                       hover:scale-110 active:scale-95"
            title={isMinimized ? "Maximize" : "Minimize"}
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4 text-jewel-burgundy group-hover:text-jewel-crimson transition-colors" />
            ) : (
              <Minimize2 className="w-4 h-4 text-jewel-burgundy group-hover:text-jewel-crimson transition-colors" />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              actions.closeChat()
            }}
            className="p-2.5 bg-red-500 hover:bg-red-600 rounded-xl transition-all duration-200 
                       shadow-md hover:shadow-lg border border-red-400 group
                       hover:scale-110 active:scale-95"
            title="Close chat"
          >
            <X className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className={getBodyClasses()}>
        {/* Messages Container */}
        <div className={getMessagesContainerClasses()}>
          {state.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
              <Heart className="w-12 h-12 text-rose-gold/50" />
              <div className="text-center">
                <p className="font-medium text-gray-700">Welcome to the Wedding Assistant!</p>
                <p className="text-sm">How can I help you today?</p>
              </div>
            </div>
          ) : (
            state.messages.map((message, index) => (
              <ChatMessageComponent key={message.id} message={message} isLatest={index === state.messages.length - 1} />
            ))
          )}

          {/* Error Message */}
          {state.error && <ErrorMessage message={state.error} onRetry={actions.resetError} />}

          {/* Loading Indicator */}
          {state.isLoading && <SystemMessage content="Wedding assistant is thinking..." timestamp={new Date()} />}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Container */}
        <div className={getInputContainerClasses()}>
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => {
                // Ensure input stays focused when user clicks on it
                inputRef.current?.focus()
              }}
              placeholder="Ask about the wedding..."
              className="flex-1 resize-none rounded-lg border border-rose-gold/30 px-3 py-2 
                        focus:outline-none focus:ring-2 focus:ring-rose-gold/50 
                        focus:border-transparent text-sm"
              rows={1}
              disabled={state.isLoading}
              style={{ minHeight: "40px", maxHeight: "120px" }}
            />

            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || state.isLoading}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all duration-200
                flex items-center gap-2 text-sm
                ${
                  inputMessage.trim() && !state.isLoading
                    ? "bg-jewel-fuchsia text-warm-white hover:bg-jewel-crimson transform hover:scale-105"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }
              `}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Actions */}
          {config.quickActions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {config.quickActions.slice(0, 3).map((action, index) => (
                <button
                  key={index}
                  onClick={() => actions.sendMessage(action.action)}
                  disabled={state.isLoading}
                  className="text-xs px-3 py-1 rounded-full bg-jewel-emerald/20 text-jewel-emerald 
                           hover:bg-jewel-emerald hover:text-warm-white transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Mobile-optimized version
interface MobileChatWindowProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileChatWindow({ isOpen, onClose }: MobileChatWindowProps) {
  const { state, actions } = useChat()
  const [inputMessage, setInputMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const config = getChatbotConfig()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [state.messages])

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  // Refocus input when clicking in the mobile chat window (but not on interactive elements)
  const handleMobileChatWindowClick = (e: React.MouseEvent) => {
    // Only refocus if clicking on non-interactive elements
    const target = e.target as HTMLElement
    const isInteractiveElement = target.closest('button, input, textarea, a, [role="button"]')

    if (!isInteractiveElement) {
      inputRef.current?.focus()
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || state.isLoading) return

    const message = inputMessage.trim()
    setInputMessage("")

    try {
      await actions.sendMessage(message)
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
      <div
        className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl max-h-[80vh] flex flex-col"
        onClick={handleMobileChatWindowClick}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-jewel-fuchsia to-jewel-crimson text-navy rounded-t-3xl">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6" />
            <div>
              <h3 className="font-semibold text-lg text-navy drop-shadow-[0_1px_2px_rgba(255,255,255,0.6)]">
                {config.name}
              </h3>
              <p className="text-xs opacity-90 text-navy drop-shadow-[0_1px_2px_rgba(255,255,255,0.4)]">
                {config.description}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-soft-blush/20">
          {state.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
              <Heart className="w-12 h-12 text-rose-gold/50" />
              <div className="text-center">
                <p className="font-medium text-gray-700">Welcome to the Wedding Assistant!</p>
                <p className="text-sm">How can I help you today?</p>
              </div>
            </div>
          ) : (
            state.messages.map((message, index) => (
              <ChatMessageComponent key={message.id} message={message} isLatest={index === state.messages.length - 1} />
            ))
          )}

          {state.error && <ErrorMessage message={state.error} onRetry={actions.resetError} />}
          {state.isLoading && <SystemMessage content="Wedding assistant is thinking..." timestamp={new Date()} />}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-rose-gold/20 p-4 bg-white">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => {
                // Ensure input stays focused when user clicks on it
                inputRef.current?.focus()
              }}
              placeholder="Ask about the wedding..."
              className="flex-1 resize-none rounded-lg border border-rose-gold/30 px-3 py-2 
                        focus:outline-none focus:ring-2 focus:ring-rose-gold/50 
                        focus:border-transparent text-sm"
              rows={1}
              disabled={state.isLoading}
            />

            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || state.isLoading}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all duration-200
                flex items-center gap-2 text-sm
                ${
                  inputMessage.trim() && !state.isLoading
                    ? "bg-jewel-fuchsia text-warm-white hover:bg-jewel-crimson"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }
              `}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Actions */}
          {config.quickActions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {config.quickActions.slice(0, 3).map((action, index) => (
                <button
                  key={index}
                  onClick={() => actions.sendMessage(action.action)}
                  disabled={state.isLoading}
                  className="text-xs px-3 py-1 rounded-full bg-jewel-emerald/20 text-jewel-emerald 
                           hover:bg-jewel-emerald hover:text-warm-white transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
