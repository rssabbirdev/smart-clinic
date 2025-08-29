'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('Attempting login with:', { email, password: '***' })
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      console.log('SignIn result:', result)

      if (result?.error) {
        setError('Invalid email or password')
        console.error('Login error:', result.error)
      } else if (result?.ok) {
        console.log('Login successful, redirecting...')
        // Redirect based on user role
        // The role will be determined by the session callback in auth.ts
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Login exception:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 text-center">
          <div className="text-6xl mb-4">🏥</div>
          <h1 className="text-3xl font-bold">SmartClinic</h1>
          <p className="text-blue-100 mt-2">Staff Portal - Admin & Nurse Access</p>
          <div className="mt-3 text-blue-200 text-sm">
            <span className="inline-flex items-center px-2 py-1 bg-blue-500 bg-opacity-30 rounded-full">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Staff Only
            </span>
          </div>
        </div>

        {/* Return to Home Button for Students */}
        <div className="px-8 pt-6 pb-4">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl mb-2">👨‍🎓</div>
            <p className="text-yellow-800 text-sm mb-3">
              <strong>Student?</strong> If you're not a staff member, click below to return to the main page.
            </p>
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 hover:scale-105 transition-all duration-200 shadow-md"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Return to Home
            </a>
          </div>
        </div>

        {/* Login Form */}
        <div className="px-8 pb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your password"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Info Section */}
          <div className="mt-6 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">Staff Access Only</h3>
              <p className="text-xs text-blue-600">
                This portal is for authorized healthcare staff (nurses & administrators) only. 
                Students should use the main page for check-in.
              </p>
            </div>
            
            {/* Sample Credentials for Testing */}
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-green-800 mb-2">Sample Credentials (for testing)</h3>
              <div className="text-xs text-green-700 space-y-1">
                <p><strong>Admin:</strong> admin.brown@school.edu / password123</p>
                <p><strong>Nurse:</strong> nurse.wilson@school.edu / password123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
