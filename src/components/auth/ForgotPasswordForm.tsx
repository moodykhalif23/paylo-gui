import React, { useState } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper,
  Link,
  InputAdornment,
  CircularProgress,
} from '@mui/material'
import { Email, ArrowBack } from '@mui/icons-material'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { authService } from '../../services/auth/authService'

interface ForgotPasswordFormProps {
  onBackToLogin?: () => void
}

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
})

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onBackToLogin,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema,
    onSubmit: async values => {
      setIsLoading(true)
      setError(null)

      try {
        await authService.requestPasswordReset(values.email)
        setSuccess(true)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to send reset email'
        )
      } finally {
        setIsLoading(false)
      }
    },
  })

  if (success) {
    return (
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h5"
            component="h1"
            gutterBottom
            color="success.main"
          >
            Check Your Email
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            We've sent a password reset link to{' '}
            <strong>{formik.values.email}</strong>
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please check your email and click the link to reset your password.
            If you don't see the email, check your spam folder.
          </Typography>

          {onBackToLogin && (
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={onBackToLogin}
              fullWidth
            >
              Back to Sign In
            </Button>
          )}
        </Box>
      </Paper>
    )
  }

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
      <Box component="form" onSubmit={formik.handleSubmit} noValidate>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Reset Password
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mb: 3 }}
        >
          Enter your email address and we'll send you a link to reset your
          password.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          id="email"
          name="email"
          label="Email Address"
          type="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
          disabled={isLoading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={isLoading || !formik.isValid}
          sx={{ mb: 2 }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Send Reset Link'
          )}
        </Button>

        {onBackToLogin && (
          <Box sx={{ textAlign: 'center' }}>
            <Link
              component="button"
              type="button"
              variant="body2"
              onClick={onBackToLogin}
              sx={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              <ArrowBack fontSize="small" />
              Back to Sign In
            </Link>
          </Box>
        )}
      </Box>
    </Paper>
  )
}

export default ForgotPasswordForm
