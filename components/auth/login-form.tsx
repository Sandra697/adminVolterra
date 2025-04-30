"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/providers/auth-provider"
import { useToast } from "@/providers/toast-provider"
import { motion } from "framer-motion"
import Image from "next/image"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const { addToast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      addToast("Please fill in all fields", "warning")
      return
    }

    setIsLoading(true)

    try {
      const result = await login(email, password)

      if (result.success) {
        addToast("Login successful", "success")
        router.push("/dashboard")
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-8 rounded-lg shadow-md"
    >
      {/* Logo Container */}
      <div className="flex justify-center mb-2">
        <div className="w-40 h-20 relative">
          <Image 
            src="https://res.cloudinary.com/dunssu2gi/image/upload/v1744565990/blog-images/tbwfs89mvh5u8vt1mz4a.png" 
            alt="Volterra Automotive Logo" 
            width={128} 
            height={52}
            className="object-cover"
          />
        </div>
      </div>

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

        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="password" className="block text-gray-700 text-[0.8rem] font-medium">
              Password
            </label>
            <Link href="/auth/forgot-password" className="text-[0.8rem] text-amber-600 hover:text-amber-700">
              Forgot Password?
            </Link>
          </div>
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-amber-900 text-white py-2 px-4 rounded-md hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 transition-colors text-[0.9rem] font-medium"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </motion.div>
  )
}