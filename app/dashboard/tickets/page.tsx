import { TicketsList } from "@/components/tickets/tickets-list"

export default function TicketsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-[0.85rem]  font-bold tracking-tight">Support Tickets</h1>
      <TicketsList />
    </div>
  )
}
