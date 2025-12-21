import {
  createApi,
  fetchBaseQuery,
  FetchArgs,
  BaseQueryApi,
} from '@reduxjs/toolkit/query/react'
import { config } from '../../config/environment'
import { tokenStorage } from '../../services/api/client'
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
  const result = await baseQuery(args, api, extraOptions)

  if (result.error && result.error.status === 401) {
    // JWT-only model: clear tokens and redirect to login on unauthorized
    tokenStorage.clearTokens()
    window.location.href = '/login'
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
