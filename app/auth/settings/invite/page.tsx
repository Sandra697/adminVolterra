"use client"

import type React from "react"

import { useState } from "react"
import { useToast } from "@/providers/toast-provider"
import { motion } from "framer-motion"
import RoleGate from "@/components/auth/role-gate"
import { UserRole } from "@prisma/client"

export default function InviteUserPage() {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("USER")
  const [isLoading, setIsLoading] = useState(false)
  const { addToast } = useToast()


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !role) {
      addToast("Please fill in all fields", "warning")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          role,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        addToast("Invitation sent successfully", "success")
        setEmail("")
        setRole("USER")
      } else {
        addToast(data.error || "Failed to send invitation", "error")
      }
    } catch (error) {
      console.error("Error sending invitation:", error)
      addToast("An unexpected error occurred", "error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <RoleGate allowedRoles={[UserRole.SUPER_ADMIN]}>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold text-amber-600 mb-6">Invite Users</h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-lg items-left justify-left shadow-md max-w-md mx-auto"
        >
          <h2 className="text-xl font-semibold text-amber-600 mb-4">Send Invitation</h2>
          <p className="text-gray-600 text-[0.8rem] mb-6">
            Invite a new user to join the Volterra Automotive platform. They will receive an email with instructions to set
            up their account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-gray-700 text-[0.8rem] font-medium mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-[0.8rem] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="user@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-gray-700 text-[0.8rem] font-medium mb-1">
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 text-[0.8rem] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              >
                <option value="USER">User</option>
              
                <option value="ADMIN">Admin</option>
                {/* Only show SUPER_ADMIN option for SUPER_ADMIN users */}
                <RoleGate allowedRoles={[UserRole.SUPER_ADMIN]}>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </RoleGate>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-900 text-white py-2 px-4 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors text-[0.9rem] font-medium"
            >
              {isLoading ? "Sending Invitation..." : "Send Invitation"}
            </button>
          </form>
        </motion.div>
      </div>
    </RoleGate>
  )
}
