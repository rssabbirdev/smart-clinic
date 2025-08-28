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
              <div key={visit._id} className="px-6 py-4 bg-red-50 border-l-4 border-red-400 hover:bg-red-100 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-sm font-medium text-red-900">{visit.name}</h4>
                      <span className="text-xs text-red-600">ID: {visit.studentId}</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                        🚨 Emergency
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(visit.queueStatus)}`}>
                        {visit.queueStatus.replace('-', ' ')}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(visit.priority)}`}>
                        {visit.priority}
                      </span>
                      {visit.estimatedWaitTime && visit.estimatedWaitTime > 0 && (
                        <span className="text-xs text-red-600">
                          ⏱️ {visit.estimatedWaitTime} min wait
                        </span>
                      )}
                    </div>
                    
                    <div className="mb-2">
                      <p className="text-xs text-red-700">
                        <span className="font-medium">Symptoms:</span> {visit.symptoms.join(', ')}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-red-500">
                      <span>Arrived: {new Date(visit.createdAt).toLocaleTimeString()}</span>
                      {visit.mobile && (
                        <span>📱 {visit.mobile}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {visit.queueStatus === 'waiting' && (
                      <>
                        <button
                          onClick={() => handleAction(visit, 'start')}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                        >
                          Start Treatment
                        </button>
                        <button
                          onClick={() => handleAction(visit, 'complete')}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                        >
                          Complete
                        </button>
                      </>
                    )}
                    
                    {visit.queueStatus === 'in-progress' && (
                      <button
                        onClick={() => handleAction(visit, 'complete')}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                      >
                        Complete
                      </button>
                    )}
                    
                    {visit.queueStatus === 'completed' && (
                      <span className="text-xs text-green-600 font-medium">✓ Completed</span>
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
