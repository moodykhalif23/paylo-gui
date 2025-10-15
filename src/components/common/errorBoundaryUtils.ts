import { ErrorInfo } from 'react'

// Hook for manual error reporting
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    // Create a synthetic error boundary state
    console.error('Manual error report:', error, errorInfo)

    // In a real implementation, this would integrate with your error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Send to monitoring service
      console.error('Error sent to monitoring:', { error, errorInfo })
    }
  }
}
