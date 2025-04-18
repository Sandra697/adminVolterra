import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { getCarById } from "@/lib/action"

export default async function CarDetailsPage({ params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id)
  const car = await getCarById(id)

  if (!car) {
    notFound()
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/cars">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-[0.85rem]  font-bold">{car.name}</h1>
        </div>
        <Link href={`/dashboard/cars/${car.id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Car
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="grid grid-cols-1 gap-4">
            {car.CarImage && car.CarImage.length > 0 ? (
              <div className="aspect-video relative overflow-hidden rounded-lg">
                <Image src={car.CarImage[0].url || "/placeholder.svg"} alt={car.name} fill className="object-cover" />
              </div>
            ) : (
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                No main image available
              </div>
            )}

            {car.CarImage && car.CarImage.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {car.CarImage.slice(1).map((image) => (
                  <div key={image.id} className="aspect-square relative overflow-hidden rounded-lg">
                    <Image src={image.url || "/placeholder.svg"} alt={car.name} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-[0.75rem]  font-medium text-gray-500">Price</h3>
                  <p className="text-[0.85rem]  font-bold">${car.price.toLocaleString()}</p>
                </div>

                <div>
                  <h3 className="text-[0.75rem]  font-medium text-gray-500">Status</h3>
                  <Badge variant={car.status === "NEW" ? "default" : "secondary"}>{car.status}</Badge>
                </div>

                <div>
                  <h3 className="text-[0.75rem]  font-medium text-gray-500">Availability</h3>
                  <Badge variant={car.availability ? "success" : "destructive"}>
                    {car.availability ? "Available" : "Not Available"}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-[0.75rem]  font-medium text-gray-500">Brand</h3>
                  <p>{car.Brand?.name || "N/A"}</p>
                </div>

                <div>
                  <h3 className="text-[0.75rem]  font-medium text-gray-500">Model</h3>
                  <p>{car.model}</p>
                </div>

                <div>
                  <h3 className="text-[0.75rem]  font-medium text-gray-500">Year</h3>
                  <p>{car.yearOfManufacture}</p>
                </div>

                <div>
                  <h3 className="text-[0.75rem]  font-medium text-gray-500">Location</h3>
                  <p>{car.currentLocation}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-[0.85rem]  font-bold mb-4">Description</h2>
          <p className="text-gray-700 whitespace-pre-line">{car.description}</p>

          <h3 className="text-[0.8rem]  font-bold mt-6 mb-4">Features</h3>
          {car.Feature && car.Feature.length > 0 ? (
            <ul className="grid grid-cols-2 gap-2">
              {car.Feature.map((feature) => (
                <li key={feature.id} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary"></span>
                  {feature.name}
                </li>
              ))}
            </ul>
          ) : (
            <p>No features listed</p>
          )}
        </div>

        <div>
          <h2 className="text-[0.85rem]  font-bold mb-4">Specifications</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-[0.75rem]  font-medium text-gray-500">Engine Power</h3>
                <p>{car.enginePower} cc</p>
              </div>
              <div>
                <h3 className="text-[0.75rem]  font-medium text-gray-500">Horse Power</h3>
                <p>{car.horsePower} hp</p>
              </div>
              <div>
                <h3 className="text-[0.75rem]  font-medium text-gray-500">Engine Size</h3>
                <p>{car.engineSize} L</p>
              </div>
              <div>
                <h3 className="text-[0.75rem]  font-medium text-gray-500">Fuel Type</h3>
                <p>{car.fuelType}</p>
              </div>
              <div>
                <h3 className="text-[0.75rem]  font-medium text-gray-500">Transmission</h3>
                <p>{car.transmission}</p>
              </div>
              <div>
                <h3 className="text-[0.75rem]  font-medium text-gray-500">Drive</h3>
                <p>{car.drive}</p>
              </div>
              <div>
                <h3 className="text-[0.75rem]  font-medium text-gray-500">Mileage</h3>
                <p>{car.mileage.toLocaleString()} km</p>
              </div>
              <div>
                <h3 className="text-[0.75rem]  font-medium text-gray-500">Seats</h3>
                <p>{car.seats}</p>
              </div>
              <div>
                <h3 className="text-[0.75rem]  font-medium text-gray-500">Color</h3>
                <p>{car.color}</p>
              </div>
              {car.torque && (
                <div>
                  <h3 className="text-[0.75rem]  font-medium text-gray-500">Torque</h3>
                  <p>{car.torque}</p>
                </div>
              )}
              {car.aspiration && (
                <div>
                  <h3 className="text-[0.75rem]  font-medium text-gray-500">Aspiration</h3>
                  <p>{car.aspiration}</p>
                </div>
              )}
              {car.acceleration && (
                <div>
                  <h3 className="text-[0.75rem]  font-medium text-gray-500">Acceleration (0-100)</h3>
                  <p>{car.acceleration} sec</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
