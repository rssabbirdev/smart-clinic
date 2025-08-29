'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import NurseHeader from '@/components/nurse/NurseHeader'
import QueueList from '@/components/nurse/QueueList'

export default function NurseDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSessionReady, setIsSessionReady] = useState(false)

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
    // Wait for session to have user ID
    if (session?.user?.id) {
      setIsSessionReady(true)
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
        <div>
          {isSessionReady ? (
            <QueueList nurseId={session!.user!.id!} />
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <div className="text-yellow-600 text-lg mb-2">⚠️</div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Session Loading</h3>
              <p className="text-yellow-700">Waiting for user ID to load. Please wait a moment...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
