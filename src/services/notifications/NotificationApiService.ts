import {
  Notification,
  NotificationCategory,
  NotificationPriority,
} from '../../types'

// ============================================================================
// Types
// ============================================================================

export interface NotificationPreferences {
  category: NotificationCategory
  enabled: boolean
  channels: {
    inApp: boolean
    email: boolean
    sms: boolean
    push: boolean
  }
  priority: NotificationPriority
}

interface NotificationSettings {
  doNotDisturb: boolean
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
  groupSimilar: boolean
  maxPerHour: number
}

interface NotificationFilters {
  categories?: NotificationCategory[]
  priorities?: NotificationPriority[]
  read?: boolean
  dateFrom?: string
  dateTo?: string
}

interface PaginatedNotifications {
  notifications: Notification[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// ============================================================================
// Notification API Service
// ============================================================================

export class NotificationApiService {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string = '/api/notifications') {
    this.baseUrl = baseUrl
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this.token = token
  }

  /**
   * Get request headers
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    return headers
  }

  /**
   * Make API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      )
    }

    return response.json()
  }

  /**
   * Get user notifications with pagination and filtering
   */
  async getNotifications(
    page: number = 1,
    limit: number = 20,
    filters?: NotificationFilters
  ): Promise<PaginatedNotifications> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    if (filters) {
      if (filters.categories?.length) {
        params.append('categories', filters.categories.join(','))
      }
      if (filters.priorities?.length) {
        params.append('priorities', filters.priorities.join(','))
      }
      if (filters.read !== undefined) {
        params.append('read', filters.read.toString())
      }
      if (filters.dateFrom) {
        params.append('dateFrom', filters.dateFrom)
      }
      if (filters.dateTo) {
        params.append('dateTo', filters.dateTo)
      }
    }

    return this.request<PaginatedNotifications>(`?${params.toString()}`)
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<{ count: number }> {
    return this.request<{ count: number }>('/unread-count')
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await this.request(`/${notificationId}/read`, {
      method: 'PUT',
    })
  }

  /**
   * Mark notification as unread
   */
  async markAsUnread(notificationId: string): Promise<void> {
    await this.request(`/${notificationId}/unread`, {
      method: 'PUT',
    })
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await this.request('/mark-all-read', {
      method: 'PUT',
    })
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await this.request(`/${notificationId}`, {
      method: 'DELETE',
    })
  }

  /**
   * Delete all read notifications
   */
  async deleteReadNotifications(): Promise<void> {
    await this.request('/read', {
      method: 'DELETE',
    })
  }

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences[]> {
    return this.request<NotificationPreferences[]>('/preferences')
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(
    preferences: NotificationPreferences[]
  ): Promise<void> {
    await this.request('/preferences', {
      method: 'PUT',
      body: JSON.stringify({ preferences }),
    })
  }

  /**
   * Get notification settings
   */
  async getSettings(): Promise<NotificationSettings> {
    return this.request<NotificationSettings>('/settings')
  }

  /**
   * Update notification settings
   */
  async updateSettings(settings: NotificationSettings): Promise<void> {
    await this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
  }

  /**
   * Test notification delivery
   */
  async testNotification(
    type: 'email' | 'sms' | 'push',
    message: string
  ): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/test', {
      method: 'POST',
      body: JSON.stringify({ type, message }),
    })
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(subscription: PushSubscription): Promise<void> {
    await this.request('/push/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
    })
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush(): Promise<void> {
    await this.request('/push/unsubscribe', {
      method: 'DELETE',
    })
  }

  /**
   * Get notification statistics
   */
  async getStatistics(): Promise<{
    total: number
    unread: number
    byCategory: Record<NotificationCategory, number>
    byPriority: Record<NotificationPriority, number>
    recentActivity: Array<{
      date: string
      count: number
    }>
  }> {
    return this.request('/statistics')
  }

  /**
   * Export notifications
   */
  async exportNotifications(
    format: 'json' | 'csv',
    filters?: NotificationFilters
  ): Promise<{ downloadUrl: string; fileName: string }> {
    const params = new URLSearchParams({
      format,
    })

    if (filters) {
      if (filters.categories?.length) {
        params.append('categories', filters.categories.join(','))
      }
      if (filters.priorities?.length) {
        params.append('priorities', filters.priorities.join(','))
      }
      if (filters.dateFrom) {
        params.append('dateFrom', filters.dateFrom)
      }
      if (filters.dateTo) {
        params.append('dateTo', filters.dateTo)
      }
    }

    return this.request<{ downloadUrl: string; fileName: string }>(
      `/export?${params.toString()}`,
      { method: 'POST' }
    )
  }
}

// Export singleton instance
export const notificationApiService = new NotificationApiService()
export default notificationApiService
