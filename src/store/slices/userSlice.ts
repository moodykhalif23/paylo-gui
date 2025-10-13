import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User } from '../../types'

interface UserState {
  profile: User | null
  preferences: UserPreferences
  isLoading: boolean
  error: string | null
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  currency: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    transactionUpdates: boolean
    systemAlerts: boolean
    marketingEmails: boolean
  }
  dashboard: {
    defaultView: 'overview' | 'transactions' | 'analytics'
    refreshInterval: number
    showBalanceInUSD: boolean
  }
}

const initialState: UserState = {
  profile: null,
  preferences: {
    theme: 'system',
    language: 'en',
    currency: 'USD',
    notifications: {
      email: true,
      push: true,
      sms: false,
      transactionUpdates: true,
      systemAlerts: true,
      marketingEmails: false,
    },
    dashboard: {
      defaultView: 'overview',
      refreshInterval: 30000, // 30 seconds
      showBalanceInUSD: true,
    },
  },
  isLoading: false,
  error: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Set user profile
    setProfile: (state, action: PayloadAction<User>) => {
      state.profile = action.payload
      state.error = null
    },

    // Update user profile
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload }
      }
    },

    // Clear user profile
    clearProfile: state => {
      state.profile = null
      state.error = null
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },

    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.isLoading = false
    },

    // Update user preferences
    updatePreferences: (
      state,
      action: PayloadAction<Partial<UserPreferences>>
    ) => {
      state.preferences = { ...state.preferences, ...action.payload }
    },

    // Update notification preferences
    updateNotificationPreferences: (
      state,
      action: PayloadAction<Partial<UserPreferences['notifications']>>
    ) => {
      state.preferences.notifications = {
        ...state.preferences.notifications,
        ...action.payload,
      }
    },

    // Update dashboard preferences
    updateDashboardPreferences: (
      state,
      action: PayloadAction<Partial<UserPreferences['dashboard']>>
    ) => {
      state.preferences.dashboard = {
        ...state.preferences.dashboard,
        ...action.payload,
      }
    },

    // Reset preferences to default
    resetPreferences: state => {
      state.preferences = initialState.preferences
    },
  },
})

// Export actions
export const {
  setProfile,
  updateProfile,
  clearProfile,
  setLoading,
  setError,
  updatePreferences,
  updateNotificationPreferences,
  updateDashboardPreferences,
  resetPreferences,
} = userSlice.actions

// Selectors
export const selectUserProfile = (state: { user: UserState }) =>
  state.user.profile
export const selectUserPreferences = (state: { user: UserState }) =>
  state.user.preferences
export const selectUserLoading = (state: { user: UserState }) =>
  state.user.isLoading
export const selectUserError = (state: { user: UserState }) => state.user.error
export const selectTheme = (state: { user: UserState }) =>
  state.user.preferences.theme
export const selectNotificationPreferences = (state: { user: UserState }) =>
  state.user.preferences.notifications
export const selectDashboardPreferences = (state: { user: UserState }) =>
  state.user.preferences.dashboard

// Export reducer
export default userSlice.reducer
