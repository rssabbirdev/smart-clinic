export interface User {
  id: string
  name: string
  studentId: string
  role: 'student' | 'nurse' | 'admin'
  mobile?: string
  email?: string
  password?: string
  createdAt: Date
  updatedAt: Date
}

export interface Visit {
  id: string
  userId?: string // nullable if guest mode
  name: string
  studentId: string
  mobile?: string
  symptoms: string[]
  queueStatus: 'waiting' | 'in-progress' | 'completed'
  emergencyFlag: boolean
  priority: 'low' | 'medium' | 'high' | 'emergency'
  estimatedWaitTime?: number // in minutes
  createdAt: Date
  updatedAt: Date
}

export interface GuestSession {
  id: string
  name: string
  studentId: string
  mobile?: string
  sessionToken: string
  expiresAt: Date
  createdAt: Date
}

export interface QueueItem {
  id: string
  name: string
  studentId: string
  symptoms: string[]
  emergencyFlag: boolean
  priority: 'low' | 'medium' | 'high' | 'emergency'
  position: number
  estimatedWaitTime: number
  status: 'waiting' | 'in-progress' | 'completed'
}

export interface SymptomCategory {
  id: string
  name: string
  icon: string
  symptoms: string[]
  priority: 'low' | 'medium' | 'high' | 'emergency'
}

export interface EmergencyAlert {
  id: string
  visitId: string
  studentName: string
  studentId: string
  symptoms: string[]
  timestamp: Date
  acknowledged: boolean
}

export interface DashboardStats {
  totalWaiting: number
  totalInProgress: number
  totalCompleted: number
  emergencyCases: number
  averageWaitTime: number
  totalToday: number
  totalPages: number
  currentPage: number
  totalCount: number
}

export interface ReportData {
  date: string
  totalVisits: number
  emergencyCases: number
  averageWaitTime: number
  commonSymptoms: Array<{ symptom: string; count: number }>
}

export interface AuthSession {
  user?: {
    id: string
    name: string
    studentId: string
    role: string
    email?: string
  }
  expires: string
}

export interface GuestLoginData {
  name: string
  studentId: string
  mobile?: string
}

export interface CheckInData {
  symptoms: string[]
  emergencyFlag: boolean
  priority: 'low' | 'medium' | 'high' | 'emergency'
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface DashboardHeaderProps {
  userInfo: {
    name: string
    studentId: string
    mobile?: string
  } | null
  isGuest: boolean
}
