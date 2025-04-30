import type React from "react"
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components"

interface PasswordResetEmailProps {
  name: string
  resetUrl: string
  appName: string
}

const PasswordResetEmail: React.FC<PasswordResetEmailProps> = ({ name, resetUrl, appName }) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your {appName} password</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>{appName}</Heading>
          <Section style={styles.section}>
            <Heading as="h2" style={styles.subheading}>
              Password Reset Request
            </Heading>
            <Text style={styles.text}>Hello {name},</Text>
            <Text style={styles.text}>
              We received a request to reset your password for your {appName} account. If you didn't make this request,
              you can safely ignore this email.
            </Text>
            <Text style={styles.text}>To reset your password, click the button below:</Text>
            <Button style={styles.button} href={resetUrl}>
              Reset Password
            </Button>
            <Text style={styles.smallText}>Or copy and paste this URL into your browser:</Text>
            <Text style={styles.link}>{resetUrl}</Text>
            <Hr style={styles.hr} />
            <Text style={styles.footer}>
              This password reset link will expire in 24 hours. If you need assistance, please contact our support team.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Email styles
const styles = {
  body: {
    backgroundColor: "#f5f5f5",
    fontFamily: "Arial, sans-serif",
    padding: "20px",
  },
  container: {
    backgroundColor: "#ffffff",
    border: "1px solid #e0e0e0",
    borderRadius: "5px",
    margin: "0 auto",
    maxWidth: "600px",
    padding: "20px",
  },
  heading: {
    color: "#b45309", // amber-600
    fontSize: "24px",
    fontWeight: "bold",
    margin: "20px 0",
    textAlign: "center" as const,
  },
  section: {
    padding: "20px",
  },
  subheading: {
    color: "#b45309", // amber-600
    fontSize: "20px",
    fontWeight: "bold",
    margin: "20px 0",
  },
  text: {
    color: "#4b5563", // gray-600
    fontSize: "16px",
    lineHeight: "24px",
    margin: "16px 0",
  },
  smallText: {
    color: "#6b7280", // gray-500
    fontSize: "14px",
    margin: "8px 0",
  },
  link: {
    color: "#1e3a8a", // blue-900
    fontSize: "14px",
    margin: "8px 0",
    wordBreak: "break-all" as const,
  },
  button: {
    backgroundColor: "#1e3a8a", // blue-900
    borderRadius: "4px",
    color: "#ffffff",
    display: "inline-block",
    fontSize: "16px",
    fontWeight: "bold",
    margin: "16px 0",
    padding: "12px 24px",
    textDecoration: "none",
  },
  hr: {
    borderColor: "#e0e0e0",
    margin: "20px 0",
  },
  footer: {
    color: "#6b7280", // gray-500
    fontSize: "14px",
    fontStyle: "italic",
    margin: "20px 0 0",
  },
}

export default PasswordResetEmail
