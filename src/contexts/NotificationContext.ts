import { createContext } from 'react'
import { Notification, WebSocketMessage } from '../types'

export interface NotificationContextType {
  showNotification: (
    notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>
  ) => void
  dismissNotification: (id: string) => void
  acknowledgeNotification: (id: string) => void
  clearAllNotifications: () => void
  handleWebSocketMessage: (message: WebSocketMessage) => void
  unreadCount: number
  notifications: Notification[]
}

export const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined)
