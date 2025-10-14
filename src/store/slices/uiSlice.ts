import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Notification } from '../../types'

interface UIState {
  // Navigation and layout
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  currentPage: string
  breadcrumbs: BreadcrumbItem[]

  // Loading states
  globalLoading: boolean
  loadingStates: Record<string, boolean>

  // Notifications
  notifications: Notification[]
  unreadNotificationCount: number

  // Modals and dialogs
  modals: Record<string, boolean>

  // Theme and appearance
  theme: 'light' | 'dark' | 'system'

  // Error handling
  globalError: string | null

  // Connection status
  isOnline: boolean
  websocketConnected: boolean
}

interface BreadcrumbItem {
  label: string
  path?: string
  isActive?: boolean
}

const initialState: UIState = {
  sidebarOpen: true,
  sidebarCollapsed: false,
  currentPage: '',
  breadcrumbs: [],
  globalLoading: false,
  loadingStates: {},
  notifications: [],
  unreadNotificationCount: 0,
  modals: {},
  theme: 'system',
  globalError: null,
  isOnline: true,
  websocketConnected: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Sidebar management
    toggleSidebar: state => {
      state.sidebarOpen = !state.sidebarOpen
    },

    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },

    toggleSidebarCollapsed: state => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },

    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload
    },

    // Page navigation
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPage = action.payload
    },

    setBreadcrumbs: (state, action: PayloadAction<BreadcrumbItem[]>) => {
      state.breadcrumbs = action.payload
    },

    // Loading states
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload
    },

    setLoadingState: (
      state,
      action: PayloadAction<{ key: string; loading: boolean }>
    ) => {
      const { key, loading } = action.payload
      if (loading) {
        state.loadingStates[key] = true
      } else {
        delete state.loadingStates[key]
      }
    },

    clearAllLoadingStates: state => {
      state.loadingStates = {}
      state.globalLoading = false
    },

    // Notifications
    addNotification: (
      state,
      action: PayloadAction<Omit<Notification, 'id' | 'createdAt'>>
    ) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      }
      state.notifications.unshift(notification)
      if (!notification.isRead) {
        state.unreadNotificationCount += 1
      }
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload)
      if (index !== -1) {
        const notification = state.notifications[index]
        if (!notification.isRead) {
          state.unreadNotificationCount -= 1
        }
        state.notifications.splice(index, 1)
      }
    },

    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        n => n.id === action.payload
      )
      if (notification && !notification.isRead) {
        notification.isRead = true
        state.unreadNotificationCount -= 1
      }
    },

    markAllNotificationsAsRead: state => {
      state.notifications.forEach(notification => {
        notification.isRead = true
      })
      state.unreadNotificationCount = 0
    },

    clearNotifications: state => {
      state.notifications = []
      state.unreadNotificationCount = 0
    },

    // Modal management
    openModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = true
    },

    closeModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = false
    },

    closeAllModals: state => {
      state.modals = {}
    },

    // Theme
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload
    },

    // Error handling
    setGlobalError: (state, action: PayloadAction<string | null>) => {
      state.globalError = action.payload
    },

    clearGlobalError: state => {
      state.globalError = null
    },

    // Connection status
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload
    },

    setWebsocketStatus: (state, action: PayloadAction<boolean>) => {
      state.websocketConnected = action.payload
    },

    // Utility actions
    showSuccessNotification: (state, action: PayloadAction<string>) => {
      const notification: Notification = {
        id: Date.now().toString(),
        type: 'success',
        title: 'Success',
        message: action.payload,
        isRead: false,
        priority: 'medium',
        category: 'system',
        userId: 'system',
        createdAt: new Date().toISOString(),
      }
      state.notifications.unshift(notification)
      state.unreadNotificationCount += 1
    },

    showErrorNotification: (state, action: PayloadAction<string>) => {
      const notification: Notification = {
        id: Date.now().toString(),
        type: 'error',
        title: 'Error',
        message: action.payload,
        isRead: false,
        priority: 'high',
        category: 'system',
        userId: 'system',
        createdAt: new Date().toISOString(),
      }
      state.notifications.unshift(notification)
      state.unreadNotificationCount += 1
    },

    showInfoNotification: (state, action: PayloadAction<string>) => {
      const notification: Notification = {
        id: Date.now().toString(),
        type: 'info',
        title: 'Information',
        message: action.payload,
        isRead: false,
        priority: 'low',
        category: 'system',
        userId: 'system',
        createdAt: new Date().toISOString(),
      }
      state.notifications.unshift(notification)
      state.unreadNotificationCount += 1
    },

    showWarningNotification: (state, action: PayloadAction<string>) => {
      const notification: Notification = {
        id: Date.now().toString(),
        type: 'warning',
        title: 'Warning',
        message: action.payload,
        isRead: false,
        priority: 'medium',
        category: 'system',
        userId: 'system',
        createdAt: new Date().toISOString(),
      }
      state.notifications.unshift(notification)
      state.unreadNotificationCount += 1
    },
  },
})

// Export actions
export const {
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapsed,
  setSidebarCollapsed,
  setCurrentPage,
  setBreadcrumbs,
  setGlobalLoading,
  setLoadingState,
  clearAllLoadingStates,
  addNotification,
  removeNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotifications,
  openModal,
  closeModal,
  closeAllModals,
  setTheme,
  setGlobalError,
  clearGlobalError,
  setOnlineStatus,
  setWebsocketStatus,
  showSuccessNotification,
  showErrorNotification,
  showInfoNotification,
  showWarningNotification,
} = uiSlice.actions

// Selectors
export const selectSidebarOpen = (state: { ui: UIState }) =>
  state.ui.sidebarOpen
export const selectSidebarCollapsed = (state: { ui: UIState }) =>
  state.ui.sidebarCollapsed
export const selectCurrentPage = (state: { ui: UIState }) =>
  state.ui.currentPage
export const selectBreadcrumbs = (state: { ui: UIState }) =>
  state.ui.breadcrumbs
export const selectGlobalLoading = (state: { ui: UIState }) =>
  state.ui.globalLoading
export const selectLoadingState = (key: string) => (state: { ui: UIState }) =>
  state.ui.loadingStates[key] || false
export const selectNotifications = (state: { ui: UIState }) =>
  state.ui.notifications
export const selectUnreadNotificationCount = (state: { ui: UIState }) =>
  state.ui.unreadNotificationCount
export const selectModalOpen =
  (modalName: string) => (state: { ui: UIState }) =>
    state.ui.modals[modalName] || false
export const selectTheme = (state: { ui: UIState }) => state.ui.theme
export const selectGlobalError = (state: { ui: UIState }) =>
  state.ui.globalError
export const selectIsOnline = (state: { ui: UIState }) => state.ui.isOnline
export const selectWebsocketConnected = (state: { ui: UIState }) =>
  state.ui.websocketConnected

// Export reducer
export default uiSlice.reducer
