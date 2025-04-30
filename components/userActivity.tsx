"use client"

import Link from "next/link"
import { useState } from "react"
import { ChevronDown, ChevronUp, Clock, Filter, Plus, RefreshCw, Search, User } from "lucide-react"

// Define types based on your Prisma schema
type UserActivity = {
  id: number
  userId: number
  action: string
  details?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  createdAt: Date
  User?: {  // Capital "U" to match Prisma's structure
    name?: string | null
    email: string
  }
}

type SellListingOriginal = {
  id: number
  name: string
  email: string
  phoneNumber: string
  carName: string
  status: "PENDING" | "APPROVED" | "REJECTED" | "SOLD"
  createdAt: Date
  updatedAt: Date
}

type ServiceBooking = {
  id: number
  name: string
  email: string
  phoneNumber: string
  carDetails: string
  preferredDate: Date
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "RESCHEDULED"
  createdAt: Date
  service: {
    name: string
  }
}

// Props for the component
interface UserActivityDashboardProps {
  userActivities: UserActivity[]
  sellListings: SellListingOriginal[]
  serviceBookings: ServiceBooking[]
  onRefresh?: () => void
}

export default function UserActivityDashboard({
  userActivities = [],
  sellListings = [],
  serviceBookings = [],
  onRefresh = () => {},
}: UserActivityDashboardProps) {
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"activities" | "listings" | "bookings">("activities")

  // State for expanded sections
  const [sectionsExpanded, setSectionsExpanded] = useState({
    activities: true,
    listings: true,
    bookings: true,
  })

  // Toggle section expansion
  const toggleSection = (section: keyof typeof sectionsExpanded) => {
    setSectionsExpanded({
      ...sectionsExpanded,
      [section]: !sectionsExpanded[section],
    })
  }

  // Filter functions
  const filteredActivities = userActivities.filter(
    (activity) =>
      activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.User?.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredListings = sellListings.filter(
    (listing) =>
      listing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.carName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.status.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredBookings = serviceBookings.filter(
    (booking) =>
      booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.carDetails.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Format date function
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    let bgColor = "bg-gray-100"
    let textColor = "text-gray-800"

    switch (status) {
      case "PENDING":
        bgColor = "bg-yellow-100"
        textColor = "text-yellow-800"
        break
      case "APPROVED":
      case "CONFIRMED":
      case "COMPLETED":
        bgColor = "bg-green-100"
        textColor = "text-green-800"
        break
      case "REJECTED":
      case "CANCELLED":
        bgColor = "bg-red-100"
        textColor = "text-red-800"
        break
      case "RESCHEDULED":
        bgColor = "bg-blue-100"
        textColor = "text-blue-800"
        break
      case "SOLD":
        bgColor = "bg-purple-100"
        textColor = "text-purple-800"
        break
    }

    return (
      <span className={`px-2 py-1 rounded-full ${bgColor} ${textColor} text-xs`}>
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    )
  }

  return (
    <div className="w-full bg-white rounded-lg font-medium text-gray-700 shadow">
      {/* Header with Add User button */}
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-sm font-semibold">User Activity Dashboard</h1>
        <div className="flex items-center gap-2">
          <button onClick={onRefresh} className="p-1 rounded-full hover:bg-gray-100" title="Refresh data">
            <RefreshCw className="h-4 w-4" />
          </button>
          <Link
            href="/auth/settings/invite"
            className="flex items-center gap-1 px-3 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200"
          >
            <Plus className="h-3 w-3" />
            Add User
          </Link>
        </div>
      </div>

      {/* Search and filter bar */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, status..."
              className="w-full pl-8 pr-4 py-1 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-1 px-3 py-1 text-xs rounded-md border hover:bg-gray-50">
            <Filter className="h-3 w-3" />
            Filter
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`flex-1 py-2 text-xs font-medium ${
            activeTab === "activities" ? "text-amber-700" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("activities")}
        >
          User Activities
        </button>
        <button
          className={`flex-1 py-2 text-xs font-medium ${
            activeTab === "listings" ? "text-amber-700 " : "text-gray-500"
          }`}
          onClick={() => setActiveTab("listings")}
        >
          Sell Listings
        </button>
        <button
          className={`flex-1 py-2 text-xs font-medium ${
            activeTab === "bookings" ? "text-amber-700" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("bookings")}
        >
          Service Bookings
        </button>
      </div>

      {/* Content based on active tab */}
      <div className="p-4">
        {/* User Activities Section */}
        {activeTab === "activities" && (
          <div className="mb-4">
            <div
              className="flex justify-between items-center mb-2 cursor-pointer"
              onClick={() => toggleSection("activities")}
            >
              <h2 className="text-sm font-medium flex items-center gap-1">
                <User className="h-4 w-4" />
                User Activities
              </h2>
              {sectionsExpanded.activities ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>

            {sectionsExpanded.activities && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP Address
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredActivities.length > 0 ? (
                      filteredActivities.map((activity) => (
                        <tr key={activity.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 whitespace-nowrap text-xs">
                            {activity.User?.name || activity.User?.email }
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs">{activity.action}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs">{activity.details || "-"}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs">{activity.ipAddress || "-"}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-gray-400" />
                              {formatDate(activity.createdAt)}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-3 py-4 text-center text-xs text-gray-500">
                          No user activities found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Sell Listings Section */}
        {activeTab === "listings" && (
          <div className="mb-4">
            <div
              className="flex justify-between items-center mb-2 cursor-pointer"
              onClick={() => toggleSection("listings")}
            >
              <h2 className="text-sm font-medium">Sell Listings</h2>
              {sectionsExpanded.listings ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>

            {sectionsExpanded.listings && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Seller
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Car
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Updated
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredListings.length > 0 ? (
                      filteredListings.map((listing) => (
                        <tr key={listing.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 whitespace-nowrap text-xs">{listing.id}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs">
                            <div>
                              <div>{listing.name}</div>
                              <div className="text-gray-500">{listing.email}</div>
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs">{listing.carName}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs">
                            <StatusBadge status={listing.status} />
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs">{formatDate(listing.createdAt)}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs">{formatDate(listing.updatedAt)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-3 py-4 text-center text-xs text-gray-500">
                          No sell listings found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Service Bookings Section */}
        {activeTab === "bookings" && (
          <div className="mb-4">
            <div
              className="flex justify-between items-center mb-2 cursor-pointer"
              onClick={() => toggleSection("bookings")}
            >
              <h2 className="text-sm font-medium">Service Bookings</h2>
              {sectionsExpanded.bookings ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>

            {sectionsExpanded.bookings && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Car Details
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBookings.length > 0 ? (
                      filteredBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 whitespace-nowrap text-xs">{booking.id}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs">
                            <div>
                              <div>{booking.name}</div>
                              <div className="text-gray-500">{booking.email}</div>
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs">{booking.service.name}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs">{booking.carDetails}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs">{formatDate(booking.preferredDate)}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs">
                            <StatusBadge status={booking.status} />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-3 py-4 text-center text-xs text-gray-500">
                          No service bookings found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer with pagination */}
      <div className="p-4 border-t flex justify-between items-center">
        <div className="text-xs text-gray-500">
          Showing{" "}
          {activeTab === "activities"
            ? filteredActivities.length
            : activeTab === "listings"
              ? filteredListings.length
              : filteredBookings.length}{" "}
          results
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 text-xs border rounded-md hover:bg-gray-50 disabled:opacity-50" disabled>
            Previous
          </button>
          <button className="px-3 py-1 text-xs border rounded-md hover:bg-gray-50">Next</button>
        </div>
      </div>
    </div>
  )
}
