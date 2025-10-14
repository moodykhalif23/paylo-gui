import React, { useEffect } from 'react'
import { useAppSelector } from '../../store'
import { selectUser, selectAuth } from '../../store/slices/authSlice'
import {
  useWebSocket,
  useP2PWebSocket,
  useMerchantWebSocket,
  useAdminWebSocket,
} from '../../hooks/useWebSocket'

// ============================================================================
// Types
// ============================================================================

interface WebSocketProviderProps {
  children: React.ReactNode
}

// ============================================================================
// Component
// ============================================================================

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
}) => {
  const user = useAppSelector(selectUser)
  const auth = useAppSelector(selectAuth)

  // Initialize WebSocket connection based on user role
  const p2pWebSocket = useP2PWebSocket({
    onMessage: message => {
      console.log('P2P WebSocket message:', message)
    },
    onConnect: () => {
      console.log('P2P WebSocket connected')
    },
    onDisconnect: reason => {
      console.log('P2P WebSocket disconnected:', reason)
    },
    onError: error => {
      console.error('P2P WebSocket error:', error)
    },
  })

  const merchantWebSocket = useMerchantWebSocket({
    onMessage: message => {
      console.log('Merchant WebSocket message:', message)
    },
    onConnect: () => {
      console.log('Merchant WebSocket connected')
    },
    onDisconnect: reason => {
      console.log('Merchant WebSocket disconnected:', reason)
    },
    onError: error => {
      console.error('Merchant WebSocket error:', error)
    },
  })

  const adminWebSocket = useAdminWebSocket({
    onMessage: message => {
      console.log('Admin WebSocket message:', message)
    },
    onConnect: () => {
      console.log('Admin WebSocket connected')
    },
    onDisconnect: reason => {
      console.log('Admin WebSocket disconnected:', reason)
    },
    onError: error => {
      console.error('Admin WebSocket error:', error)
    },
  })

  // Generic WebSocket for unauthenticated users or fallback
  const genericWebSocket = useWebSocket({
    autoConnect: false,
    onMessage: message => {
      console.log('Generic WebSocket message:', message)
    },
    onConnect: () => {
      console.log('Generic WebSocket connected')
    },
    onDisconnect: reason => {
      console.log('Generic WebSocket disconnected:', reason)
    },
    onError: error => {
      console.error('Generic WebSocket error:', error)
    },
  })

  // Connect to appropriate WebSocket based on user role
  useEffect(() => {
    if (!auth.isAuthenticated || !user) {
      // Disconnect all WebSocket connections if not authenticated
      p2pWebSocket.disconnect()
      merchantWebSocket.disconnect()
      adminWebSocket.disconnect()
      return
    }

    // Connect based on user role
    switch (user.role) {
      case 'user':
        // P2P WebSocket auto-connects
        merchantWebSocket.disconnect()
        adminWebSocket.disconnect()
        break
      case 'merchant':
        // Merchant WebSocket auto-connects
        p2pWebSocket.disconnect()
        adminWebSocket.disconnect()
        break
      case 'admin':
        // Admin WebSocket auto-connects
        p2pWebSocket.disconnect()
        merchantWebSocket.disconnect()
        break
      default:
        // Fallback to generic WebSocket
        p2pWebSocket.disconnect()
        merchantWebSocket.disconnect()
        adminWebSocket.disconnect()
        genericWebSocket.connect()
        break
    }
  }, [
    auth.isAuthenticated,
    user?.role,
    p2pWebSocket,
    merchantWebSocket,
    adminWebSocket,
    genericWebSocket,
    user,
  ])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      p2pWebSocket.disconnect()
      merchantWebSocket.disconnect()
      adminWebSocket.disconnect()
      genericWebSocket.disconnect()
    }
  }, [p2pWebSocket, merchantWebSocket, adminWebSocket, genericWebSocket])

  return <>{children}</>
}

export default WebSocketProvider
