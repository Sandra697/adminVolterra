// This file would contain functions to fetch data from your API
// For now, we'll use mock data

import { v4 as uuidv4 } from "uuid"

// Mock data for cars
const cars = [
  {
    id: "1",
    name: "BMW X5",
    price: 65000,
    description: "Luxury SUV with advanced features and powerful performance.",
    shortDescription: "Luxury SUV with advanced features",
    brandId: "1",
    model: "X5",
    mileage: 0,
    status: "NEW",
    isFavorite: false,
    badge: "New Arrival",
    enginePower: 335,
    seats: 5,
    color: "Black",
    yearOfManufacture: 2023,
    currentLocation: "New York, NY",
    availability: true,
    drive: "AWD",
    engineSize: 3.0,
    fuelType: "Gasoline",
    horsePower: 335,
    transmission: "Automatic",
    torque: "330 lb-ft",
    aspiration: "Turbocharged",
    acceleration: 5.3,
    CarImage: [
      { id: "1", url: "/placeholder.svg?height=400&width=600&text=BMW X5" },
      { id: "2", url: "/placeholder.svg?height=400&width=600&text=BMW X5 Interior" },
    ],
    Feature: [
      { id: "1", name: "Leather Seats" },
      { id: "2", name: "Navigation System" },
      { id: "3", name: "Bluetooth" },
    ],
  },
  {
    id: "2",
    name: "Mercedes-Benz C300",
    price: 55000,
    description: "Elegant sedan with premium interior and smooth driving experience.",
    shortDescription: "Elegant sedan with premium interior",
    brandId: "2",
    model: "C300",
    mileage: 15000,
    status: "USED",
    isFavorite: true,
    badge: null,
    enginePower: 255,
    seats: 5,
    color: "Silver",
    yearOfManufacture: 2022,
    currentLocation: "Los Angeles, CA",
    availability: true,
    drive: "RWD",
    engineSize: 2.0,
    fuelType: "Gasoline",
    horsePower: 255,
    transmission: "Automatic",
    torque: "295 lb-ft",
    aspiration: "Turbocharged",
    acceleration: 5.7,
    CarImage: [{ id: "3", url: "/placeholder.svg?height=400&width=600&text=Mercedes C300" }],
    Feature: [
      { id: "1", name: "Leather Seats" },
      { id: "4", name: "Backup Camera" },
      { id: "5", name: "Sunroof" },
    ],
  },
]

// Mock data for brands
const brands = [
  {
    id: "1",
    name: "BMW",
    logoUrl: "/placeholder.svg?height=200&width=200&text=BMW",
    vehicleImageUrl: "/placeholder.svg?height=400&width=600&text=BMW",
  },
  {
    id: "2",
    name: "Mercedes",
    logoUrl: "/placeholder.svg?height=200&width=200&text=Mercedes",
    vehicleImageUrl: "/placeholder.svg?height=400&width=600&text=Mercedes",
  },
]

// Mock data for sell listings
const sellListings = [
  {
    id: "1",
    name: "John Smith",
    email: "john@example.com",
    phoneNumber: "+1 (555) 123-4567",
    carName: "BMW 3 Series",
    description:
      "Well maintained BMW 3 Series with low mileage. The car has been regularly serviced and is in excellent condition. It has a clean title and no accidents.",
    color: "Black",
    location: "New York, NY",
    mileage: 35000,
    brandName: "BMW",
    carType: "Sedan",
    enginePower: 248,
    engineType: "2.0L Turbo",
    condition: "GOOD",
    sellingPrice: 35000,
    status: "PENDING",
    createdAt: "2023-05-15",
  },
]

// Mock data for tickets
const tickets = [
  {
    id: "1",
    ticketNumber: "TKT-1001",
    name: "John Smith",
    email: "john@example.com",
    phoneNumber: "+1 (555) 123-4567",
    message:
      "I'm having trouble with my payment for the BMW X5 I was interested in. I tried to make a deposit but the transaction failed multiple times. Can someone from the finance department contact me? I'm still very interested in the vehicle.",
    status: "OPEN",
    createdAt: "2023-05-15",
  },
]

// Functions to fetch data
export async function getCar(id: string) {
  // In a real app, this would be an API call
  return cars.find((car) => car.id === id) || null
}

export async function getBrand(id: string) {
  // In a real app, this would be an API call
  return brands.find((brand) => brand.id === id) || null
}

export async function getSellListing(id: string) {
  // In a real app, this would be an API call
  return sellListings.find((listing) => listing.id === id) || null
}

export async function getTicket(id: string) {
  // In a real app, this would be an API call
  return tickets.find((ticket) => ticket.id === id) || null
}

// In a real app, you would have functions to create, update, and delete data
export async function createCar(data: any) {
  // In a real app, this would be an API call
  const newCar = {
    id: uuidv4(),
    ...data,
  }
  return newCar
}

export async function updateCar(id: string, data: any) {
  // In a real app, this would be an API call
  return {
    id,
    ...data,
  }
}

export async function deleteCar(id: string) {
  // In a real app, this would be an API call
  return { success: true }
}
