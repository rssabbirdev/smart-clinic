'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminHeader from '@/components/admin/AdminHeader'

interface User {
  _id: string
  name: string
  studentId: string
  email?: string
  mobile?: string
  role: string
  createdAt: string
}

interface NewUser {
  name: string
  studentId: string
  email: string
  password: string
  mobile?: string
  role: 'nurse' | 'admin'
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'nurse' | 'admin'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState<NewUser>({
    name: '',
    studentId: '',
    email: '',
    password: '',
    mobile: '',
    role: 'nurse'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (session?.user?.role !== 'admin') {
      router.push('/login')
      return
    }
  }, [session, status, router])

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      if (data.success) {
        // Filter out students, only show nurses and admins
        const staffUsers = data.users.filter((user: User) => 
          user.role === 'nurse' || user.role === 'admin'
        )
        setUsers(staffUsers)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setMessage({ type: 'error', text: 'Failed to fetch users' })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    return matchesSearch && matchesRole
  })

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage({ type: 'success', text: `${newUser.role} added successfully!` })
        setShowAddModal(false)
        setNewUser({
          name: '',
          studentId: '',
          email: '',
          password: '',
          mobile: '',
          role: 'nurse'
        })
        fetchUsers() // Refresh the list
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to add user' })
      }
    } catch (error) {
      console.error('Error adding user:', error)
      setMessage({ type: 'error', text: 'Failed to add user' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    
    try {
      const response = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage({ type: 'success', text: `${selectedUser.role} deleted successfully!` })
        setShowDeleteModal(false)
        setSelectedUser(null)
        fetchUsers() // Refresh the list
      } else {
        setMessage({ type: 'error', text: data.message || data.error || 'Failed to delete user' })
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      setMessage({ type: 'error', text: 'Failed to delete user' })
    }
  }

  const openDeleteModal = (user: User) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'nurse':
        return 'bg-purple-100 text-purple-800 border-purple-200'
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
      default:
        return '👤'
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link 
                href="/admin" 
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Dashboard
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Staff Management</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
              <p className="text-gray-600 mt-2">Manage nurses and administrators</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Add New Staff
            </button>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message.text}
            <button
              onClick={() => setMessage(null)}
              className="float-right font-bold text-lg hover:opacity-70"
            >
              ×
            </button>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by name, ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as 'all' | 'nurse' | 'admin')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="nurse">Nurses Only</option>
                <option value="admin">Admins Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Staff Members</h2>
              <div className="text-sm text-gray-600">
                Showing {filteredUsers.length} of {users.length} staff members
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {isLoading ? (
              <div className="px-6 py-8">
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <div className="text-4xl mb-2">👥</div>
                <p className="text-gray-500">No staff members found</p>
                <p className="text-sm text-gray-400 mt-1">
                  {searchTerm || roleFilter !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'No staff members in the system yet'}
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div key={user._id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">{getRoleIcon(user.role)}</span>
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
                      </div>
                      
                      <div className="text-xs text-gray-400 mt-2">
                        Added: {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {user.studentId === session?.user?.studentId && (
                        <span className="text-xs text-blue-600 font-medium px-2 py-1 bg-blue-50 rounded">
                          Current User
                        </span>
                      )}
                      <button
                        onClick={() => openDeleteModal(user)}
                        disabled={user.studentId === session?.user?.studentId}
                        className={`px-3 py-1 text-xs rounded transition-colors ${
                          user.studentId === session?.user?.studentId
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                        title={user.studentId === session?.user?.studentId ? 'Cannot delete your own account' : 'Delete user'}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Staff Member</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID *</label>
                <input
                  type="text"
                  required
                  value={newUser.studentId}
                  onChange={(e) => setNewUser({ ...newUser, studentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter student ID"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter password"
                  minLength={6}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                <input
                  type="tel"
                  value={newUser.mobile}
                  onChange={(e) => setNewUser({ ...newUser, mobile: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter mobile number (optional)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  required
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'nurse' | 'admin' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="nurse">Nurse</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Deletion</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{selectedUser.name}</strong> ({selectedUser.role})?
                This action cannot be undone.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
