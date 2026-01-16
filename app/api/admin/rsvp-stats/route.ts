import { type NextRequest, NextResponse } from "next/server"
import { createBrowserClient } from "@supabase/ssr"
import { requireAdminAPIAuth } from "@/lib/authHelpers"

// Cache environment variables at module load time to avoid intermittent access issues
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ""

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

function getSupabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      `Supabase environment variables are missing. URL: ${SUPABASE_URL ? "SET" : "NOT SET"}, Key: ${SUPABASE_ANON_KEY ? "SET" : "NOT SET"}`,
    )
  }

  if (!supabaseClient) {
    supabaseClient = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }

  return supabaseClient
}

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"
export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const auth = requireAdminAPIAuth(request)
  if (auth instanceof NextResponse) return auth

  try {
    const supabase = getSupabaseClient()

    console.log("[RSVP Stats] Fetching RSVP statistics from rsvps table")

    const { data: rsvps, error } = await supabase.from("rsvps").select("attendance, guest_count")

    if (error) {
      console.error("[RSVP Stats] Database error:", error)
      if (error.message && error.message.includes("Too Many")) {
        return NextResponse.json(
          { success: false, error: "Rate limit exceeded. Please wait a moment and try again." },
          { status: 429 },
        )
      }
      return NextResponse.json({ success: false, error: "Database error: " + error.message }, { status: 500 })
    }

    const yesCount = rsvps?.filter((r) => r.attendance === "yes").reduce((sum, r) => sum + (r.guest_count || 1), 0) || 0
    const noCount = rsvps?.filter((r) => r.attendance === "no").reduce((sum, r) => sum + (r.guest_count || 1), 0) || 0
    const totalCount = rsvps?.reduce((sum, r) => sum + (r.guest_count || 1), 0) || 0

    console.log("[RSVP Stats] Headcount - Yes:", yesCount, "No:", noCount, "Total:", totalCount)

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
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  } catch (error: any) {
    console.error("[RSVP Stats] Error fetching statistics:", error)
    const errorMessage =
      error?.message?.includes("Too Many") || error?.toString()?.includes("Too Many")
        ? "Rate limit exceeded. Please wait 30 seconds and try again."
        : error?.message || "Internal server error. Please try again."

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: error?.message?.includes("Too Many") ? 429 : 500 },
    )
  }
}
