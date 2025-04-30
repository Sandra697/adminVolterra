import type React from "react"
import "@/app/globals.css"
import { Quicksand } from "next/font/google"
import { AuthProvider } from "@/providers/auth-provider"
import { ToastProvider } from "@/providers/toast-provider"

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

export const metadata = {
  title: "Volterra Automotive",
  description: "A platform for aggregating tenders from multiple sources",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
       className={`${quicksand.className} font-medium`}

        
      >
          <AuthProvider>
          <ToastProvider>
       
            {children}
         
            </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}