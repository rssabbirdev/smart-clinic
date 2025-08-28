'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Visit {
  _id: string
  name: string
  studentId: string
  mobile?: string
  symptoms: string[]
  queueStatus: string
  emergencyFlag: boolean
  priority: string
  estimatedWaitTime?: number
  createdAt: string
  updatedAt: string
}

export default function RecentCases() {
  const [visits, setVisits] = useState<Visit[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCases()
  }, [])

  const fetchCases = async () => {
    try {
      const response = await fetch('/api/queue')
      const data = await response.json()
      if (data.success) {
        // The API returns data in a nested structure: data.data.visits
        const visitsData = data.data?.visits || data.visits || []
        // Sort by creation date, most recent first
        const sortedVisits = visitsData.sort((a: Visit, b: Visit) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setVisits(sortedVisits)
      }
    } catch (error) {
      console.error('Failed to fetch cases:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const recentCases = visits.slice(0, 5)

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📋</span>
            <h3 className="text-lg font-semibold text-gray-900">Recent Cases</h3>
            <span className="text-sm text-gray-500">({recentCases.length} of {visits.length})</span>
          </div>
          <Link
            href="/admin/cases"
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            See More
          </Link>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {recentCases.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">No cases found</p>
          </div>
        ) : (
          recentCases.map((visit) => (
            <div key={visit._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{visit.name}</h4>
                    <span className="text-xs text-gray-500 flex-shrink-0">ID: {visit.studentId}</span>
                    {visit.emergencyFlag && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200 flex-shrink-0">
                        🚨 Emergency
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(visit.queueStatus)}`}>
                      {visit.queueStatus.replace('-', ' ')}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(visit.priority)}`}>
                      {visit.priority}
                    </span>
                    {visit.estimatedWaitTime && visit.estimatedWaitTime > 0 && (
                      <span className="text-xs text-gray-600">
                        ⏱️ {visit.estimatedWaitTime} min wait
                      </span>
                    )}
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Symptoms:</span> {visit.symptoms.join(', ')}
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-400">
                    <span>Created: {formatTimeAgo(visit.createdAt)}</span>
                    {visit.mobile && (
                      <span>📱 {visit.mobile}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
