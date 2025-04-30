import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { UserRole } from "@prisma/client"
import ActivityDashboardPage from "@/components/settings"
import Layout from "@/components/Layout"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Settings | Tender Aggregator",
  description: "Manage system settings and user access",
}

export default async function SettingsPageWrapper() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/auth/login")
  }
  
  const hasAccess = user.role === UserRole.SUPER_ADMIN 
  
  return (
    <Layout>
      {hasAccess ? (
        // Show settings page for authorized users
        <ActivityDashboardPage />
      ) : (
        // Show unauthorized banner with home button
        <div className="flex flex-col items-center justify-center p-8 text-center ">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md max-w-xl">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Access Denied</h3>
                <div className="mt-2 text-xs text-red-700">
                  <p>You don't have permission to access the settings page.</p>
                </div>
                <div className="mt-4">
                  <Link 
                    href="/dashboard" 
                    className="inline-flex items-center px-4 py-2 border border-transparent text-[0.8rem] font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Return to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}