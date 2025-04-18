"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Edit, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { deleteCar } from "@/lib/action"
import { toast } from "@/components/ui/use-toast"

interface Car {
  id: number
  name: string
  model: string
  price: number
  status: "NEW" | "USED"
  availability: boolean
  Brand?: {
    id: number
    name: string
  }
  CarImage?: {
    id: number
    url: string
  }[]
}

export function CarsList() {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await fetch("/api/cars")
        if (!response.ok) {
          throw new Error("Failed to fetch cars")
        }
        const data = await response.json()
        setCars(data)
      } catch (error) {
        console.error("Error fetching cars:", error)
        toast({
          title: "Error",
          description: "Failed to load cars. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCars()
  }, [])

  const handleDelete = async (id: number) => {
    try {
      setIsDeleting(true)
      await deleteCar(id)
      setCars(cars.filter((car) => car.id !== id))
      toast({
        title: "Success",
        description: "Car deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting car:", error)
      toast({
        title: "Error",
        description: "Failed to delete car. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredCars = cars.filter(
    (car) =>
      car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.Brand?.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return <div className="text-center py-10">Loading cars...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search cars..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-100">
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCars.length === 0 ? (
              <TableRow className="bg-slate-100">
                <TableCell colSpan={7} className="text-center py-10">
                  No cars found
                </TableCell>
              </TableRow>
            ) : (
              filteredCars.map((car) => (
                <TableRow key={car.id}>
                  <TableCell>
                    {car.CarImage && car.CarImage.length > 0 ? (
                      <div className="relative w-[60px] h-[40px]">
                        <Image
                          src={car.CarImage[0].url || "/placeholder.svg"}
                          alt={car.name}
                          fill
                          className="rounded object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-[60px] h-[40px] bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                        No image
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{car.name}</TableCell>
                  <TableCell>{car.Brand?.name || "N/A"}</TableCell>
                  <TableCell>${car.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={car.status === "NEW" ? "default" : "secondary"}>{car.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={car.availability ? "default" : "destructive"}
                      className={car.availability ? "bg-green-500" : ""}
                    >
                      {car.availability ? "Available" : "Not Available"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/cars/${car.id}`}>
                        <Button variant="outline" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/dashboard/cars/${car.id}/edit`}>
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the car and all related data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(car.id)}
                              disabled={isDeleting}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {isDeleting ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
