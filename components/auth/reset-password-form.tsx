"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/providers/auth-provider"
import { useToast } from "@/providers/toast-provider"
import { motion } from "framer-motion"

interface ResetPasswordFormProps {
  token: string
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { resetPassword } = useAuth()
  const { addToast } = useToast()
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password || !confirmPassword) {
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

    setIsLoading(true)

    try {
      const result = await resetPassword(token, password)

      if (result.success) {
        setIsSuccess(true)
        addToast(result.message, "success")
      } else {
        addToast(result.message, "error")
      }
    } catch (error) {
      addToast("An unexpected error occurred", "error")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-semibold text-amber-600 mb-6 text-center">Reset Your Password</h2>

        {isSuccess ? (
          <div className="text-center">
            <p className="text-gray-700 text-[0.9rem] mb-4">Your password has been reset successfully!</p>
            <p className="text-gray-600 text-[0.8rem] mb-6">You can now login with your new password.</p>
            <Link
              href="/auth/login"
              className="bg-blue-900 text-white py-2 px-6 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors text-[0.9rem] font-medium"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-gray-700 text-[0.8rem] font-medium mb-1">
                New Password
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
                Confirm New Password
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
              disabled={isLoading}
              className="w-full bg-blue-900 text-white py-2 px-4 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors text-[0.9rem] font-medium"
            >
              {isLoading ? "Resetting Password..." : "Reset Password"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
