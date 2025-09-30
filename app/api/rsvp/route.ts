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

    console.log("[v0] RSVP submission received:", {
      guest_name: body.guest_name,
      email: body.email,
      attendance: body.attendance,
    })

    const { guest_name, email, attendance, guest_count, dietary_restrictions, special_message, wallet_address } = body

    // Validate required fields
    if (!guest_name || !email || !attendance) {
      console.log("[v0] Missing required fields:", {
        guest_name: !!guest_name,
        email: !!email,
        attendance: !!attendance,
      })
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Validate attendance value
    if (!["yes", "no"].includes(attendance)) {
      console.log("[v0] Invalid attendance value:", attendance)
      return NextResponse.json(
        { success: false, error: 'Invalid attendance value. Must be "yes" or "no"' },
        { status: 400 },
      )
    }

    console.log("[v0] Attempting to upsert RSVP into database...")

    if (guest_name === "Douglas" && email === "doug@pretend.com") {
      console.log("[v0] Processing test RSVP for Douglas")
    }

    const { data, error } = await supabase
      .from("rsvps")
      .upsert(
        {
          guest_name,
          email,
          attendance,
          guest_count: guest_count || 1,
          dietary_restrictions: dietary_restrictions || null,
          special_message: special_message || null,
          wallet_address: wallet_address || null,
        },
        {
          onConflict: "email",
        },
      )
      .select()
      .single()

    if (error) {
      console.error("[v0] Supabase error upserting RSVP:", error)
      return NextResponse.json({ success: false, error: "Failed to submit RSVP: " + error.message }, { status: 500 })
    }

    console.log("[v0] RSVP successfully upserted:", data)

    return NextResponse.json({
      success: true,
      data: data,
      message: "RSVP submitted successfully",
    })
  } catch (error) {
    console.error("[v0] Error processing RSVP submission:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Please try again.",
      },
      { status: 500 },
    )
  }
}
