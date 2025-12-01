// Chat API Route - Server-side handler for OpenRouter communication
// This keeps the API key secure on the server side

import { type NextRequest, NextResponse } from "next/server"
import { getOpenRouterClient, type OpenRouterMessage } from "@/lib/openrouter"

// Safety limits to prevent excessive credit usage
const MAX_MESSAGES = 50 // Maximum messages in a conversation
const MAX_INPUT_TOKENS = 8000 // Maximum input tokens (rough estimate: ~4 chars per token)
const MAX_OUTPUT_TOKENS = 1000 // Maximum output tokens per response
const MAX_MESSAGE_LENGTH = 2000 // Maximum characters per user message
const MAX_RESPONSE_LENGTH = 5000 // Maximum characters per assistant response

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Chat API: Received request")

    const body = await request.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      console.error("[v0] Chat API: Invalid request - messages array required")
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 })
    }

    // Safety check 1: Limit conversation length
    if (messages.length > MAX_MESSAGES) {
      console.warn(`[v0] Chat API: Conversation too long (${messages.length} messages), truncating to last ${MAX_MESSAGES}`)
      const truncated = messages.slice(-MAX_MESSAGES)
      // Keep system message if present
      const systemMsg = messages.find(m => m.role === 'system')
      const messagesToUse = systemMsg && !truncated.some(m => m.role === 'system')
        ? [systemMsg, ...truncated.slice(1)]
        : truncated
      
      return NextResponse.json({
        error: `Conversation limit reached. Please start a new conversation.`,
        truncated: true,
      }, { status: 400 })
    }

    // Safety check 2: Limit individual message length
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()
    if (lastUserMessage && lastUserMessage.content.length > MAX_MESSAGE_LENGTH) {
      console.warn(`[v0] Chat API: Message too long (${lastUserMessage.content.length} chars)`)
      return NextResponse.json({
        error: `Message is too long. Please keep messages under ${MAX_MESSAGE_LENGTH} characters.`,
      }, { status: 400 })
    }

    // Safety check 3: Estimate and limit input tokens
    const estimatedInputTokens = messages.reduce((sum, msg) => {
      return sum + Math.ceil((msg.content?.length || 0) / 4) // Rough estimate: 4 chars per token
    }, 0)

    if (estimatedInputTokens > MAX_INPUT_TOKENS) {
      console.warn(`[v0] Chat API: Input too large (estimated ${estimatedInputTokens} tokens)`)
      return NextResponse.json({
        error: `Conversation context is too large. Please start a new conversation.`,
      }, { status: 400 })
    }

    console.log("[v0] Chat API: Processing", messages.length, "messages (estimated", estimatedInputTokens, "input tokens)")

    // Get OpenRouter client (server-side only)
    const client = getOpenRouterClient()

    // Send to OpenRouter with strict limits
    console.log("[v0] Chat API: Sending to OpenRouter...")
    const response = await client.chatCompletion(messages as OpenRouterMessage[], {
      temperature: 0.7,
      maxTokens: MAX_OUTPUT_TOKENS, // Strict limit on output tokens
    })

    console.log("[v0] Chat API: OpenRouter response received")
    console.log("[v0] Chat API: Response ID:", response.id)
    console.log("[v0] Chat API: Model used:", response.model)

    let assistantMessage =
      response.choices[0]?.message?.content ||
      "I apologize, but I'm having trouble responding right now. Please try again."

    // Safety check 4: Truncate response if too long (shouldn't happen with maxTokens, but double-check)
    if (assistantMessage.length > MAX_RESPONSE_LENGTH) {
      console.warn(`[v0] Chat API: Response too long (${assistantMessage.length} chars), truncating`)
      assistantMessage = assistantMessage.substring(0, MAX_RESPONSE_LENGTH) + "... [Response truncated for length]"
    }

    // Log usage for monitoring
    if (response.usage) {
      const estimatedCost = (
        (response.usage.prompt_tokens / 1000000) * 0.15 +
        (response.usage.completion_tokens / 1000000) * 0.60
      ).toFixed(6)
      console.log(`[v0] Chat API: Usage - ${response.usage.total_tokens} tokens (est. cost: $${estimatedCost})`)
    }

    console.log("[v0] Chat API: Returning response to client")

    return NextResponse.json({
      success: true,
      message: assistantMessage,
      metadata: {
        id: response.id,
        model: response.model,
        usage: response.usage,
      },
    })
  } catch (error) {
    console.error("[v0] Chat API: Error processing request:", error)
    console.error("[v0] Chat API: Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    })

    let errorMessage = "Failed to process chat request"
    let statusCode = 500

    if (error instanceof Error) {
      errorMessage = error.message
      const errorMsgLower = error.message.toLowerCase()

      if (errorMsgLower.includes("rate limit") || errorMsgLower.includes("429") || errorMsgLower.includes("too many requests")) {
        statusCode = 429
        errorMessage = "Rate limit exceeded. Please wait a moment and try again."
      } else if (errorMsgLower.includes("api key") || errorMsgLower.includes("unauthorized") || errorMsgLower.includes("401")) {
        statusCode = 401
        errorMessage = "API authentication failed. Please check the API key configuration."
      } else if (errorMsgLower.includes("402") || errorMsgLower.includes("payment") || errorMsgLower.includes("insufficient credits")) {
        statusCode = 402
        errorMessage = "Insufficient API credits. Please add credits to your OpenRouter account."
      } else if (errorMsgLower.includes("timeout")) {
        statusCode = 504
        errorMessage = "Request timeout. The AI service is taking too long to respond."
      }
    }

    console.error("[v0] Chat API: Returning error response:", { errorMessage, statusCode })
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
