import React, { useEffect, useState, ReactNode } from 'react'
import { useAppDispatch, useAppSelector } from '../../store'
import {
  addNotification,
  removeNotification,
  markAsRead,
  selectNotifications,
  selectUnreadCount,
} from '../../store/slices/notificationSlice'
import { notificationManager } from '../../services/notifications/NotificationManager'
import { webSocketNotificationService } from '../../services/notifications/WebSocketNotificationService'
import { NotificationToast } from '../notifications/NotificationToast'
import { Notification, WebSocketMessage } from '../../types'
import {
  NotificationContext,
  NotificationContextType,
} from '../../contexts/NotificationContext'

// Re-export for convenience
export { NotificationContext }
export type { NotificationContextType }

// ============================================================================
// Types
// ============================================================================

interface NotificationProviderProps {
  children: ReactNode
}

// ============================================================================
// Provider Component
// ============================================================================

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const dispatch = useAppDispatch()
  const notifications = useAppSelector(selectNotifications)
  const unreadCount = useAppSelector(selectUnreadCount)

  const [activeToasts, setActiveToasts] = useState<Map<string, Notification>>(
    new Map()
  )

  // Initialize notification manager
  useEffect(() => {
    // Listen for new notifications from the manager
    const handleNotification = (notification: Notification) => {
      dispatch(addNotification(notification))

      // Show toast for high priority or action required notifications
      if (
        notification.priority === 'high' ||
        notification.priority === 'critical' ||
        notification.actionRequired
      ) {
        setActiveToasts(
          prev => new Map(prev.set(notification.id, notification))
        )
      }
    }

    const handleAcknowledged = (notificationId: string) => {
      dispatch(markAsRead(notificationId))
      setActiveToasts(prev => {
        const newMap = new Map(prev)
        newMap.delete(notificationId)
        return newMap
      })
    }

    const handleDismissed = (notificationId: string) => {
      dispatch(removeNotification(notificationId))
      setActiveToasts(prev => {
        const newMap = new Map(prev)
        newMap.delete(notificationId)
        return newMap
      })
    }

    // Register event listeners
    notificationManager.on('notification', handleNotification)
    notificationManager.on('acknowledged', handleAcknowledged)
    notificationManager.on('dismissed', handleDismissed)

    return () => {
      notificationManager.off('notification', handleNotification)
      notificationManager.off('acknowledged', handleAcknowledged)
      notificationManager.off('dismissed', handleDismissed)
    }
  }, [dispatch])

  // Context value
  const contextValue: NotificationContextType = {
    showNotification: notificationData => {
      const notification: Notification = {
        ...notificationData,
        id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        isRead: false,
      }

      notificationManager.show(notification)
    },

    dismissNotification: (id: string) => {
      notificationManager.dismiss(id)
    },

    acknowledgeNotification: (id: string) => {
      notificationManager.acknowledge(id)
    },

    clearAllNotifications: () => {
      notificationManager.clearAll()
      setActiveToasts(new Map())
    },

    handleWebSocketMessage: (message: WebSocketMessage) => {
      webSocketNotificationService.handleWebSocketMessage(message)
    },

    unreadCount,
    notifications,
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}

      {/* Render active toast notifications */}
      {Array.from(activeToasts.entries()).map(([id, notification]) => (
        <NotificationToast
          key={id}
          notification={notification}
          open={true}
          onClose={() => {
            setActiveToasts(prev => {
              const newMap = new Map(prev)
              newMap.delete(id)
              return newMap
            })
          }}
          onAcknowledge={() => {
            contextValue.acknowledgeNotification(id)
          }}
        />
      ))}
    </NotificationContext.Provider>
  )
}

// Hook is now exported from hooks/useNotificationContext.ts

export default NotificationProvider
