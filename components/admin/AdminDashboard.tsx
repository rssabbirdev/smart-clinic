'use client'

import { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { AdminHeader } from './AdminHeader'
import { UserManagement } from './UserManagement'
import { SystemReports } from './SystemReports'
import { SystemSettings } from './SystemSettings'

export function AdminDashboard() {
  const { user } = useSelector((state: RootState) => state.auth)
  const [activeTab, setActiveTab] = useState<'users' | 'reports' | 'settings'>('users')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Admin Header */}
      <AdminHeader />
      
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-clinic-primary text-clinic-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                👥 User Management
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reports'
                    ? 'border-clinic-primary text-clinic-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 System Reports
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-clinic-primary text-clinic-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ⚙️ System Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'reports' && <SystemReports />}
          {activeTab === 'settings' && <SystemSettings />}
        </div>
      </div>
    </div>
  )
}
