"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/providers/auth-provider"
import { useToast } from "@/providers/toast-provider"
import { motion } from "framer-motion"

interface InvitationFormProps {
  token: string
}

interface InvitationDetails {
  email: string
  role: string
  inviterName: string
  valid: boolean
  expired: boolean
}

export default function InvitationForm({ token }: InvitationFormProps) {
  const [invitationDetails, setInvitationDetails] = useState<InvitationDetails | null>(null)
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { acceptInvitation } = useAuth()
  const { addToast } = useToast()
  const router = useRouter()

  // Fetch invitation details
  useEffect(() => {
    const fetchInvitationDetails = async () => {
      try {
        const res = await fetch(`/api/auth/invitation?token=${token}`)
        const data = await res.json()

        if (res.ok && data.invitation) {
          setInvitationDetails({
            email: data.invitation.email,
            role: data.invitation.role,
            inviterName: data.invitation.inviterName,
            valid: true,
            expired: data.invitation.expired || data.invitation.accepted,
          })
        } else {
          setInvitationDetails({
            email: "",
            role: "",
            inviterName: "",
            valid: false,
            expired: true,
          })
          addToast(data.error || "Invalid or expired invitation", "error")
        }
      } catch (error) {
        console.error("Error fetching invitation details:", error)
        addToast("Failed to load invitation details", "error")
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchInvitationDetails()
    }
  }, [token, addToast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !password || !confirmPassword) {
      addToast("Please fill in all fields", "warning")
      return
    }

    if (password !== confirmPassword) {
      addToast("Passwords do not match", "error")
      return
    }

    if (password.length < 8) {
      addToast("Password must be at least 8 characters long", "warning")
      return
    }

    setIsSubmitting(true)

    try {
      const result = await acceptInvitation(token, name, password)

      if (result.success) {
        addToast(result.message, "success")
        router.push("/dashboard")
      } else {
        addToast(result.message, "error")
      }
    } catch (error) {
      addToast("An unexpected error occurred", "error")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600 text-[0.9rem]">Loading invitation details...</p>
        </div>
      </div>
    )
  }

  if (!invitationDetails?.valid || invitationDetails.expired) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-semibold text-amber-600 mb-4">Invalid Invitation</h2>
          <p className="text-gray-600 text-[0.9rem] mb-6">This invitation link is invalid or has expired.</p>
          <Link
            href="/auth/login"
            className="bg-blue-900 text-white py-2 px-6 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors text-[0.9rem] font-medium"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-semibold text-amber-600 mb-4 text-center">Accept Invitation</h2>

        <div className="mb-6">
          <p className="text-gray-700 text-[0.9rem] mb-2">
            You've been invited to join Volterra Automotive as a{" "}
            <span className="font-semibold">{invitationDetails.role.replace("_", " ")}</span>.
          </p>
          <p className="text-gray-600 text-[0.8rem]">Please complete your account setup.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-700 text-[0.8rem] font-medium mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={invitationDetails.email}
              className="w-full px-3 py-2 text-[0.8rem] border border-gray-300 rounded-md bg-gray-50"
              disabled
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-gray-700 text-[0.8rem] font-medium mb-1">
              Your Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-[0.8rem] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 text-[0.8rem] font-medium mb-1">
              Set Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-[0.8rem] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-gray-700 text-[0.8rem] font-medium mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 text-[0.8rem] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-900 text-white py-2 px-4 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors text-[0.9rem] font-medium"
          >
            {isSubmitting ? "Creating Account..." : "Accept Invitation"}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
