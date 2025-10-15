import {
  Notification,
  NotificationType,
  NotificationPriority,
} from '../../types'

// Simple EventEmitter for browser compatibility
class EventEmitter {
  private listeners: Map<string, ((...args: unknown[]) => void)[]> = new Map()

  on(event: string, listener: (...args: unknown[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(listener)
  }

  off(event: string, listener: (...args: unknown[]) => void): void {
    const listeners = this.listeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  emit(event: string, ...args: unknown[]): void {
    const listeners = this.listeners.get(event)
    if (listeners) {
      listeners.forEach(listener => listener(...args))
    }
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }
}

// ============================================================================
// Types
// ============================================================================

interface NotificationManagerConfig {
  maxNotifications: number
  defaultDuration: number
  enableSound: boolean
  enableVibration: boolean
  groupSimilar: boolean
  enableDoNotDisturb: boolean
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
}

interface NotificationQueue {
  id: string
  notification: Notification
  timestamp: number
  shown: boolean
  acknowledged: boolean
}

// ============================================================================
// Notification Manager
// ============================================================================

export class NotificationManager extends EventEmitter {
  private config: NotificationManagerConfig
  private queue: NotificationQueue[] = []
  private activeNotifications: Map<string, NodeJS.Timeout> = new Map()
  private preferences: Map<string, Record<string, unknown>> = new Map()

  constructor(config?: Partial<NotificationManagerConfig>) {
    super()

    this.config = {
      maxNotifications: 5,
      defaultDuration: 6000,
      enableSound: true,
      enableVibration: true,
      groupSimilar: true,
      enableDoNotDisturb: false,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00',
      },
      ...config,
    }

    // Load preferences from localStorage
    this.loadPreferences()
  }

  /**
   * Show a notification
   */
  show(notification: Notification): void {
    // Check if notifications are enabled for this category
    if (!this.isNotificationEnabled(notification)) {
      return
    }

    // Check for similar notifications if grouping is enabled
    if (this.config.groupSimilar) {
      const similar = this.findSimilarNotification(notification)
      if (similar) {
        this.updateSimilarNotification(similar, notification)
        return
      }
    }

    // Add to queue
    const queueItem: NotificationQueue = {
      id: notification.id,
      notification,
      timestamp: Date.now(),
      shown: false,
      acknowledged: false,
    }

    this.queue.push(queueItem)
    this.processQueue()
    this.emit('queueUpdated', this.queue)
  }

  /**
   * Acknowledge a notification
   */
  acknowledge(notificationId: string): void {
    const queueItem = this.queue.find(item => item.id === notificationId)
    if (queueItem) {
      queueItem.acknowledged = true
      this.emit('acknowledged', notificationId)
    }

    // Clear auto-dismiss timer
    const timer = this.activeNotifications.get(notificationId)
    if (timer) {
      clearTimeout(timer)
      this.activeNotifications.delete(notificationId)
    }
  }

  /**
   * Dismiss a notification
   */
  dismiss(notificationId: string): void {
    this.queue = this.queue.filter(item => item.id !== notificationId)
    this.emit('dismissed', notificationId)
    this.emit('queueUpdated', this.queue)

    // Clear auto-dismiss timer
    const timer = this.activeNotifications.get(notificationId)
    if (timer) {
      clearTimeout(timer)
      this.activeNotifications.delete(notificationId)
    }
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    // Clear all timers
    this.activeNotifications.forEach(timer => clearTimeout(timer))
    this.activeNotifications.clear()

    // Clear queue
    this.queue = []
    this.emit('queueUpdated', this.queue)
  }

  /**
   * Get current notification queue
   */
  getQueue(): NotificationQueue[] {
    return [...this.queue]
  }

  /**
   * Get unread notification count
   */
  getUnreadCount(): number {
    return this.queue.filter(item => !item.acknowledged).length
  }

  /**
   * Update notification preferences
   */
  updatePreferences(
    category: string,
    preferences: Record<string, unknown>
  ): void {
    this.preferences.set(category, preferences)
    this.savePreferences()
  }

  /**
   * Get notification preferences
   */
  getPreferences(category: string): Record<string, unknown> {
    return this.preferences.get(category) || {}
  }

  /**
   * Process notification queue
   */
  private processQueue(): void {
    const unshownNotifications = this.queue.filter(item => !item.shown)
    const activeCount = this.queue.filter(
      item => item.shown && !item.acknowledged
    ).length

    // Show notifications up to the maximum limit
    const availableSlots = this.config.maxNotifications - activeCount
    const toShow = unshownNotifications.slice(0, availableSlots)

    toShow.forEach(queueItem => {
      this.showNotification(queueItem)
    })
  }

  /**
   * Show individual notification
   */
  private showNotification(queueItem: NotificationQueue): void {
    queueItem.shown = true
    this.emit('notification', queueItem.notification)

    // Play sound if enabled
    if (
      this.config.enableSound &&
      this.shouldPlaySound(queueItem.notification)
    ) {
      this.playNotificationSound(queueItem.notification.type)
    }

    // Vibrate if enabled and supported
    if (this.config.enableVibration && 'vibrate' in navigator) {
      this.vibrateDevice(queueItem.notification.priority)
    }

    // Set auto-dismiss timer for non-persistent notifications
    if (!queueItem.notification.persistent) {
      const duration = this.getNotificationDuration(queueItem.notification)
      const timer = setTimeout(() => {
        this.dismiss(queueItem.id)
      }, duration)

      this.activeNotifications.set(queueItem.id, timer)
    }
  }

  /**
   * Check if notification is enabled for category
   */
  private isNotificationEnabled(notification: Notification): boolean {
    // Check do not disturb mode
    if (this.config.enableDoNotDisturb) {
      return false
    }

    // Check quiet hours
    if (this.config.quietHours.enabled && this.isQuietHours()) {
      // Only allow critical notifications during quiet hours
      return notification.priority === 'critical'
    }

    const preferences = this.getPreferences(notification.category || 'default')
    return preferences.enabled !== false
  }

  /**
   * Check if current time is within quiet hours
   */
  private isQuietHours(): boolean {
    if (!this.config.quietHours.enabled) return false

    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()

    const [startHour, startMin] = this.config.quietHours.start
      .split(':')
      .map(Number)
    const [endHour, endMin] = this.config.quietHours.end.split(':').map(Number)

    const startTime = startHour * 60 + startMin
    const endTime = endHour * 60 + endMin

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime
    }

    return currentTime >= startTime && currentTime <= endTime
  }

  /**
   * Update global configuration
   */
  updateConfig(newConfig: Partial<NotificationManagerConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.savePreferences()
  }

  /**
   * Get current configuration
   */
  getConfig(): NotificationManagerConfig {
    return { ...this.config }
  }

  /**
   * Find similar notification for grouping
   */
  private findSimilarNotification(
    notification: Notification
  ): NotificationQueue | null {
    return (
      this.queue.find(
        item =>
          item.notification.category === notification.category &&
          item.notification.type === notification.type &&
          !item.acknowledged &&
          Date.now() - item.timestamp < 60000 // Within last minute
      ) || null
    )
  }

  /**
   * Update similar notification with new information
   */
  private updateSimilarNotification(
    similar: NotificationQueue,
    _newNotification: Notification
  ): void {
    // Update the existing notification with new information
    similar.notification = {
      ...similar.notification,
      message: `${similar.notification.message} (and 1 more)`,
      updatedAt: new Date().toISOString(),
    }
    similar.timestamp = Date.now()

    this.emit('notification', similar.notification)
  }

  /**
   * Get notification duration based on priority and type
   */
  private getNotificationDuration(notification: Notification): number {
    const baseDuration = this.config.defaultDuration

    switch (notification.priority) {
      case 'high':
        return baseDuration * 2 // 12 seconds
      case 'low':
        return baseDuration * 0.5 // 3 seconds
      case 'medium':
      default:
        return baseDuration // 6 seconds
    }
  }

  /**
   * Check if sound should be played
   */
  private shouldPlaySound(notification: Notification): boolean {
    const preferences = this.getPreferences(notification.category || 'default')
    return preferences.sound !== false && notification.priority !== 'low'
  }

  /**
   * Play notification sound
   */
  private playNotificationSound(type: NotificationType): void {
    try {
      // Create audio context for different notification types
      const audioContext = new (window.AudioContext ||
        (window as typeof window & { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Different frequencies for different notification types
      switch (type) {
        case 'success':
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
          break
        case 'error':
          oscillator.frequency.setValueAtTime(400, audioContext.currentTime)
          break
        case 'warning':
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
          break
        case 'info':
        default:
          oscillator.frequency.setValueAtTime(500, audioContext.currentTime)
          break
      }

      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3
      )

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      console.warn('Could not play notification sound:', error)
    }
  }

  /**
   * Vibrate device based on priority
   */
  private vibrateDevice(priority: NotificationPriority): void {
    if (!('vibrate' in navigator)) return

    try {
      switch (priority) {
        case 'high':
          navigator.vibrate([200, 100, 200]) // Long-short-long
          break
        case 'medium':
          navigator.vibrate(200) // Single vibration
          break
        case 'low':
          navigator.vibrate(100) // Short vibration
          break
      }
    } catch (error) {
      console.warn('Could not vibrate device:', error)
    }
  }

  /**
   * Load preferences from localStorage
   */
  private loadPreferences(): void {
    try {
      const stored = localStorage.getItem('notification-preferences')
      if (stored) {
        const preferences = JSON.parse(stored)
        Object.entries(preferences).forEach(([key, value]) => {
          this.preferences.set(key, value as Record<string, unknown>)
        })
      }
    } catch (error) {
      console.warn('Could not load notification preferences:', error)
    }
  }

  /**
   * Save preferences to localStorage
   */
  private savePreferences(): void {
    try {
      const preferences: Record<string, Record<string, unknown>> = {}
      this.preferences.forEach((value, key) => {
        preferences[key] = value
      })
      localStorage.setItem(
        'notification-preferences',
        JSON.stringify(preferences)
      )
    } catch (error) {
      console.warn('Could not save notification preferences:', error)
    }
  }
}

// Export singleton instance
export const notificationManager = new NotificationManager()
export default notificationManager
