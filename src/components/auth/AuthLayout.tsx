import React, { useState } from 'react'
import { Box, Container, Paper, Tabs, Tab } from '@mui/material'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { ForgotPasswordForm } from './ForgotPasswordForm'

type AuthMode = 'login' | 'register' | 'forgot-password'

interface AuthLayoutProps {
  initialMode?: AuthMode
  redirectTo?: string
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  initialMode = 'login',
  redirectTo,
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode)

  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: AuthMode
  ) => {
    if (newValue !== 'forgot-password') {
      setMode(newValue)
    }
  }

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
          <Paper elevation={3} sx={{ overflow: 'hidden' }}>
            <Tabs
              value={mode}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                },
              }}
            >
              <Tab label="Sign In" value="login" />
              <Tab label="Sign Up" value="register" />
            </Tabs>

            <Box sx={{ p: 0 }}>
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
                />
              )}
            </Box>
          </Paper>
        )}
      </Container>
    </Box>
  )
}

export default AuthLayout
