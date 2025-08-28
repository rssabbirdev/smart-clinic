'use client'

import { DashboardStats } from '@/types'

interface QueueStatsProps {
  stats: DashboardStats | undefined
  isLoading: boolean
  onFilterChange: (filter: 'all' | 'waiting' | 'in-progress' | 'completed') => void
  currentFilter: string
}

export function QueueStats({ stats, isLoading, onFilterChange, currentFilter }: QueueStatsProps) {
  if (isLoading) {
    return (
      <div className="kiosk-card">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="kiosk-card">
        <p className="text-center text-gray-600">No statistics available</p>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Waiting',
      value: stats.totalWaiting,
      color: 'bg-blue-100 border-blue-300 text-blue-800',
      icon: '⏳'
    },
    {
      title: 'In Progress',
      value: stats.totalInProgress,
      color: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      icon: '🔄'
    },
    {
      title: 'Completed',
      value: stats.totalCompleted,
      color: 'bg-green-100 border-green-300 text-green-800',
      icon: '✅'
    },
    {
      title: 'Emergency',
      value: stats.emergencyCases,
      color: 'bg-red-100 border-red-300 text-red-800',
      icon: '🚨'
    }
  ]

  const filters = [
    { value: 'all', label: 'All Patients', color: 'bg-gray-100 text-gray-800' },
    { value: 'waiting', label: 'Waiting', color: 'bg-blue-100 text-blue-800' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' }
  ]

  return (
    <div className="kiosk-card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-kiosk-2xl font-bold text-gray-800">
          📊 Queue Statistics
        </h2>
        
        {/* Filter Buttons */}
        <div className="flex space-x-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => onFilterChange(filter.value as any)}
              className={`px-4 py-2 rounded-lg text-kiosk-sm font-medium transition-colors ${
                currentFilter === filter.value
                  ? 'bg-clinic-primary text-white shadow-lg'
                  : `${filter.color} hover:bg-opacity-80`
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className={`p-4 rounded-xl border-2 ${stat.color} text-center`}
          >
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-kiosk-2xl font-bold mb-1">
              {stat.value}
            </div>
            <div className="text-kiosk-sm font-medium">
              {stat.title}
            </div>
          </div>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-kiosk-base font-semibold text-gray-700 mb-2">
            📈 Today's Activity
          </h3>
          <div className="text-kiosk-2xl font-bold text-gray-800">
            {stats.totalToday}
          </div>
          <div className="text-kiosk-sm text-gray-600">
            Total visits today
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-kiosk-base font-semibold text-gray-700 mb-2">
            ⏱️ Average Wait Time
          </h3>
          <div className="text-kiosk-2xl font-bold text-gray-800">
            {stats.averageWaitTime} min
          </div>
          <div className="text-kiosk-sm text-gray-600">
            Current average
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-kiosk-base font-semibold text-blue-800 mb-3">
          🚀 Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onFilterChange('waiting')}
            className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-kiosk-sm font-medium hover:bg-blue-200 transition-colors"
          >
            View Waiting Patients
          </button>
          <button
            onClick={() => onFilterChange('in-progress')}
            className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-kiosk-sm font-medium hover:bg-yellow-200 transition-colors"
          >
            View Active Patients
          </button>
          <button
            onClick={() => onFilterChange('completed')}
            className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-kiosk-sm font-medium hover:bg-green-200 transition-colors"
          >
            View Completed
          </button>
        </div>
      </div>
    </div>
  )
}
