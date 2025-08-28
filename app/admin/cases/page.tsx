'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminHeader from '@/components/admin/AdminHeader'

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

export default function AdminCasesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [visits, setVisits] = useState<Visit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [emergencyFilter, setEmergencyFilter] = useState('all')

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

  const filteredVisits = visits.filter(visit => {
    const matchesSearch = 
      visit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (visit.mobile && visit.mobile.includes(searchTerm))
    
    const matchesStatus = statusFilter === 'all' || visit.queueStatus === statusFilter
    const matchesPriority = priorityFilter === 'all' || visit.priority === priorityFilter
    const matchesEmergency = emergencyFilter === 'all' || 
      (emergencyFilter === 'emergency' && visit.emergencyFlag) ||
      (emergencyFilter === 'normal' && !visit.emergencyFlag)
    
    return matchesSearch && matchesStatus && matchesPriority && matchesEmergency
  })

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link 
                href="/admin" 
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Dashboard
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">All Cases</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Medical Cases</h1>
          <p className="text-gray-600 mt-2">View and manage all medical cases in the system</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by name, ID, or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="waiting">Waiting</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="emergency">Emergency</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={emergencyFilter}
                onChange={(e) => setEmergencyFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Cases</option>
                <option value="emergency">Emergency Only</option>
                <option value="normal">Normal Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cases List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2 className="text-lg font-semibold text-gray-900">Cases</h2>
              <div className="text-sm text-gray-600">
                Showing {filteredVisits.length} of {visits.length} cases
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {isLoading ? (
              <div className="px-6 py-8">
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ) : filteredVisits.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <div className="text-4xl mb-2">📋</div>
                <p className="text-gray-500">No cases found</p>
                <p className="text-sm text-gray-400 mt-1">
                  {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || emergencyFilter !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'No medical cases in the system yet'}
                </p>
              </div>
            ) : (
              filteredVisits.map((visit) => (
                <div key={visit._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{visit.name}</h3>
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
      </main>
    </div>
  )
}
