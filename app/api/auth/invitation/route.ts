import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { logger } from "@/lib/logger"
import { getCurrentUser } from "@/lib/auth"
import { UserRole } from "@prisma/client"
import { sendInvitationEmail } from "@/lib/adminMails"
import crypto from "crypto"

// GET - Fetch invitation details by token
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const token = url.searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    // Find invitation by token
    const invitation = await db.invitation.findUnique({
      where: { token },
      include: {
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Check if invitation exists
    if (!invitation) {
      logger.auth("Invitation not found", { details: { token } })
      return NextResponse.json({ error: "Invalid invitation token" }, { status: 404 })
    }

    // Check if invitation is expired
    const isExpired = new Date() > invitation.expiresAt

    // Check if invitation is already accepted
    const isAccepted = invitation.status === "ACCEPTED"

    return NextResponse.json({
      invitation: {
        email: invitation.email,
        role: invitation.role,
        inviterName: invitation.inviter.name || invitation.inviter.email,
        expired: isExpired,
        accepted: isAccepted,
        updatedAt:new Date(invitation.updatedAt)
      },
    })
  } catch (error) {
    logger.error(`Get invitation error: ${error}`)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

// POST - Create a new invitation
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    // Check if user is authenticated
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has permission to invite others
    if (currentUser.role !== UserRole.SUPER_ADMIN && currentUser.role !== UserRole.ADMIN) {
      logger.auth("Unauthorized invitation attempt", {
        details: { userId: currentUser.id, role: currentUser.role },
      })
      return NextResponse.json({ error: "You do not have permission to invite users" }, { status: 403 })
    }

    const { email, role } = await req.json()

    // Validate input
    if (!email || !role) {
      return NextResponse.json({ error: "Email and role are required" }, { status: 400 })
    }

    // Check if email is already registered
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Check if there's an active invitation for this email
    const existingInvitation = await db.invitation.findFirst({
      where: {
        email,
        status: "PENDING",
        expiresAt: {
          gt: new Date(),
        },
      },
    })

    if (existingInvitation) {
      return NextResponse.json({ error: "An invitation has already been sent to this email" }, { status: 409 })
    }

    // Validate role
    const validRoles = Object.values(UserRole)
    if (!validRoles.includes(role as UserRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // SUPER_ADMIN can only be invited by another SUPER_ADMIN
    if (role === UserRole.SUPER_ADMIN && currentUser.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({ error: "You do not have permission to invite SUPER_ADMIN users" }, { status: 403 })
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Expires in 7 days

    // Create invitation
    const invitation = await db.invitation.create({
      data: {
        email,
        role: role as UserRole,
        token,
        expiresAt,
        inviterId: currentUser.id,
        updatedAt: new Date(),
      },
    })

    logger.auth("Invitation created", {
      details: {
        invitation: invitation.id,
        inviterId: currentUser.id,
        inviteeEmail: email,
        role,
        token,
      },
    })

    // Send invitation email
    await sendInvitationEmail(email, currentUser.name || currentUser.email, role, token)

    logger.auth("Invitation created", {
      details: {
        inviterId: currentUser.id,
        inviteeEmail: email,
        role,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Invitation sent successfully",
    })
  } catch (error) {
    logger.error(`Create invitation error: ${error}`)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
