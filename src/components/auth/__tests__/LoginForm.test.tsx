import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { store } from '../../../store'
import { theme } from '../../../theme'
import { LoginForm } from '../LoginForm'

// Mock the useAuth hook
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    login: vi.fn(),
    isLoading: false,
    error: null,
    clearAuthError: vi.fn(),
    shouldLimitLogin: () => false,
    getLockoutTimeRemaining: () => 0,
  }),
}))

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Provider store={store}>
    <BrowserRouter>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </BrowserRouter>
  </Provider>
)

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form with all required fields', () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )

    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid email', async () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )

    const emailInput = screen.getByLabelText(/email address/i)
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.blur(emailInput)

    await waitFor(() => {
      expect(screen.getByText('Enter a valid email')).toBeInTheDocument()
    })
  })

  it('toggles password visibility', () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )

    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement
    const toggleButton = screen.getByLabelText(/toggle password visibility/i)

    expect(passwordInput.type).toBe('password')

    fireEvent.click(toggleButton)
    expect(passwordInput.type).toBe('text')

    fireEvent.click(toggleButton)
    expect(passwordInput.type).toBe('password')
  })

  it('calls onSwitchToRegister when register link is clicked', () => {
    const mockSwitchToRegister = vi.fn()

    render(
      <TestWrapper>
        <LoginForm onSwitchToRegister={mockSwitchToRegister} />
      </TestWrapper>
    )

    const registerLink = screen.getByText('Sign up')
    fireEvent.click(registerLink)

    expect(mockSwitchToRegister).toHaveBeenCalledOnce()
  })

  it('calls onForgotPassword when forgot password link is clicked', () => {
    const mockForgotPassword = vi.fn()

    render(
      <TestWrapper>
        <LoginForm onForgotPassword={mockForgotPassword} />
      </TestWrapper>
    )

    const forgotPasswordLink = screen.getByText('Forgot your password?')
    fireEvent.click(forgotPasswordLink)

    expect(mockForgotPassword).toHaveBeenCalledOnce()
  })
})
