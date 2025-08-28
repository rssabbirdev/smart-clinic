import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { queueApi } from './queueApi'
import { visitsApi } from './visitsApi'
import { reportsApi } from './reportsApi'
import authReducer from './authSlice'
import queueReducer from './queueSlice'
import uiReducer from './uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    queue: queueReducer,
    ui: uiReducer,
    [queueApi.reducerPath]: queueApi.reducer,
    [visitsApi.reducerPath]: visitsApi.reducer,
    [reportsApi.reducerPath]: reportsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      queueApi.middleware,
      visitsApi.middleware,
      reportsApi.middleware,
    ),
  devTools: process.env.NODE_ENV !== 'production',
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
