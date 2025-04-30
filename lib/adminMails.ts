import nodemailer from "nodemailer"
import { render } from "@react-email/render"
import WelcomeEmail from "@/components/emails/welcome-email"
import PasswordResetEmail from "@/components/emails/password-reset-email"
import TenderReminderEmail from "@/components/emails/tender-reminder-email"
import { logger } from "./logger"

// Create a nodemailer transporter using Brevo SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || "7aa060001@smtp-brevo.com",
    pass: process.env.SMTP_PASSWORD || "crY04Fnf8NSIZqJM",
  },
})

// Email sender address
const fromEmail = process.env.EMAIL_FROM || "Volterra Automotive <francis@mitsumidistribution.com>"

// App name and URL
const appName = "Volterra Automotive"
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(to: string, name: string) {
  try {
    const emailHtml = await render(
      WelcomeEmail({
        name,
        appUrl,
        appName,
      }) as React.ReactElement,
    )

    const mailOptions = {
      from: fromEmail,
      to,
      subject: `Welcome to ${appName}`,
      html: emailHtml,
    }

    await transporter.sendMail(mailOptions)
    logger.info(`Welcome email sent to ${to}`)
    return true
  } catch (error) {
    logger.error(`Failed to send welcome email: ${error}`)
    return false
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  try {
    const resetUrl = `${appUrl}/auth/reset-password?token=${token}`

    const emailHtml = await render(
      PasswordResetEmail({
        name,
        resetUrl,
        appName,
      }) as React.ReactElement,
    )

    const mailOptions = {
      from: fromEmail,
      to,
      subject: `Reset Your ${appName} Password`,
      html: emailHtml,
    }

    await transporter.sendMail(mailOptions)
    logger.info(`Password reset email sent to ${to}`)
    return true
  } catch (error) {
    logger.error(`Failed to send password reset email: ${error}`)
    return false
  }
}

/**
 * Send invitation email
 */
export async function sendInvitationEmail(to: string, inviterName: string, role: string, token: string) {
  try {
    const inviteUrl = `${appUrl}/auth/invite?token=${token}`

    // Create a simple HTML email for invitation
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #b45309; text-align: center;">${appName}</h2>
        <h3 style="color: #b45309;">You've Been Invited!</h3>
        <p>Hello,</p>
        <p>${inviterName} has invited you to join ${appName} as a ${role.replace("_", " ")}.</p>
        <p>Click the button below to accept this invitation and set up your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteUrl}" style="background-color: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Accept Invitation
          </a>
        </div>
        <p>This invitation will expire in 7 days.</p>
        <p>If you have any questions, please contact the person who invited you.</p>
        <hr style="border-color: #e0e0e0; margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 14px; font-style: italic;">
          If you didn't expect this invitation, you can safely ignore this email.
        </p>
      </div>
    `

    const mailOptions = {
      from: fromEmail,
      to,
      subject: `You've been invited to join ${appName}`,
      html: emailHtml,
    }

    await transporter.sendMail(mailOptions)
    logger.info(`Invitation email sent to ${to}`)
    return true
  } catch (error) {
    logger.error(`Failed to send invitation email: ${error}`)
    return false
  }
}

/**
 * Send tender reminder email
 */
export async function sendTenderReminderEmail(
  to: string,
  name: string,
  tenderTitle: string,
  tenderNumber: string,
  closingDate: string,
  tenderUrl: string,
  notes?: string,
) {
  try {
    const emailHtml = await render(
      TenderReminderEmail({
        name,
        tenderTitle,
        tenderNumber,
        closingDate,
        tenderUrl,
        notes,
        appName,
      }) as React.ReactElement,
    )

    const mailOptions = {
      from: fromEmail,
      to,
      subject: `Reminder: Tender ${tenderNumber} closing soon`,
      html: emailHtml,
    }

    await transporter.sendMail(mailOptions)
    logger.info(`Tender reminder email sent to ${to}`)
    return true
  } catch (error) {
    logger.error(`Failed to send tender reminder email: ${error}`)
    return false
  }
}

/**
 * Verify SMTP connection
 */
export async function verifyEmailConnection() {
  try {
    await transporter.verify()
    logger.info("SMTP connection verified successfully")
    return true
  } catch (error) {
    logger.error(`SMTP connection verification failed: ${error}`)
    return false
  }
}