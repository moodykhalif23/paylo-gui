import { Routes, Route } from 'react-router-dom'
import { Box, ThemeProvider, CssBaseline } from '@mui/material'
import { useEffect } from 'react'

// Import components
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import WebSocketProvider from './components/providers/WebSocketProvider'
import NotificationProvider from './components/providers/NotificationProvider'
import {
  AccessibilityProvider,
  useAccessibility,
} from './contexts/AccessibilityContext.tsx'
import { createAccessibleTheme } from './theme'
import SkipLinks from './components/common/SkipLinks'
import PerformanceMonitor from './components/common/PerformanceMonitor'
import {
  usePerformanceMonitoring,
  useWebVitals,
  useMemoryMonitoring,
} from './hooks/usePerformanceMonitoring'

// Import enhanced error boundaries and workflow integration
import EnhancedErrorBoundary, {
  RouteErrorBoundary,
} from './components/common/EnhancedErrorBoundary'
import { OfflineFallback } from './components/common/FallbackUI'
import { workflowOrchestrator } from './services/integration/workflowOrchestrator'
import { useAppDispatch, useAppSelector } from './store'
import { initializeAuth } from './store/slices/authSlice'

// Theme wrapper component to access accessibility context
function ThemedApp() {
  const { settings } = useAccessibility()
  const dispatch = useAppDispatch()
  const { isAuthenticated, user } = useAppSelector(state => state.auth)
  const { isConnected } = useAppSelector(state => state.websocket)

  // Performance monitoring for the main app
  usePerformanceMonitoring('ThemedApp', {
    enabled: process.env.NODE_ENV === 'development',
    threshold: 16,
    onSlowRender: metrics => {
      console.warn('Main app slow render:', metrics)
    },
  })

  // Monitor Web Vitals
  useWebVitals()

  // Monitor memory usage every 5 seconds
  useMemoryMonitoring(5000)

  // Initialize application on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize authentication state
        dispatch(initializeAuth())

        // Set up connection monitoring
        const handleOnline = () =>
          workflowOrchestrator.handleConnectionStatusChange(true)
        const handleOffline = () =>
          workflowOrchestrator.handleConnectionStatusChange(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        // Start system health monitoring for admin users
        if (user?.role === 'admin') {
          workflowOrchestrator.monitorSystemHealth()
        }

        return () => {
          window.removeEventListener('online', handleOnline)
          window.removeEventListener('offline', handleOffline)
        }
      } catch (error) {
        console.error('App initialization error:', error)
      }
    }

    initializeApp()
  }, [dispatch, user?.role])

  // Handle authentication state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      // User logged in, initialize user-specific workflows
      console.log(`User ${user.email} authenticated with role: ${user.role}`)
    }
  }, [isAuthenticated, user])

  const theme = createAccessibleTheme({
    highContrast: settings.highContrast,
    fontSize: settings.fontSize,
    reducedMotion: settings.reducedMotion,
  })

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SkipLinks />

      {/* Show offline indicator when disconnected */}
      {!isConnected && <OfflineFallback />}

      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          // Apply accessibility classes to root
          '&.high-contrast': {
            filter: 'contrast(150%)',
          },
          '&.reduced-motion *': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
          },
        }}
        className={[
          settings.highContrast ? 'high-contrast' : '',
          settings.reducedMotion ? 'reduced-motion' : '',
          settings.keyboardNavigation ? 'keyboard-navigation' : '',
          settings.screenReaderMode ? 'screen-reader-mode' : '',
          settings.focusIndicators ? 'focus-indicators' : '',
          settings.skipLinks ? 'skip-links-enabled' : '',
          `accessibility-font-${settings.fontSize}`,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <RouteErrorBoundary>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </RouteErrorBoundary>

        {/* Performance monitoring overlay (development only) */}
        <PerformanceMonitor
          enabled={process.env.NODE_ENV === 'development'}
          position="bottom-right"
        />
      </Box>
    </ThemeProvider>
  )
}

function App() {
  return (
    <EnhancedErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Root application error:', error, errorInfo)
        // In production, send to error monitoring service
      }}
    >
      <AccessibilityProvider>
        <WebSocketProvider>
          <NotificationProvider>
            <ThemedApp />
          </NotificationProvider>
        </WebSocketProvider>
      </AccessibilityProvider>
    </EnhancedErrorBoundary>
  )
}

export default App
