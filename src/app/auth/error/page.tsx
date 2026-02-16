import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
      <p className="mb-6 text-gray-600">Something went wrong during sign in.</p>
      <Link href="/login" className="text-blue-500 underline">
        Try again
      </Link>
    </div>
  )
}