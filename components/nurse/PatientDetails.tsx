'use client'

import { useState } from 'react'
import { QueueItem } from '@/types'
import { formatTime, getPriorityColor, getStatusColor } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

interface PatientDetailsProps {
  visit: QueueItem
  onStatusUpdate: (visitId: string, action: string, notes?: string, priority?: string) => Promise<void>
  updateLoading: boolean
}

export function PatientDetails({ visit, onStatusUpdate, updateLoading }: PatientDetailsProps) {
  const [notes, setNotes] = useState('')
  const [showNotesInput, setShowNotesInput] = useState(false)

  const handleStatusUpdate = async (action: string) => {
    try {
      await onStatusUpdate(visit.id, action, notes)
      if (action === 'complete') {
        setNotes('')
        setShowNotesInput(false)
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handlePriorityChange = async (newPriority: string) => {
    try {
      await onStatusUpdate(visit.id, 'update_priority', undefined, newPriority)
    } catch (error) {
      console.error('Failed to update priority:', error)
    }
  }

  return (
    <div className="kiosk-card">
      <h3 className="text-kiosk-xl font-bold text-gray-800 mb-6">
        👤 Patient Details
      </h3>

      {/* Patient Information */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="text-kiosk-lg font-bold text-gray-800">{visit.name}</h4>
            <p className="text-kiosk-base text-gray-600">ID: {visit.studentId}</p>
          </div>
          <div className="text-right">
            <div className="text-kiosk-2xl font-bold text-gray-800">
              #{visit.position}
            </div>
            <div className="text-kiosk-sm text-gray-600">Queue Position</div>
          </div>
        </div>

        {/* Status and Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h5 className="text-kiosk-base font-semibold text-gray-700 mb-2">Status</h5>
            <span className={`px-3 py-2 rounded-full text-sm font-medium border ${getStatusColor(visit.status)}`}>
              {visit.status === 'waiting' ? '⏳ Waiting' : 
               visit.status === 'in-progress' ? '🔄 In Progress' : 
               '✅ Completed'}
            </span>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h5 className="text-kiosk-base font-semibold text-gray-700 mb-2">Priority</h5>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(visit.priority)}`}>
              {visit.priority === 'emergency' ? '🚨 Emergency' :
               visit.priority === 'high' ? '🔴 High' :
               visit.priority === 'medium' ? '🟡 Medium' : '🟢 Low'}
            </span>
          </div>
        </div>

        {/* Symptoms */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h5 className="text-kiosk-base font-semibold text-gray-700 mb-3">Symptoms</h5>
          <div className="flex flex-wrap gap-2">
            {visit.symptoms.map((symptom, index) => (
              <span
                key={index}
                className="px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {symptom}
              </span>
            ))}
          </div>
        </div>

        {/* Wait Time */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h5 className="text-kiosk-base font-semibold text-gray-700 mb-2">Estimated Wait Time</h5>
          <div className="text-kiosk-lg font-bold text-gray-800">
            {formatTime(visit.estimatedWaitTime)}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4 mb-6">
        {visit.status === 'waiting' && (
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => handleStatusUpdate('start')}
              disabled={updateLoading}
              className="w-full"
            >
              🚀 Start Treatment
            </Button>
            <Button
              onClick={() => handleStatusUpdate('complete')}
              disabled={updateLoading}
              variant="secondary"
              className="w-full"
            >
              ✅ Mark Complete
            </Button>
          </div>
        )}

        {visit.status === 'in-progress' && (
          <Button
            onClick={() => handleStatusUpdate('complete')}
            disabled={updateLoading}
            className="w-full"
          >
            ✅ Mark Complete
          </Button>
        )}

        {/* Priority Change */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h5 className="text-kiosk-base font-semibold text-yellow-800 mb-3">Change Priority</h5>
          <div className="grid grid-cols-2 gap-2">
            {['low', 'medium', 'high', 'emergency'].map((priority) => (
              <button
                key={priority}
                onClick={() => handlePriorityChange(priority)}
                disabled={updateLoading || visit.priority === priority}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  visit.priority === priority
                    ? 'bg-yellow-200 text-yellow-800 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-yellow-100 border border-yellow-300'
                }`}
              >
                {priority === 'emergency' ? '🚨 Emergency' :
                 priority === 'high' ? '🔴 High' :
                 priority === 'medium' ? '🟡 Medium' : '🟢 Low'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h5 className="text-kiosk-base font-semibold text-gray-700">Notes</h5>
          <Button
            onClick={() => setShowNotesInput(!showNotesInput)}
            variant="outline"
            size="sm"
          >
            {showNotesInput ? 'Cancel' : 'Add Notes'}
          </Button>
        </div>

        {showNotesInput && (
          <div className="space-y-3">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this patient..."
              className="w-full p-3 border-2 border-gray-300 rounded-lg text-kiosk-base focus:border-clinic-primary focus:outline-none"
              rows={3}
            />
            <Button
              onClick={() => handleStatusUpdate('update_notes')}
              disabled={updateLoading}
              size="sm"
              className="w-full"
            >
              💾 Save Notes
            </Button>
          </div>
        )}
      </div>

      {/* Emergency Warning */}
      {visit.emergencyFlag && (
        <div className="mt-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">🚨</span>
            <h5 className="text-kiosk-base font-bold text-red-800">Emergency Case</h5>
          </div>
          <p className="text-kiosk-sm text-red-700">
            This patient requires immediate attention. Please prioritize accordingly.
          </p>
        </div>
      )}
    </div>
  )
}
