import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { logger } from "@/lib/logger"
import { UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"

// This is a one-time setup endpoint to create the initial super admin
// It should be disabled or protected in production

export async function POST(req: NextRequest) {
  try {
    // Check for setup token to prevent unauthorized access
    // In production, you might want to use a more secure mechanism or disable this endpoint
    const setupToken = req.headers.get("x-setup-token")
    const expectedToken = process.env.SETUP_TOKEN || "initial-setup-token"

    if (setupToken !== expectedToken) {
      logger.warn("Unauthorized super admin setup attempt", {
        details: { ip: req.headers.get("x-forwarded-for") || "unknown" },
      })
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if a super admin already exists
    const existingSuperAdmin = await db.user.findFirst({
      where: {
        role: UserRole.SUPER_ADMIN,
      },
    })

    if (existingSuperAdmin) {
      return NextResponse.json({ error: "Super admin already exists", userId: existingSuperAdmin.id }, { status: 400 })
    }

    // Create super admin with provided credentials
    const email = "sandraakinyi18@gmail.com"
    const password = "Oidho@254"

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create the super admin user
    const superAdmin = await db.user.create({
      data: {
        email,
        name: "Sandra Admin",
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN,
        status: "ACTIVE",
        emailVerified: new Date(),
        updatedAt: new Date(),
      },
    })

    logger.info("Super admin created successfully", {
      details: { userId: superAdmin.id, email: superAdmin.email },
    })

    return NextResponse.json({
      success: true,
      message: "Super admin created successfully",
      userId: superAdmin.id,
    })
  } catch (error) {
    logger.error(`Failed to create super admin: ${error}`)
    return NextResponse.json({ error: "Failed to create super admin" }, { status: 500 })
  }
}

// GET method to check if super admin exists
export async function GET() {
  try {
    const superAdmin = await db.user.findFirst({
      where: {
        role: UserRole.SUPER_ADMIN,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    })

    if (superAdmin) {
      return NextResponse.json({
        exists: true,
        superAdmin: {
          id: superAdmin.id,
          email: superAdmin.email,
          createdAt: superAdmin.createdAt,
        },
      })
    }

    return NextResponse.json({ exists: false })
  } catch (error) {
    logger.error(`Error checking super admin: ${error}`)
    return NextResponse.json({ error: "Failed to check super admin status" }, { status: 500 })
  }
}
