'use client'

import { useState, useEffect, useRef } from 'react'
import { notificationSounds } from '@/lib/notificationSounds'

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
}

interface Notification {
  id: string
  type: 'new_case' | 'emergency' | 'status_update'
  title: string
  message: string
  visit: Visit
  timestamp: Date
  read: boolean
}

export default function QueueList() {
  const [visits, setVisits] = useState<Visit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [emergencyFilter, setEmergencyFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null)
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [notes, setNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [lastVisitCount, setLastVisitCount] = useState(0)
  const [lastEmergencyCount, setLastEmergencyCount] = useState(0)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    // Request notification permission on component mount
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission)
        })
      }
    }
    
    fetchQueueData()
    // Refresh every 15 seconds for real-time updates
    const interval = setInterval(fetchQueueData, 15000)
    return () => clearInterval(interval)
  }, [])

  const fetchQueueData = async () => {
    try {
      const response = await fetch('/api/queue')
      const data = await response.json()
      if (data.success) {
        // The API returns data in a nested structure: data.data.visits
        const visitsData = data.data?.visits || data.visits || []
        setVisits(visitsData)
        
        // Check for new cases and emergency cases
        checkForNewCases(visitsData)
      }
    } catch (error) {
      console.error('Failed to fetch queue data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkForNewCases = (newVisits: Visit[]) => {
    const currentVisitCount = newVisits.length
    const currentEmergencyCount = newVisits.filter(v => v.emergencyFlag).length
    
    // Check for new cases
    if (currentVisitCount > lastVisitCount && lastVisitCount > 0) {
      const newCases = newVisits.slice(0, currentVisitCount - lastVisitCount)
      newCases.forEach(visit => {
        if (visit.emergencyFlag) {
          showEmergencyNotification(visit)
        } else {
          showNewCaseNotification(visit)
        }
      })
    }
    
    // Check for new emergency cases
    if (currentEmergencyCount > lastEmergencyCount && lastEmergencyCount > 0) {
      const newEmergencyCases = newVisits.filter(v => v.emergencyFlag).slice(0, currentEmergencyCount - lastEmergencyCount)
      newEmergencyCases.forEach(visit => {
        showEmergencyNotification(visit)
      })
    }
    
    setLastVisitCount(currentVisitCount)
    setLastEmergencyCount(currentEmergencyCount)
  }

  const showNewCaseNotification = (visit: Visit) => {
    const notification: Notification = {
      id: Date.now().toString(),
      type: 'new_case',
      title: 'New Patient Arrived',
      message: `${visit.name} (ID: ${visit.studentId}) has checked in with ${visit.symptoms.length} symptom(s)`,
      visit,
      timestamp: new Date(),
      read: false
    }
    
    setNotifications(prev => [notification, ...prev.slice(0, 4)]) // Keep only last 5 notifications
    
    // Play sound using Web Audio API
    notificationSounds.playNewCaseSound()
    
    // Show browser notification if permitted
    if (notificationPermission === 'granted') {
      new Notification('New Patient Arrived', {
        body: `${visit.name} (ID: ${visit.studentId}) has checked in`,
        icon: '/favicon.ico',
        tag: 'new-patient',
        requireInteraction: false
      })
    }
    
    // Show toast notification
    showToast(notification)
  }

  const showEmergencyNotification = (visit: Visit) => {
    const notification: Notification = {
      id: Date.now().toString(),
      type: 'emergency',
      title: '🚨 EMERGENCY CASE!',
      message: `${visit.name} (ID: ${visit.studentId}) requires immediate attention!`,
      visit,
      timestamp: new Date(),
      read: false
    }
    
    setNotifications(prev => [notification, ...prev.slice(0, 4)])
    
    // Play emergency sound using Web Audio API
    notificationSounds.playEmergencySound()
    
    // Show urgent browser notification if permitted
    if (notificationPermission === 'granted') {
      new Notification('🚨 EMERGENCY CASE!', {
        body: `${visit.name} (ID: ${visit.studentId}) requires immediate attention!`,
        icon: '/favicon.ico',
        tag: 'emergency',
        requireInteraction: true
      })
    }
    
    // Show emergency toast
    showToast(notification)
  }

  const showToast = (notification: Notification) => {
    // Create toast element
    const toast = document.createElement('div')
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 translate-x-full ${
      notification.type === 'emergency' 
        ? 'bg-red-500 text-white' 
        : notification.type === 'new_case'
        ? 'bg-blue-500 text-white'
        : 'bg-green-500 text-white'
    }`
    
    toast.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          ${notification.type === 'emergency' ? '🚨' : notification.type === 'new_case' ? '👤' : '✅'}
        </div>
        <div class="ml-3 flex-1">
          <p class="text-sm font-medium">${notification.title}</p>
          <p class="text-sm opacity-90">${notification.message}</p>
        </div>
        <button class="ml-4 text-white opacity-70 hover:opacity-100" onclick="this.parentElement.parentElement.remove()">
          ×
        </button>
      </div>
    `
    
    document.body.appendChild(toast)
    
    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-x-full')
    }, 100)
    
    // Auto remove after 8 seconds
    setTimeout(() => {
      toast.classList.add('translate-x-full')
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast)
        }
      }, 300)
    }, 8000)
  }

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const testNotificationSound = (type: 'new_case' | 'emergency' | 'notification') => {
    notificationSounds.testSound(type)
  }

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission)
      })
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
          notes: visitNotes || notes
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Update local state
          setVisits(prevVisits => 
            prevVisits.map(visit => 
              visit._id === visitId 
                ? { ...visit, queueStatus: newStatus, notes: visitNotes || notes }
                : visit
            )
          )
          
          // Close modal and reset
          setShowNotesModal(false)
          setSelectedVisit(null)
          setNotes('')
          
          // Show success message (you can add a toast notification here)
          console.log('Status updated successfully')
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

  const openStatusModal = (visit: Visit, status: string) => {
    setSelectedVisit(visit)
    setNotes(visit.notes || '')
    setShowNotesModal(true)
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

  // Filter visits based on current filters
  const filteredVisits = visits.filter(visit => {
    const matchesStatus = statusFilter === 'all' || visit.queueStatus === statusFilter
    const matchesPriority = priorityFilter === 'all' || visit.priority === priorityFilter
    const matchesEmergency = emergencyFilter === 'all' || 
      (emergencyFilter === 'emergency' && visit.emergencyFlag) ||
      (emergencyFilter === 'normal' && !visit.emergencyFlag)
    const matchesSearch = 
      visit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (visit.mobile && visit.mobile.includes(searchTerm))

    return matchesStatus && matchesPriority && matchesEmergency && matchesSearch
  })

  // Calculate statistics
  const stats = {
    total: visits.length,
    waiting: visits.filter(v => v.queueStatus === 'waiting').length,
    inProgress: visits.filter(v => v.queueStatus === 'in-progress').length,
    completed: visits.filter(v => v.queueStatus === 'completed').length,
    emergency: visits.filter(v => v.emergencyFlag).length
  }

  const unreadNotifications = notifications.filter(n => !n.read).length

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Stats Cards Loading */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Queue List Loading */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Real-time Notifications Panel */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">🔔 Real-time Notifications</h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Notifications
              {unreadNotifications > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </button>
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="px-3 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
        
        {/* Notification Permission Status */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Browser Notifications:</span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                notificationPermission === 'granted' 
                  ? 'bg-green-100 text-green-800' 
                  : notificationPermission === 'denied'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {notificationPermission === 'granted' ? '✅ Enabled' : 
                 notificationPermission === 'denied' ? '❌ Blocked' : '⚠️ Not Set'}
              </span>
            </div>
            {notificationPermission === 'default' && (
              <button
                onClick={requestNotificationPermission}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded hover:bg-blue-200 transition-colors"
              >
                Enable Notifications
              </button>
            )}
          </div>
        </div>
        
        {/* Sound Test Buttons */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => testNotificationSound('new_case')}
            className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded hover:bg-blue-200 transition-colors"
          >
            🔊 Test New Case Sound
          </button>
          <button
            onClick={() => testNotificationSound('emergency')}
            className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200 transition-colors"
          >
            🔊 Test Emergency Sound
          </button>
          <button
            onClick={() => testNotificationSound('notification')}
            className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200 transition-colors"
          >
            🔊 Test Notification Sound
          </button>
        </div>
        
        {showNotifications && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No notifications</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    notification.type === 'emergency'
                      ? 'bg-red-50 border-red-400'
                      : notification.type === 'new_case'
                      ? 'bg-blue-50 border-blue-400'
                      : 'bg-green-50 border-green-400'
                  } ${notification.read ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        notification.type === 'emergency' ? 'text-red-800' : 
                        notification.type === 'new_case' ? 'text-blue-800' : 'text-green-800'
                      }`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {notification.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-3">
                      {!notification.read && (
                        <button
                          onClick={() => markNotificationAsRead(notification.id)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setNotifications(prev => prev.filter(n => n.id !== notification.id))
                        }}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-blue-100">
              <span className="text-xl">👥</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-yellow-100">
              <span className="text-xl">⏳</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Waiting</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.waiting}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-blue-100">
              <span className="text-xl">🔄</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-green-100">
              <span className="text-xl">✅</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-red-100">
              <span className="text-xl">🚨</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Emergency</p>
              <p className="text-2xl font-bold text-red-600">{stats.emergency}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Filters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Name, ID, or mobile..."
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
          
          <div>
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
          
          <div className="sm:col-span-2 lg:col-span-1 flex items-end">
            <button
              onClick={() => {
                setStatusFilter('all')
                setPriorityFilter('all')
                setEmergencyFilter('all')
                setSearchTerm('')
              }}
              className="w-full px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Queue List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Patient Queue</h2>
              <p className="text-sm text-gray-600">
                Showing {filteredVisits.length} of {visits.length} patients
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredVisits.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-gray-500">No patients found</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || emergencyFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'No patients in queue'}
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
                        {getStatusIcon(visit.queueStatus)} {visit.queueStatus.replace('-', ' ')}
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
                      <span>Arrived: {new Date(visit.createdAt).toLocaleTimeString()}</span>
                      {visit.mobile && (
                        <span>📱 {visit.mobile}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:ml-4 lg:flex-shrink-0">
                    {visit.queueStatus === 'waiting' && (
                      <>
                        <button
                          onClick={() => openStatusModal(visit, 'in-progress')}
                          className="px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors whitespace-nowrap"
                        >
                          Start Treatment
                        </button>
                        <button
                          onClick={() => openStatusModal(visit, 'completed')}
                          className="px-3 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors whitespace-nowrap"
                        >
                          Complete
                        </button>
                      </>
                    )}
                    
                    {visit.queueStatus === 'in-progress' && (
                      <button
                        onClick={() => openStatusModal(visit, 'completed')}
                        className="px-3 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors whitespace-nowrap"
                      >
                        Complete
                      </button>
                    )}
                    
                    {visit.queueStatus === 'completed' && (
                      <span className="text-xs text-green-600 font-medium px-3 py-2">✓ Completed</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Notes Modal */}
      {showNotesModal && selectedVisit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Update Status: {selectedVisit.name}
              </h3>
              <button
                onClick={() => setShowNotesModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add any notes about the patient's condition or treatment..."
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowNotesModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedVisit.queueStatus === 'waiting') {
                    updateQueueStatus(selectedVisit._id, 'in-progress')
                  } else if (selectedVisit.queueStatus === 'in-progress') {
                    updateQueueStatus(selectedVisit._id, 'completed')
                  }
                }}
                disabled={isUpdating}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
