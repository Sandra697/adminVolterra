"use client"

/**
 * Client utility functions for system setup
 */

// Check system setup status
export async function checkSetupStatus() {
  try {
    const response = await fetch("/api/setup", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to check setup status: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Setup status check failed:", error)
    throw error
  }
}

// Create super admin
export async function createSuperAdmin() {
  try {
    const response = await fetch("/api/setup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "create_super_admin",
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Failed to create super admin: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Super admin creation failed:", error)
    throw error
  }
}

// Check if super admin exists
export async function checkSuperAdminExists() {
  try {
    const response = await fetch("/api/setup/super-admin", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to check super admin: ${response.statusText}`)
    }

    const data = await response.json()
    return data.exists
  } catch (error) {
    console.error("Super admin check failed:", error)
    throw error
  }
}
