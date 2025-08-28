'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import DashboardStats from '@/components/admin/DashboardStats'
import RecentUsers from '@/components/admin/RecentUsers'
import RecentCases from '@/components/admin/RecentCases'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (session?.user?.role !== 'admin') {
      router.push('/login')
      return
    }
  }, [session, status, router])

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Check if user is admin
  if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {session.user.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats and Quick Actions */}
          <div className="lg:col-span-1">
            <DashboardStats />
          </div>
          
          {/* Right Column - Recent Users and Cases */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Users Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Users</h2>
              <RecentUsers />
            </div>
            
            {/* Recent Cases Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Cases</h2>
              <RecentCases />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
