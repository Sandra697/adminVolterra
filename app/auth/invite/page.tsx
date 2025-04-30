"use client"

import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import InvitationForm from "@/components/auth/invitation-form"
import { useToast } from "@/providers/toast-provider"

export default function InvitePage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const router = useRouter()
  const { addToast } = useToast()

  useEffect(() => {
    if (!token) {
      addToast("Invalid invitation link", "error")
      router.push("/auth/login")
    }
  }, [token, router, addToast])

  if (!token) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <InvitationForm token={token} />
    </div>
  )
}
