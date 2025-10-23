import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const body = await request.json()

    console.log("[v0] Contact form submission received:", {
      name: body.name,
      email: body.email,
      subject: body.subject,
    })

    const { name, email, subject, message } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      console.log("[v0] Missing required fields:", {
        name: !!name,
        email: !!email,
        subject: !!subject,
        message: !!message,
      })
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("[v0] Invalid email format:", email)
      return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 })
    }

    console.log("[v0] Attempting to insert contact message into database...")

    const { data, error } = await supabase
      .from("contact_messages")
      .insert({
        name,
        email,
        subject,
        message,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Database error:", error)
      return NextResponse.json({ success: false, error: "Failed to submit message: " + error.message }, { status: 500 })
    }

    console.log("[v0] Contact message successfully inserted:", data)

    return NextResponse.json({
      success: true,
      data: data,
      message: "Message sent successfully! We'll get back to you soon.",
    })
  } catch (error) {
    console.error("[v0] Error processing contact form submission:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Please try again.",
      },
      { status: 500 },
    )
  }
}
