import type React from "react"
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components"

interface TenderReminderEmailProps {
  name: string
  tenderTitle: string
  tenderNumber: string
  closingDate: string
  tenderUrl: string
  notes?: string
  appName: string
}

const TenderReminderEmail: React.FC<TenderReminderEmailProps> = ({
  name,
  tenderTitle,
  tenderNumber,
  closingDate,
  tenderUrl,
  notes,
  appName,
}) => {
  return (
    <Html>
      <Head />
      <Preview>Reminder: Tender {tenderNumber} closing soon</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>{appName}</Heading>
          <Section style={styles.section}>
            <Heading as="h2" style={styles.subheading}>
              Tender Closing Reminder
            </Heading>
            <Text style={styles.text}>Hello {name},</Text>
            <Text style={styles.text}>This is a reminder that the following tender is closing soon:</Text>
            <div style={styles.tenderInfo}>
              <Text style={styles.tenderTitle}>{tenderTitle}</Text>
              <Text style={styles.tenderDetail}>
                <strong>Tender Number:</strong> {tenderNumber}
              </Text>
              <Text style={styles.tenderDetail}>
                <strong>Closing Date:</strong> {closingDate}
              </Text>
              {notes && (
                <Text style={styles.tenderDetail}>
                  <strong>Notes:</strong> {notes}
                </Text>
              )}
            </div>
            <Button style={styles.button} href={tenderUrl}>
              View Tender Details
            </Button>
            <Hr style={styles.hr} />
            <Text style={styles.footer}>
              This is an automated reminder from {appName}. You can manage your reminder settings in your account
              preferences.
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
  tenderInfo: {
    backgroundColor: "#f9fafb", // gray-50
    border: "1px solid #e5e7eb", // gray-200
    borderRadius: "4px",
    margin: "16px 0",
    padding: "16px",
  },
  tenderTitle: {
    color: "#1e3a8a", // blue-900
    fontSize: "18px",
    fontWeight: "bold",
    margin: "0 0 12px",
  },
  tenderDetail: {
    color: "#4b5563", // gray-600
    fontSize: "14px",
    lineHeight: "20px",
    margin: "8px 0",
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

export default TenderReminderEmail
