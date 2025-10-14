import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store'
import {
  selectNotifications,
  selectUnreadCount,
  addNotification,
  setNotifications,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  removeNotification,
} from '../store/slices/notificationSlice'
import {
  notificationApiService,
  NotificationPreferences,
} from '../services/notifications/NotificationApiService'
import { notificationManager } from '../services/notifications/NotificationManager'
import { Notification } from '../types'

// ============================================================================
// Types
// ============================================================================

interface UseNotificationsReturn {
  // State
  notifications: Notification[]
  unreadCount: number

  // Actions
  showNotification: (
    notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>
  ) => void
  markNotificationAsRead: (id: string) => Promise<void>
  markNotificationAsUnread: (id: string) => Promise<void>
  markAllNotificationsAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>

  // Data fetching
  refreshNotifications: () => Promise<void>
  loadMoreNotifications: () => Promise<void>

  // Preferences
  updatePreferences: (preferences: NotificationPreferences[]) => Promise<void>

  // Utility
  acknowledgeNotification: (id: string) => Promise<void>
  dismissNotification: (id: string) => void
}

// ============================================================================
// Hook
// ============================================================================

export const useNotifications = (
  autoRefresh: boolean = true,
  refreshInterval: number = 30000 // 30 seconds
): UseNotificationsReturn => {
  const dispatch = useAppDispatch()
  const notifications = useAppSelector(selectNotifications)
  const unreadCount = useAppSelector(selectUnreadCount)

  // Show notification using notification manager
  const showNotification = useCallback(
    (notificationData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
      const notification: Notification = {
        ...notificationData,
        id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        createdAt: new Date().toISOString(),
        isRead: false,
      }

      // Add to Redux store
      dispatch(addNotification(notification))

      // Show via notification manager for toast/sound/vibration
      notificationManager.show(notification)
    },
    [dispatch]
  )

  // Mark notification as read
  const markNotificationAsRead = useCallback(
    async (id: string) => {
      try {
        await notificationApiService.markAsRead(id)
        dispatch(markAsRead(id))
      } catch (error) {
        console.error('Failed to mark notification as read:', error)
        // Still update locally for better UX
        dispatch(markAsRead(id))
      }
    },
    [dispatch]
  )

  // Mark notification as unread
  const markNotificationAsUnread = useCallback(
    async (id: string) => {
      try {
        await notificationApiService.markAsUnread(id)
        dispatch(markAsUnread(id))
      } catch (error) {
        console.error('Failed to mark notification as unread:', error)
        // Still update locally for better UX
        dispatch(markAsUnread(id))
      }
    },
    [dispatch]
  )

  // Mark all notifications as read
  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      await notificationApiService.markAllAsRead()
      dispatch(markAllAsRead())
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      // Still update locally for better UX
      dispatch(markAllAsRead())
    }
  }, [dispatch])

  // Delete notification
  const deleteNotification = useCallback(
    async (id: string) => {
      try {
        await notificationApiService.deleteNotification(id)
        dispatch(removeNotification(id))
      } catch (error) {
        console.error('Failed to delete notification:', error)
        // Still update locally for better UX
        dispatch(removeNotification(id))
      }
    },
    [dispatch]
  )

  // Refresh notifications from server
  const refreshNotifications = useCallback(async () => {
    try {
      const response = await notificationApiService.getNotifications(1, 50)
      dispatch(setNotifications(response.notifications))
    } catch (error) {
      console.error('Failed to refresh notifications:', error)
    }
  }, [dispatch])

  // Load more notifications (for pagination)
  const loadMoreNotifications = useCallback(async () => {
    try {
      const currentPage = Math.ceil(notifications.length / 20) + 1
      const response = await notificationApiService.getNotifications(
        currentPage,
        20
      )

      // Add new notifications to existing ones
      response.notifications.forEach(notification => {
        dispatch(addNotification(notification))
      })
    } catch (error) {
      console.error('Failed to load more notifications:', error)
    }
  }, [dispatch, notifications.length])

  // Update preferences
  const updatePreferences = useCallback(
    async (preferences: NotificationPreferences[]) => {
      try {
        await notificationApiService.updatePreferences(preferences)
      } catch (error) {
        console.error('Failed to update preferences:', error)
        throw error
      }
    },
    []
  )

  // Acknowledge notification (mark as read and dismiss from manager)
  const acknowledgeNotification = useCallback(
    async (id: string) => {
      await markNotificationAsRead(id)
      notificationManager.acknowledge(id)
    },
    [markNotificationAsRead]
  )

  // Dismiss notification from manager
  const dismissNotification = useCallback((id: string) => {
    notificationManager.dismiss(id)
  }, [])

  // Auto-refresh notifications
  useEffect(() => {
    if (!autoRefresh) return

    // Initial load
    refreshNotifications()

    // Set up interval
    const interval = setInterval(refreshNotifications, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, refreshNotifications])

  // Set up notification manager event listeners
  useEffect(() => {
    const handleNotificationAcknowledged = (notificationId: string) => {
      dispatch(markAsRead(notificationId))
    }

    const handleNotificationDismissed = (notificationId: string) => {
      // Optionally remove from store or just mark as dismissed
      // For now, we'll just mark as read
      dispatch(markAsRead(notificationId))
    }

    notificationManager.on('acknowledged', handleNotificationAcknowledged)
    notificationManager.on('dismissed', handleNotificationDismissed)

    return () => {
      notificationManager.off('acknowledged', handleNotificationAcknowledged)
      notificationManager.off('dismissed', handleNotificationDismissed)
    }
  }, [dispatch])

  return {
    // State
    notifications,
    unreadCount,

    // Actions
    showNotification,
    markNotificationAsRead,
    markNotificationAsUnread,
    markAllNotificationsAsRead,
    deleteNotification,

    // Data fetching
    refreshNotifications,
    loadMoreNotifications,

    // Preferences
    updatePreferences,

    // Utility
    acknowledgeNotification,
    dismissNotification,
  }
}

export default useNotifications
