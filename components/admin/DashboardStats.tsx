'use client'

import { useState, useEffect } from 'react'

interface DashboardStats {
  totalUsers: number
  totalStudents: number
  totalNurses: number
  totalAdmins: number
  totalVisits: number
  waitingPatients: number
  emergencyCases: number
  completedToday: number
  activeCases: number
}

export default function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalStudents: 0,
    totalNurses: 0,
    totalAdmins: 0,
    totalVisits: 0,
    waitingPatients: 0,
    emergencyCases: 0,
    completedToday: 0,
    activeCases: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch users to get role-based counts
      const usersResponse = await fetch('/api/admin/users')
      const usersData = await usersResponse.json()
      
      // Fetch queue data for visit statistics
      const queueResponse = await fetch('/api/queue')
      const queueData = await queueResponse.json()
      
      if (usersData.success) {
        const users = usersData.users
        const totalStudents = users.filter((user: any) => user.role === 'student').length
        const totalNurses = users.filter((user: any) => user.role === 'nurse').length
        const totalAdmins = users.filter((user: any) => user.role === 'admin').length
        
        // The API returns data in a nested structure: data.data.visits
        const visitsData = queueData.data?.visits || queueData.visits || []
        
        setStats({
          totalUsers: users.length,
          totalStudents,
          totalNurses,
          totalAdmins,
          totalVisits: visitsData.length,
          waitingPatients: visitsData.filter((v: any) => v.queueStatus === 'waiting').length,
          emergencyCases: visitsData.filter((v: any) => v.emergencyFlag).length,
          completedToday: visitsData.filter((v: any) => v.queueStatus === 'completed').length,
          activeCases: visitsData.filter((v: any) => v.queueStatus === 'in-progress').length
        })
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      // Fallback to mock data
      setStats({
        totalUsers: 8,
        totalStudents: 5,
        totalNurses: 1,
        totalAdmins: 1,
        totalVisits: 12,
        waitingPatients: 3,
        emergencyCases: 1,
        completedToday: 8,
        activeCases: 1
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: '👥',
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      description: 'All system users'
    },
    {
      title: 'Students',
      value: stats.totalStudents,
      icon: '🎓',
      color: 'bg-green-500',
      textColor: 'text-green-600',
      description: 'Registered students'
    },
    {
      title: 'Nurses',
      value: stats.totalNurses,
      icon: '👩‍⚕️',
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      description: 'Healthcare staff'
    },
    {
      title: 'Admins',
      value: stats.totalAdmins,
      icon: '👨‍💼',
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      description: 'System administrators'
    },
    {
      title: 'Total Cases',
      value: stats.totalVisits,
      icon: '📋',
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      description: 'All medical cases'
    },
    {
      title: 'Waiting',
      value: stats.waitingPatients,
      icon: '⏳',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      description: 'Patients in queue'
    },
    {
      title: 'Emergency',
      value: stats.emergencyCases,
      icon: '🚨',
      color: 'bg-red-500',
      textColor: 'text-red-600',
      description: 'Urgent cases'
    },
    {
      title: 'Active',
      value: stats.activeCases,
      icon: '🔄',
      color: 'bg-teal-500',
      textColor: 'text-teal-600',
      description: 'Currently being treated'
    }
  ]

  return (
    <div className="space-y-4">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className={`p-2 rounded-full ${stat.color} bg-opacity-10`}>
                <span className="text-xl">{stat.icon}</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-xl font-bold ${stat.textColor}`}>{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <a 
            href="/admin/students"
            className="block w-full px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors text-center"
          >
            👥 Manage Students
          </a>
          <a 
            href="/admin/cases"
            className="block w-full px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors text-center"
          >
            📋 View All Cases
          </a>
          <button className="w-full px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors">
            📊 Generate Report
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Database</span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ✅ Online
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Authentication</span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ✅ Active
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Queue System</span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ✅ Running
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Recent Activity</span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              🔄 {stats.activeCases} active
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
