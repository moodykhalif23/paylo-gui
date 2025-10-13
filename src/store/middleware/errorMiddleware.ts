import { Middleware } from '@reduxjs/toolkit'
import { showErrorNotification, setGlobalError } from '../slices/uiSlice'

// Error handling middleware
export const errorMiddleware: Middleware = store => next => action => {
  // Handle rejected async thunks
  if (action.type.endsWith('/rejected')) {
    const error =
      action.payload || action.error?.message || 'An unexpected error occurred'

    // Don't show notifications for authentication errors (handled by auth slice)
    if (!action.type.startsWith('auth/')) {
      store.dispatch(showErrorNotification(error))
    }

    // Set global error for critical system errors
    if (action.type.includes('system') || action.type.includes('critical')) {
      store.dispatch(setGlobalError(error))
    }
  }

  // Handle RTK Query errors
  if (action.type.endsWith('/rejected') && action.meta?.baseQueryMeta) {
    const error = action.payload?.data?.message || 'API request failed'

    // Only show notification for non-authentication errors
    if (action.payload?.status !== 401) {
      store.dispatch(showErrorNotification(error))
    }
  }

  return next(action)
}

export default errorMiddleware
