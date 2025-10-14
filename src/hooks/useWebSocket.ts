import { useEffect, useCallback, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../store'
import {
  WebSocketChannel,
  WebSocketMessage,
  WebSocketMessageType,
} from '../types/websocket'
import { webSocketService } from '../services/websocket/WebSocketService'
import {
  setConnecting,
  setConnected,
  setDisconnected,
  setError,
  incrementReconnectAttempts,
  resetReconnectAttempts,
  incrementMessagesReceived,
  incrementMessagesSent,
  updateLatency,
  updateHeartbeat,
  addSubscription,
  removeSubscription,
  addPendingSubscription,
  setLastMessage,
  selectWebSocketState,
  selectIsConnected,
  selectConnectionStatus,
} from '../store/slices/websocketSlice'
import { selectUser, selectAuth } from '../store/slices/authSlice'

// ============================================================================
// Types
// ============================================================================

interface UseWebSocketOptions {
  autoConnect?: boolean
  channels?: WebSocketChannel[]
  onMessage?: (message: WebSocketMessage) => void
  onConnect?: () => void
  onDisconnect?: (reason: string) => void
  onError?: (error: Error) => void
}

interface UseWebSocketReturn {
  isConnected: boolean
  isConnecting: boolean
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error'
  error: string | undefined
  connect: () => Promise<void>
  disconnect: () => void
  send: <T>(type: WebSocketMessageType, payload: T) => void
  subscribe: (channels: WebSocketChannel[]) => void
  unsubscribe: (channels: WebSocketChannel[]) => void
  reconnectAttempts: number
}

// ============================================================================
// Hook Implementation
// ============================================================================

export const useWebSocket = (
  options: UseWebSocketOptions = {}
): UseWebSocketReturn => {
  const {
    autoConnect = false,
    channels = [],
    onMessage,
    onConnect,
    onDisconnect,
    onError,
  } = options

  const dispatch = useAppDispatch()
  const websocketState = useAppSelector(selectWebSocketState)
  const isConnected = useAppSelector(selectIsConnected)
  const connectionStatus = useAppSelector(selectConnectionStatus)
  const user = useAppSelector(selectUser)
  const auth = useAppSelector(selectAuth)

  // Refs to store callback functions to avoid re-registering listeners
  const onMessageRef = useRef(onMessage)
  const onConnectRef = useRef(onConnect)
  const onDisconnectRef = useRef(onDisconnect)
  const onErrorRef = useRef(onError)

  // Update refs when callbacks change
  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    onConnectRef.current = onConnect
  }, [onConnect])

  useEffect(() => {
    onDisconnectRef.current = onDisconnect
  }, [onDisconnect])

  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  // Setup WebSocket event listeners
  useEffect(() => {
    const handleConnect = () => {
      dispatch(setConnected({ timestamp: new Date().toISOString() }))
      onConnectRef.current?.()

      // Authenticate if user is available
      if (auth.token && user?.id) {
        webSocketService.authenticate(auth.token, user.id)
      }
    }

    const handleDisconnect = (reason: string) => {
      dispatch(
        setDisconnected({
          timestamp: new Date().toISOString(),
          reason,
        })
      )
      onDisconnectRef.current?.(reason)
    }

    const handleError = (error: Error) => {
      dispatch(
        setError({
          error: error.message,
          timestamp: new Date().toISOString(),
        })
      )
      onErrorRef.current?.(error)
    }

    const handleReconnect = () => {
      dispatch(incrementReconnectAttempts())
    }

    const handleMessage = (message: WebSocketMessage) => {
      dispatch(incrementMessagesReceived())
      dispatch(setLastMessage(message))

      // Handle heartbeat messages
      if (message.type === 'heartbeat') {
        dispatch(updateHeartbeat(new Date().toISOString()))

        // Calculate latency if timestamp is available
        const payload = message.payload as { timestamp?: string }
        if (payload?.timestamp) {
          const latency = Date.now() - new Date(payload.timestamp).getTime()
          dispatch(updateLatency(latency))
        }
      }

      onMessageRef.current?.(message)
    }

    const handleAuthenticated = () => {
      // Subscribe to initial channels after authentication
      if (channels.length > 0) {
        webSocketService.subscribe(channels)
        channels.forEach(channel => dispatch(addSubscription(channel)))
      }
    }

    const handleSubscribed = (subscribedChannels: WebSocketChannel[]) => {
      subscribedChannels.forEach(channel => dispatch(addSubscription(channel)))
    }

    const handleUnsubscribed = (unsubscribedChannels: WebSocketChannel[]) => {
      unsubscribedChannels.forEach(channel =>
        dispatch(removeSubscription(channel))
      )
    }

    // Register event listeners
    webSocketService.on('connect', handleConnect)
    webSocketService.on('disconnect', handleDisconnect)
    webSocketService.on('error', handleError)
    webSocketService.on('reconnect', handleReconnect)
    webSocketService.on('message', handleMessage)
    webSocketService.on('authenticated', handleAuthenticated)
    webSocketService.on('subscribed', handleSubscribed)
    webSocketService.on('unsubscribed', handleUnsubscribed)

    // Cleanup listeners on unmount
    return () => {
      webSocketService.off('connect', handleConnect)
      webSocketService.off('disconnect', handleDisconnect)
      webSocketService.off('error', handleError)
      webSocketService.off('reconnect', handleReconnect)
      webSocketService.off('message', handleMessage)
      webSocketService.off('authenticated', handleAuthenticated)
      webSocketService.off('subscribed', handleSubscribed)
      webSocketService.off('unsubscribed', handleUnsubscribed)
    }
  }, [dispatch, channels, user, auth.token])

  // Connect function
  const connect = useCallback(async (): Promise<void> => {
    if (websocketState.isConnected || websocketState.isConnecting) {
      return
    }

    dispatch(setConnecting())

    try {
      await webSocketService.connect()
      dispatch(resetReconnectAttempts())
    } catch (error) {
      dispatch(
        setError({
          error: error instanceof Error ? error.message : 'Connection failed',
          timestamp: new Date().toISOString(),
        })
      )
      throw error
    }
  }, [dispatch, websocketState.isConnected, websocketState.isConnecting])

  // Auto-connect if enabled and user is authenticated
  useEffect(() => {
    if (
      autoConnect &&
      auth.token &&
      !isConnected &&
      !websocketState.isConnecting
    ) {
      connect()
    }
  }, [
    autoConnect,
    auth.token,
    isConnected,
    websocketState.isConnecting,
    connect,
  ])

  // Disconnect function
  const disconnect = useCallback((): void => {
    webSocketService.disconnect()
  }, [])

  // Send message function
  const send = useCallback(
    <T>(type: WebSocketMessageType, payload: T): void => {
      webSocketService.send(type, payload)
      dispatch(incrementMessagesSent())
    },
    [dispatch]
  )

  // Subscribe function
  const subscribe = useCallback(
    (channelsToSubscribe: WebSocketChannel[]): void => {
      if (!isConnected) {
        // Add to pending subscriptions if not connected
        channelsToSubscribe.forEach(channel => {
          dispatch(addPendingSubscription(channel))
        })
        return
      }

      webSocketService.subscribe(channelsToSubscribe)
      channelsToSubscribe.forEach(channel => {
        dispatch(addSubscription(channel))
      })
    },
    [dispatch, isConnected]
  )

  // Unsubscribe function
  const unsubscribe = useCallback(
    (channelsToUnsubscribe: WebSocketChannel[]): void => {
      webSocketService.unsubscribe(channelsToUnsubscribe)
      channelsToUnsubscribe.forEach(channel => {
        dispatch(removeSubscription(channel))
      })
    },
    [dispatch]
  )

  return {
    isConnected,
    isConnecting: websocketState.isConnecting,
    connectionStatus,
    error: websocketState.error,
    connect,
    disconnect,
    send,
    subscribe,
    unsubscribe,
    reconnectAttempts: websocketState.reconnectAttempts,
  }
}

