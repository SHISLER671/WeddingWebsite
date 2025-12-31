import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = 'force-dynamic'

/**
 * Admin API endpoint to get RSVP statistics
 * Returns counts of "yes" and "no" RSVPs from the attendance column
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log("[RSVP Stats] Fetching RSVP statistics from rsvps table")

    // Count RSVPs by attendance status
    const { data: rsvps, error } = await supabase
      .from("rsvps")
      .select("attendance")

    if (error) {
      console.error("[RSVP Stats] Database error:", error)
      return NextResponse.json({ success: false, error: "Database error: " + error.message }, { status: 500 })
    }

    // Count yes and no
    const yesCount = rsvps?.filter(r => r.attendance === 'yes').length || 0
    const noCount = rsvps?.filter(r => r.attendance === 'no').length || 0
    const totalCount = rsvps?.length || 0

    console.log("[RSVP Stats] Counts - Yes:", yesCount, "No:", noCount, "Total:", totalCount)

    return NextResponse.json(
      {
        success: true,
        data: {
          yes: yesCount,
          no: noCount,
          total: totalCount,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    )
  } catch (error) {
    console.error("[RSVP Stats] Error fetching statistics:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Please try again.",
      },
      { status: 500 },
    )
  }
}
