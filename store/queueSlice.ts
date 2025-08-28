import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { QueueItem, EmergencyAlert } from '@/types'

interface QueueState {
  currentQueue: QueueItem[]
  emergencyAlerts: EmergencyAlert[]
  selectedVisit: QueueItem | null
  filters: {
    status: string
    priority: string
    searchTerm: string
  }
  isLoading: boolean
  error: string | null
}

const initialState: QueueState = {
  currentQueue: [],
  emergencyAlerts: [],
  selectedVisit: null,
  filters: {
    status: 'all',
    priority: 'all',
    searchTerm: '',
  },
  isLoading: false,
  error: null,
}

const queueSlice = createSlice({
  name: 'queue',
  initialState,
  reducers: {
    setQueue: (state, action: PayloadAction<QueueItem[]>) => {
      state.currentQueue = action.payload
    },
    
    addToQueue: (state, action: PayloadAction<QueueItem>) => {
      state.currentQueue.push(action.payload)
    },
    
    updateQueueItem: (state, action: PayloadAction<{ id: string; updates: Partial<QueueItem> }>) => {
      const index = state.currentQueue.findIndex(item => item.id === action.payload.id)
      if (index !== -1) {
        state.currentQueue[index] = { ...state.currentQueue[index], ...action.payload.updates }
      }
    },
    
    removeFromQueue: (state, action: PayloadAction<string>) => {
      state.currentQueue = state.currentQueue.filter(item => item.id !== action.payload)
    },
    
    setEmergencyAlerts: (state, action: PayloadAction<EmergencyAlert[]>) => {
      state.emergencyAlerts = action.payload
    },
    
    addEmergencyAlert: (state, action: PayloadAction<EmergencyAlert>) => {
      state.emergencyAlerts.push(action.payload)
    },
    
    acknowledgeEmergencyAlert: (state, action: PayloadAction<string>) => {
      const alert = state.emergencyAlerts.find(a => a.id === action.payload)
      if (alert) {
        alert.acknowledged = true
      }
    },
    
    setSelectedVisit: (state, action: PayloadAction<QueueItem | null>) => {
      state.selectedVisit = action.payload
    },
    
    setFilters: (state, action: PayloadAction<Partial<QueueState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  setQueue,
  addToQueue,
  updateQueueItem,
  removeFromQueue,
  setEmergencyAlerts,
  addEmergencyAlert,
  acknowledgeEmergencyAlert,
  setSelectedVisit,
  setFilters,
  setLoading,
  setError,
  clearError,
} = queueSlice.actions

export default queueSlice.reducer
