'use client'

import { useState, useEffect } from 'react'

interface EmergencyVisit {
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

export default function EmergencyAlerts() {
  const [emergencyVisits, setEmergencyVisits] = useState<EmergencyVisit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVisit, setSelectedVisit] = useState<EmergencyVisit | null>(null)
  const [showActionModal, setShowActionModal] = useState(false)
  const [action, setAction] = useState<'start' | 'complete'>('start')

  useEffect(() => {
    fetchEmergencyData()
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchEmergencyData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchEmergencyData = async () => {
    try {
      const response = await fetch('/api/queue/emergency')
      const data = await response.json()
      if (data.success) {
        // The API returns data in a nested structure: data.data
        const visitsData = data.data || data.visits || []
        setEmergencyVisits(visitsData)
      }
    } catch (error) {
      console.error('Failed to fetch emergency data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = (visit: EmergencyVisit, actionType: 'start' | 'complete') => {
    setSelectedVisit(visit)
    setAction(actionType)
    setShowActionModal(true)
  }

  const confirmAction = async () => {
    if (!selectedVisit) return

    try {
      const response = await fetch('/api/queue', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          visitId: selectedVisit._id, 
          action: action === 'start' ? 'start' : 'complete'
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Update local state
          setEmergencyVisits(prevVisits => 
            prevVisits.map(visit => 
              visit._id === selectedVisit._id 
                ? { 
                    ...visit, 
                    queueStatus: action === 'start' ? 'in-progress' : 'completed'
                  }
                : visit
            )
          )
          
          // Close modal
          setShowActionModal(false)
          setSelectedVisit(null)
          
          console.log('Action completed successfully')
        }
      } else {
        console.error('Failed to complete action')
      }
    } catch (error) {
      console.error('Failed to complete action:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-red-200'
      default:
        return 'bg-red-100 text-red-800 border-red-200'
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Emergency Summary Card */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">🚨 Emergency Alerts</h2>
            <p className="text-red-100">
              {emergencyVisits.length === 0 
                ? 'No emergency cases requiring immediate attention' 
                : `${emergencyVisits.length} emergency case${emergencyVisits.length > 1 ? 's' : ''} requiring immediate attention`
              }
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{emergencyVisits.length}</div>
            <div className="text-red-100 text-sm">Active</div>
          </div>
        </div>
      </div>

      {/* Emergency Cases List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">High Priority Cases</h3>
          <p className="text-sm text-gray-600">Emergency and high-priority patients</p>
        </div>

        <div className="divide-y divide-gray-200">
          {emergencyVisits.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-gray-500">No emergency cases</p>
              <p className="text-sm text-gray-400 mt-1">All patients are stable</p>
            </div>
          ) : (
            emergencyVisits.map((visit) => (
              <div key={visit._id} className="p-4 sm:p-6 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 hover:from-red-100 hover:to-red-200 transition-all duration-300 shadow-sm hover:shadow-md">
                {/* Enhanced Emergency Case Card Design */}
                <div className="space-y-4">
                  {/* Top Section - Patient Info & Emergency Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Patient Name and ID Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                        <h4 className="text-base sm:text-lg font-bold text-red-900 truncate">
                          {visit.name}
                        </h4>
                        <span className="text-sm text-red-700 flex-shrink-0 bg-red-200 px-3 py-1.5 rounded-lg font-mono font-semibold">
                          ID: {visit.studentId}
                        </span>
                      </div>
                      
                      {/* Enhanced Emergency Badge */}
                      <div className="mb-3">
                        <span className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg border border-red-300 w-full sm:w-auto justify-center sm:justify-start">
                          🚨 EMERGENCY CASE - IMMEDIATE ATTENTION REQUIRED
                        </span>
                      </div>
                    </div>
                    
                    {/* Priority Indicator - Right Side */}
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold border-2 ${getPriorityColor(visit.priority)}`}>
                        {visit.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Status Row - Enhanced with Icons */}
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold border-2 ${getStatusColor(visit.queueStatus)}`}>
                      <span className="mr-2 text-lg">
                        {visit.queueStatus === 'waiting' ? '⏳' : visit.queueStatus === 'in-progress' ? '🔄' : '✅'}
                      </span>
                      {visit.queueStatus.replace('-', ' ').toUpperCase()}
                    </span>
                    
                    {visit.estimatedWaitTime && visit.estimatedWaitTime > 0 && (
                      <span className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold bg-red-200 text-red-800 border border-red-300">
                        ⏱️ {visit.estimatedWaitTime} min wait
                      </span>
                    )}
                  </div>
                  
                  {/* Symptoms Section - Enhanced Readability */}
                  <div className="bg-white/60 rounded-lg p-3 sm:p-4 border border-red-200">
                    <div className="flex items-start gap-2 mb-3">
                      <span className="text-lg">🏥</span>
                      <h5 className="text-sm font-bold text-red-800">Symptoms</h5>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {visit.symptoms.map((symptom, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300 shadow-sm">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Info Section - Arrival Time and Contact */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-red-600">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🕒</span>
                      <span className="font-medium">Arrived: {new Date(visit.createdAt).toLocaleTimeString()}</span>
                    </div>
                    {visit.mobile && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📱</span>
                        <span className="font-mono font-semibold">{visit.mobile}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons - Enhanced Design */}
                  <div className="flex flex-col sm:flex-row items-stretch gap-3 pt-3 border-t border-red-200">
                    {visit.queueStatus === 'waiting' && (
                      <>
                        <button
                          onClick={() => handleAction(visit, 'start')}
                          className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                        >
                          🚀 Start Emergency Treatment
                        </button>
                        <button
                          onClick={() => handleAction(visit, 'complete')}
                          className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                        >
                          ✅ Complete
                        </button>
                      </>
                    )}
                    
                    {visit.queueStatus === 'in-progress' && (
                      <button
                        onClick={() => handleAction(visit, 'complete')}
                        className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                      >
                        ✅ Complete Emergency Treatment
                      </button>
                    )}
                    
                    {visit.queueStatus === 'completed' && (
                      <div className="w-full text-center px-6 py-3 bg-gradient-to-r from-green-50 to-green-100 text-green-700 font-bold rounded-lg border-2 border-green-300">
                        <span className="text-lg mr-2">🎉</span>
                        Emergency Case Completed Successfully
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Action Confirmation Modal */}
      {showActionModal && selectedVisit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="text-center">
              <div className="text-4xl mb-4">
                {action === 'start' ? '🔄' : '✅'}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirm {action === 'start' ? 'Start Treatment' : 'Complete Case'}
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to {action === 'start' ? 'start treating' : 'mark as completed'} <strong>{selectedVisit.name}</strong>?
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowActionModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  className={`flex-1 px-4 py-2 text-white text-sm rounded-lg transition-colors ${
                    action === 'start' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {action === 'start' ? 'Start Treatment' : 'Complete Case'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
