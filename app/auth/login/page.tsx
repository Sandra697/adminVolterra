import LoginForm from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <LoginForm />
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-[0.8rem]">Need an account? Contact your administrator for an invitation.</p>
        </div>
      </div>
    </div>
  )
}
