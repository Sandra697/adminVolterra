"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Tag, Users, FileText } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardCards() {
  const [stats, setStats] = useState({
    carsCount: 0,
    brandsCount: 0,
    membersCount: 0,
    pendingListingsCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/dashboard/stats")
        if (!response.ok) throw new Error("Failed to fetch stats")

        const data = await response.json()
        setStats(data.stats)
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-[0.75rem]  font-medium">Total Cars</CardTitle>
          <Car className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <>
              <div className="text-[0.85rem]  font-bold">{stats.carsCount}</div>
              <p className="text-xs text-muted-foreground">Total cars in inventory</p>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-[0.75rem]  font-medium">Brands</CardTitle>
          <Tag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <>
              <div className="text-[0.85rem]  font-bold">{stats.brandsCount}</div>
              <p className="text-xs text-muted-foreground">Available car brands</p>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-[0.75rem]  font-medium">Members</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <>
              <div className="text-[0.85rem]  font-bold">{stats.membersCount}</div>
              <p className="text-xs text-muted-foreground">Registered members</p>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-[0.75rem]  font-medium">Pending Listings</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <>
              <div className="text-[0.85rem]  font-bold">{stats.pendingListingsCount}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
