'use client'

import { useState, useEffect } from 'react'

export default function LandingPage() {
  const [studentId, setStudentId] = useState('')
  const [studentInfo, setStudentInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showManualForm, setShowManualForm] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showAlreadyInQueueModal, setShowAlreadyInQueueModal] = useState(false)
  const [queueInfo, setQueueInfo] = useState<any>(null)
  const [countdown, setCountdown] = useState(30)
  const [manualForm, setManualForm] = useState({
    name: '',
    class: '',
    mobile: ''
  })

  const symptoms = [
    { id: 'headache', label: 'Headache', icon: '🧠' },
    { id: 'fever', label: 'Fever', icon: '🌡️' },
    { id: 'cough', label: 'Cough', icon: '😷' },
    { id: 'stomach', label: 'Stomach Pain', icon: '🫃' },
    { id: 'injury', label: 'Injury', icon: '🩹' },
    { id: 'dizziness', label: 'Dizziness', icon: '💫' }
  ]

  const severityLevels = ['Low', 'Medium', 'High', 'Emergency']
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [severity, setSeverity] = useState('')
  const [emergencyFlag, setEmergencyFlag] = useState(false)

  // Countdown effect for auto-redirect
  useEffect(() => {
    if ((showSuccessModal || showAlreadyInQueueModal) && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if ((showSuccessModal || showAlreadyInQueueModal) && countdown === 0) {
      handleReturnHome()
    }
  }, [showSuccessModal, showAlreadyInQueueModal, countdown])

  const handleSymptomToggle = (symptomId: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId) 
        ? prev.filter(s => s !== symptomId)
        : [...prev, symptomId]
    )
  }

  const handleSeveritySelect = (level: string) => {
    setSeverity(level)
  }

  const handleStudentIdSearch = async () => {
    if (!studentId.trim()) return
    
    setIsLoading(true)
    try {
      // First check if student is already in queue
      const queueResponse = await fetch(`/api/queue/position?studentId=${studentId}`)
      const queueData = await queueResponse.json()
      
      if (queueData.success) {
        // Student is already in queue, show modal immediately
        setQueueInfo({
          ...queueData.currentVisit,
          queueNumber: queueData.queueNumber,
          totalWaiting: queueData.totalWaiting
        })
        setShowAlreadyInQueueModal(true)
        setCountdown(30)
        setIsLoading(false)
        return
      }

      // If not in queue, search for student in database
      const response = await fetch(`/api/students/search?studentId=${studentId}`)
      const data = await response.json()
      
      if (data.success && data.student) {
        setStudentInfo(data.student)
        setShowManualForm(false)
      } else {
        setShowManualForm(true)
        setStudentInfo(null)
      }
    } catch (error) {
      setShowManualForm(true)
      setStudentInfo(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualSubmit = () => {
    if (manualForm.name.trim() && manualForm.class.trim()) {
      setStudentInfo({
        studentId: studentId || 'GUEST',
        name: manualForm.name,
        class: manualForm.class,
        mobile: manualForm.mobile,
        isGuest: true
      })
      setShowManualForm(false)
    }
  }

  const handleCheckIn = async () => {
    if (!studentInfo || selectedSymptoms.length === 0 || !severity) {
      alert('Please complete all required fields')
      return
    }

    try {
      const response = await fetch('/api/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: studentInfo.studentId,
          name: studentInfo.name,
          class: studentInfo.class,
          mobile: studentInfo.mobile,
          symptoms: selectedSymptoms,
          severity,
          emergencyFlag,
          isGuest: studentInfo.isGuest || false
        }),
      })

      const data = await response.json()
      if (data.success) {
        // Get queue number
        const queueResponse = await fetch(`/api/queue/position?studentId=${studentInfo.studentId}`)
        const queueData = await queueResponse.json()
        
        if (queueData.success) {
          setQueueInfo({
            ...data.data,
            queueNumber: queueData.queueNumber,
            totalWaiting: queueData.totalWaiting
          })
          setShowSuccessModal(true)
          setCountdown(30)
        }
      } else if (data.error === 'already_in_queue') {
        // Show already in queue modal
        const queueResponse = await fetch(`/api/queue/position?studentId=${studentInfo.studentId}`)
        const queueData = await queueResponse.json()
        
        if (queueData.success) {
          setQueueInfo({
            ...data.existingVisit,
            queueNumber: queueData.queueNumber,
            totalWaiting: queueData.totalWaiting
          })
          setShowAlreadyInQueueModal(true)
          setCountdown(30)
        }
      } else {
        alert(data.error || 'Check-in failed')
      }
    } catch (error) {
      alert('Check-in failed. Please try again.')
    }
  }

  const handleEmergency = async () => {
    try {
      const response = await fetch('/api/queue/emergency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: queueInfo.studentId
        }),
      })

      const data = await response.json()
      if (data.success) {
        alert('Your case has been marked as emergency!')
        handleReturnHome()
      } else {
        alert(data.error || 'Failed to mark as emergency')
      }
    } catch (error) {
      alert('Failed to mark as emergency. Please try again.')
    }
  }

  const handleReturnHome = () => {
    setShowSuccessModal(false)
    setShowAlreadyInQueueModal(false)
    setQueueInfo(null)
    setStudentId('')
    setStudentInfo(null)
    setShowManualForm(false)
    setSelectedSymptoms([])
    setSeverity('')
    setEmergencyFlag(false)
    setManualForm({ name: '', class: '', mobile: '' })
    setCountdown(30)
  }

  const canCheckIn = () => {
    return studentInfo && selectedSymptoms.length > 0 && severity && !isLoading
  }

  // Success Modal
  if (showSuccessModal && queueInfo) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold">Check-in Successful!</h2>
            <p className="text-green-100">You have been added to the queue</p>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3 text-center">
                Queue Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-semibold">{studentInfo.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Student ID:</span>
                  <span className="font-semibold">{studentInfo.studentId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Queue Number:</span>
                  <span className="text-2xl font-bold text-blue-600">#{queueInfo.queueNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">People Ahead:</span>
                  <span className="font-semibold">{queueInfo.totalWaiting - 1}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Priority:</span>
                  <span className="font-semibold capitalize">{queueInfo.priority}</span>
                </div>
                {emergencyFlag && (
                  <div className="bg-red-100 border border-red-200 rounded-lg p-3 text-center">
                    <span className="text-red-800 font-semibold">🚨 Emergency Case</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-center font-medium">
                Please wait in the waiting area. Your name will be called when it's your turn.
              </p>
            </div>

            <button
              onClick={handleReturnHome}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors mb-3"
            >
              Return Home
            </button>

            <p className="text-center text-sm text-gray-500">
              Auto-redirecting in {countdown} seconds...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Already in Queue Modal
  if (showAlreadyInQueueModal && queueInfo) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold">Already in Queue!</h2>
            <p className="text-orange-100">You are already registered</p>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3 text-center">
                Current Queue Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-semibold">{queueInfo.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Student ID:</span>
                  <span className="font-semibold">{queueInfo.studentId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Queue Number:</span>
                  <span className="text-2xl font-bold text-blue-600">#{queueInfo.queueNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">People Ahead:</span>
                  <span className="font-semibold">{queueInfo.totalWaiting - 1}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Priority:</span>
                  <span className="font-semibold capitalize">{queueInfo.priority}</span>
                </div>
                {queueInfo.emergencyFlag && (
                  <div className="bg-red-100 border border-red-200 rounded-lg p-3 text-center">
                    <span className="text-red-800 font-semibold">🚨 Emergency Case</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={handleEmergency}
                className="w-full bg-red-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-red-700 transition-colors"
              >
                🚨 Mark as Emergency
              </button>

              <button
                onClick={handleReturnHome}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors"
              >
                Return Home
            </button>
            </div>

            <p className="text-center text-sm text-gray-500">
              Auto-redirecting in {countdown} seconds...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full overflow-hidden">
        {/* Blue Header */}
        <div className="bg-blue-600 text-white p-4 flex items-center space-x-2">
          <span className="text-xl">🏥</span>
          <h1 className="text-xl font-bold">SmartClinic</h1>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-6">
          {/* Student ID Search */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Check in with Student ID
            </h2>
            <div className="flex space-x-3">
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Enter your Student ID"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleStudentIdSearch}
                disabled={!studentId.trim() || isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {/* Student Information */}
          {studentInfo && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">Student Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <p className="font-medium">{studentInfo.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Student ID:</span>
                  <p className="font-medium">{studentInfo.studentId}</p>
                </div>
                <div>
                  <span className="text-gray-600">Class:</span>
                  <p className="font-medium">{studentInfo.class}</p>
                </div>
                {studentInfo.mobile && (
                  <div>
                    <span className="text-gray-600">Mobile:</span>
                    <p className="font-medium">{studentInfo.mobile}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Manual Entry Form */}
          {showManualForm && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-3">Student not found. Please enter manually:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={manualForm.name}
                  onChange={(e) => setManualForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Full Name"
                  className="px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={manualForm.class}
                  onChange={(e) => setManualForm(prev => ({ ...prev, class: e.target.value }))}
                  placeholder="Class/Year"
                  className="px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="tel"
                  value={manualForm.mobile}
                  onChange={(e) => setManualForm(prev => ({ ...prev, mobile: e.target.value }))}
                  placeholder="Mobile (Optional)"
                  className="px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleManualSubmit}
                disabled={!manualForm.name.trim() || !manualForm.class.trim()}
                className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
              >
                Submit
              </button>
            </div>
          )}

          {/* Symptom Selection */}
          <div>
            <h3 className="text-md font-medium mb-3">Select Symptoms:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {symptoms.map((symptom) => (
                <label key={symptom.id} className="flex items-center space-x-2 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedSymptoms.includes(symptom.id)}
                    onChange={() => handleSymptomToggle(symptom.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-2xl">{symptom.icon}</span>
                  <span className="text-sm font-medium">{symptom.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Severity Selection */}
          <div>
            <h3 className="text-md font-medium mb-3">Severity Level:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {severityLevels.map((level) => (
                <label key={level} className="flex items-center space-x-2 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="radio"
                    name="severity"
                    value={level}
                    checked={severity === level}
                    onChange={(e) => handleSeveritySelect(e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Emergency Flag */}
          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={emergencyFlag}
                onChange={(e) => setEmergencyFlag(e.target.checked)}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-red-600">🚨 Emergency Case</span>
            </label>
          </div>

          {/* Check-in Button */}
          <button
            onClick={handleCheckIn}
            disabled={!canCheckIn()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Check In'}
          </button>
        </div>
      </div>
    </div>
  )
}
