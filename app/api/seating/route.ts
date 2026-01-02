import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    const guestName = searchParams.get("name")

    if (!email && !guestName) {
      return NextResponse.json({ success: false, error: "Email or name parameter is required" }, { status: 400 })
    }

    const supabase = await createClient()

    console.log("[v0] Looking up seating for:", { email, guestName })

    let query = supabase.from("invited_guests").select(`
        id,
        guest_name,
        email,
        rsvps(table_number, guest_count, attendance)
      `)

    if (email) {
      query = query.eq("email", email)
    } else if (guestName) {
      const normalizedName = guestName.trim().toLowerCase()
      query = query.ilike("guest_name", `%${normalizedName}%`)
    }

    const { data, error } = await query.maybeSingle()

    if (error) {
      console.error("[v0] Database error:", error)
      return NextResponse.json({ success: false, error: "Database error" }, { status: 500 })
    }

    if (!data || !data.rsvps || data.rsvps.length === 0) {
      console.log("[v0] No RSVP found for:", { email, guestName })
      return NextResponse.json(
        {
          success: false,
          error: "No RSVP found",
          hasSeating: false,
        },
        { status: 404 },
      )
    }

    const rsvp = data.rsvps[0]
    const tableNumber = rsvp.table_number || 0

    if (tableNumber === 0) {
      console.log("[v0] No table assignment yet for:", data.guest_name)
      return NextResponse.json(
        {
          success: false,
          error: "No seating assignment yet",
          hasSeating: false,
        },
        { status: 404 },
      )
    }

    console.log("[v0] Found seating for:", data.guest_name, "at Table", tableNumber)

    return NextResponse.json({
      success: true,
      data: {
        guest_name: data.guest_name,
        table_number: tableNumber,
        guest_count: rsvp.guest_count,
      },
      hasSeating: true,
      message: `You're assigned to Table ${tableNumber}`,
    })
  } catch (error) {
    console.error("[v0] Error looking up seating:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
