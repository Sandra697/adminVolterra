import { TicketDetail } from "@/components/tickets/ticket-detail"
import { getTicket } from "@/lib/data"

export default async function TicketDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const ticket = await getTicket(params.id)

  return (
    <div className="space-y-6">
      <h1 className="text-[0.85rem]  font-bold tracking-tight">Ticket Details</h1>
      <TicketDetail ticket={ticket} />
    </div>
  )
}
