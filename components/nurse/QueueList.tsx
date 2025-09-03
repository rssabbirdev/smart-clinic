'use client'

import { useState, useEffect } from 'react'

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
  notes?: string
  assignedNurse?: string
  assignedNurseName?: string
}

interface QueueListProps {
  nurseId: string
}

export default function QueueList({ nurseId }: QueueListProps) {
  const [visits, setVisits] = useState<Visit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [notes, setNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [activeTab, setActiveTab] = useState<'today' | 'all' | 'history'>('today')
  
  // Filter states for all cases tab
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [emergencyFilter, setEmergencyFilter] = useState<boolean | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0] // today
  })
  
  // Advanced filtering and sorting states
  const [symptomFilter, setSymptomFilter] = useState<string>('all')
  const [assignedNurseFilter, setAssignedNurseFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('priority')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  
  // Background update indicator
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date())
  const [hasNewUpdates, setHasNewUpdates] = useState(false)

  // Validate nurseId
  if (!nurseId) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 text-lg mb-2">⚠️</div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Authentication Error</h3>
        <p className="text-red-700">Unable to identify nurse. Please log in again.</p>
      </div>
    )
  }

  // Validate MongoDB ObjectId format (24 character hex string)
  const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(nurseId)
  if (!isValidObjectId) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 text-lg mb-2">⚠️</div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Invalid Nurse ID Format</h3>
        <p className="text-red-700">Nurse ID format is invalid. Please log in again.</p>
        <p className="text-xs text-red-600 mt-2">Current ID: {nurseId}</p>
      </div>
    )
  }

  useEffect(() => {
    fetchQueueData()
  }, [])

  const fetchQueueData = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/queue')
      const data = await response.json()
      
      if (data.success) {
        const visitsData = data.data?.visits || data.visits || []
        
        // Filter for today's cases only
        const today = new Date()
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
        
        const todaysVisits = visitsData.filter((visit: Visit) => {
          const visitDate = new Date(visit.createdAt)
          return visitDate >= todayStart && visitDate < todayEnd
        })
        
        setVisits(todaysVisits)
      }
    } catch (error) {
      console.error('Failed to fetch queue data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAllCases = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/queue')
      const data = await response.json()
      
      if (data.success) {
        const visitsData = data.data?.visits || data.visits || []
        setVisits(visitsData)
      }
    } catch (error) {
      console.error('Failed to fetch all cases:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMyHistory = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/queue?nurseId=${nurseId}`)
      const data = await response.json()
      
      if (data.success) {
        const visitsData = data.data?.visits || data.visits || []
        // Filter for cases handled by this nurse
        const myCases = visitsData.filter((visit: Visit) => 
          visit.assignedNurse === nurseId
        )
        setVisits(myCases)
      }
    } catch (error) {
      console.error('Failed to fetch my history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateQueueStatus = async (visitId: string, newStatus: string, visitNotes?: string) => {
    try {
      setIsUpdating(true)
      const response = await fetch('/api/queue', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          visitId, 
          action: newStatus === 'in-progress' ? 'start' : newStatus === 'completed' ? 'complete' : 'update_notes',
          notes: visitNotes || notes,
          nurseId: nurseId
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Update local state
          setVisits(prevVisits => 
            prevVisits.map(visit => 
              visit._id === visitId 
                ? { 
                    ...visit, 
                    queueStatus: newStatus, 
                    notes: visitNotes || notes,
                    assignedNurse: newStatus === 'in-progress' ? nurseId : visit.assignedNurse,
                    assignedNurseName: newStatus === 'in-progress' ? 'You' : visit.assignedNurseName
                  }
                : visit
            )
          )
          
          // Close modal and reset
          setShowDetailsModal(false)
          setSelectedVisit(null)
          setNotes('')
          
        }
      } else {
        console.error('Failed to update status')
      }
    } catch (error) {
      console.error('Failed to update queue status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const openDetailsModal = (visit: Visit) => {
    setSelectedVisit(visit)
    setNotes(visit.notes || '')
    setShowDetailsModal(true)
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting':
        return '⏳'
      case 'in-progress':
        return '🔄'
      case 'completed':
        return '✅'
      default:
        return '❓'
    }
  }

  // Helper functions for advanced filtering
  const getAllUniqueSymptoms = () => {
    const allSymptoms = visits.flatMap(visit => visit.symptoms)
    return Array.from(new Set(allSymptoms)).sort()
  }

  const getAllUniqueNurses = () => {
    const nurses = visits
      .filter(visit => visit.assignedNurseName)
      .map(visit => ({ id: visit.assignedNurse, name: visit.assignedNurseName }))
    const uniqueNurses = nurses.filter((nurse, index, self) => 
      index === self.findIndex(n => n.id === nurse.id)
    )
    return uniqueNurses.sort((a, b) => a.name!.localeCompare(b.name!))
  }

  // Advanced sorting function
  const sortVisits = (visitsToSort: Visit[]) => {
    return [...visitsToSort].sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { emergency: 4, high: 3, medium: 2, low: 1 }
          const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0
          const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0
          comparison = aPriority - bPriority
          break
        case 'symptom':
          const aSymptoms = a.symptoms.join(', ').toLowerCase()
          const bSymptoms = b.symptoms.join(', ').toLowerCase()
          comparison = aSymptoms.localeCompare(bSymptoms)
          break
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'studentId':
          comparison = a.studentId.localeCompare(b.studentId)
          break
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'updatedAt':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break
        case 'status':
          const statusOrder = { waiting: 1, 'in-progress': 2, completed: 3 }
          const aStatus = statusOrder[a.queueStatus as keyof typeof statusOrder] || 0
          const bStatus = statusOrder[b.queueStatus as keyof typeof statusOrder] || 0
          comparison = aStatus - bStatus
          break
        case 'emergency':
          comparison = (a.emergencyFlag ? 1 : 0) - (b.emergencyFlag ? 1 : 0)
          break
        default:
          comparison = 0
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }

  // Clear all filters function
  const clearAllFilters = () => {
    setStatusFilter('all')
    setPriorityFilter('all')
    setEmergencyFilter(null)
    setSearchTerm('')
    setSymptomFilter('all')
    setAssignedNurseFilter('all')
    setDateRange({
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    })
    setSortBy('priority')
    setSortOrder('desc')
  }

  // Filter visits for each column (today's cases) - sorted by queue order
  const pendingVisits = sortVisits(visits.filter(visit => visit.queueStatus === 'waiting' && !visit.assignedNurse))
  
  const processingVisits = sortVisits(visits.filter(visit => visit.queueStatus === 'in-progress' && visit.assignedNurse === nurseId))
  
  const completedVisits = sortVisits(visits.filter(visit => visit.queueStatus === 'completed' && visit.assignedNurse === nurseId))

  // Filter all cases based on filters
  const filteredAllCases = sortVisits(visits.filter(visit => {
      // Status filter
      if (statusFilter !== 'all' && visit.queueStatus !== statusFilter) return false
      
      // Priority filter
      if (priorityFilter !== 'all' && visit.priority !== priorityFilter) return false
      
      // Emergency filter
      if (emergencyFilter !== null && visit.emergencyFlag !== emergencyFilter) return false
      
      // Search term filter
      if (searchTerm && !visit.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !visit.studentId.toLowerCase().includes(searchTerm.toLowerCase())) return false
      
      // Symptom filter
      if (symptomFilter !== 'all' && !visit.symptoms.some(symptom => 
          symptom.toLowerCase().includes(symptomFilter.toLowerCase()))) return false
      
      // Assigned nurse filter
      if (assignedNurseFilter !== 'all') {
        if (assignedNurseFilter === 'unassigned' && visit.assignedNurse) return false
        if (assignedNurseFilter !== 'unassigned' && visit.assignedNurse !== assignedNurseFilter) return false
      }
      
      // Date range filter
      const visitDate = new Date(visit.createdAt)
      const startDate = new Date(dateRange.start)
      const endDate = new Date(dateRange.end)
      endDate.setHours(23, 59, 59) // Include end date
      
      if (visitDate < startDate || visitDate > endDate) return false
      
      return true
    }))

  // Filter my history cases
  const filteredMyHistory = sortVisits(visits.filter(visit => {
      // Only show cases assigned to this nurse
      if (visit.assignedNurse !== nurseId) return false
      
      // Apply other filters
      if (statusFilter !== 'all' && visit.queueStatus !== statusFilter) return false
      if (priorityFilter !== 'all' && visit.priority !== priorityFilter) return false
      if (emergencyFilter !== null && visit.emergencyFlag !== emergencyFilter) return false
      if (searchTerm && !visit.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !visit.studentId.toLowerCase().includes(searchTerm.toLowerCase())) return false
      
      // Symptom filter
      if (symptomFilter !== 'all' && !visit.symptoms.some(symptom => 
          symptom.toLowerCase().includes(symptomFilter.toLowerCase()))) return false
      
      // Date range filter
      const visitDate = new Date(visit.createdAt)
      const startDate = new Date(dateRange.start)
      const endDate = new Date(dateRange.end)
      endDate.setHours(23, 59, 59)
      
      if (visitDate < startDate || visitDate > endDate) return false
      
      return true
    }))

  // Handle tab changes and fetch appropriate data
  useEffect(() => {
    switch (activeTab) {
      case 'today':
        fetchQueueData()
        break
      case 'all':
        fetchAllCases()
        break
      case 'history':
        fetchMyHistory()
        break
    }
  }, [activeTab])

  // Background check for new cases (only for today's cases)
  useEffect(() => {
    if (activeTab === 'today') {
      const interval = setInterval(async () => {
        try {
          // Silent background check - don't show loading state
          const response = await fetch('/api/queue')
          const data = await response.json()
          
          if (data.success) {
            const visitsData = data.data?.visits || data.visits || []
            
            // Filter for today's cases only
            const today = new Date()
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
            const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
            
            const todaysVisits = visitsData.filter((visit: Visit) => {
              const visitDate = new Date(visit.createdAt)
              return visitDate >= todayStart && visitDate < todayEnd
            })
            
            // Only update state if there are new cases or changes
            setVisits(prevVisits => {
              // Quick check: if counts are different, there are definitely changes
              if (prevVisits.length !== todaysVisits.length) {
                setHasNewUpdates(true)
                setLastUpdateTime(new Date())
                // Clear the indicator after 5 seconds
                setTimeout(() => setHasNewUpdates(false), 5000)
                return todaysVisits
              }
              
              // Check for new cases by looking for IDs that don't exist in previous visits
              const newCaseIds = todaysVisits.map((v: Visit) => v._id)
              const prevCaseIds = prevVisits.map((v: Visit) => v._id)
              const hasNewCases = newCaseIds.some((id: string) => !prevCaseIds.includes(id))
              
              if (hasNewCases) {
                setHasNewUpdates(true)
                setLastUpdateTime(new Date())
                // Clear the indicator after 5 seconds
                setTimeout(() => setHasNewUpdates(false), 5000)
                return todaysVisits
              }
              
              // Check if any existing cases have been updated (status, assignment, notes, etc.)
              const hasUpdates = todaysVisits.some((newVisit: Visit) => {
                const existingVisit = prevVisits.find(v => v._id === newVisit._id)
                if (!existingVisit) return false
                
                return existingVisit.queueStatus !== newVisit.queueStatus ||
                       existingVisit.assignedNurse !== newVisit.assignedNurse ||
                       existingVisit.assignedNurseName !== newVisit.assignedNurseName ||
                       existingVisit.notes !== newVisit.notes ||
                       existingVisit.updatedAt !== newVisit.updatedAt
              })
              
              if (hasUpdates) {
                setHasNewUpdates(true)
                setLastUpdateTime(new Date())
                // Clear the indicator after 5 seconds
                setTimeout(() => setHasNewUpdates(false), 5000)
                return todaysVisits
              }
              
              // No changes detected, keep existing state (no unnecessary re-renders)
              return prevVisits
            })
          }
        } catch (error) {
          // Silent error handling for background checks
          console.error('Background check failed:', error)
        }
      }, 10000) // Check every 10 seconds

      return () => clearInterval(interval)
    }
  }, [activeTab])

  // Calculate statistics based on active tab
  const getStats = () => {
    switch (activeTab) {
      case 'today':
        return {
          total: visits.length,
          pending: pendingVisits.length,
          processing: processingVisits.length,
          completed: completedVisits.length,
          emergency: visits.filter(v => v.emergencyFlag).length
        }
      case 'all':
        return {
          total: filteredAllCases.length,
          pending: filteredAllCases.filter(v => v.queueStatus === 'waiting').length,
          processing: filteredAllCases.filter(v => v.queueStatus === 'in-progress').length,
          completed: filteredAllCases.filter(v => v.queueStatus === 'completed').length,
          emergency: filteredAllCases.filter(v => v.emergencyFlag).length
        }
      case 'history':
        return {
          total: filteredMyHistory.length,
          pending: filteredMyHistory.filter(v => v.queueStatus === 'waiting').length,
          processing: filteredMyHistory.filter(v => v.queueStatus === 'in-progress').length,
          completed: filteredMyHistory.filter(v => v.queueStatus === 'completed').length,
          emergency: filteredMyHistory.filter(v => v.emergencyFlag).length
        }
      default:
        return {
          total: 0,
          pending: 0,
          processing: 0,
          completed: 0,
          emergency: 0
        }
    }
  }

  const stats = getStats()

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Stats Cards Loading */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Columns Loading */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-20 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('today')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'today'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📅 Today's Cases
              {hasNewUpdates && activeTab === 'today' && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse">
                  🔄 New
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🏥 All Cases
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 My Work History
            </button>
          </nav>
        </div>
        
        {/* Background Check Status */}
        {activeTab === 'today' && (
          <div className="px-6 py-2 bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
            <span>
              🔄 Background check active (every 10 seconds)
            </span>
            <span>
              Last update: {lastUpdateTime.toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      {/* Advanced Filters and Sorting for All Cases and History Tabs */}
      {(activeTab === 'all' || activeTab === 'history') && (
        <div className="bg-white rounded-lg shadow border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Advanced Filters & Sorting</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
              >
                {showAdvancedFilters ? '🔽 Hide Advanced' : '🔼 Show Advanced'}
              </button>
              <button
                onClick={clearAllFilters}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                🗑️ Clear All
              </button>
            </div>
          </div>

          {/* Basic Filters - Always Visible */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search Term */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">🔍 Search</label>
              <input
                type="text"
                placeholder="Name or Student ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">📊 Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="waiting">⏳ Waiting</option>
                <option value="in-progress">🔄 In Progress</option>
                <option value="completed">✅ Completed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">⚡ Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priority</option>
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
                <option value="emergency">🚨 Emergency</option>
              </select>
            </div>

            {/* Emergency Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">🚨 Emergency</label>
              <select
                value={emergencyFilter === null ? 'all' : emergencyFilter.toString()}
                onChange={(e) => {
                  if (e.target.value === 'all') {
                    setEmergencyFilter(null)
                  } else {
                    setEmergencyFilter(e.target.value === 'true')
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Cases</option>
                <option value="true">🚨 Emergency Only</option>
                <option value="false">✅ Non-Emergency Only</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters - Collapsible */}
          {showAdvancedFilters && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Symptom Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">🩺 Symptom</label>
                  <select
                    value={symptomFilter}
                    onChange={(e) => setSymptomFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Symptoms</option>
                    {getAllUniqueSymptoms().map(symptom => (
                      <option key={symptom} value={symptom}>{symptom}</option>
                    ))}
                  </select>
                </div>

                {/* Assigned Nurse Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">👩‍⚕️ Assigned Nurse</label>
                  <select
                    value={assignedNurseFilter}
                    onChange={(e) => setAssignedNurseFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Nurses</option>
                    <option value="unassigned">❌ Unassigned</option>
                    {getAllUniqueNurses().map(nurse => (
                      <option key={nurse.id} value={nurse.id}>{nurse.name}</option>
                    ))}
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">📅 Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">📅 End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Sorting Options */}
              <div className="border-t pt-4">
                <h4 className="text-md font-semibold text-gray-800 mb-3">🔄 Sorting Options</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="priority">⚡ Priority</option>
                      <option value="symptom">🩺 Symptom</option>
                      <option value="name">👤 Name</option>
                      <option value="studentId">🆔 Student ID</option>
                      <option value="createdAt">📅 Creation Date</option>
                      <option value="updatedAt">🔄 Modification Date</option>
                      <option value="status">📊 Status</option>
                      <option value="emergency">🚨 Emergency</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="desc">⬇️ Descending (High to Low)</option>
                      <option value="asc">⬆️ Ascending (Low to High)</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSortBy('priority')
                        setSortOrder('desc')
                      }}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      🔄 Reset to Default
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filter Summary */}
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  📊 <strong>Results:</strong> {activeTab === 'all' ? filteredAllCases.length : filteredMyHistory.length} cases found
                </p>
                <div className="text-xs text-gray-600 mt-1">
                  {searchTerm && `🔍 Search: "${searchTerm}"`}
                  {statusFilter !== 'all' && ` • 📊 Status: ${statusFilter}`}
                  {priorityFilter !== 'all' && ` • ⚡ Priority: ${priorityFilter}`}
                  {emergencyFilter !== null && ` • 🚨 Emergency: ${emergencyFilter ? 'Yes' : 'No'}`}
                  {symptomFilter !== 'all' && ` • 🩺 Symptom: ${symptomFilter}`}
                  {assignedNurseFilter !== 'all' && ` • 👩‍⚕️ Nurse: ${assignedNurseFilter === 'unassigned' ? 'Unassigned' : 'Assigned'}`}
                  {` • 📅 Date: ${dateRange.start} to ${dateRange.end}`}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">
                  🔄 Sorted by: <span className="text-blue-600">{sortBy}</span>
                </p>
                <p className="text-xs text-gray-600">
                  Order: <span className="text-blue-600">{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-1.5 sm:p-2 rounded-full bg-blue-100">
              <span className="text-lg sm:text-xl">📅</span>
            </div>
            <div className="ml-2 sm:ml-3 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                {activeTab === 'today' ? "Today's Total" : 
                 activeTab === 'all' ? "All Cases Total" : "My Cases Total"}
              </p>
              <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 sm:p-4 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-1.5 sm:p-2 rounded-full bg-yellow-100">
              <span className="text-lg sm:text-xl">⏳</span>
            </div>
            <div className="ml-2 sm:ml-3 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Pending</p>
              <p className="text-lg sm:text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 sm:p-4 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-1.5 sm:p-2 rounded-full bg-blue-100">
              <span className="text-lg sm:text-xl">🔄</span>
            </div>
            <div className="ml-2 sm:ml-3 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Processing</p>
              <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.processing}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 sm:p-4 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-1.5 sm:p-2 rounded-full bg-green-100">
              <span className="text-lg sm:text-xl">✅</span>
            </div>
            <div className="ml-2 sm:ml-3 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Completed</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 sm:p-4 border-l-4 border-red-500 col-span-2 sm:col-span-1">
          <div className="flex items-center">
            <div className="p-1.5 sm:p-2 rounded-full bg-red-100">
              <span className="text-lg sm:text-xl">🚨</span>
            </div>
            <div className="ml-2 sm:ml-3 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Emergency</p>
              <p className="text-lg sm:text-2xl font-bold text-red-600">{stats.emergency}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Sort for Today's Cases */}
      {activeTab === 'today' && (
        <div className="bg-white rounded-lg shadow border p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-semibold text-gray-800">🔄 Quick Sort Options</h3>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="priority">⚡ Priority</option>
                <option value="createdAt">📅 Arrival Time</option>
                <option value="name">👤 Name</option>
                <option value="symptom">🩺 Symptom</option>
                <option value="emergency">🚨 Emergency</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">⬇️ High to Low</option>
                <option value="asc">⬆️ Low to High</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'today' && (
        /* Todo List Style - Three Columns */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Column */}
          <div className="bg-white rounded-lg shadow border">
            <div className="px-4 py-3 border-b border-gray-200 bg-yellow-50">
              <h3 className="text-lg font-semibold text-yellow-800 flex items-center gap-2">
                <span>⏳</span>
                Pending ({pendingVisits.length})
              </h3>
              <p className="text-sm text-yellow-600">Available for pickup - Cases disappear when picked up by other nurses</p>
            </div>
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {pendingVisits.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-2xl mb-2">🎉</div>
                  <p>No pending cases!</p>
                </div>
              ) : (
                pendingVisits.map((visit) => (
                  <div
                    key={visit._id}
                    className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300"
                    onClick={() => openDetailsModal(visit)}
                  >
                    {/* Minimal Case Card */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">{visit.name}</h4>
                        {visit.emergencyFlag && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">🚨</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">ID: {visit.studentId}</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(visit.priority)}`}>
                          {visit.priority}
                        </span>
                      </div>

                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Symptoms:</span> {visit.symptoms.slice(0, 2).join(', ')}
                        {visit.symptoms.length > 2 && '...'}
                      </div>

                      <div className="text-xs text-gray-400">
                        Arrived: {new Date(visit.createdAt).toLocaleTimeString()}
                      </div>
                      
                                           {/* Show assignment status */}
                     {visit.assignedNurse && (
                       <div className="text-xs text-blue-600 font-medium">
                         👤 Assigned to: {visit.assignedNurse === nurseId ? 'You' : (visit.assignedNurseName || visit.assignedNurse)}
                       </div>
                     )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Processing Column */}
          <div className="bg-white rounded-lg shadow border">
            <div className="px-4 py-3 border-b border-gray-200 bg-blue-50">
              <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                <span>🔄</span>
                Processing ({processingVisits.length})
              </h3>
              <p className="text-sm text-blue-600">Your active cases - Only visible to you</p>
            </div>
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {processingVisits.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-2xl mb-2">📋</div>
                  <p>No active cases</p>
                </div>
              ) : (
                processingVisits.map((visit) => (
                  <div
                    key={visit._id}
                    className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300"
                    onClick={() => openDetailsModal(visit)}
                  >
                    {/* Minimal Case Card */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">{visit.name}</h4>
                        {visit.emergencyFlag && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">🚨</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">ID: {visit.studentId}</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(visit.priority)}`}>
                          {visit.priority}
                        </span>
                      </div>

                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Symptoms:</span> {visit.symptoms.slice(0, 2).join(', ')}
                        {visit.symptoms.length > 2 && '...'}
                      </div>

                      <div className="text-xs text-gray-400">
                        Started: {new Date(visit.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Completed Column */}
          <div className="bg-white rounded-lg shadow border">
            <div className="px-4 py-3 border-b border-gray-200 bg-green-50">
              <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2">
                <span>✅</span>
                Completed ({completedVisits.length})
              </h3>
              <p className="text-sm text-green-600">Your completed cases - Only visible to you</p>
            </div>
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {completedVisits.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-2xl mb-2">🎯</div>
                  <p>No completed cases</p>
                </div>
              ) : (
                completedVisits.map((visit) => (
                  <div
                    key={visit._id}
                    className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300"
                    onClick={() => openDetailsModal(visit)}
                  >
                    {/* Minimal Case Card */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">{visit.name}</h4>
                        {visit.emergencyFlag && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">🚨</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">ID: {visit.studentId}</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(visit.priority)}`}>
                          {visit.priority}
                        </span>
                      </div>

                      <div className="text-xs text-gray-600">
                        <span className="font-medium">Symptoms:</span> {visit.symptoms.slice(0, 2).join(', ')}
                        {visit.symptoms.length > 2 && '...'}
                      </div>

                      <div className="text-xs text-gray-400">
                        Completed: {new Date(visit.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* All Cases Tab Content */}
      {activeTab === 'all' && (
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">All Cases Overview</h3>
            <p className="text-sm text-gray-600">View and monitor all cases in the system</p>
          </div>
          <div className="p-6">
            {filteredAllCases.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-3xl mb-3">🔍</div>
                <p className="text-lg font-medium">No cases found</p>
                <p className="text-sm">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAllCases.map((visit) => (
                  <div
                    key={visit._id}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => openDetailsModal(visit)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{visit.name}</h4>
                          <span className="text-sm text-gray-500">ID: {visit.studentId}</span>
                          {visit.emergencyFlag && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">🚨 Emergency</span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(visit.priority)}`}>
                            {visit.priority}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(visit.queueStatus)}`}>
                            {getStatusIcon(visit.queueStatus)} {visit.queueStatus}
                          </span>
                        </div>

                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Symptoms:</span> {visit.symptoms.join(', ')}
                        </div>

                        <div className="text-xs text-gray-400">
                          Created: {new Date(visit.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div className="text-right">
                        {visit.assignedNurse ? (
                          <div className="text-sm">
                            <span className="font-medium text-blue-600">👤 Assigned to:</span>
                            <div className="text-blue-800">
                              {visit.assignedNurse === nurseId ? 'You' : (visit.assignedNurseName || visit.assignedNurse)}
                            </div>
                            {visit.assignedNurse !== nurseId && (
                              <div className="text-xs text-gray-500">ID: {visit.assignedNurse}</div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">Unassigned</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* My Work History Tab Content */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">My Work History</h3>
            <p className="text-sm text-gray-600">All cases you have handled throughout your time here</p>
          </div>
          <div className="p-6">
            {filteredMyHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-3xl mb-3">📋</div>
                <p className="text-lg font-medium">No work history found</p>
                <p className="text-sm">Try adjusting your filters or check if you have any assigned cases</p>
              </div>
              ) : (
              <div className="space-y-3">
                {filteredMyHistory.map((visit) => (
                  <div
                    key={visit._id}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => openDetailsModal(visit)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{visit.name}</h4>
                          <span className="text-sm text-gray-500">ID: {visit.studentId}</span>
                          {visit.emergencyFlag && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">🚨 Emergency</span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(visit.priority)}`}>
                            {visit.priority}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(visit.queueStatus)}`}>
                            {getStatusIcon(visit.queueStatus)} {visit.queueStatus}
                          </span>
                        </div>

                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Symptoms:</span> {visit.symptoms.join(', ')}
                        </div>

                        <div className="text-xs text-gray-400">
                          Handled on: {new Date(visit.createdAt).toLocaleString()}
                        </div>

                        {visit.notes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700">
                            <span className="font-medium">Your Notes:</span> {visit.notes}
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-green-600 font-medium">
                          ✅ Your Case
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Case Details Modal */}
      {showDetailsModal && selectedVisit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Case Details: {selectedVisit.name}
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            {/* Full Case Details */}
            <div className="space-y-6">
              {/* Patient Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Patient Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{selectedVisit.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Student ID</p>
                    <p className="font-medium font-mono">{selectedVisit.studentId}</p>
                  </div>
                  {selectedVisit.mobile && (
                    <div>
                      <p className="text-sm text-gray-600">Mobile</p>
                      <p className="font-medium">{selectedVisit.mobile}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Arrival Time</p>
                    <p className="font-medium">{new Date(selectedVisit.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Status and Priority */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Status & Priority</h4>
                <div className="flex flex-wrap gap-3">
                  <span className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border-2 ${getStatusColor(selectedVisit.queueStatus)}`}>
                    <span className="mr-2 text-lg">{getStatusIcon(selectedVisit.queueStatus)}</span>
                    {selectedVisit.queueStatus.replace('-', ' ').toUpperCase()}
                  </span>
                  <span className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border-2 ${getPriorityColor(selectedVisit.priority)}`}>
                    {selectedVisit.priority.toUpperCase()}
                  </span>
                  {selectedVisit.emergencyFlag && (
                    <span className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-bold bg-red-100 text-red-800 border-2 border-red-300">
                      🚨 EMERGENCY CASE
                    </span>
                  )}
                </div>
              </div>

              {/* Symptoms */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Symptoms</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedVisit.symptoms.map((symptom, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-white text-gray-700 border border-gray-200">
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Notes</h4>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add any notes about the patient's condition or treatment..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                {selectedVisit.queueStatus === 'waiting' && (
                  <>
                    <button
                      onClick={() => updateQueueStatus(selectedVisit._id, 'in-progress')}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      🚀 Start Treatment
                    </button>
                    {/* No Need: no need to complete the case for pending cases*/}
                    {/* <button
                      onClick={() => updateQueueStatus(selectedVisit._id, 'completed')}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      ✅ Complete
                    </button> */}
                  </>
                )}
                
                {selectedVisit.queueStatus === 'in-progress' && (
                  <button
                    onClick={() => updateQueueStatus(selectedVisit._id, 'completed')}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    ✅ Complete Treatment
                  </button>
                )}
                
                {selectedVisit.queueStatus === 'completed' && (
                  <div className="w-full text-center px-6 py-3 bg-gradient-to-r from-green-50 to-green-100 text-green-700 font-bold rounded-lg border-2 border-green-300">
                    <span className="text-lg mr-2">🎉</span>
                    Case Completed Successfully
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
