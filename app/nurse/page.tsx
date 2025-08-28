'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import NurseHeader from '@/components/nurse/NurseHeader'
import QueueList from '@/components/nurse/QueueList'
import EmergencyAlerts from '@/components/nurse/EmergencyAlerts'

export default function NurseDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (session?.user?.role !== 'nurse') {
      router.push('/login')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'nurse') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NurseHeader />
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {session?.user?.name || 'Nurse'}! 👩‍⚕️
                </h1>
                <p className="text-blue-100 text-lg">
                  Manage your patient queue and handle emergency cases efficiently
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl mb-2">🏥</div>
                <div className="text-blue-100 text-sm">SmartClinic</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Queue Management - Takes 2/3 of the space */}
          <div className="lg:col-span-2">
            <QueueList />
          </div>
          
          {/* Emergency Alerts - Takes 1/3 of the space */}
          <div className="lg:col-span-1">
            <EmergencyAlerts />
          </div>
        </div>
      </main>
    </div>
  )
}
