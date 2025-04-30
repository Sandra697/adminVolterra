"use client"

import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import ResetPasswordForm from "@/components/auth/reset-password-form"
import { useToast } from "@/providers/toast-provider"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const router = useRouter()
  const { addToast } = useToast()

  useEffect(() => {
    if (!token) {
      addToast("Invalid password reset link", "error")
      router.push("/forgot-password")
    }
  }, [token, router, addToast])

  if (!token) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <ResetPasswordForm token={token} />
    </div>
  )
}
