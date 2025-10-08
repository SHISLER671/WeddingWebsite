// Chat API Route - Server-side handler for OpenRouter communication
// This keeps the API key secure on the server side

import { type NextRequest, NextResponse } from "next/server"
import { getOpenRouterClient, type OpenRouterMessage } from "@/lib/openrouter"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Chat API: Received request")

    const body = await request.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      console.error("[v0] Chat API: Invalid request - messages array required")
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 })
    }

    console.log("[v0] Chat API: Processing", messages.length, "messages")

    // Get OpenRouter client (server-side only)
    const client = getOpenRouterClient()

    // Send to OpenRouter
    console.log("[v0] Chat API: Sending to OpenRouter...")
    // This leaves plenty of room for input context while preventing token limit errors
    const response = await client.chatCompletion(messages as OpenRouterMessage[], {
      temperature: 0.7,
      maxTokens: 4000,
    })

    console.log("[v0] Chat API: OpenRouter response received")
    console.log("[v0] Chat API: Response ID:", response.id)
    console.log("[v0] Chat API: Model used:", response.model)

    const assistantMessage =
      response.choices[0]?.message?.content ||
      "I apologize, but I'm having trouble responding right now. Please try again."

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

    let errorMessage = "Failed to process chat request"
    let statusCode = 500

    if (error instanceof Error) {
      errorMessage = error.message

      if (error.message.includes("rate limit") || error.message.includes("429")) {
        statusCode = 429
      } else if (error.message.includes("API key") || error.message.includes("Unauthorized")) {
        statusCode = 401
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
