import React, { useEffect, useRef, useCallback } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
} from '@mui/material'
import { Warning } from '@mui/icons-material'
import { useAuth } from '../../hooks/useAuth'

interface SessionManagerProps {
  children: React.ReactNode
  warningThreshold?: number // Minutes before expiration to show warning
  autoRefreshThreshold?: number // Minutes before expiration to auto-refresh
}

export const SessionManager: React.FC<SessionManagerProps> = ({
  children,
  warningThreshold = 5,
  autoRefreshThreshold = 10,
}) => {
  const { isAuthenticated, refreshAuthToken, logout, user } = useAuth()

  const [showWarning, setShowWarning] = React.useState(false)
  const [timeRemaining, setTimeRemaining] = React.useState(0)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const warningTimerRef = useRef<NodeJS.Timeout>()
  const refreshTimerRef = useRef<NodeJS.Timeout>()
  const countdownTimerRef = useRef<NodeJS.Timeout>()

  // Get token expiration time
  const getTokenExpiration = useCallback(() => {
    const token = localStorage.getItem('paylo_access_token')
    if (!token) return null

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.exp * 1000 // Convert to milliseconds
    } catch {
      return null
    }
  }, [])

  // Calculate time until expiration
  const getTimeUntilExpiration = useCallback(() => {
    const expiration = getTokenExpiration()
    if (!expiration) return 0
    return Math.max(0, expiration - Date.now())
  }, [getTokenExpiration])

  // Handle session refresh
  const handleRefreshSession = useCallback(async () => {
    if (isRefreshing) return

    setIsRefreshing(true)
    try {
      await refreshAuthToken()
      setShowWarning(false)
      setTimeRemaining(0)
    } catch (error) {
      console.error('Failed to refresh session:', error)
      // If refresh fails, logout user
      await logout()
    } finally {
      setIsRefreshing(false)
    }
  }, [refreshAuthToken, logout, isRefreshing])

  // Handle session expiration
  const handleSessionExpired = useCallback(async () => {
    setShowWarning(false)
    await logout()
  }, [logout])

  // Setup session monitoring
  const setupSessionMonitoring = useCallback(() => {
    if (!isAuthenticated) return

    const timeUntilExpiration = getTimeUntilExpiration()
    if (timeUntilExpiration <= 0) {
      handleSessionExpired()
      return
    }

    const warningTime = warningThreshold * 60 * 1000 // Convert to milliseconds
    const autoRefreshTime = autoRefreshThreshold * 60 * 1000

    // Clear existing timers
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)

    // Set auto-refresh timer
    if (timeUntilExpiration > autoRefreshTime) {
      refreshTimerRef.current = setTimeout(() => {
        handleRefreshSession()
      }, timeUntilExpiration - autoRefreshTime)
    }

    // Set warning timer
    if (timeUntilExpiration > warningTime) {
      warningTimerRef.current = setTimeout(() => {
        setShowWarning(true)
        setTimeRemaining(Math.ceil(warningTime / 1000 / 60)) // Convert to minutes

        // Start countdown
        countdownTimerRef.current = setInterval(() => {
          const remaining = getTimeUntilExpiration()
          const remainingMinutes = Math.ceil(remaining / 1000 / 60)

          if (remainingMinutes <= 0) {
            handleSessionExpired()
          } else {
            setTimeRemaining(remainingMinutes)
          }
        }, 1000)
      }, timeUntilExpiration - warningTime)
    } else if (timeUntilExpiration > 0) {
      // Show warning immediately if we're already within the warning threshold
      setShowWarning(true)
      setTimeRemaining(Math.ceil(timeUntilExpiration / 1000 / 60))

      countdownTimerRef.current = setInterval(() => {
        const remaining = getTimeUntilExpiration()
        const remainingMinutes = Math.ceil(remaining / 1000 / 60)

        if (remainingMinutes <= 0) {
          handleSessionExpired()
        } else {
          setTimeRemaining(remainingMinutes)
        }
      }, 1000)
    }
  }, [
    isAuthenticated,
    getTimeUntilExpiration,
    warningThreshold,
    autoRefreshThreshold,
    handleRefreshSession,
    handleSessionExpired,
  ])

  // Cleanup timers
  const cleanupTimers = useCallback(() => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
  }, [])

  // Setup monitoring when authentication state changes
  useEffect(() => {
    cleanupTimers()

    if (isAuthenticated) {
      setupSessionMonitoring()
    } else {
      setShowWarning(false)
      setTimeRemaining(0)
    }

    return cleanupTimers
  }, [isAuthenticated, setupSessionMonitoring, cleanupTimers])

  // Handle extend session
  const handleExtendSession = () => {
    handleRefreshSession()
  }

  // Handle logout from warning dialog
  const handleLogoutFromWarning = () => {
    setShowWarning(false)
    logout()
  }

  return (
    <>
      {children}

      <Dialog
        open={showWarning}
        onClose={() => {}} // Prevent closing by clicking outside
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color="warning" />
          Session Expiring Soon
        </DialogTitle>

        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Hi {user?.firstName || 'there'}! Your session will expire in{' '}
            <strong>
              {timeRemaining} minute{timeRemaining !== 1 ? 's' : ''}
            </strong>
            .
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Would you like to extend your session to continue working?
          </Typography>

          {isRefreshing && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Refreshing session...
              </Typography>
              <LinearProgress />
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleLogoutFromWarning}
            color="inherit"
            disabled={isRefreshing}
          >
            Sign Out
          </Button>
          <Button
            onClick={handleExtendSession}
            variant="contained"
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Refreshing...' : 'Extend Session'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default SessionManager
