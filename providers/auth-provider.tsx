"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { UserRole } from "@prisma/client"
import type { AuthUser } from "@/lib/auth-utils"
import { hasRole } from "@/lib/auth-utils"

// Define the AuthContext type
interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>
  resetPassword: (token: string, password: string) => Promise<{ success: boolean; message: string }>
  verifyEmail: (token: string) => Promise<{ success: boolean; message: string }>
  acceptInvitation: (token: string, name: string, password: string) => Promise<{ success: boolean; message: string }>
  hasPermission: (requiredRoles: UserRole[]) => boolean
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Check if user is authenticated on initial load
  useEffect(() => {
    console.log("AuthProvider Mounted: Checking auth session...")
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/session", {
          // Adding cache: no-store to prevent stale cache issues
          cache: "no-store",
          // Add credentials to ensure cookies are sent
          credentials: "include"
        })
        
        console.log("Session response status:", res.status)
        
        if (res.ok) {
          const data = await res.json()
          console.log("AuthProvider: Session data received", data)
          if (data.user) {
            setUser(data.user)
          } else {
            console.log("AuthProvider: No user in session data")
            setUser(null)
          }
        } else {
          console.warn("AuthProvider: Session check failed with status:", res.status)
          setUser(null)
        }
      } catch (error) {
        console.error("AuthProvider: Failed to fetch session:", error)
        setUser(null)
      } finally {
        console.log("AuthProvider: Finished session check, setting isLoading to false")
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Redirect logic with improved logging
  useEffect(() => {
    if (isLoading) {
      console.log("Redirect Effect: Skipping, still loading auth state")
      return
    }

    console.log("Redirect Effect Running:", { 
      isLoading, 
      user: user ? `${user.email} (${user.role})` : "null", 
      pathname 
    })

    const publicRoutes = [
      "/auth/login",
      "/auth/forgot-password",
      "/auth/reset-password",
      "/auth/verify-email",
      "/auth/invite",
      "/setup",
      "/setup/super-admin",
    ]
    
    // Check if the current path *starts with* any public route
    const isPublicRoute = publicRoutes.some((route) => pathname?.startsWith(route))
    
    // Root path handling - decide if this should be public or protected
    const isRootPath = pathname === "/"
    
    console.log("Path analysis:", { 
      pathname, 
      isPublicRoute, 
      isRootPath,
      matchingRoutes: publicRoutes.filter(route => pathname?.startsWith(route))
    })

    // Condition 1: Trying to access a protected route while logged out
    if (!user && !isPublicRoute && !isRootPath) {
      console.log(`Redirecting: Not logged in, accessing protected route (${pathname}) → /auth/login`)
      router.push("/auth/login")
      return
    }

    // Condition 2: Logged in user trying to access a public auth route
    if (user && isPublicRoute) {
      console.log(`Redirecting: Logged in, accessing public auth route (${pathname}) → /dashboard`)
      router.push("/dashboard")
      return
    }

    // Condition 3: Logged in user on root path
    if (user && isRootPath) {
      console.log(`Redirecting: Logged in, on root path → /dashboard`)
      router.push("/dashboard")
      return
    }

    console.log("No redirect needed for current path")
  }, [user, isLoading, pathname, router])

  // Auth action functions (unchanged)
  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include" // Important: ensure cookies are sent/received
      })
      const data = await res.json()

      if (res.ok && data.user) {
        console.log("Login successful, user data:", data.user)
        setUser(data.user)
        return { success: true, message: "Login successful" }
      }
      console.warn("Login failed:", data.error)
      return { success: false, message: data.error || "Login failed" }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, message: "An unexpected error occurred" }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Other auth methods remain the same...
  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await fetch("/api/auth/logout", { 
        method: "POST",
        credentials: "include" // Important: ensure cookies are sent/received
      })
      setUser(null)
      router.push("/auth/login")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoading(false)
    }
  }, [router])

  // Other methods unchanged...
  const forgotPassword = useCallback(async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        return { success: true, message: "Password reset instructions sent to your email" }
      }
      return { success: false, message: data.error || "Failed to process request" }
    } catch (error) {
      console.error("Forgot password error:", error)
      return { success: false, message: "An unexpected error occurred" }
    }
  }, [])

  const resetPassword = useCallback(async (token: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (res.ok) {
        return { success: true, message: "Password reset successful. You can now login." }
      }
      return { success: false, message: data.error || "Failed to reset password" }
    } catch (error) {
      console.error("Reset password error:", error)
      return { success: false, message: "An unexpected error occurred" }
    }
  }, [])

  const verifyEmail = useCallback(async (token: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      if (res.ok) {
        return { success: true, message: "Email verification successful. You can now login." }
      }
      return { success: false, message: data.error || "Failed to verify email" }
    } catch (error) {
      console.error("Verify email error:", error)
      return { success: false, message: "An unexpected error occurred" }
    }
  }, [])

  const acceptInvitation = useCallback(async (token: string, name: string, password: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/accept-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name, password }),
        credentials: "include" // Important: ensure cookies are sent/received
      })
      const data = await res.json()
      if (res.ok && data.user) {
        setUser(data.user)
        return { success: true, message: "Invitation accepted successfully" }
      }
      return { success: false, message: data.error || "Failed to accept invitation" }
    } catch (error) {
      console.error("Accept invitation error:", error)
      return { success: false, message: "An unexpected error occurred" }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const hasPermission = useCallback((requiredRoles: UserRole[]) => {
    return hasRole(user, requiredRoles)
  }, [user])

  // Context value
  const contextValue = useMemo(() => ({
    user,
    isLoading,
    login,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    acceptInvitation,
    hasPermission,
  }), [user, isLoading, login, logout, forgotPassword, resetPassword, verifyEmail, acceptInvitation, hasPermission])

  console.log("AuthProvider Rendering. isLoading:", isLoading, "User:", user ? `${user.email} (${user.role})` : "null")

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}