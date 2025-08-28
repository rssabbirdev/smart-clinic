interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export function LoadingSpinner({ size = 'medium', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="animate-spin rounded-full h-full w-full border-b-2 border-clinic-primary"></div>
    </div>
  )
}
