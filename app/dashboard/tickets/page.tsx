import { TicketsList } from "@/components/tickets/tickets-list"
import { getAllTickets } from "@/lib/ticket-actions"

export default async function TicketsPage() {
  const tickets = await getAllTickets()

  return (
    <div className="space-y-6">
      <h1 className="text-[0.85rem] font-bold tracking-tight">Support Tickets</h1>
      <TicketsList tickets={tickets} />
    </div>
  )
}
