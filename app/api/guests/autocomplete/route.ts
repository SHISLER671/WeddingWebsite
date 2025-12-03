import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = 'force-dynamic'

/**
 * Guest Name Autocomplete API
 * 
 * Returns matching guest names from invited_guests table based on prefix search.
 * Used for RSVP form autocomplete to help guests find their name.
 * 
 * Query params:
 *   - q: search query (prefix, minimum 2 characters)
 *   - limit: max results (default 10, max 20)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")?.trim()
    const limitParam = searchParams.get("limit")
    const limit = Math.min(parseInt(limitParam || "10", 10), 20)

    // Validate query
    if (!query || query.length < 2) {
      return NextResponse.json(
        { success: false, error: "Query must be at least 2 characters" },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Query invited_guests with case-insensitive prefix matching
    const { data, error } = await supabase
      .from("invited_guests")
      .select("id, guest_name, email, allowed_party_size")
      .ilike("guest_name", `${query}%`)
      .order("guest_name")
      .limit(limit)

    if (error) {
      console.error("[Autocomplete] Database error:", error)
      return NextResponse.json(
        { success: false, error: "Database query failed" },
        { status: 500 }
      )
    }

    // Format response with display-friendly data
    const results = (data || []).map((guest) => ({
      id: guest.id,
      guest_name: guest.guest_name,
      email: guest.email || null,
      allowed_party_size: guest.allowed_party_size || 1,
      // Extract last name for display
      display_name: guest.guest_name,
    }))

    return NextResponse.json({
      success: true,
      query,
      results,
      count: results.length,
    })
  } catch (error) {
    console.error("[Autocomplete] Unexpected error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
