/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function RegisterForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)



  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault()

  //   if (!name || !email || !password || !confirmPassword) {
  //     addToast("Please fill in all fields", "warning")
  //     return
  //   }

  //   if (password !== confirmPassword) {
  //     addToast("Passwords do not match", "error")
  //     return
  //   }

  //   if (password.length < 8) {
  //     addToast("Password must be at least 8 characters long", "warning")
  //     return
  //   }

  //   setIsLoading(true)

  //   try {
  //     const result = await register(name, email, password)

  //     if (result.success) {
  //       addToast(result.message, "success")
  //       router.push("/auth/login")
  //     } else {
  //       addToast(result.message, "error")
  //     }
  //   } catch (error) {
  //     addToast("An unexpected error occurred", "error")
  //     console.error(error)
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-semibold text-amber-600 mb-6 text-center">Create an Account</h2>

        <form  className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-gray-700 text-[0.8rem] font-medium mb-1">
              Full Name
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

          <div>
            <label htmlFor="password" className="block text-gray-700 text-[0.8rem] font-medium mb-1">
              Password
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
            disabled={isLoading}
            className="w-full bg-blue-900 text-white py-2 px-4 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors text-[0.9rem] font-medium"
          >
            {isLoading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-[0.8rem]">
            Already have an account?{" "}
            <Link href="/login" className="text-amber-600 hover:text-amber-700">
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
