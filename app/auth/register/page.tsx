import { redirect } from "next/navigation"

// Redirect any direct access to the register page to login
export default function RegisterPage() {
  redirect("/login")
}