// ============================================================================
// Specialized Hooks
// ============================================================================

/**
 * Hook for P2P users to connect to WebSocket with appropriate channels
 */
export const useP2PWebSocket = (
  options: Omit<UseWebSocketOptions, 'channels'> = {}
) => {
  const channels: WebSocketChannel[] = [
    'user_transactions',
    'user_balances',
    'user_notifications',
  ]

  return useWebSocket({
    ...options,
    channels,
    autoConnect: true,
  })
}

/**
 * Hook for merchants to connect to WebSocket with appropriate channels
 */
export const useMerchantWebSocket = (
  options: Omit<UseWebSocketOptions, 'channels'> = {}
) => {
  const channels: WebSocketChannel[] = [
    'merchant_invoices',
    'merchant_analytics',
    'user_notifications',
    'global_announcements',
  ]

  return useWebSocket({
    ...options,
    channels,
    autoConnect: true,
  })
}

/**
 * Hook for admins to connect to WebSocket with appropriate channels
 */
export const useAdminWebSocket = (
  options: Omit<UseWebSocketOptions, 'channels'> = {}
) => {
  const channels: WebSocketChannel[] = [
    'system_alerts',
    'system_health',
    'admin_notifications',
    'global_announcements',
  ]

  return useWebSocket({
    ...options,
    channels,
    autoConnect: true,
  })
}

export default useWebSocket
