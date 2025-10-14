import { useEffect, useCallback, useRef } from 'react'
import { useAppSelector } from '../store'
import { realTimeDataService } from '../services/realtime/RealTimeDataService'
import { WebSocketChannel } from '../types/websocket'
import { selectIsConnected } from '../store/slices/websocketSlice'
import { selectUser } from '../store/slices/authSlice'

/**
 * Hook for managing real-time data connections and subscriptions
 */
export const useRealTimeData = () => {
  const isConnected = useAppSelector(selectIsConnected)
  const initializationRef = useRef(false)

  // Initialize real-time service
  const initialize = useCallback(async () => {
    if (initializationRef.current) {
      return
    }

    try {
      initializationRef.current = true
      await realTimeDataService.initialize()
    } catch (error) {
      console.error('Failed to initialize real-time data service:', error)
      initializationRef.current = false
    }
  }, [])

  // Shutdown real-time service
  const shutdown = useCallback(() => {
    realTimeDataService.shutdown()
    initializationRef.current = false
  }, [])

  // Subscribe to channels
  const subscribe = useCallback(
    (channels: WebSocketChannel[], filters?: Record<string, unknown>) => {
      realTimeDataService.subscribeToChannels(channels, filters)
    },
    []
  )

  // Unsubscribe from channels
  const unsubscribe = useCallback((channels: WebSocketChannel[]) => {
    realTimeDataService.unsubscribeFromChannels(channels)
  }, [])

  // Authenticate with WebSocket
  const authenticateService = useCallback((token: string, userId: string) => {
    realTimeDataService.authenticate(token, userId)
  }, [])

  // Auto-initialize when hook is used
  useEffect(() => {
    initialize()

    return () => {
      // Don't shutdown on unmount as other components might be using it
      // shutdown()
    }
  }, [initialize])

  return {
    isConnected,
    initialize,
    shutdown,
    subscribe,
    unsubscribe,
    authenticate: authenticateService,
    getSubscriptions: () => realTimeDataService.getSubscriptions(),
    getMetrics: () => realTimeDataService.getMetrics(),
    isServiceConnected: () => realTimeDataService.isConnected(),
  }
}

/**
 * Hook for real-time transaction updates
 */
export const useRealTimeTransactions = (userId?: string) => {
  const { subscribe, unsubscribe, isConnected } = useRealTimeData()
  const user = useAppSelector(selectUser)
  const effectiveUserId = userId || user?.id

  useEffect(() => {
    if (isConnected && effectiveUserId) {
      const channels: WebSocketChannel[] = ['user_transactions']
      subscribe(channels, { userId: effectiveUserId })

      return () => {
        unsubscribe(channels)
      }
    }
  }, [isConnected, effectiveUserId, subscribe, unsubscribe])

  return {
    isConnected,
  }
}

/**
 * Hook for real-time wallet balance updates
 */
export const useRealTimeWallets = (userId?: string) => {
  const { subscribe, unsubscribe, isConnected } = useRealTimeData()
  const user = useAppSelector(selectUser)
  const effectiveUserId = userId || user?.id

  useEffect(() => {
    if (isConnected && effectiveUserId) {
      const channels: WebSocketChannel[] = ['user_balances']
      subscribe(channels, { userId: effectiveUserId })

      return () => {
        unsubscribe(channels)
      }
    }
  }, [isConnected, effectiveUserId, subscribe, unsubscribe])

  return {
    isConnected,
  }
}

/**
 * Hook for real-time system health monitoring
 */
export const useRealTimeSystemHealth = () => {
  const { subscribe, unsubscribe, isConnected } = useRealTimeData()
  const user = useAppSelector(selectUser)
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    if (isConnected && isAdmin) {
      const channels: WebSocketChannel[] = ['system_health', 'system_alerts']
      subscribe(channels)

      return () => {
        unsubscribe(channels)
      }
    }
  }, [isConnected, isAdmin, subscribe, unsubscribe])

  return {
    isConnected,
    isAdmin,
  }
}

/**
 * Hook for real-time merchant updates
 */
export const useRealTimeMerchant = (merchantId?: string) => {
  const { subscribe, unsubscribe, isConnected } = useRealTimeData()
  const user = useAppSelector(selectUser)
  const isMerchant = user?.role === 'merchant'
  const effectiveMerchantId = merchantId || user?.id

  useEffect(() => {
    if (isConnected && isMerchant && effectiveMerchantId) {
      const channels: WebSocketChannel[] = [
        'merchant_invoices',
        'merchant_analytics',
        'user_transactions', // For merchant transactions
        'user_balances', // For merchant wallets
      ]
      subscribe(channels, { merchantId: effectiveMerchantId })

      return () => {
        unsubscribe(channels)
      }
    }
  }, [isConnected, isMerchant, effectiveMerchantId, subscribe, unsubscribe])

  return {
    isConnected,
    isMerchant,
  }
}

/**
 * Hook for real-time notifications
 */
export const useRealTimeNotifications = () => {
  const { subscribe, unsubscribe, isConnected } = useRealTimeData()
  const user = useAppSelector(selectUser)

  useEffect(() => {
    if (isConnected && user) {
      const channels: WebSocketChannel[] = ['user_notifications']

      // Add role-specific notification channels
      if (user.role === 'merchant') {
        channels.push('merchant_notifications' as WebSocketChannel)
      } else if (user.role === 'admin') {
        channels.push('admin_notifications' as WebSocketChannel)
      }

      subscribe(channels, { userId: user.id })

      return () => {
        unsubscribe(channels)
      }
    }
  }, [isConnected, user, subscribe, unsubscribe])

  return {
    isConnected,
    userRole: user?.role,
  }
}

/**
 * Hook for comprehensive real-time updates based on user role
 */
export const useRealTimeByRole = () => {
  const { subscribe, unsubscribe, isConnected } = useRealTimeData()
  const user = useAppSelector(selectUser)

  useEffect(() => {
    if (isConnected && user) {
      const channels: WebSocketChannel[] = ['user_notifications']

      // Add role-specific channels
      switch (user.role) {
        case 'user':
          channels.push('user_transactions', 'user_balances')
          break
        case 'merchant':
          channels.push(
            'user_transactions',
            'user_balances',
            'merchant_invoices',
            'merchant_analytics'
          )
          break
        case 'admin':
          channels.push(
            'system_health',
            'system_alerts',
            'admin_notifications',
            'global_announcements'
          )
          break
      }

      subscribe(channels, { userId: user.id })

      return () => {
        unsubscribe(channels)
      }
    }
  }, [isConnected, user, subscribe, unsubscribe])

  return {
    isConnected,
    user,
    userRole: user?.role,
  }
}
