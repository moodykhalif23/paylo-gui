import { baseApi } from './baseApi'
import { User, ApiResponse } from '../../types'

// User API request/response types
export interface UpdateUserProfileRequest {
  firstName?: string
  lastName?: string
  email?: string
}

export interface UserPreferencesRequest {
  theme?: 'light' | 'dark' | 'system'
  language?: string
  currency?: string
  notifications?: {
    email?: boolean
    push?: boolean
    sms?: boolean
    transactionUpdates?: boolean
    systemAlerts?: boolean
    marketingEmails?: boolean
  }
  dashboard?: {
    defaultView?: 'overview' | 'transactions' | 'analytics'
    refreshInterval?: number
    showBalanceInUSD?: boolean
  }
}

export interface UserActivityLog {
  id: string
  action: string
  details: string
  ipAddress: string
  userAgent: string
  createdAt: string
}

export interface PaginatedUserActivity {
  activities: UserActivityLog[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
  }
}

// User API endpoints
export const userApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Get current user profile
    getCurrentUser: builder.query<User, void>({
      query: () => '/auth/me',
      transformResponse: (response: ApiResponse<User>) => response.data!,
      providesTags: ['User'],
    }),

    // Update user profile
    updateUserProfile: builder.mutation<User, UpdateUserProfileRequest>({
      query: data => ({
        url: '/users/profile',
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<User>) => response.data!,
      invalidatesTags: ['User'],
    }),

    // Get user preferences
    getUserPreferences: builder.query<UserPreferencesRequest, void>({
      query: () => '/users/preferences',
      transformResponse: (response: ApiResponse<UserPreferencesRequest>) =>
        response.data!,
      providesTags: ['User'],
    }),

    // Update user preferences
    updateUserPreferences: builder.mutation<
      UserPreferencesRequest,
      UserPreferencesRequest
    >({
      query: preferences => ({
        url: '/users/preferences',
        method: 'PUT',
        body: preferences,
      }),
      transformResponse: (response: ApiResponse<UserPreferencesRequest>) =>
        response.data!,
      invalidatesTags: ['User'],
    }),

    // Get user activity log
    getUserActivity: builder.query<
      PaginatedUserActivity,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 20 }) =>
        `/users/activity?page=${page}&limit=${limit}`,
      transformResponse: (response: ApiResponse<PaginatedUserActivity>) =>
        response.data!,
      providesTags: ['User'],
    }),

    // Delete user account
    deleteUserAccount: builder.mutation<void, { password: string }>({
      query: data => ({
        url: '/users/account',
        method: 'DELETE',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Upload user avatar
    uploadAvatar: builder.mutation<{ avatarUrl: string }, FormData>({
      query: formData => ({
        url: '/users/avatar',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: ApiResponse<{ avatarUrl: string }>) =>
        response.data!,
      invalidatesTags: ['User'],
    }),

    // Remove user avatar
    removeAvatar: builder.mutation<void, void>({
      query: () => ({
        url: '/users/avatar',
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
})

// Export hooks for use in components
export const {
  useGetCurrentUserQuery,
  useUpdateUserProfileMutation,
  useGetUserPreferencesQuery,
  useUpdateUserPreferencesMutation,
  useGetUserActivityQuery,
  useDeleteUserAccountMutation,
  useUploadAvatarMutation,
  useRemoveAvatarMutation,
} = userApi
