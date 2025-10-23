import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log("[v0] Admin: Fetching all seating assignments")

    const { data, error } = await supabase
      .from("seating_assignments")
      .select("*")
      .order("table_number", { ascending: true })
      .order("seat_number", { ascending: true })

    if (error) {
      console.error("[v0] Admin: Database error:", error)
      return NextResponse.json({ success: false, error: "Database error: " + error.message }, { status: 500 })
    }

    console.log("[v0] Admin: Successfully fetched", data.length, "assignments")

    return NextResponse.json({
      success: true,
      data: data,
    })
  } catch (error) {
    console.error("[v0] Admin: Error fetching seating assignments:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Please try again.",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const body = await request.json()
    const { id, ...updateData } = body

    console.log("[v0] Admin: Updating seating assignment:", { id, updateData })

    const { data, error } = await supabase
      .from("seating_assignments")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Admin: Update error:", error)
      return NextResponse.json({ success: false, error: "Update error: " + error.message }, { status: 500 })
    }

    console.log("[v0] Admin: Successfully updated assignment:", data)

    return NextResponse.json({
      success: true,
      data: data,
      message: "Assignment updated successfully",
    })
  } catch (error) {
    console.error("[v0] Admin: Error updating seating assignment:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Please try again.",
      },
      { status: 500 },
    )
  }
}
