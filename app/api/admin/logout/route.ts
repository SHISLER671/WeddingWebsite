import { NextRequest, NextResponse } from "next/server"
import { requireAdminAPIAuth } from "@/lib/authHelpers"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const auth = requireAdminAPIAuth(request)
  if (auth instanceof NextResponse) return auth

  const res = NextResponse.json({ success: true })
  res.cookies.delete("admin-token")
  return res
}

