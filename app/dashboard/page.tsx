import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardCards } from "@/components/dashboard-cards"
import { RecentActivity } from "@/components/recent-activity"
import Layout from "@/components/Layout"

export default function DashboardPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <DashboardHeader />
        <DashboardCards />
        <RecentActivity />
      </div>
    </Layout>
  )
}
