// app/layout.tsx
import type { Metadata } from "next"
import { Sidebar } from "@/components/sidebar"
import "./globals.css"

import { Quicksand } from "next/font/google"

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your dashboard description",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={quicksand.className}>
        <div className="flex min-h-screen text-gray-700 font-medium">
          <Sidebar className="sticky top-0 h-screen" />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  )
}
