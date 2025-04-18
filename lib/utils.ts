import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { v4 as uuidv4 } from "uuid"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function generateId(): string {
  return uuidv4()
}

export function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "APPROVED":
    case "RESOLVED":
    case "SUCCESS":
      return "success"
    case "REJECTED":
    case "OPEN":
      return "destructive"
    case "SOLD":
    case "CLOSED":
      return "outline"
    case "IN_PROGRESS":
    case "PENDING":
      return "default"
    default:
      return "secondary"
  }
}

export function formatStatus(status: string) {
  return status
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ")
}
