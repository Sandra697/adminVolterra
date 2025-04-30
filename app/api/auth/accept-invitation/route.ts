import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { logger } from "@/lib/logger"
import { createSession, setSessionCookie } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const { token, name, password } = await req.json()

    // Validate input
    if (!token || !name || !password) {
      return NextResponse.json({ error: "Token, name, and password are required" }, { status: 400 })
    }

    // Find invitation by token
    const invitation = await db.invitation.findUnique({
      where: { token },
    })

    // Check if invitation exists
    if (!invitation) {
      logger.auth("Accept invitation failed: Invalid token", { details: { token } })
      return NextResponse.json({ error: "Invalid invitation token" }, { status: 404 })
    }

    // Check if invitation is expired
    if (new Date() > invitation.expiresAt) {
      logger.auth("Accept invitation failed: Invitation expired", {
        details: { token, expires: invitation.expiresAt },
      })
      return NextResponse.json({ error: "Invitation has expired" }, { status: 400 })
    }

    // Check if invitation is already accepted
    if (invitation.status === "ACCEPTED") {
      logger.auth("Accept invitation failed: Already accepted", {
        details: { token },
      })
      return NextResponse.json({ error: "Invitation has already been accepted" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Check if user with this email already exists
    const existingUser = await db.user.findUnique({
      where: { email: invitation.email },
    })

    let user

    if (existingUser) {
      // Update existing user
      user = await db.user.update({
        where: { id: existingUser.id },
        data: {
          name,
          password: hashedPassword,
          role: invitation.role,
          status: "ACTIVE",
          emailVerified: new Date(),
        },
      })
    } else {
      // Create new user
      user = await db.user.create({
        data: {
          email: invitation.email,
          name,
          password: hashedPassword,
          role: invitation.role,
          status: "ACTIVE",
          emailVerified: new Date(),
          invitedBy: invitation.inviterId,
          updatedAt: new Date(),
        },
      })
    }

    // Update invitation status
    await db.invitation.update({
      where: { id: invitation.id },
      data: {
        status: "ACCEPTED",
        userId: user.id,
      },
    })

    // Create session
    const sessionToken = await createSession(user)

    // Set session cookie
    setSessionCookie(sessionToken)

    logger.auth("Invitation accepted successfully", {
      details: { userId: user.id, email: user.email, role: user.role },
    })

    return NextResponse.json({
      success: true,
      message: "Invitation accepted successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
      },
    })
  } catch (error) {
    logger.error(`Accept invitation error: ${error}`)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
