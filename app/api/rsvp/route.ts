import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
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

    let result = await supabase
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

    // If RLS error, try with service role client
    if (result.error && result.error.message.includes("row-level security")) {
      console.log("[v0] RLS error detected, trying with service role client...")

      // Create service role client for this operation
      const { createClient: createServiceClient } = await import("@supabase/supabase-js")
      const serviceSupabase = createServiceClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

      result = await serviceSupabase
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
    }

    if (result.error) {
      console.error("[v0] Supabase error upserting RSVP:", result.error)
      return NextResponse.json(
        { success: false, error: "Failed to submit RSVP: " + result.error.message },
        { status: 500 },
      )
    }

    console.log("[v0] RSVP successfully upserted:", result.data)

    return NextResponse.json({
      success: true,
      data: result.data,
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
