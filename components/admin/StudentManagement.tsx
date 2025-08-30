'use client'

import { useState, useEffect } from 'react'

interface Student {
  _id: string
  name: string
  studentId: string
  email?: string
  mobile?: string
  class?: string
  role: string
  createdAt: string
}

interface StudentFormData {
  name: string
  studentId: string
  email: string
  mobile: string
  class: string
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    studentId: '',
    email: '',
    mobile: '',
    class: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      if (data.success) {
        // Filter to show only students
        const studentUsers = data.users.filter((user: Student) => user.role === 'student')
        setStudents(studentUsers)
      }
    } catch (error) {
      console.error('Failed to fetch students:', error)
      setError('Failed to load students')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddStudent = async () => {
    if (!formData.name || !formData.studentId) {
      setError('Name and Student ID are required')
      return
    }

    const requestBody = {
      ...formData,
      role: 'student',
      password: 'default123' // Default password for students
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Student added successfully!')
        setShowAddModal(false)
        resetForm()
        fetchStudents()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.message || 'Failed to add student')
      }
    } catch (error) {
      setError('An error occurred while adding the student')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditStudent = async () => {
    if (!selectedStudent || !formData.name || !formData.studentId) {
      setError('Name and Student ID are required')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/users/${selectedStudent._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Student updated successfully!')
        setShowEditModal(false)
        resetForm()
        fetchStudents()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.message || 'Failed to update student')
      }
    } catch (error) {
      setError('An error occurred while updating the student')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/users/${selectedStudent._id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSuccess('Student deleted successfully!')
        setShowDeleteModal(false)
        setSelectedStudent(null)
        fetchStudents()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to delete student')
      }
    } catch (error) {
      setError('An error occurred while deleting the student')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      studentId: '',
      email: '',
      mobile: '',
      class: ''
    })
    setError('')
  }

  const openEditModal = (student: Student) => {
    setSelectedStudent(student)
    setFormData({
      name: student.name,
      studentId: student.studentId,
      email: student.email || '',
      mobile: student.mobile || '',
      class: student.class || ''
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (student: Student) => {
    setSelectedStudent(student)
    setShowDeleteModal(true)
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesRole = filterRole === 'all' || student.role === filterRole
    return matchesSearch && matchesRole
  })

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
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Header and Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <a 
                href="/admin"
                className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
              >
                ← Back to Dashboard
              </a>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Students</h2>
            <p className="text-sm text-gray-600 mt-1">
              Total: {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <button
            onClick={() => {
              resetForm()
              setShowAddModal(true)
            }}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            ➕ Add New Student
          </button>
        </div>

        {/* Search and Filter */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="student">Students Only</option>
          </select>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Student List</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredStudents.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <div className="text-4xl mb-2">👥</div>
              <p className="text-gray-500">No students found</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchTerm || filterRole !== 'all' ? 'Try adjusting your search or filters' : 'Add your first student to get started'}
              </p>
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div key={student._id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{student.name}</h4>
                      <span className="text-xs text-gray-500">ID: {student.studentId}</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        {student.role}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-600">
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

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => openEditModal(student)}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(student)}
                      className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Add New Student</h3>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID *</label>
                <input
                  type="text"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter student ID"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter mobile number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <input
                  type="text"
                  value={formData.class}
                  onChange={(e) => {
                    const newValue = e.target.value
                    setFormData({ ...formData, class: newValue })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter class/grade"
                />
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex space-x-3">
              <button
                onClick={handleAddStudent}
                disabled={isSubmitting || !formData.name || !formData.studentId}
                className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Adding...' : 'Add Student'}
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Edit Student</h3>
              <p className="text-sm text-gray-600 mt-1">Editing: {selectedStudent.name}</p>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID *</label>
                <input
                  type="text"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter student ID"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter mobile number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <input
                  type="text"
                  value={formData.class}
                  onChange={(e) => {
                    const newValue = e.target.value
                    setFormData({ ...formData, class: newValue })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter class/grade"
                />
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex space-x-3">
              <button
                onClick={handleEditStudent}
                disabled={isSubmitting || !formData.name || !formData.studentId}
                className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Updating...' : 'Update Student'}
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Delete Student</h3>
              <p className="text-sm text-gray-600 mt-1">
                Are you sure you want to delete <strong>{selectedStudent.name}</strong>?
              </p>
              <p className="text-xs text-red-600 mt-2">
                This action cannot be undone. All associated data will be permanently removed.
              </p>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex space-x-3">
              <button
                onClick={handleDeleteStudent}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Student'}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
