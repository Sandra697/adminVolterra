"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { checkSetupStatus, createSuperAdmin } from "../api/setup/client"
import { motion } from "framer-motion"
import Layout from "@/components/Layout"

interface SetupStatus {
  system: {
    database: {
      status: string
    }
    email: {
      status: string
    }
    users: {
      superAdminExists: boolean
    }
  }
}

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCreatingSuperAdmin, setIsCreatingSuperAdmin] = useState(false)
  const [setupComplete, setSetupComplete] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function fetchSetupStatus() {
      try {
        setIsLoading(true)
        const status = await checkSetupStatus()
        setSetupStatus(status)

        if (status.system.users.superAdminExists) {
          setSetupComplete(true)
        }
      } catch (err) {
        setError("Failed to check system status. Please try again.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSetupStatus()
  }, [])

  const handleCreateSuperAdmin = async () => {
    try {
      setIsCreatingSuperAdmin(true)
      setError(null)

      const result = await createSuperAdmin()

      if (result.success) {
        setSetupComplete(true)
        // Refresh setup status
        const status = await checkSetupStatus()
        setSetupStatus(status)
      }
    } catch (err) {
      setError((err as Error).message || "Failed to create super admin. Please try again.")
      console.error(err)
    } finally {
      setIsCreatingSuperAdmin(false)
    }
  }

  const handleGoToLogin = () => {
    router.push("/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking system status...</p>
        </div>
      </div>
    )
  }

  return (
   <Layout>
 <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-lg shadow-md max-w-md w-full"
      >
        <h1 className="text-2xl font-bold text-amber-600 mb-6 text-center">System Setup</h1>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

        {setupComplete ? (
          <div className="text-center">
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
              <p className="font-medium">Setup Complete!</p>
              <p className="text-sm">Super admin account has been created.</p>
            </div>

            <div className="mt-6">
              <p className="text-gray-600 mb-4">You can now log in with the following credentials:</p>
              <div className="bg-gray-50 p-4 rounded border border-gray-200 text-left mb-6">
                <p>
                  <strong>Email:</strong> sandraakinyi18@gmail.com
                </p>
                <p>
                  <strong>Password:</strong> Oidho@254
                </p>
              </div>
              <button
                onClick={handleGoToLogin}
                className="w-full bg-blue-900 text-white py-2 px-4 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
              >
                Go to Login
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="space-y-4 mb-6">
              <div className="flex items-center">
                <div
                  className={`flex-shrink-0 h-5 w-5 rounded-full ${setupStatus?.system.database.status === "ok" ? "bg-green-500" : "bg-red-500"}`}
                ></div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">Database Connection</h3>
                  <p className="text-xs text-gray-500">
                    {setupStatus?.system.database.status === "ok" ? "Connected successfully" : "Connection error"}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div
                  className={`flex-shrink-0 h-5 w-5 rounded-full ${setupStatus?.system.email.status === "ok" ? "bg-green-500" : "bg-red-500"}`}
                ></div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">Email Configuration</h3>
                  <p className="text-xs text-gray-500">
                    {setupStatus?.system.email.status === "ok" ? "Configured correctly" : "Configuration error"}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div
                  className={`flex-shrink-0 h-5 w-5 rounded-full ${setupStatus?.system.users.superAdminExists ? "bg-green-500" : "bg-yellow-500"}`}
                ></div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">Super Admin</h3>
                  <p className="text-xs text-gray-500">
                    {setupStatus?.system.users.superAdminExists ? "Already exists" : "Not created yet"}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Create Super Admin</h2>
              <p className="text-sm text-gray-600 mb-4">
                Create the initial super admin account with the following credentials:
              </p>
              <div className="bg-gray-50 p-4 rounded border border-gray-200 text-sm mb-6">
                <p>
                  <strong>Email:</strong> sandraakinyi18@gmail.com
                </p>
                <p>
                  <strong>Password:</strong> Oidho@254
                </p>
              </div>
              <button
                onClick={handleCreateSuperAdmin}
                disabled={isCreatingSuperAdmin || setupStatus?.system.users.superAdminExists}
                className={`w-full py-2 px-4 rounded-md transition-colors ${
                  setupStatus?.system.users.superAdminExists
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-900 text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                }`}
              >
                {isCreatingSuperAdmin
                  ? "Creating..."
                  : setupStatus?.system.users.superAdminExists
                    ? "Already Created"
                    : "Create Super Admin"}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
   </Layout>
  )
}