// Export all services
export { default as authService } from './auth/authService'
export { default as AuthApi } from './api/authApi'
export { apiClient, api, tokenStorage } from './api/client'

// Export types
export type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenResponse,
} from './auth/authService'

export type {
  LoginRequest as ApiLoginRequest,
  RegisterRequest as ApiRegisterRequest,
  AuthResponse as ApiAuthResponse,
  RefreshTokenResponse as ApiRefreshTokenResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  LogoutRequest,
} from './api/authApi'
