import { NextRequest, NextResponse } from "next/server"
import { createSignedToken } from "@/lib/auth"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 })
  }

  const password = (body?.password ?? "").toString()
  const expected = process.env.ADMIN_PASSWORD || process.env.JWT_SECRET

  if (!expected) {
    return NextResponse.json({ success: false, error: "Server not configured: missing ADMIN_PASSWORD/JWT_SECRET" }, { status: 500 })
  }

  if (!password || password !== expected) {
    return NextResponse.json({ success: false, error: "Invalid password" }, { status: 401 })
  }

  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 // 30 days
  const token = createSignedToken({ userType: "admin", id: 1, exp })

  const res = NextResponse.json({ success: true })
  res.cookies.set("admin-token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })
  return res
}
