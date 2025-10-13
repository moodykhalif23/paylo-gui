import { Middleware } from '@reduxjs/toolkit'

// Logging middleware for development
export const loggingMiddleware: Middleware = store => next => action => {
  // Only log in development mode
  if (import.meta.env.DEV) {
    const prevState = store.getState()
    const result = next(action)
    const nextState = store.getState()

    // Log action details
    console.group(`🔄 Action: ${action.type}`)
    console.log('Payload:', action.payload)
    console.log('Previous State:', prevState)
    console.log('Next State:', nextState)
    console.groupEnd()

    return result
  }

  return next(action)
}

// Performance monitoring middleware
export const performanceMiddleware: Middleware = _store => next => action => {
  const start = performance.now()
  const result = next(action)
  const end = performance.now()

  const duration = end - start

  // Log slow actions (> 10ms) in development
  if (import.meta.env.DEV && duration > 10) {
    console.warn(
      `⚠️ Slow action detected: ${action.type} took ${duration.toFixed(2)}ms`
    )
  }

  // Track performance metrics in production
  if (import.meta.env.PROD && duration > 100) {
    // In a real app, you might send this to an analytics service
    console.warn(`Performance: ${action.type} took ${duration.toFixed(2)}ms`)
  }

  return result
}

export default loggingMiddleware
