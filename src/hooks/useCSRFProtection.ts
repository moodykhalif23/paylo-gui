import { useState, useEffect, useCallback } from 'react'
import { SecurityUtils } from '../utils/security'

interface CSRFProtection {
  token: string
  getToken: () => string
  validateToken: (token: string) => boolean
  refreshToken: () => void
}

/**
 * Hook for CSRF protection
 */
export const useCSRFProtection = (): CSRFProtection => {
  const [token, setToken] = useState<string>('')

  const generateNewToken = useCallback(() => {
    const newToken = SecurityUtils.generateCSRFToken()
    setToken(newToken)

    // Store in session storage for validation
    sessionStorage.setItem('csrf_token', newToken)

    return newToken
  }, [])

  const getToken = useCallback(() => {
    if (!token) {
      return generateNewToken()
    }
    return token
  }, [token, generateNewToken])

  const validateToken = useCallback((tokenToValidate: string) => {
    const storedToken = sessionStorage.getItem('csrf_token')
    return SecurityUtils.validateCSRFToken(tokenToValidate, storedToken || '')
  }, [])

  const refreshToken = useCallback(() => {
    generateNewToken()
  }, [generateNewToken])

  useEffect(() => {
    // Initialize token on mount
    const existingToken = sessionStorage.getItem('csrf_token')
    if (existingToken) {
      setToken(existingToken)
    } else {
      generateNewToken()
    }
  }, [generateNewToken])

  return {
    token,
    getToken,
    validateToken,
    refreshToken,
  }
}
