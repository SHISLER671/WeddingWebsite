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

    if (error) {
      console.error("[v0] Admin: Database error:", error)
      return NextResponse.json({ success: false, error: "Database error: " + error.message }, { status: 500 })
    }

    // Sort by table_number first (0/unassigned at end), then alphabetically by name
    const sorted = data?.sort((a, b) => {
      // First sort by table_number (0 goes to end)
      const tableA = a.table_number || 0
      const tableB = b.table_number || 0
      
      // If both are 0 or both are > 0, compare normally
      if ((tableA === 0 && tableB === 0) || (tableA > 0 && tableB > 0)) {
        if (tableA !== tableB) {
          return tableA - tableB
        }
      } else {
        // One is 0, one is not - 0 goes to end
        if (tableA === 0) return 1
        if (tableB === 0) return -1
      }
      
      // If same table, sort alphabetically by name
      const nameA = (a.guest_name || '').toLowerCase().trim()
      const nameB = (b.guest_name || '').toLowerCase().trim()
      if (nameA < nameB) return -1
      if (nameA > nameB) return 1
      return 0
    })

    console.log("[v0] Admin: Successfully fetched", sorted?.length || 0, "assignments")

    return NextResponse.json({
      success: true,
      data: sorted || [],
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
