import { Button } from "@/components/ui/button"

export function DashboardHeader() {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h1 className="text-[0.85rem]  font-bold tracking-tight">Dashboard</h1>
        <p className="text-[0.75rem]">Welcome to your car dealership admin dashboard.</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline">Download Report</Button>
        <Button>Refresh Data</Button>
      </div>
    </div>
  )
}
