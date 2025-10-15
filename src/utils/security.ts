import DOMPurify from 'dompurify'
import CryptoJS from 'crypto-js'

/**
 * Input sanitization and XSS protection utilities
 */
export class SecurityUtils {
  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  static sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      ALLOWED_ATTR: ['href', 'target'],
      ALLOW_DATA_ATTR: false,
    })
  }

  /**
   * Sanitize user input by removing potentially dangerous characters
   */
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') return ''

    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/[<>]/g, '') // Remove angle brackets
      .trim()
  }

  /**
   * Validate and sanitize cryptocurrency addresses
   */
  static sanitizeCryptoAddress(address: string): string {
    if (typeof address !== 'string') return ''

    // Remove any non-alphanumeric characters except for valid crypto address chars
    return address.replace(/[^a-zA-Z0-9]/g, '').trim()
  }

  /**
   * Sanitize numeric input (amounts, fees, etc.)
   */
  static sanitizeNumericInput(input: string): string {
    if (typeof input !== 'string') return ''

    // Only allow digits, decimal point, and minus sign
    return input.replace(/[^0-9.-]/g, '').trim()
  }

  /**
   * Validate email format and sanitize
   */
  static sanitizeEmail(email: string): string {
    if (typeof email !== 'string') return ''

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const sanitized = email.toLowerCase().trim()

    return emailRegex.test(sanitized) ? sanitized : ''
  }

  /**
   * Generate CSRF token
   */
  static generateCSRFToken(): string {
    return CryptoJS.lib.WordArray.random(32).toString()
  }

  /**
   * Validate CSRF token
   */
  static validateCSRFToken(token: string, expectedToken: string): boolean {
    return token === expectedToken
  }

  /**
   * Encrypt sensitive data for local storage
   */
  static encryptData(data: string, key: string): string {
    return CryptoJS.AES.encrypt(data, key).toString()
  }

  /**
   * Decrypt sensitive data from local storage
   */
  static decryptData(encryptedData: string, key: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, key)
      return bytes.toString(CryptoJS.enc.Utf8)
    } catch (error) {
      console.error('Decryption failed:', error)
      return ''
    }
  }

  /**
   * Mask sensitive information for display
   */
  static maskSensitiveData(data: string, visibleChars: number = 4): string {
    if (!data || data.length <= visibleChars * 2) return data

    const start = data.substring(0, visibleChars)
    const end = data.substring(data.length - visibleChars)
    const masked = '*'.repeat(Math.max(0, data.length - visibleChars * 2))

    return `${start}${masked}${end}`
  }

  /**
   * Mask cryptocurrency addresses for display
   */
  static maskCryptoAddress(address: string): string {
    if (!address || address.length < 10) return address

    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  /**
   * Mask private keys or sensitive tokens
   */
  static maskPrivateKey(key: string): string {
    if (!key) return ''
    return '*'.repeat(Math.min(key.length, 32))
  }

  /**
   * Validate input against common injection patterns
   */
  static validateInput(input: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!input) {
      return { isValid: true, errors: [] }
    }

    // Check for SQL injection patterns
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
      /(--|\/\*|\*\/)/,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    ]

    sqlPatterns.forEach((pattern, index) => {
      if (pattern.test(input)) {
        errors.push(`Potential SQL injection detected (pattern ${index + 1})`)
      }
    })

    // Check for XSS patterns
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
    ]

    xssPatterns.forEach((pattern, index) => {
      if (pattern.test(input)) {
        errors.push(`Potential XSS detected (pattern ${index + 1})`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Rate limiting helper
   */
  static createRateLimiter(maxRequests: number, windowMs: number) {
    const requests = new Map<string, number[]>()

    return (identifier: string): boolean => {
      const now = Date.now()
      const windowStart = now - windowMs

      if (!requests.has(identifier)) {
        requests.set(identifier, [])
      }

      const userRequests = requests.get(identifier)!

      // Remove old requests outside the window
      const validRequests = userRequests.filter(time => time > windowStart)

      if (validRequests.length >= maxRequests) {
        return false // Rate limit exceeded
      }

      validRequests.push(now)
      requests.set(identifier, validRequests)

      return true // Request allowed
    }
  }
}

/**
 * Content Security Policy configuration
 */
export const CSP_CONFIG = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'img-src': ["'self'", 'data:', 'https:'],
  'connect-src': ["'self'", 'wss:', 'https:'],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
}

/**
 * Security headers configuration
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}
