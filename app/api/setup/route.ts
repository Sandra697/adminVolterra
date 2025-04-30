import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { logger } from "@/lib/logger"
import { UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"
import { verifyEmailConnection } from "@/lib/adminMails"

// This endpoint provides system setup information and can run initial setup tasks

export async function GET() {
  try {
    // Check database connection
    let dbStatus = "ok"
    let dbError = null

    try {
      // Simple query to check database connection
      await db.$queryRaw`SELECT 1`
    } catch (error) {
      dbStatus = "error"
      dbError = (error as Error).message
      logger.error(`Database connection error: ${error}`)
    }

    // Check email configuration
    let emailStatus = "ok"
    let emailError = null

    try {
      const emailVerified = await verifyEmailConnection()
      if (!emailVerified) {
        emailStatus = "error"
        emailError = "Failed to verify email connection"
      }
    } catch (error) {
      emailStatus = "error"
      emailError = (error as Error).message
      logger.error(`Email verification error: ${error}`)
    }

    // Check if super admin exists
    const superAdmin = await db.user.findFirst({
      where: {
        role: UserRole.SUPER_ADMIN,
      },
      select: {
        id: true,
        email: true,
      },
    })

    // Count total users
    const userCount = await db.user.count()

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      system: {
        database: {
          status: dbStatus,
          error: dbError,
        },
        email: {
          status: emailStatus,
          error: emailError,
        },
        users: {
          total: userCount,
          superAdminExists: !!superAdmin,
        },
      },
    })
  } catch (error) {
    logger.error(`Setup check error: ${error}`)
    return NextResponse.json({ error: "Failed to check system setup" }, { status: 500 })
  }
}

// POST method to initialize the system
export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json()

    if (action === "create_super_admin") {
      // Check if a super admin already exists
      const existingSuperAdmin = await db.user.findFirst({
        where: {
          role: UserRole.SUPER_ADMIN,
        },
      })

      if (existingSuperAdmin) {
        return NextResponse.json(
          { error: "Super admin already exists", userId: existingSuperAdmin.id },
          { status: 400 },
        )
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
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    logger.error(`Setup initialization error: ${error}`)
    return NextResponse.json({ error: "Failed to initialize system" }, { status: 500 })
  }
}
