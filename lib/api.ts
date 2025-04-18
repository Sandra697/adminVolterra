import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseIntParam(param: string | undefined): number | undefined {
  if (!param) return undefined
  const parsed = Number.parseInt(param, 10)
  return isNaN(parsed) ? undefined : parsed
}
