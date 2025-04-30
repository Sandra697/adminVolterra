"use client"

import { useEffect, useState } from "react"
import UserActivityDashboard from "@/components/userActivity"

import BusinessPerformanceDashboard from "@/components/performance"

export default function ActivityDashboardPage() {
  const [data, setData] = useState({
    userActivities: [],
    sellListings: [],
    serviceBookings: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/user-activity")

      if (!response.ok) {
        throw new Error("Failed to fetch data")
      }

      const result = await response.json()
      setData(result)
      setError(null)
    } catch (err) {
      setError("Error loading dashboard data. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="sm:container sm:mx-auto px-2 py-6 ">
      <div className="container mx-auto">
      <h1 className="text-lg font-bold mb-6">Business Dashboard</h1>
      <BusinessPerformanceDashboard />
    </div>
      <h1 className="text-lg mt-8 font-bold mb-6">Activity Dashboard</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-xs">
          {error}
          <button onClick={fetchData} className="ml-2 underline">
            Try again
          </button>
        </div>
      ) : (
        <UserActivityDashboard
          userActivities={data.userActivities}
          sellListings={data.sellListings}
          serviceBookings={data.serviceBookings}
          onRefresh={fetchData}
        />
      )}


    </div>
  )
}
