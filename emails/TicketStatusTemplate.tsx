import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components"
import { Tailwind } from "@react-email/tailwind"

interface TicketStatusTemplateProps {
  customerName: string
  ticketId: string
  status: string
  message: string
  supportLink: string
  department: string
}

export const TicketStatusTemplate = ({
  customerName,
  ticketId,
  status,
  message, 
  department,
}: TicketStatusTemplateProps) => {
  const previewText = `Your ticket NO:${ticketId} status has been updated to ${status}`

  return (
    <Html>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-gray-100" style={{ fontFamily: 'Poppins' }}>
          <Container className="mx-auto max-w-[600px] rounded bg-white p-8" style={{ fontFamily: 'Poppins' }}>
            
            <div className="flex flex-col items-center">
              <img
                src="https://res.cloudinary.com/dunssu2gi/image/upload/v1744565990/blog-images/tbwfs89mvh5u8vt1mz4a.png"
                alt="Company Logo"
                className="h-16 mb-4"
              />
            </div>
            

            
            <Section className="mb-6">
              <Text className="mb-4 text-gray-700" style={{ fontFamily: 'Poppins' }}>Hello {customerName},</Text>
              <Text className="mb-4 text-gray-700" style={{ fontFamily: 'Poppins' }}>
                Your support ticket <strong>NO:{ticketId}</strong> has been updated to:{" "}
                <span className="font-bold">{status}</span>
              </Text>
              <Text className="mb-4 text-gray-700" style={{ fontFamily: 'Poppins' }}>{message}</Text>
            </Section>
            
            <Section className="mb-6 rounded bg-gray-50 p-4">
              <Text className="mb-2 font-bold text-gray-800" style={{ fontFamily: 'Poppins' }}>Ticket Details:</Text>
              <Text className="mb-1 text-gray-700" style={{ fontFamily: 'Poppins' }}>
                <strong>Ticket ID:</strong> NO:{ticketId}
              </Text>
              <Text className="mb-1 text-gray-700" style={{ fontFamily: 'Poppins' }}>
                <strong>Status:</strong> {status}
              </Text>
              <Text className="mb-1 text-gray-700" style={{ fontFamily: 'Poppins' }}>
                <strong>Department:</strong> {department}
              </Text>
            </Section>
            
            <Hr className="mb-6 border-gray-300" />
            
            <Section>
              <Text className="text-center text-sm text-gray-500" style={{ fontFamily: 'Poppins' }}>
                If you have any questions, please contact our support team.
              </Text>
              <Text className="text-center text-sm text-gray-500" style={{ fontFamily: 'Poppins' }}>
                © {new Date().getFullYear()} Volterra Automotive. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}