import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { User, AuthState, ApiError } from '../../types'
import {
  authService,
  LoginRequest,
  RegisterRequest,
} from '../../services/auth/authService'

// Extended auth state for Redux
interface ReduxAuthState extends AuthState {
  error: string | null
  loginAttempts: number
  lastLoginAttempt: number | null
}

// Initial state
const initialState: ReduxAuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  loginAttempts: 0,
  lastLoginAttempt: null,
}

// Async thunks for authentication actions
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials)
      return response
    } catch (error) {
      const apiError = error as ApiError
      return rejectWithValue(apiError.message)
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData)
      return response
    } catch (error) {
      const apiError = error as ApiError
      return rejectWithValue(apiError.message)
    }
  }
)

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser()
      return user
    } catch (error) {
      const apiError = error as ApiError
      return rejectWithValue(apiError.message)
    }
  }
)

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.refreshToken()
      return response
    } catch (error) {
      const apiError = error as ApiError
      return rejectWithValue(apiError.message)
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout()
      return true
    } catch (error) {
      const apiError = error as ApiError
      return rejectWithValue(apiError.message)
    }
  }
)

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (
    {
      currentPassword,
      newPassword,
    }: { currentPassword: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      await authService.changePassword(currentPassword, newPassword)
      return true
    } catch (error) {
      const apiError = error as ApiError
      return rejectWithValue(apiError.message)
    }
  }
)

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clear error state
    clearError: state => {
      state.error = null
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },

    // Initialize auth state from stored tokens
    initializeAuth: state => {
      const token = authService.getAccessToken()
      const isAuthenticated =
        authService.isAuthenticated() && !authService.isTokenExpired()

      state.token = token
      state.isAuthenticated = isAuthenticated

      if (!isAuthenticated && token) {
        // Token exists but is expired, clear it
        authService.logout()
        state.token = null
      }
    },

    // Reset login attempts
    resetLoginAttempts: state => {
      state.loginAttempts = 0
      state.lastLoginAttempt = null
    },

    // Update user profile
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
  },
  extraReducers: builder => {
    // Login user
    builder
      .addCase(loginUser.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.accessToken
        state.isAuthenticated = true
        state.error = null
        state.loginAttempts = 0
        state.lastLoginAttempt = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.loginAttempts += 1
        state.lastLoginAttempt = Date.now()
        state.isAuthenticated = false
        state.user = null
        state.token = null
      })

    // Register user
    builder
      .addCase(registerUser.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.accessToken
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.isAuthenticated = false
        state.user = null
        state.token = null
      })

    // Get current user
    builder
      .addCase(getCurrentUser.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.isAuthenticated = false
        state.user = null
        state.token = null
      })

    // Refresh token
    builder
      .addCase(refreshToken.pending, state => {
        state.isLoading = true
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false
        state.token = action.payload.accessToken
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.isAuthenticated = false
        state.user = null
        state.token = null
      })

    // Logout user
    builder
      .addCase(logoutUser.pending, state => {
        state.isLoading = true
      })
      .addCase(logoutUser.fulfilled, state => {
        state.isLoading = false
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.error = null
        state.loginAttempts = 0
        state.lastLoginAttempt = null
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        // Still clear auth state even if logout request failed
        state.user = null
        state.token = null
        state.isAuthenticated = false
      })

    // Change password
    builder
      .addCase(changePassword.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(changePassword.fulfilled, state => {
        state.isLoading = false
        state.error = null
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

// Export actions
export const {
  clearError,
  setLoading,
  initializeAuth,
  resetLoginAttempts,
  updateUserProfile,
} = authSlice.actions

// Selectors
export const selectAuth = (state: { auth: ReduxAuthState }) => state.auth
export const selectUser = (state: { auth: ReduxAuthState }) => state.auth.user
export const selectIsAuthenticated = (state: { auth: ReduxAuthState }) =>
  state.auth.isAuthenticated
export const selectIsLoading = (state: { auth: ReduxAuthState }) =>
  state.auth.isLoading
export const selectAuthError = (state: { auth: ReduxAuthState }) =>
  state.auth.error
export const selectLoginAttempts = (state: { auth: ReduxAuthState }) =>
  state.auth.loginAttempts

// Export reducer
export default authSlice.reducer
