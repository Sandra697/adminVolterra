import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components"
import { Tailwind } from "@react-email/tailwind"

interface ServiceBookingTemplateProps {
  customerName: string
  bookingId: string
  serviceName: string
  preferredDate: string
  status: string
  message: string
  bookingLink: string
}

export const ServiceBookingTemplate = ({
  customerName,
  bookingId,
  serviceName,
  preferredDate,
  status,
  message,
  bookingLink,
}: ServiceBookingTemplateProps) => {
  const previewText = `Your service booking #${bookingId} status: ${status}`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto max-w-[600px] rounded bg-white p-8">
          <div className="flex flex-col items-center">
              <img
                src="https://res.cloudinary.com/dunssu2gi/image/upload/v1744565990/blog-images/tbwfs89mvh5u8vt1mz4a.png"
                alt="Company Logo"
                className="h-16 mb-4"
              />
            </div>

            <Section className="mb-6">
              <Text className="mb-4 text-gray-700">Hello {customerName},</Text>
              <Text className="mb-4 text-gray-700">
                Your service booking <strong>#{bookingId}</strong> for <strong>{serviceName}</strong> is now:{" "}
                <span className="font-bold">{status}</span>
              </Text>
              <Text className="mb-4 text-gray-700">{message}</Text>
            </Section>

            <Section className="mb-6 rounded bg-gray-50 p-4">
              <Text className="mb-2 font-bold text-gray-800">Booking Details:</Text>
              <Text className="mb-1 text-gray-700">
                <strong>Booking ID:</strong> #{bookingId}
              </Text>
              <Text className="mb-1 text-gray-700">
                <strong>Service:</strong> {serviceName}
              </Text>
              <Text className="mb-1 text-gray-700">
                <strong>Preferred Date:</strong> {preferredDate}
              </Text>
              <Text className="mb-1 text-gray-700">
                <strong>Status:</strong> {status}
              </Text>
            </Section>

            <Section className="mb-6 text-center">
              <Button className="rounded bg-blue-600 px-6 py-3 font-bold text-white" href={bookingLink}>
                View Booking
              </Button>
            </Section>

            <Hr className="mb-6 border-gray-300" />

            <Section>
              <Text className="text-center text-sm text-gray-500">
                If you have any questions, please contact our service team.
              </Text>
              <Text className="text-center text-sm text-gray-500">
                © {new Date().getFullYear()} Volterra Automotive. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
