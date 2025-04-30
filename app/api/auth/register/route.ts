import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { logger } from "@/lib/logger"
import { sendWelcomeEmail } from "@/lib/adminMails"
import bcrypt from "bcryptjs"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    // Check if email is already registered
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      logger.auth("Registration failed: Email already in use", { details: { email } })
      return NextResponse.json({ error: "Email is already registered" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const tokenExpiry = new Date()
    tokenExpiry.setHours(tokenExpiry.getHours() + 24) // Token valid for 24 hours

    // Create user with PENDING status
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        status: "PENDING",
        updatedAt: new Date(),
      },
    })

    // Create verification token
    await db.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires: tokenExpiry,
      },
    })

    // Send welcome email with verification link
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`

   logger.auth("Sending welcome email", {
      details: { email, verificationUrl },
    })
    await sendWelcomeEmail(email, name || "User")

    logger.auth("User registered successfully", {
      details: { email, userId: user.id },
    })

    return NextResponse.json({
      success: true,
      message: "Registration successful. Please check your email to verify your account.",
    })
  } catch (error) {
    logger.error(`Registration error: ${error}`)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
