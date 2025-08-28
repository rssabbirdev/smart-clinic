'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface User {
  _id: string
  name: string
  studentId: string
  email?: string
  mobile?: string
  class?: string
  role: string
  createdAt: string
}

export default function RecentUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  const getUsersByRole = (role: string) => {
    return users.filter(user => user.role === role).slice(0, 5)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'nurse':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'student':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return '👨‍💼'
      case 'nurse':
        return '👩‍⚕️'
      case 'student':
        return '🎓'
      default:
        return '👤'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((section) => (
          <div key={section} className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const students = getUsersByRole('student')
  const nurses = getUsersByRole('nurse')
  const admins = getUsersByRole('admin')

  return (
    <div className="space-y-6">
      {/* Recent Students */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎓</span>
              <h3 className="text-lg font-semibold text-gray-900">Recent Students</h3>
              <span className="text-sm text-gray-500">({students.length} of {users.filter(u => u.role === 'student').length})</span>
            </div>
            <Link
              href="/admin/students"
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              See More
            </Link>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {students.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">No students found</p>
            </div>
          ) : (
            students.map((student) => (
              <div key={student._id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{student.name}</h4>
                      <span className="text-xs text-gray-500">ID: {student.studentId}</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(student.role)}`}>
                        {student.role}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                      {student.email && (
                        <div>
                          <span className="font-medium">Email:</span> {student.email}
                        </div>
                      )}
                      {student.mobile && (
                        <div>
                          <span className="font-medium">Mobile:</span> {student.mobile}
                        </div>
                      )}
                      {student.class && (
                        <div>
                          <span className="font-medium">Class:</span> {student.class}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-400 mt-2">
                      Added: {new Date(student.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Nurses */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">👩‍⚕️</span>
              <h3 className="text-lg font-semibold text-gray-900">Recent Nurses</h3>
              <span className="text-sm text-gray-500">({nurses.length} of {users.filter(u => u.role === 'nurse').length})</span>
            </div>
            <Link
              href="/admin/users?role=nurse"
              className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
            >
              See More
            </Link>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {nurses.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">No nurses found</p>
            </div>
          ) : (
            nurses.map((nurse) => (
              <div key={nurse._id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{nurse.name}</h4>
                      <span className="text-xs text-gray-500">ID: {nurse.studentId}</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(nurse.role)}`}>
                        {nurse.role}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                      {nurse.email && (
                        <div>
                          <span className="font-medium">Email:</span> {nurse.email}
                        </div>
                      )}
                      {nurse.mobile && (
                        <div>
                          <span className="font-medium">Mobile:</span> {nurse.mobile}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-400 mt-2">
                      Added: {new Date(nurse.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Admins */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">👨‍💼</span>
              <h3 className="text-lg font-semibold text-gray-900">Recent Admins</h3>
              <span className="text-sm text-gray-500">({admins.length} of {users.filter(u => u.role === 'admin').length})</span>
            </div>
            <Link
              href="/admin/users?role=admin"
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
            >
              See More
            </Link>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {admins.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">No admins found</p>
            </div>
          ) : (
            admins.map((admin) => (
              <div key={admin._id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{admin.name}</h4>
                      <span className="text-xs text-gray-500">ID: {admin.studentId}</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(admin.role)}`}>
                        {admin.role}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                      {admin.email && (
                        <div>
                          <span className="font-medium">Email:</span> {admin.email}
                        </div>
                      )}
                      {admin.mobile && (
                        <div>
                          <span className="font-medium">Mobile:</span> {admin.mobile}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-400 mt-2">
                      Added: {new Date(admin.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
