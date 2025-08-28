import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { QueueItem, DashboardStats } from '@/types'

export const queueApi = createApi({
  reducerPath: 'queueApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api',
    credentials: 'include',
  }),
  tagTypes: ['Queue', 'Stats'],
  endpoints: (builder) => ({
    getQueue: builder.query<{ visits: QueueItem[]; stats: DashboardStats }, { status?: string; page?: number; limit?: number }>({
      query: ({ status = 'all', page = 1, limit = 50 }) => ({
        url: `/queue?status=${status}&page=${page}&limit=${limit}`,
      }),
      transformResponse: (response: { success: boolean; data: { visits: any[]; stats: DashboardStats } }) => {
        if (response.success && response.data) {
          return {
            visits: response.data.visits.map((visit: any) => ({
              id: visit._id,
              name: visit.name,
              studentId: visit.studentId,
              symptoms: visit.symptoms || [],
              emergencyFlag: visit.emergencyFlag || false,
              priority: visit.priority || 'medium',
              position: visit.queuePosition || 0,
              estimatedWaitTime: visit.estimatedWaitTime || 15,
              status: visit.queueStatus || 'waiting',
            })),
            stats: response.data.stats,
          }
        }
        return { visits: [], stats: {} as DashboardStats }
      },
      providesTags: ['Queue'],
    }),
    
    getQueueStats: builder.query<DashboardStats, void>({
      query: () => '/queue?status=all&limit=1',
      transformResponse: (response: { success: boolean; data: { stats: DashboardStats } }) => {
        if (response.success && response.data?.stats) {
          return response.data.stats
        }
        return {} as DashboardStats
      },
      providesTags: ['Stats'],
    }),
    
    updateQueueStatus: builder.mutation<{ success: boolean; data: { visit: QueueItem } }, { visitId: string; action: string; notes?: string; priority?: string }>({
      query: (body) => ({
        url: '/queue',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Queue', 'Stats'],
    }),
    
    getEmergencyAlerts: builder.query<QueueItem[], void>({
      query: () => '/queue?status=waiting&limit=100',
      transformResponse: (response: { success: boolean; data: { visits: any[] } }) => {
        if (response.success && response.data?.visits) {
          return response.data.visits
            .filter((visit: any) => visit.emergencyFlag)
            .map((visit: any) => ({
              id: visit._id,
              name: visit.name,
              studentId: visit.studentId,
              symptoms: visit.symptoms || [],
              emergencyFlag: visit.emergencyFlag || false,
              priority: visit.priority || 'medium',
              position: visit.queuePosition || 0,
              estimatedWaitTime: visit.estimatedWaitTime || 15,
              status: visit.queueStatus || 'waiting',
            }))
        }
        return []
      },
      providesTags: ['Queue'],
    }),
  }),
})

export const {
  useGetQueueQuery,
  useGetQueueStatsQuery,
  useUpdateQueueStatusMutation,
  useGetEmergencyAlertsQuery,
} = queueApi
