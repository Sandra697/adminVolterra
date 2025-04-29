"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Plus, Search } from "lucide-react"
import { deleteService } from "@/lib/service-actions"
import { toast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface Service {
  id: number
  name: string
  description: string
  logoUrl: string
  price?: number | null
  duration?: string | null
  createdAt: string | Date
  updatedAt: string | Date
  _count?: {
    bookings: number
  }
}

interface ServicesListProps {
  services: Service[]
}

export function ServicesList({ services }: ServicesListProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid")

  const formattedServices = services.map((service) => ({
    ...service,
    createdAt:
      service.createdAt instanceof Date
        ? service.createdAt.toISOString().split("T")[0]
        : typeof service.createdAt === "string"
          ? service.createdAt.includes("T")
            ? service.createdAt.split("T")[0]
            : service.createdAt
          : "",
    bookingCount: service._count?.bookings || 0,
  }))

  const filteredServices = formattedServices.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteService = async (serviceId: number) => {
    if (confirm("Are you sure you want to delete this service? This action cannot be undone.")) {
      setIsDeleting(serviceId)
      try {
        await deleteService(serviceId)
        toast({
          title: "Service deleted",
          description: "The service has been permanently deleted",
        })
        router.refresh()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete service",
          variant: "destructive",
        })
      } finally {
        setIsDeleting(null)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}>
            {viewMode === "table" ? "Grid View" : "Table View"}
          </Button>
          <Button onClick={() => router.push("/service/new")}>
            <Plus className="mr-2 h-4 w-4" /> Add Service
          </Button>
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-100">
                <TableHead>Logo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.length === 0 ? (
                <TableRow className="bg-slate-100">
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No services found. Try adjusting your search or add a new service.
                  </TableCell>
                </TableRow>
              ) : (
                filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <div className="relative h-10 w-10 rounded-md overflow-hidden">
                        <Image
                          src={service.logoUrl || "/placeholder.svg?height=40&width=40"}
                          alt={service.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{service.description}</TableCell>
                    <TableCell>{service.price ? `$${service.price.toFixed(2)}` : "N/A"}</TableCell>
                    <TableCell>{service.duration || "N/A"}</TableCell>
                    <TableCell>{service.bookingCount}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isDeleting === service.id}>
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => router.push(`/service/${service.id}/edit`)}>
                            Edit Service
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/service/bookings?serviceId=${service.id}`)}>
                            View Bookings
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteService(service.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No services found. Try adjusting your search or add a new service.
            </div>
          ) : (
            filteredServices.map((service) => (
              <Card key={service.id} className="overflow-hidden">
                <div className="relative h-40 w-full">
                  <Image
                    src={service.logoUrl || "/placeholder.svg?height=160&width=320"}
                    alt={service.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle>{service.name}</CardTitle>
                  <CardDescription>
                    {service.price ? `$${service.price.toFixed(2)}` : "Price not specified"} •{" "}
                    {service.duration || "Duration not specified"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                  <div className="mt-2">
                    <Badge variant="outline">{service.bookingCount} bookings</Badge>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/service/${service.id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteService(service.id)}
                    disabled={isDeleting === service.id}
                  >
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
