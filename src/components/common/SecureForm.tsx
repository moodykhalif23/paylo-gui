import React, { ReactNode, FormEvent, useCallback } from 'react'
import { Box, Alert } from '@mui/material'
import { useCSRFProtection } from '../../hooks/useCSRFProtection'
import { SecurityUtils } from '../../utils/security'

interface SecureFormProps {
  children: ReactNode
  onSubmit: (data: FormData, csrfToken: string) => void | Promise<void>
  validateInputs?: boolean
  sanitizeInputs?: boolean
  className?: string
}

/**
 * Secure form component with CSRF protection and input sanitization
 */
export const SecureForm: React.FC<SecureFormProps> = ({
  children,
  onSubmit,
  validateInputs = true,
  sanitizeInputs = true,
  className,
}) => {
  const { getToken, validateToken } = useCSRFProtection()
  const [validationErrors, setValidationErrors] = React.useState<string[]>([])

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setValidationErrors([])

      const formData = new FormData(event.currentTarget)
      const csrfToken = getToken()

      // Add CSRF token to form data
      formData.append('_csrf', csrfToken)

      // Validate CSRF token
      if (!validateToken(csrfToken)) {
        setValidationErrors(['Invalid CSRF token. Please refresh the page.'])
        return
      }

      // Validate and sanitize inputs if enabled
      if (validateInputs || sanitizeInputs) {
        const errors: string[] = []
        const sanitizedData = new FormData()

        for (const [key, value] of formData.entries()) {
          if (key === '_csrf') {
            sanitizedData.append(key, value as string)
            continue
          }

          let processedValue = value as string

          // Validate input
          if (validateInputs) {
            const validation = SecurityUtils.validateInput(processedValue)
            if (!validation.isValid) {
              errors.push(...validation.errors.map(error => `${key}: ${error}`))
              continue
            }
          }

          // Sanitize input
          if (sanitizeInputs) {
            processedValue = SecurityUtils.sanitizeInput(processedValue)
          }

          sanitizedData.append(key, processedValue)
        }

        if (errors.length > 0) {
          setValidationErrors(errors)
          return
        }

        await onSubmit(sanitizedData, csrfToken)
      } else {
        await onSubmit(formData, csrfToken)
      }
    },
    [getToken, validateToken, onSubmit, validateInputs, sanitizeInputs]
  )

  return (
    <Box component="form" onSubmit={handleSubmit} className={className}>
      {validationErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {children}

      {/* Hidden CSRF token field */}
      <input type="hidden" name="_csrf" value={getToken()} />
    </Box>
  )
}
