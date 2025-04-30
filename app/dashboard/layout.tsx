import type React from "react"


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
