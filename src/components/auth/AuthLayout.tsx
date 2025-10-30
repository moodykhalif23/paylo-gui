import React, { useState } from 'react'
import { Box, Container } from '@mui/material'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { ForgotPasswordForm } from './ForgotPasswordForm'

type AuthMode = 'login' | 'register' | 'forgot-password'

interface AuthLayoutProps {
  initialMode?: AuthMode
  redirectTo?: string
  initialRole?: 'user' | 'merchant'
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  initialMode = 'login',
  redirectTo,
  initialRole,
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode)

  const handleSwitchToLogin = () => setMode('login')
  const handleSwitchToRegister = () => setMode('register')
  const handleSwitchToForgotPassword = () => setMode('forgot-password')

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        {mode === 'forgot-password' ? (
          <ForgotPasswordForm onBackToLogin={handleSwitchToLogin} />
        ) : (
          <Box>
            {mode === 'login' && (
              <LoginForm
                onSwitchToRegister={handleSwitchToRegister}
                onForgotPassword={handleSwitchToForgotPassword}
                redirectTo={redirectTo}
              />
            )}
            {mode === 'register' && (
              <RegisterForm
                onSwitchToLogin={handleSwitchToLogin}
                redirectTo={redirectTo}
                initialRole={initialRole}
              />
            )}
          </Box>
        )}
      </Container>
    </Box>
  )
}

export default AuthLayout
