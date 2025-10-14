import React, { useEffect, useRef } from 'react'
import { useAppSelector } from '../../store'
import { selectUser, selectIsAuthenticated } from '../../store/slices/authSlice'
import { selectIsConnected } from '../../store/slices/websocketSlice'
import { tokenStorage } from '../api/client'
import { realTimeDataService } from './RealTimeDataService'

/**
 * Component that initializes real-time data services when user is authenticated
 * This should be placed high in the component tree (e.g., in App.tsx)
 */
export const RealTimeInitializer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const user = useAppSelector(selectUser)
  const isConnected = useAppSelector(selectIsConnected)
  const initializationRef = useRef(false)
  const authenticationRef = useRef(false)

  // Initialize real-time service when user is authenticated
  useEffect(() => {
    const initializeRealTime = async () => {
      if (isAuthenticated && user && !initializationRef.current) {
        try {
          initializationRef.current = true
          console.log('Initializing real-time data service...')

          await realTimeDataService.initialize()
          console.log('Real-time data service initialized successfully')
        } catch (error) {
          console.error('Failed to initialize real-time data service:', error)
          initializationRef.current = false
        }
      }
    }

    initializeRealTime()
  }, [isAuthenticated, user])

  // Authenticate with WebSocket when connected
  useEffect(() => {
    const authenticateWebSocket = () => {
      if (isConnected && user && !authenticationRef.current) {
        const token = tokenStorage.getAccessToken()

        if (token) {
          console.log('Authenticating WebSocket connection...')
          realTimeDataService.authenticate(token, user.id)
          authenticationRef.current = true
        }
      }
    }

    authenticateWebSocket()
  }, [isConnected, user])

  // Reset authentication flag when disconnected
  useEffect(() => {
    if (!isConnected) {
      authenticationRef.current = false
    }
  }, [isConnected])

  // Cleanup on unmount or logout
  useEffect(() => {
    return () => {
      if (!isAuthenticated) {
        console.log('Shutting down real-time data service...')
        realTimeDataService.shutdown()
        initializationRef.current = false
        authenticationRef.current = false
      }
    }
  }, [isAuthenticated])

  // Set up event listeners for real-time service
  useEffect(() => {
    const handleConnected = () => {
      console.log('Real-time service connected')
    }

    const handleDisconnected = (reason: string) => {
      console.log('Real-time service disconnected:', reason)
      authenticationRef.current = false
    }

    const handleAuthenticated = (userId: string) => {
      console.log('WebSocket authenticated for user:', userId)

      // Subscribe to appropriate channels based on user role
      if (user) {
        switch (user.role) {
          case 'user':
            realTimeDataService.subscribeToUserUpdates(user.id)
            break
          case 'merchant':
            realTimeDataService.subscribeToMerchantUpdates(user.id)
            break
          case 'admin':
            realTimeDataService.subscribeToAdminUpdates()
            break
        }
      }
    }

    const handleError = (error: Error) => {
      console.error('Real-time service error:', error)
    }

    // Add event listeners
    realTimeDataService.on('connected', handleConnected)
    realTimeDataService.on('disconnected', handleDisconnected)
    realTimeDataService.on('authenticated', handleAuthenticated)
    realTimeDataService.on('error', handleError)

    // Cleanup event listeners
    return () => {
      realTimeDataService.off('connected', handleConnected)
      realTimeDataService.off('disconnected', handleDisconnected)
      realTimeDataService.off('authenticated', handleAuthenticated)
      realTimeDataService.off('error', handleError)
    }
  }, [user])

  return <>{children}</>
}

export default RealTimeInitializer
