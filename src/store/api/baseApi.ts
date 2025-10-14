import {
  createApi,
  fetchBaseQuery,
  FetchArgs,
  BaseQueryApi,
} from '@reduxjs/toolkit/query/react'
import { config } from '../../config/environment'
import { tokenStorage } from '../../services/api/client'
import { ApiResponse } from '../../types'

// Base query with authentication and error handling
const baseQuery = fetchBaseQuery({
  baseUrl: config.api.baseUrl,
  prepareHeaders: (headers, { getState: _getState }) => {
    // Get token from storage
    const token = tokenStorage.getAccessToken()

    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }

    headers.set('content-type', 'application/json')
    return headers
  },
})

// Enhanced base query with token refresh logic
const baseQueryWithReauth = async (
  args: string | FetchArgs,
  api: BaseQueryApi,
  extraOptions: Record<string, unknown>
) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error && result.error.status === 401) {
    // Try to refresh the token
    const refreshToken = tokenStorage.getRefreshToken()

    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      )

      if (refreshResult.data) {
        const responseData = refreshResult.data as ApiResponse<{
          accessToken: string
          refreshToken: string
        }>
        if (responseData.data) {
          const { accessToken, refreshToken: newRefreshToken } =
            responseData.data

          // Store new tokens
          tokenStorage.setAccessToken(accessToken)
          tokenStorage.setRefreshToken(newRefreshToken)

          // Retry the original query with new token
          result = await baseQuery(args, api, extraOptions)
        }
      } else {
        // Refresh failed, clear tokens and redirect to login
        tokenStorage.clearTokens()
        window.location.href = '/login'
      }
    } else {
      // No refresh token, redirect to login
      tokenStorage.clearTokens()
      window.location.href = '/login'
    }
  }

  return result
}

// Create the base API slice
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Transaction',
    'Wallet',
    'Invoice',
    'SystemHealth',
    'Analytics',
    'Notification',
    'SuspiciousActivity',
    'Investigation',
    'SystemConfig',
  ],
  endpoints: () => ({}),
})

export default baseApi
