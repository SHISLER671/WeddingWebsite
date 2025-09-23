import { type NextRequest, NextResponse } from "next/server"
import { createSignedToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { userType, password } = await request.json()

    if (!userType || !password) {
      return NextResponse.json({ message: "User type and password are required" }, { status: 400 })
    }

    console.log("[v0] Admin login attempt for userType:", userType)

    const adminCredentials = {
      BRIDE: { id: 1, user_type: "BRIDE", password: "BR1D3" },
      GROOM: { id: 2, user_type: "GROOM", password: "GR00M" },
      PLANNER: { id: 3, user_type: "PLANNER", password: "PLANN3R" },
    }

    const adminUser = adminCredentials[userType as keyof typeof adminCredentials]
    if (!adminUser) {
      console.warn("[v0] No admin user found for userType:", userType)
      return NextResponse.json({ message: "Invalid user type" }, { status: 401 })
    }

    const isValidPassword = password === adminUser.password
    console.log("[v0] Password verification result:", isValidPassword)

    if (!isValidPassword) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    const tokenData = {
      userType: adminUser.user_type,
      id: adminUser.id,
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
    }
    const token = createSignedToken(tokenData)

    const response = NextResponse.json({
      success: true,
      userType: adminUser.user_type,
      message: "Login successful",
    })

    response.cookies.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60,
    })

    return response
  } catch (error) {
    console.error("[v0] Admin login error:", error)
    return NextResponse.json(
      {
        message: "Internal server error",
        error:
          typeof error === "object" && error !== null && "message" in error
            ? (error as { message: string }).message
            : String(error),
      },
      { status: 500 },
    )
  }
}
