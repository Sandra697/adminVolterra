"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/providers/auth-provider"
import { useToast } from "@/providers/toast-provider"
import { motion } from "framer-motion"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const { verifyEmail } = useAuth()
  const { addToast } = useToast()
  const [isVerifying, setIsVerifying] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setIsVerifying(false)
      setErrorMessage("Invalid verification link")
      return
    }

    const verifyToken = async () => {
      try {
        const result = await verifyEmail(token)

        if (result.success) {
          setIsSuccess(true)
          addToast(result.message, "success")
        } else {
          setErrorMessage(result.message)
          addToast(result.message, "error")
        }
      } catch (error) {
        console.error("Verification error:", error)
        setErrorMessage("An unexpected error occurred")
        addToast("An unexpected error occurred", "error")
      } finally {
        setIsVerifying(false)
      }
    }

    verifyToken()
  }, [token, verifyEmail, addToast])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold text-amber-600 mb-6 text-center">Email Verification</h2>

        {isVerifying ? (
          <div className="text-center py-4">
            <p className="text-gray-600 text-[0.9rem]">Verifying your email...</p>
          </div>
        ) : isSuccess ? (
          <div className="text-center">
            <div className="mb-6">
              <svg
                className="w-16 h-16 text-green-500 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Email Verified!</h3>
            <p className="text-gray-600 text-[0.9rem] mb-6">
              Your email has been successfully verified. You can now log in to your account.
            </p>
            <Link
              href="/login"
              className="bg-blue-900 text-white py-2 px-6 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors text-[0.9rem] font-medium"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-6">
              <svg
                className="w-16 h-16 text-red-500 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Verification Failed</h3>
            <p className="text-gray-600 text-[0.9rem] mb-6">
              {errorMessage || "We could not verify your email. The link may be invalid or expired."}
            </p>
            <Link
              href="/register"
              className="bg-blue-900 text-white py-2 px-6 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors text-[0.9rem] font-medium"
            >
              Register Again
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  )
}
