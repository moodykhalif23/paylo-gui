import React, { Component, ErrorInfo, ReactNode } from 'react'
import {
  GenericErrorFallback,
  NetworkErrorFallback,
  AuthenticationErrorFallback,
  ServerErrorFallback,
} from './FallbackUI'
import { ErrorType } from './errorBoundaryTypes'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  isolate?: boolean // If true, only catches errors from direct children
  errorType?: ErrorType
  resetKeys?: Array<string | number> // Keys that trigger reset when changed
  resetOnPropsChange?: boolean
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorType: ErrorType
  errorId: string
}

class EnhancedErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private resetTimeoutId: number | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: ErrorType.GENERIC,
      errorId: '',
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorType = EnhancedErrorBoundary.determineErrorType(error)
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return {
      hasError: true,
      error,
      errorType,
      errorId,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log error to console and monitoring service
    this.logError(error, errorInfo)

    // Auto-retry for certain error types
    if (this.shouldAutoRetry(error)) {
      this.scheduleAutoRetry()
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props
    const { hasError } = this.state

    // Reset error state when resetKeys change
    if (hasError && resetKeys) {
      const prevResetKeys = prevProps.resetKeys || []
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== prevResetKeys[index]
      )

      if (hasResetKeyChanged) {
        this.resetErrorBoundary()
      }
    }

    // Reset error state when any prop changes (if enabled)
    if (hasError && resetOnPropsChange && prevProps !== this.props) {
      this.resetErrorBoundary()
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  private static determineErrorType(error: Error): ErrorType {
    const message = error.message.toLowerCase()
    const stack = error.stack?.toLowerCase() || ''

    // Network errors
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection') ||
      message.includes('timeout')
    ) {
      return ErrorType.NETWORK
    }

    // Authentication errors
    if (
      message.includes('unauthorized') ||
      message.includes('authentication') ||
      message.includes('token') ||
      message.includes('login')
    ) {
      return ErrorType.AUTHENTICATION
    }

    // Server errors
    if (
      message.includes('server') ||
      message.includes('500') ||
      message.includes('internal error')
    ) {
      return ErrorType.SERVER
    }

    // Chunk loading errors (code splitting)
    if (
      message.includes('loading chunk') ||
      message.includes('chunk load') ||
      stack.includes('chunk')
    ) {
      return ErrorType.CHUNK_LOAD
    }

    // Permission errors
    if (
      message.includes('permission') ||
      message.includes('forbidden') ||
      message.includes('access denied')
    ) {
      return ErrorType.PERMISSION
    }

    return ErrorType.GENERIC
  }

  private logError(error: Error, errorInfo: ErrorInfo) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorType: this.state.errorType,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId(),
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error Boundary Caught Error (${this.state.errorType})`)
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.error('Error Data:', errorData)
      console.groupEnd()
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendErrorToMonitoring(errorData)
    }
  }

  private getCurrentUserId(): string | null {
    try {
      // Get user ID from Redux store or local storage
      const state = (
        window as {
          __REDUX_STORE__?: {
            getState?: () => { auth?: { user?: { id?: string } } }
          }
        }
      ).__REDUX_STORE__?.getState?.()
      return state?.auth?.user?.id || null
    } catch {
      return null
    }
  }

  private sendErrorToMonitoring(errorData: Record<string, unknown>) {
    try {
      // Send to error monitoring service (e.g., Sentry, LogRocket, etc.)
      // Example: Sentry.captureException(error, { extra: errorData });

      // For now, just log to console
      console.error('Error sent to monitoring:', errorData)
    } catch (monitoringError) {
      console.error('Failed to send error to monitoring:', monitoringError)
    }
  }

  private shouldAutoRetry(_error: Error): boolean {
    const { errorType } = this.state

    // Auto-retry for network and chunk loading errors
    return errorType === ErrorType.NETWORK || errorType === ErrorType.CHUNK_LOAD
  }

  private scheduleAutoRetry() {
    // Retry after 3 seconds
    this.resetTimeoutId = window.setTimeout(() => {
      this.resetErrorBoundary()
    }, 3000)
  }

  private resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
      this.resetTimeoutId = null
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: ErrorType.GENERIC,
      errorId: '',
    })
  }

  private renderErrorFallback() {
    const { fallback } = this.props
    const { error, errorType } = this.state

    // Use custom fallback if provided
    if (fallback) {
      return fallback
    }

    // Use specific fallback based on error type
    switch (errorType) {
      case ErrorType.NETWORK:
        return (
          <NetworkErrorFallback
            error={error || undefined}
            resetError={this.resetErrorBoundary}
            showDetails={process.env.NODE_ENV === 'development'}
          />
        )

      case ErrorType.AUTHENTICATION:
        return (
          <AuthenticationErrorFallback
            error={error || undefined}
            resetError={this.resetErrorBoundary}
            showDetails={process.env.NODE_ENV === 'development'}
          />
        )

      case ErrorType.SERVER:
        return (
          <ServerErrorFallback
            error={error || undefined}
            resetError={this.resetErrorBoundary}
            showDetails={process.env.NODE_ENV === 'development'}
          />
        )

      case ErrorType.CHUNK_LOAD:
        return (
          <GenericErrorFallback
            error={error || undefined}
            resetError={this.resetErrorBoundary}
            title="Loading Error"
            message="Failed to load application resources. This usually resolves itself on retry."
            showDetails={process.env.NODE_ENV === 'development'}
            actions={[
              {
                label: 'Reload Page',
                onClick: () => window.location.reload(),
                variant: 'contained',
              },
            ]}
          />
        )

      case ErrorType.PERMISSION:
        return (
          <GenericErrorFallback
            error={error || undefined}
            resetError={this.resetErrorBoundary}
            title="Access Denied"
            message="You don't have permission to access this resource."
            showDetails={process.env.NODE_ENV === 'development'}
            actions={[
              {
                label: 'Go Back',
                onClick: () => window.history.back(),
                variant: 'contained',
              },
              {
                label: 'Go Home',
                onClick: () => (window.location.href = '/'),
                variant: 'outlined',
              },
            ]}
          />
        )

      default:
        return (
          <GenericErrorFallback
            error={error || undefined}
            resetError={this.resetErrorBoundary}
            showDetails={process.env.NODE_ENV === 'development'}
          />
        )
    }
  }

  render() {
    if (this.state.hasError) {
      return this.renderErrorFallback()
    }

    return this.props.children
  }
}

// Specialized error boundaries for different parts of the app
export const RouteErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <EnhancedErrorBoundary
    onError={(error, errorInfo) => {
      console.error('Route error:', error, errorInfo)
    }}
    resetOnPropsChange={true}
  >
    {children}
  </EnhancedErrorBoundary>
)

export const ComponentErrorBoundary: React.FC<{
  children: ReactNode
  componentName?: string
}> = ({ children, componentName }) => (
  <EnhancedErrorBoundary
    isolate={true}
    onError={(error, errorInfo) => {
      console.error(`Component error in ${componentName}:`, error, errorInfo)
    }}
  >
    {children}
  </EnhancedErrorBoundary>
)

export const AsyncErrorBoundary: React.FC<{
  children: ReactNode
  resetKeys?: Array<string | number>
}> = ({ children, resetKeys }) => (
  <EnhancedErrorBoundary
    resetKeys={resetKeys}
    onError={(error, errorInfo) => {
      console.error('Async operation error:', error, errorInfo)
    }}
  >
    {children}
  </EnhancedErrorBoundary>
)

export default EnhancedErrorBoundary
