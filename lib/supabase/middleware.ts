import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  console.log("[v0] Middleware - SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "NOT SET")
  console.log("[v0] Middleware - SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "NOT SET")

  // Just pass through the request without trying to refresh Supabase sessions
  // Auth checks will be handled in components/pages as needed

  return NextResponse.next({
    request,
  })
}
