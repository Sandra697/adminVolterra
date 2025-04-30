import { TicketsList } from "@/components/tickets/tickets-list"
import { getAllTickets } from "@/lib/ticket-actions"
import Layout from "@/components/Layout"

export default async function TicketsPage() {
  const tickets = await getAllTickets()

  return (
    <Layout>
      <div className="sm:container sm:mx-auto px-2 py-10">
        <h1 className="text-[0.85rem]  font-bold mb-6">Tickets Management</h1>
        <TicketsList tickets={tickets} />
      </div>
    </Layout>
  )
}
