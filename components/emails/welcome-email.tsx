import type React from "react"
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components"

interface WelcomeEmailProps {
  name: string
  appUrl: string
  appName: string
}

const WelcomeEmail: React.FC<WelcomeEmailProps> = ({ name, appUrl, appName }) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to {appName}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>{appName}</Heading>
          <Section style={styles.section}>
            <Heading as="h2" style={styles.subheading}>
              Welcome to {appName}!
            </Heading>
            <Text style={styles.text}>Hello {name},</Text>
            <Text style={styles.text}>Thank you for joining {appName}. We're excited to have you on board!</Text>
            <Text style={styles.text}>
              {appName} helps you manage and track Car Orders more efficiently, allowing you to stay on top of
              opportunities and deadlines.
            </Text>
            <Button style={styles.button} href={appUrl}>
              Get Started
            </Button>
            <Hr style={styles.hr} />
            <Text style={styles.footer}>
              If you have any questions or need assistance, please don't hesitate to contact our support team.
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

export default WelcomeEmail
