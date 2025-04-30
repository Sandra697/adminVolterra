// lib/auth.ts - Server-side operations
import { cookies } from "next/headers"; // Server-only import
import { type NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose"; // JWT library
import { db } from "./db"; // Your Prisma client instance
import { logger } from "./logger"; // Your logging utility
import type { User, UserRole } from "@prisma/client"; // Prisma types

// Auth types (can be shared, ensure no server-only code leaks if used client-side)
// It's often better to define a separate client-safe AuthUser in auth-utils.ts
export interface AuthUser {
  id: number;
  email: string;
  name?: string | null;
  role: UserRole;
  image?: string | null;
  // Add any other fields needed in the session/client-side, but avoid sensitive ones
}

export interface SessionPayload {
  user: AuthUser;
  exp: number; // Expiration Time (Unix timestamp)
  iat: number; // Issued At (Unix timestamp)
  jti: string; // JWT ID
  // Add other relevant non-sensitive payload data if needed
}

// Secret key for JWT tokens
const getJwtSecretKey = (): Uint8Array => {
  const secret = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET;
  if (!secret) {
    logger.error("JWT Secret key is not set in environment variables");
    throw new Error("JWT Secret key is not configured.");
  }
  if (secret.length < 32) {
     logger.warn("JWT Secret key is shorter than 32 characters, which is potentially insecure.");
  }
  return new TextEncoder().encode(secret);
};

// Secure cookie options
const cookieOptions = {
  name: process.env.SESSION_COOKIE_NAME || "myapp-session", // Use env var
  httpOnly: true,
  path: "/",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 7, // 1 week in seconds
  sameSite: "strict" as const, // Recommended for auth cookies
};

/**
 * Creates a JWT session token for a given user.
 * @param user - The user object (ensure it matches AuthUser structure).
 * @returns The signed JWT token.
 */
export async function createSession(user: User): Promise<string> { // Expecting Prisma User type
  try {
    // Create the user payload for the JWT, selecting only necessary fields
    const sessionUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      image: user.image,
    };

    const secretKey = getJwtSecretKey();
    const expirationTime = Math.floor(Date.now() / 1000) + cookieOptions.maxAge; // In seconds

    const token = await new SignJWT({ user: sessionUser })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(expirationTime) // Use calculated expiration
      .setJti(crypto.randomUUID()) // Unique token ID
      .sign(secretKey);

    // Log the login activity (consider moving this to the login API endpoint)
    // await logUserActivity(user.id, "login", "User logged in");

    // Update last login timestamp (consider moving this to the login API endpoint)
    // await db.user.update({
    //   where: { id: user.id },
    //   data: { lastLogin: new Date() },
    // });

    logger.info(`Session created for user ID: ${user.id}`);
    return token;
  } catch (error) {
    logger.error(`Failed to create session for user ID ${user?.id}: ${error}`);
    // Don't expose internal errors directly
    throw new Error("Authentication failed during session creation.");
  }
}

/**
 * Sets the session cookie in the browser response.
 * IMPORTANT: This function can ONLY be used in Server Components, Route Handlers, or Server Actions.
 * @param token - The JWT session token.
 */
export async function setSessionCookie(token: string): Promise<void> {
  try {
    // cookies() only works in server-side contexts
    (await
      // cookies() only works in server-side contexts
      cookies()).set(cookieOptions.name, token, {
      httpOnly: cookieOptions.httpOnly,
      maxAge: cookieOptions.maxAge,
      path: cookieOptions.path,
      sameSite: cookieOptions.sameSite,
      secure: cookieOptions.secure,
    });
     logger.info(`Session cookie set.`);
  } catch (error) {
      // This error often happens if used in a client component
      logger.error(`Failed to set session cookie (ensure this runs server-side): ${error}`);
      throw new Error("Failed to set session cookie.");
  }
}

/**
 * Gets and verifies the session data from the request cookie.
 * IMPORTANT: This function can ONLY be used in Server Components, Route Handlers, or Server Actions.
 * @returns The verified session payload or null if invalid/not found.
 */
export async function getSession(): Promise<SessionPayload | null> {
   let tokenValue: string | undefined;
   try {
     // cookies() only works in server-side contexts
     tokenValue = (await cookies()).get(cookieOptions.name)?.value;

     if (!tokenValue) {
       // logger.info("No session cookie found."); // Can be noisy, log if needed
       return null;
     }

     const secretKey = getJwtSecretKey();
     const { payload } = await jwtVerify(tokenValue, secretKey, {
        algorithms: ["HS256"], // Specify expected algorithm
     });

     // Optional: Check if token is close to expiry and needs refresh (implement refresh logic separately)

     // logger.info(`Session retrieved for user ID: ${payload.user?.id}`);
     return payload as unknown as SessionPayload; // First cast to 'unknown' then to 'SessionPayload'

   } catch (error) {
     // Common errors: TokenExpiredError, JsonWebTokenError (invalid signature/format)
     if (error instanceof Error && (error.name === 'JWTExpired' || error.message.includes('expired'))) {
        logger.info(`Expired session token detected.`);
     } else if (tokenValue) {
        // Avoid logging the token value itself
        logger.warn(`Invalid session token detected: ${error instanceof Error ? error.message : error}`);
     }
     // Clear potentially invalid cookie? Only if verification fails, not if just expired.
     // if (!(error instanceof Error && error.name === 'JWTExpired')) {
     //    await clearSession(); // Be careful with automatically clearing cookies
     // }
     return null;
   }
}

