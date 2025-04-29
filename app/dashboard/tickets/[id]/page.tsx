import { TicketDetail } from "@/components/tickets/ticket-detail"
import { getTicketById } from "@/lib/ticket-actions"
import { notFound } from "next/navigation"

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
    <div className="space-y-6">
      <h1 className="text-[0.85rem] font-bold tracking-tight">Ticket Details</h1>
      <TicketDetail ticket={ticket} />
    </div>
  )
}
