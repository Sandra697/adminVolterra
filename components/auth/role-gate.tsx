"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/providers/auth-provider"
import type { UserRole } from "@prisma/client"
import { hasRole } from "@/lib/auth-utils"


interface RoleGateProps {
  children: ReactNode
  allowedRoles: UserRole[]
  fallback?: ReactNode
}

export default function RoleGate({ children, allowedRoles, fallback }: RoleGateProps) {
  const { user } = useAuth()

  console.log("RoleGate", { user, allowedRoles })

  if (!hasRole(user, allowedRoles)) {
    return fallback || null
  }

  return <>{children}</>
}
