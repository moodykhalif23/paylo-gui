import React, { useState } from 'react'
import {
  Box,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Container,
  Paper,
  IconButton,
  InputAdornment,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Security,
  AdminPanelSettings,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../store'
import { loginUser } from '../../store/slices/authSlice'

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await dispatch(
        loginUser({
          email,
          password,
          role: 'admin', // Explicitly require admin role
        })
      ).unwrap()

      // Verify the user has admin role
      if (result.user.role !== 'admin') {
        setError('Access denied. Administrator privileges required.')
        setLoading(false)
        return
      }

      // Redirect to admin dashboard
      navigate('/admin/dashboard')
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Login failed. Please check your credentials.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            width: '100%',
            maxWidth: 400,
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              bgcolor: 'error.main',
              color: 'error.contrastText',
              p: 3,
              textAlign: 'center',
            }}
          >
            <AdminPanelSettings sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h5" fontWeight={600}>
              Administrator Portal
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
              Restricted Access Only
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {/* Security Warning */}
            <Alert severity="warning" icon={<Security />} sx={{ mb: 3 }}>
              This is a secure administrative portal. All access attempts are
              logged and monitored.
            </Alert>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Administrator Email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                sx={{ mb: 3 }}
                InputProps={{
                  'aria-describedby': 'admin-email-help',
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                sx={{ mb: 4 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  bgcolor: 'error.main',
                  '&:hover': {
                    bgcolor: 'error.dark',
                  },
                  '&:focus-visible': {
                    outline: '2px solid',
                    outlineColor: 'error.main',
                    outlineOffset: '2px',
                  },
                }}
              >
                {loading ? 'Authenticating...' : 'Access Admin Portal'}
              </Button>
            </form>

            {/* Footer */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Need help? Contact system administrator
              </Typography>
            </Box>
          </CardContent>
        </Paper>
      </Box>
    </Container>
  )
}

export default AdminLoginPage
