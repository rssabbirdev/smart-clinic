'use client'

import { useEffect, useState } from 'react'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    // Listen for custom toast events
    const handleToast = (event: CustomEvent) => {
      const { type, message, duration = 5000 } = event.detail
      const id = Date.now().toString()
      
      setToasts(prev => [...prev, { id, type, message, duration }])
      
      // Auto-remove toast after duration
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
      }, duration)
    }

    window.addEventListener('show-toast', handleToast as EventListener)
    
    return () => {
      window.removeEventListener('show-toast', handleToast as EventListener)
    }
  }, [])

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const getToastStyles = (type: Toast['type']) => {
    const baseStyles = 'p-4 rounded-lg shadow-lg border-l-4 max-w-sm w-full'
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-400 text-green-800`
      case 'error':
        return `${baseStyles} bg-red-50 border-red-400 text-red-800`
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-400 text-yellow-800`
      case 'info':
        return `${baseStyles} bg-blue-50 border-blue-400 text-blue-800`
      default:
        return `${baseStyles} bg-gray-50 border-gray-400 text-gray-800`
    }
  }

  const getToastIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      default:
        return '💬'
    }
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${getToastStyles(toast.type)} animate-fade-in`}
        >
          <div className="flex items-start space-x-3">
            <span className="text-lg">{getToastIcon(toast.type)}</span>
            <div className="flex-1">
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
