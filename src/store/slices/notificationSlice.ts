import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Notification, NotificationType, NotificationState } from '../../types'

// ============================================================================
// Initial State
// ============================================================================

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
}

// ============================================================================
// Notification Slice
// ============================================================================

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Add a new notification
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload)
      if (!action.payload.isRead) {
        state.unreadCount += 1
      }
    },

    // Remove a notification
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload)
      if (index !== -1) {
        const notification = state.notifications[index]
        if (!notification.isRead) {
          state.unreadCount -= 1
        }
        state.notifications.splice(index, 1)
      }
    },

    // Mark notification as read
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        n => n.id === action.payload
      )
      if (notification && !notification.isRead) {
        notification.isRead = true
        notification.readAt = new Date().toISOString()
        state.unreadCount -= 1
      }
    },

    // Mark notification as unread
    markAsUnread: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        n => n.id === action.payload
      )
      if (notification && notification.isRead) {
        notification.isRead = false
        notification.readAt = undefined
        state.unreadCount += 1
      }
    },

    // Mark all notifications as read
    markAllAsRead: state => {
      state.notifications.forEach(notification => {
        if (!notification.isRead) {
          notification.isRead = true
          notification.readAt = new Date().toISOString()
        }
      })
      state.unreadCount = 0
    },

    // Clear all notifications
    clearAllNotifications: state => {
      state.notifications = []
      state.unreadCount = 0
    },

    // Clear read notifications
    clearReadNotifications: state => {
      state.notifications = state.notifications.filter(n => !n.isRead)
    },

    // Update notification
    updateNotification: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Notification> }>
    ) => {
      const { id, updates } = action.payload
      const notification = state.notifications.find(n => n.id === id)
      if (notification) {
        Object.assign(notification, updates)

        // Update unread count if read status changed
        if ('isRead' in updates) {
          if (updates.isRead && !notification.isRead) {
            state.unreadCount -= 1
          } else if (!updates.isRead && notification.isRead) {
            state.unreadCount += 1
          }
        }
      }
    },

    // Set notifications (for initial load)
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload
      state.unreadCount = action.payload.filter(n => !n.isRead).length
    },

    // Add multiple notifications
    addNotifications: (state, action: PayloadAction<Notification[]>) => {
      const newNotifications = action.payload
      state.notifications.unshift(...newNotifications)
      state.unreadCount += newNotifications.filter(n => !n.isRead).length
    },

    // Show notification (alias for addNotification for compatibility)
    showNotification: (
      state,
      action: PayloadAction<
        Partial<Omit<Notification, 'id' | 'createdAt' | 'isRead'>> &
          Pick<Notification, 'type' | 'title' | 'message'>
      >
    ) => {
      const notification: Notification = {
        priority: 'medium',
        userId: 'system',
        category: 'system',
        ...action.payload,
        id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        isRead: false,
      }
      state.notifications.unshift(notification)
      state.unreadCount += 1
    },
  },
})

// ============================================================================
// Actions
// ============================================================================

export const {
  addNotification,
  removeNotification,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  clearAllNotifications,
  clearReadNotifications,
  updateNotification,
  setNotifications,
  addNotifications,
  showNotification,
} = notificationSlice.actions

// ============================================================================
// Selectors
// ============================================================================

export const selectNotifications = (state: {
  notifications: NotificationState
}) => state.notifications.notifications

export const selectUnreadCount = (state: {
  notifications: NotificationState
}) => state.notifications.unreadCount

export const selectUnreadNotifications = (state: {
  notifications: NotificationState
}) => state.notifications.notifications.filter(n => !n.isRead)

export const selectNotificationsByCategory =
  (category: string) => (state: { notifications: NotificationState }) =>
    state.notifications.notifications.filter(n => n.category === category)

export const selectNotificationsByType =
  (type: NotificationType) => (state: { notifications: NotificationState }) =>
    state.notifications.notifications.filter(n => n.type === type)

export const selectRecentNotifications =
  (limit: number = 10) =>
  (state: { notifications: NotificationState }) =>
    state.notifications.notifications.slice(0, limit)

// ============================================================================
// Reducer
// ============================================================================

export default notificationSlice.reducer
