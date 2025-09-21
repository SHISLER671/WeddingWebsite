import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { searchParams } = new URL(request.url)
    const name = searchParams.get("name")
    const email = searchParams.get("email")

    if (!name || !email) {
      return NextResponse.json({ success: false, error: "Name and email are required" }, { status: 400 })
    }

    // Query seating assignment from Supabase
    const { data, error } = await supabase
      .from("seating_assignments")
      .select("*")
      .ilike("guest_name", name.trim())
      .ilike("guest_email", email.trim())
      .single()

    if (error || !data) {
      return NextResponse.json(
        {
          success: false,
          error: "No seating assignment found. Please check your name and email, or contact the wedding organizers.",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error("[v0] Seating API error:", err)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
