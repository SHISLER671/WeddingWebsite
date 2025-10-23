import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    const guestName = searchParams.get("name")

    if (!email && !guestName) {
      return NextResponse.json({ success: false, error: "Email or name parameter is required" }, { status: 400 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log("[v0] Looking up seating assignment for:", { email, guestName })

    let query = supabase.from("seating_assignments").select("*")
    
    // Try to find by email first, then by name
    if (email) {
      query = query.eq("email", email)
    } else {
      query = query.eq("guest_name", guestName)
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === "PGRST116") {
        // No seating assignment found, try alternative lookup
        if (email && guestName) {
          console.log("[v0] No seating found by email, trying name lookup:", guestName)
          const { data: nameData, error: nameError } = await supabase
            .from("seating_assignments")
            .select("*")
            .eq("guest_name", guestName)
            .single()
          
          if (nameError) {
            console.log("[v0] No seating assignment found for:", { email, guestName })
            return NextResponse.json({ 
              success: false, 
              error: "No seating assignment found",
              hasSeating: false 
            }, { status: 404 })
          }
          
          console.log("[v0] Seating assignment found by name:", nameData)
          return NextResponse.json({
            success: true,
            data: nameData,
            hasSeating: true,
            message: `You're assigned to Table ${nameData.table_number}, Seat ${nameData.seat_number}`
          })
        }
        
        console.log("[v0] No seating assignment found for:", { email, guestName })
        return NextResponse.json({ 
          success: false, 
          error: "No seating assignment found",
          hasSeating: false 
        }, { status: 404 })
      }
      
      console.error("[v0] Database error:", error)
      return NextResponse.json({ success: false, error: "Database error: " + error.message }, { status: 500 })
    }

    console.log("[v0] Seating assignment found:", data)

    return NextResponse.json({
      success: true,
      data: data,
      hasSeating: true,
      message: `You're assigned to Table ${data.table_number}, Seat ${data.seat_number}`
    })
  } catch (error) {
    console.error("[v0] Error looking up seating assignment:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Please try again.",
      },
      { status: 500 },
    )
  }
}
