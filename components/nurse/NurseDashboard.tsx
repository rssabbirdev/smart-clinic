'use client'

import { useState } from 'react'
import { useGetQueueQuery, useGetQueueStatsQuery, useUpdateQueueStatusMutation } from '@/store/queueApi'
import { QueueStats } from './QueueStats'
import { QueueList } from './QueueList'
import { EmergencyAlerts } from './EmergencyAlerts'
import { PatientDetails } from './PatientDetails'
import { NurseHeader } from './NurseHeader'

export function NurseDashboard() {
  const [selectedVisit, setSelectedVisit] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'waiting' | 'in-progress' | 'completed'>('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch queue data
  const { data: queueData, isLoading: queueLoading } = useGetQueueQuery({
    status: statusFilter,
    page: currentPage,
    limit: 20,
  })

  // Fetch queue statistics
  const { data: stats, isLoading: statsLoading } = useGetQueueStatsQuery()

  // Update queue status mutation
  const [updateStatus, { isLoading: updateLoading }] = useUpdateQueueStatusMutation()

  const handleStatusUpdate = async (visitId: string, action: string, notes?: string, priority?: string) => {
    try {
      await updateStatus({ visitId, action, notes, priority }).unwrap()
      // The query will automatically refetch due to RTK Query invalidation
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Failed to update status. Please try again.')
    }
  }

  const handleVisitSelect = (visit: any) => {
    setSelectedVisit(visit)
  }

  const handleFilterChange = (newFilter: typeof statusFilter) => {
    setStatusFilter(newFilter)
    setCurrentPage(1) // Reset to first page when changing filters
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Nurse Header */}
      <NurseHeader />
      
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Column - Queue Management */}
          <div className="xl:col-span-3 space-y-8">
            {/* Queue Statistics */}
            <QueueStats 
              stats={stats} 
              isLoading={statsLoading}
              onFilterChange={handleFilterChange}
              currentFilter={statusFilter}
            />

            {/* Queue List */}
            <QueueList
              visits={queueData?.visits || []}
              isLoading={queueLoading}
              onVisitSelect={handleVisitSelect}
              onStatusUpdate={handleStatusUpdate}
              updateLoading={updateLoading}
              currentPage={currentPage}
              totalPages={queueData?.stats?.totalPages || 1}
              onPageChange={handlePageChange}
            />
          </div>

          {/* Right Column - Patient Details and Alerts */}
          <div className="space-y-8">
            {/* Emergency Alerts */}
            <EmergencyAlerts />

            {/* Patient Details */}
            {selectedVisit && (
              <PatientDetails
                visit={selectedVisit}
                onStatusUpdate={handleStatusUpdate}
                updateLoading={updateLoading}
              />
            )}

            {/* Quick Actions */}
            <div className="kiosk-card bg-blue-50 border-blue-200">
              <h3 className="text-kiosk-lg font-bold text-blue-800 mb-4">
                🚀 Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setStatusFilter('waiting')}
                  className="w-full kiosk-button-secondary text-left"
                >
                  View Waiting Patients
                </button>
                <button
                  onClick={() => setStatusFilter('in-progress')}
                  className="w-full kiosk-button-secondary text-left"
                >
                  View Active Patients
                </button>
                <button
                  onClick={() => setStatusFilter('completed')}
                  className="w-full kiosk-button-secondary text-left"
                >
                  View Completed Visits
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
