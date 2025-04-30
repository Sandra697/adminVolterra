import { BookingDetail } from "@/components/bookingDetails"
import { getServiceBookingById } from "@/lib/service-actions"
import { notFound } from "next/navigation"
import Layout from "@/components/Layout"

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const bookingId = Number.parseInt(params.id)

  if (isNaN(bookingId)) {
    notFound()
  }

  const booking = await getServiceBookingById(bookingId)

  if (!booking) {
    notFound()
  }

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <h1 className="text-[0.85rem] font-bold mb-6">Booking Details</h1>
        <BookingDetail booking={booking} />
      </div>
    </Layout>
  )
}
