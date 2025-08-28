import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Visit, CheckInData } from '@/types'

export const visitsApi = createApi({
  reducerPath: 'visitsApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api',
    credentials: 'include',
  }),
  tagTypes: ['Visit', 'CheckIn'],
  endpoints: (builder) => ({
    checkIn: builder.mutation<{ success: boolean; data: any }, CheckInData>({
      query: (body) => ({
        url: '/check-in',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Visit'],
    }),
    
    getCurrentVisit: builder.query<{ success: boolean; data: any }, void>({
      query: () => '/check-in',
      providesTags: ['Visit'],
    }),
    
    getVisitHistory: builder.query<Visit[], { studentId: string }>({
      query: ({ studentId }) => `/visits/history?studentId=${studentId}`,
      providesTags: ['Visit'],
    }),
    
    updateVisit: builder.mutation<{ success: boolean; data: any }, { visitId: string; updates: Partial<Visit> }>({
      query: ({ visitId, updates }) => ({
        url: `/visits/${visitId}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['Visit'],
    }),
  }),
})

export const {
  useCheckInMutation,
  useGetCurrentVisitQuery,
  useGetVisitHistoryQuery,
  useUpdateVisitMutation,
} = visitsApi
