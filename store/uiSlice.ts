import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  sidebarOpen: boolean
  selectedOption: string | null
  theme: 'light' | 'dark'
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    duration?: number
  }>
  modals: {
    emergencyAlert: boolean
    patientDetails: boolean
    confirmAction: boolean
  }
  loadingStates: {
    checkIn: boolean
    queueUpdate: boolean
    reportGeneration: boolean
  }
}

const initialState: UIState = {
  sidebarOpen: false,
  selectedOption: null,
  theme: 'light',
  notifications: [],
  modals: {
    emergencyAlert: false,
    patientDetails: false,
    confirmAction: false,
  },
  loadingStates: {
    checkIn: false,
    queueUpdate: false,
    reportGeneration: false,
  },
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    
    setSelectedOption: (state, action: PayloadAction<string>) => {
      state.selectedOption = action.payload
    },
    
    clearSelectedOption: (state) => {
      state.selectedOption = null
    },
    
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
    },
    
    addNotification: (state, action: PayloadAction<{
      type: 'success' | 'error' | 'warning' | 'info'
      message: string
      duration?: number
    }>) => {
      const id = Date.now().toString()
      state.notifications.push({
        id,
        ...action.payload,
      })
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    
    clearNotifications: (state) => {
      state.notifications = []
    },
    
    setModalOpen: (state, action: PayloadAction<{ modal: keyof UIState['modals']; open: boolean }>) => {
      const { modal, open } = action.payload
      state.modals[modal] = open
    },
    
    setLoadingState: (state, action: PayloadAction<{ key: keyof UIState['loadingStates']; loading: boolean }>) => {
      const { key, loading } = action.payload
      state.loadingStates[key] = loading
    },
    
    resetUI: (state) => {
      state.sidebarOpen = false
      state.notifications = []
      state.modals = {
        emergencyAlert: false,
        patientDetails: false,
        confirmAction: false,
      }
      state.loadingStates = {
        checkIn: false,
        queueUpdate: false,
        reportGeneration: false,
      }
    },
  },
})

export const {
  toggleSidebar,
  setSidebarOpen,
  setSelectedOption,
  clearSelectedOption,
  setTheme,
  addNotification,
  removeNotification,
  clearNotifications,
  setModalOpen,
  setLoadingState,
  resetUI,
} = uiSlice.actions

export default uiSlice.reducer
