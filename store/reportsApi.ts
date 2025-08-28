import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { ReportData, DashboardStats } from '@/types'

export const reportsApi = createApi({
  reducerPath: 'reportsApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api',
    credentials: 'include',
  }),
  tagTypes: ['Reports', 'Stats'],
  endpoints: (builder) => ({
    getDailyReport: builder.query<ReportData, { date: string }>({
      query: ({ date }) => `/reports/daily?date=${date}`,
      providesTags: ['Reports'],
    }),
    
    getWeeklyReport: builder.query<ReportData[], { startDate: string; endDate: string }>({
      query: ({ startDate, endDate }) => `/reports/weekly?startDate=${startDate}&endDate=${endDate}`,
      providesTags: ['Reports'],
    }),
    
    getMonthlyReport: builder.query<ReportData[], { year: number; month: number }>({
      query: ({ year, month }) => `/reports/monthly?year=${year}&month=${month}`,
      providesTags: ['Reports'],
    }),
    
    getCommonSymptoms: builder.query<Array<{ symptom: string; count: number }>, { period: string }>({
      query: ({ period }) => `/reports/symptoms?period=${period}`,
      providesTags: ['Reports'],
    }),
    
    getEmergencyTrends: builder.query<Array<{ date: string; count: number }>, { days: number }>({
      query: ({ days }) => `/reports/emergency-trends?days=${days}`,
      providesTags: ['Reports'],
    }),
    
    exportReport: builder.mutation<{ success: boolean; data: { downloadUrl: string } }, { type: string; params: any }>({
      query: ({ type, params }) => ({
        url: `/reports/export`,
        method: 'POST',
        body: { type, params },
      }),
      invalidatesTags: ['Reports'],
    }),
  }),
})

export const {
  useGetDailyReportQuery,
  useGetWeeklyReportQuery,
  useGetMonthlyReportQuery,
  useGetCommonSymptomsQuery,
  useGetEmergencyTrendsQuery,
  useExportReportMutation,
} = reportsApi
