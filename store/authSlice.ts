import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AuthSession, GuestSession } from '@/types'

// Define a proper user type
interface User {
  id: string
  name: string
  studentId: string
  role: string
  email?: string
}

interface AuthState {
  user: User | null
  guestSession: GuestSession | null
  isAuthenticated: boolean
  isGuest: boolean
  lastActivity: number
  sessionExpiry: number | null
}

const initialState: AuthState = {
  user: null,
  guestSession: null,
  isAuthenticated: false,
  isGuest: false,
  lastActivity: Date.now(),
  sessionExpiry: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
      state.isGuest = false
      state.guestSession = null
      state.lastActivity = Date.now()
      state.sessionExpiry = Date.now() + (2 * 60 * 1000) // 2 minutes
    },
    
    
    updateActivity: (state) => {
      state.lastActivity = Date.now()
      if (state.sessionExpiry) {
        state.sessionExpiry = Date.now() + (2 * 60 * 1000) // Reset timer
      }
    },
    
    logout: (state) => {
      state.user = null
      state.guestSession = null
      state.isAuthenticated = false
      state.isGuest = false
      state.lastActivity = Date.now()
      state.sessionExpiry = null
    },
    
    clearGuestSession: (state) => {
      state.guestSession = null
      state.isGuest = false
      state.sessionExpiry = null
    },
    
    setSessionExpiry: (state, action: PayloadAction<number>) => {
      state.sessionExpiry = action.payload
    },
  },
})

export const {
  setUser,
  updateActivity,
  logout,
  clearGuestSession,
  setSessionExpiry,
} = authSlice.actions

export default authSlice.reducer