/**
 * Gets the current authenticated user based on the session cookie.
 * Performs validation against the database.
 * IMPORTANT: This function can ONLY be used in Server Components, Route Handlers, or Server Actions.
 * @returns The authenticated user object (AuthUser) or null.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const session = await getSession();

    logger.info(`Session retrieved: ${JSON.stringify(session)}`);

    if (!session?.user) {
      return null; // No valid session or user data in session
    }

    // Validate against the database: Does the user still exist and are they active?
    const userFromDb = await db.user.findUnique({
      where: {
        id: session.user.id,
        // Add status checks if applicable (e.g., user must be active)
        // status: "ACTIVE",
      },
    });

    if (!userFromDb) {
      logger.warn(`User ID ${session.user.id} from valid token not found in DB or is inactive. Invalidating session.`);
      // Consider clearing the session cookie here if the user is definitively gone/inactive
      // await clearSession();
      return null;
    }

    // Return the selective AuthUser structure, potentially updating with fresh DB data if needed
    // For simplicity, we're returning the data stored in the token if the DB check passes.
    // If roles/names change frequently, you might want to return fresh data from userFromDb.
    return {
      id: session.user.id, // Use ID from validated session
      email: session.user.email, // Use email from session (less likely to change than name/role)
      name: userFromDb.name, // Get potentially updated name from DB
      role: userFromDb.role, // Get potentially updated role from DB
      image: userFromDb.image, // Get potentially updated image from DB
    };

  } catch (error) {
    logger.error(`Error getting current user: ${error}`);
    return null; // Return null on any unexpected error
  }
}

/**
 * Clears the session cookie.
 * IMPORTANT: This function can ONLY be used in Server Components, Route Handlers, or Server Actions.
 */
export async function clearSession(): Promise<void> {
   try {
     // cookies() only works in server-side contexts
     if ((await cookies()).has(cookieOptions.name)) {
        (await cookies()).delete(cookieOptions.name);
        logger.info(`Session cookie cleared.`);
        
     } else {
        logger.info(`Attempted to clear session cookie, but none was found.`);
     }
   } catch (error) {
       logger.error(`Failed to clear session cookie (ensure this runs server-side): ${error}`);
       // Decide if this should throw or just log
       // throw new Error("Failed to clear session cookie.");
   }
}

/**
 * Logs user activity to the database.
 */
export async function logUserActivity(
  userId: number,
  action: string,
  details?: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<void> {
  try {
    await db.userActivity.create({
      data: {
        userId,
        action,
        details: details?.substring(0, 500), // Truncate details if necessary
        ipAddress: ipAddress?.substring(0, 100),
        userAgent: userAgent?.substring(0, 255),
      },
    });
  } catch (error) {
    // Avoid crashing the main request if logging fails
    logger.error(`Failed to log user activity for user ID ${userId}, action ${action}: ${error}`);
  }
}


/**
 * Checks if a user object has at least one of the required roles.
 * This version is safe to use server-side OR client-side IF AuthUser type is shared.
 * Consider having a dedicated client-safe version if AuthUser types differ.
 * @param user - The user object (or null).
 * @param requiredRoles - An array of roles required for access. If empty, access is allowed.
 * @returns boolean - True if the user has permission, false otherwise.
 */
export function hasRole(user: AuthUser | null, requiredRoles: UserRole[]): boolean {
  if (!user) {
      return false; // Not logged in
  }
  // If no roles are required, the user is considered authorized (as long as they are logged in)
  if (!requiredRoles || requiredRoles.length === 0) {
      return true;
  }
  // Check if the user's role is included in the list of required roles
  return requiredRoles.includes(user.role);
}


/**
 * @param req - The NextRequest object (available in Middleware and Route Handlers).
 * @param requiredRoles - Optional array of roles required for this route/action.
 * @returns Promise<{ user: AuthUser | null; isAuthorized: boolean }>
 */
export async function authMiddleware(
  req: NextRequest,
  requiredRoles: UserRole[] = [],
): Promise<{ user: AuthUser | null; isAuthorized: boolean }> {
  const user = await getCurrentUser(); // Gets user based on cookie and validates with DB

  const isAuthorized = hasRole(user, requiredRoles);

  // Log access attempt for auditing purposes
  try {
      const ipAddress = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
      const userAgent = req.headers.get("user-agent") ?? "unknown";
      const logDetails = `Path: ${req.nextUrl.pathname}, Authorized: ${isAuthorized}${requiredRoles.length > 0 ? ', Required Roles: ' + requiredRoles.join(',') : ''}`;

      if (user) {
        await logUserActivity(
          user.id,
          isAuthorized ? "authorized_access" : "unauthorized_access",
          logDetails,
          ipAddress,
          userAgent,
        );
      } else {
         // Optionally log attempts by unauthenticated users if needed
         // await logUnauthenticatedAttempt(req.nextUrl.pathname, ipAddress, userAgent);
         logger.info(`Unauthenticated access attempt: ${logDetails}, IP: ${ipAddress}`);
      }
  } catch (logError) {
      // Don't let logging errors break the middleware
      logger.error(`Error during access logging in authMiddleware: ${logError}`);
  }


  return { user, isAuthorized };
}

/**
 * Standardized NextResponse objects for auth responses in API routes.
 */
export const authResponse = {
  /** Returns a 401 Unauthorized response. */
  unauthorized(message: string = "Unauthorized"): NextResponse {
    return NextResponse.json({ error: message }, { status: 401 });
  },

  /** Returns a 403 Forbidden response. */
  forbidden(message: string = "Forbidden"): NextResponse {
    return NextResponse.json({ error: message }, { status: 403 });
  },

   /** Returns a 500 Internal Server Error response. */
   internalError(message: string = "An unexpected error occurred"): NextResponse {
     return NextResponse.json({ error: message }, { status: 500 });
  },
};