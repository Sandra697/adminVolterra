// app/api/auth/session/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth"; // Import from your server-side auth.ts

export async function GET() {
  try {
    // Get user from the session cookie
    const user = await getCurrentUser();
    
    // Return the user data (or null if not authenticated)
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Session API error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve session" },
      { status: 500 }
    );
  }
}