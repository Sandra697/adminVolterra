import { TicketDetail } from "@/components/tickets/ticket-detail"
import { getTicketById } from "@/lib/ticket-actions"
import { notFound } from "next/navigation"
import Layout from "@/components/Layout"

export default async function TicketDetailPage({ params }: { params: { id: string } }) {
  const ticketId = parseInt(params.id)
  
  if (isNaN(ticketId)) {
    notFound()
  }
  
  const ticket = await getTicketById(ticketId)
  
  if (!ticket) {
    notFound()
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-10">
        <h1 className="text-[0.85rem] font-bold mb-6">Ticket Details</h1>
        <TicketDetail ticket={ticket} />
      </div>
    </Layout>
  )
}
