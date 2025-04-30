// lib/auth-utils.ts - Client-safe authentication utilities
import type { UserRole } from "@prisma/client";

// Client-safe AuthUser interface (mirror of server-side but with only necessary fields)
export interface AuthUser {
  id: number;
  email: string;
  name?: string | null;
  role: UserRole;
  image?: string | null;
}

/**
 * Checks if a user object has at least one of the required roles.
 * Client-safe version of the role check.
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