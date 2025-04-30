import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { createSession, setSessionCookie, logUserActivity } from "@/lib/auth"
import { logger } from "@/lib/logger"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
    })

    // Check if user exists
    if (!user) {
      logger.auth("Login failed: User not found", { details: { email } })
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Check if user is active
    if (user.status !== "ACTIVE") {
      logger.auth("Login failed: User not active", {
        details: { email, status: user.status },
      })

      if (user.status === "PENDING") {
        return NextResponse.json({ error: "Please verify your email before logging in" }, { status: 401 })
      }

      return NextResponse.json(
        { error: "Your account is not active. Please contact an administrator." },
        { status: 401 },
      )
    }

    // Check if password is correct
    if (!user.password) {
      logger.auth("Login failed: User has no password", { details: { email } })
      return NextResponse.json({ error: "Invalid login method" }, { status: 401 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      logger.auth("Login failed: Invalid password", { details: { email } })
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Create session
    const token = await createSession(user)

    // Set session cookie
    setSessionCookie(token)

    // Log IP and user agent for security
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
    const userAgent = req.headers.get("user-agent") || "unknown"

    await logUserActivity(user.id, "login", "User logged in", ipAddress.toString(), userAgent)

    logger.auth("Login successful", { details: { email, userId: user.id } })

    // Return user data (excluding sensitive information)
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
      },
    })
  } catch (error) {
    logger.error(`Login error: ${error}`)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
