'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  studentId: string
  role: string
  email?: string
  mobile?: string
  class?: string
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<string>('all')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      if (data.success) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = selectedRole === 'all' 
    ? users 
    : users.filter(user => user.role === selectedRole)

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'nurse':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'student':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
            <p className="text-sm text-gray-600">Manage system users and roles</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="text-sm border border-gray-300 rounded px-3 py-1 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="nurse">Nurse</option>
              <option value="student">Student</option>
            </select>
            
            <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
              Add User
            </button>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {filteredUsers.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-sm font-medium text-gray-900">{user.name}</h3>
                    <span className="text-xs text-gray-500">ID: {user.studentId}</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                    {user.email && (
                      <div>
                        <span className="font-medium">Email:</span> {user.email}
                      </div>
                    )}
                    {user.mobile && (
                      <div>
                        <span className="font-medium">Mobile:</span> {user.mobile}
                      </div>
                    )}
                    {user.class && (
                      <div>
                        <span className="font-medium">Class:</span> {user.class}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors">
                    Edit
                  </button>
                  <button className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-600 text-center">
          Total Users: {filteredUsers.length} | Showing: {selectedRole === 'all' ? 'All Roles' : selectedRole}
        </p>
      </div>
    </div>
  )
}
