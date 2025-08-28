import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours} hr`
  }
  return `${hours} hr ${remainingMinutes} min`
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'emergency':
      return 'text-clinic-emergency bg-red-100 border-red-300'
    case 'high':
      return 'text-red-700 bg-red-50 border-red-200'
    case 'medium':
      return 'text-yellow-700 bg-yellow-50 border-yellow-200'
    case 'low':
      return 'text-green-700 bg-green-50 border-green-200'
    default:
      return 'text-gray-700 bg-gray-50 border-gray-200'
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'waiting':
      return 'text-blue-700 bg-blue-50 border-blue-200'
    case 'in-progress':
      return 'text-yellow-700 bg-yellow-50 border-yellow-200'
    case 'completed':
      return 'text-green-700 bg-green-50 border-green-200'
    default:
      return 'text-gray-700 bg-gray-50 border-gray-200'
  }
}
