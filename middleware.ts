import { type NextRequest, NextResponse } from "next/server"
import { getSession, hasRole } from "./lib/auth"
import { UserRole } from "@prisma/client"

// Define public routes that don't require authentication
const publicRoutes = ["/", "/auth/login","/setup" ,"/auth/forgot-password", "/auth/reset-password", "/auth/verify-email", "/auth/invite"]

// Define route patterns for role-based access
const roleBasedRoutes = [
  {
    pattern: "/settings/invite",
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  {
    pattern: "/settings/revoke",
    roles: [UserRole.SUPER_ADMIN],
  },
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Block direct access to register page - users must use invitation links
  if (pathname === "/auth/register") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

   // If accessing /login directly, redirect to the proper auth/login path
   if (request.nextUrl.pathname === '/login') {
    const url = new URL('/auth/login', request.url)
    url.searchParams.set('callbackUrl', encodeURI(request.nextUrl.pathname))
    return NextResponse
  }
  
  // If accessing /login directly, redirect to the proper auth/login path
  if (request.nextUrl.pathname === '/login') {
    const url = new URL('/auth/login', request.url)
    url.searchParams.set('callbackUrl', encodeURI(request.nextUrl.pathname))
    return NextResponse
  }

  // Check authentication for protected routes
  const session = await getSession()

  // If no session, redirect to login
  if (!session) {
    const url = new URL("/auth/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(pathname))
    return NextResponse.redirect(url)
  }

  // Check role-based access
  for (const route of roleBasedRoutes) {
    if (pathname.startsWith(route.pattern)) {
      const hasAccess = hasRole(session.user, route.roles)

      if (!hasAccess) {
        // Redirect to dashboard if user doesn't have access
        return NextResponse.redirect(new URL("/auth/login", request.url))
      }
    }
  }

  return NextResponse.next()
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that handle their own auth
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
}
