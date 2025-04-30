import { type NextRequest, NextResponse } from "next/server" 
import { clearSession, getCurrentUser, logUserActivity } from "@/lib/auth" 
import { logger } from "@/lib/logger"  

export async function POST(req: NextRequest) {   
  try {     
    const user = await getCurrentUser()
    
    // Clear session cookie     
    clearSession()
    
    // Log logout activity if user was logged in     
    if (user) {       
      const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"       
      const userAgent = req.headers.get("user-agent") || "unknown"        
      
      await logUserActivity(user.id, "logout", "User logged out", ipAddress.toString(), userAgent)        
      logger.auth("Logout successful", { details: { userId: user.id } })     
    }
    
    // Create response with redirect information
    const response = NextResponse.json({ success: true, redirectUrl: "/login" })
    
    // Add the redirect URL to the response
    response.headers.set("X-Redirect-Location", "/login")
    
    return response
  } catch (error) {     
    logger.error(`Logout error: ${error}`)     
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })   
  } 
}