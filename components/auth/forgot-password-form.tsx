"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/providers/auth-provider"
import { useToast } from "@/providers/toast-provider"
import { motion } from "framer-motion"

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { forgotPassword } = useAuth()
  const { addToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      addToast("Please enter your email address", "warning")
      return
    }

    setIsLoading(true)

    try {
      const result = await forgotPassword(email)

      if (result.success) {
        setIsSubmitted(true)
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

        {isSubmitted ? (
          <div className="text-center">
            <p className="text-gray-700 text-[0.9rem] mb-4">We've sent password reset instructions to your email.</p>
            <p className="text-gray-600 text-[0.8rem] mb-6">
              Please check your inbox and follow the instructions to reset your password.
            </p>
            <Link href="/auth/login" className="text-amber-600 hover:text-amber-700 text-[0.9rem] font-medium">
              Return to Login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-600 text-[0.8rem] mb-6">
              Enter your email address and we'll send you instructions to reset your password.
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
                  placeholder="your@email.com"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-900 text-white py-2 px-4 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors text-[0.9rem] font-medium"
              >
                {isLoading ? "Sending..." : "Send Reset Instructions"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-[0.8rem]">
                Remember your password?{" "}
                <Link href="/auth/login" className="text-amber-600 hover:text-amber-700">
                  Login
                </Link>
              </p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
