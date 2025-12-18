import React from 'react'

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
  // Temporarily disable WebSocket connections until backend WebSocket support is implemented
  console.log(
    'WebSocket connections disabled - backend WebSocket support not yet implemented'
  )

  return <>{children}</>
}

export default WebSocketProvider
