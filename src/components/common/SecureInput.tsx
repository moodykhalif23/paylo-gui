import React, { useState, useCallback, ChangeEvent } from 'react'
import {
  TextField,
  TextFieldProps,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material'
import { Visibility, VisibilityOff, Security } from '@mui/icons-material'
import { SecurityUtils } from '../../utils/security'

interface SecureInputProps extends Omit<TextFieldProps, 'onChange' | 'value'> {
  value?: string
  onChange?: (value: string, sanitizedValue: string) => void
  sanitizationType?: 'general' | 'crypto-address' | 'numeric' | 'email' | 'none'
  maskSensitive?: boolean
  showSecurityIndicator?: boolean
  maxLength?: number
}

/**
 * Secure input component with automatic sanitization and masking
 */
export const SecureInput: React.FC<SecureInputProps> = ({
  value = '',
  onChange,
  sanitizationType = 'general',
  maskSensitive = false,
  showSecurityIndicator = false,
  maxLength,
  type = 'text',
  ...textFieldProps
}) => {
  const [showValue, setShowValue] = useState(!maskSensitive)
  const [internalValue, setInternalValue] = useState(value)

  const sanitizeValue = useCallback(
    (inputValue: string): string => {
      if (maxLength && inputValue.length > maxLength) {
        inputValue = inputValue.substring(0, maxLength)
      }

      switch (sanitizationType) {
        case 'crypto-address':
          return SecurityUtils.sanitizeCryptoAddress(inputValue)
        case 'numeric':
          return SecurityUtils.sanitizeNumericInput(inputValue)
        case 'email':
          return SecurityUtils.sanitizeEmail(inputValue)
        case 'general':
          return SecurityUtils.sanitizeInput(inputValue)
        case 'none':
          return inputValue
        default:
          return SecurityUtils.sanitizeInput(inputValue)
      }
    },
    [sanitizationType, maxLength]
  )

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const rawValue = event.target.value
      const sanitizedValue = sanitizeValue(rawValue)

      setInternalValue(sanitizedValue)

      if (onChange) {
        onChange(rawValue, sanitizedValue)
      }
    },
    [sanitizeValue, onChange]
  )

  const toggleShowValue = useCallback(() => {
    setShowValue(prev => !prev)
  }, [])

  const displayValue = showValue
    ? internalValue
    : SecurityUtils.maskSensitiveData(internalValue)

  const getInputType = () => {
    if (maskSensitive && !showValue) {
      return 'password'
    }
    return type
  }

  const getEndAdornment = () => {
    const adornments = []

    if (maskSensitive) {
      adornments.push(
        <IconButton
          key="visibility"
          aria-label="toggle password visibility"
          onClick={toggleShowValue}
          edge="end"
          size="small"
        >
          {showValue ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      )
    }

    if (showSecurityIndicator) {
      adornments.push(
        <Tooltip
          key="security"
          title="This field is protected with input sanitization"
        >
          <Security color="action" fontSize="small" />
        </Tooltip>
      )
    }

    if (adornments.length > 0) {
      return <InputAdornment position="end">{adornments}</InputAdornment>
    }

    return textFieldProps.InputProps?.endAdornment
  }

  return (
    <TextField
      {...textFieldProps}
      type={getInputType()}
      value={displayValue}
      onChange={handleChange}
      InputProps={{
        ...textFieldProps.InputProps,
        endAdornment: getEndAdornment(),
      }}
      inputProps={{
        ...textFieldProps.inputProps,
        maxLength,
      }}
    />
  )
}

/**
 * Specialized secure input for cryptocurrency addresses
 */
export const CryptoAddressInput: React.FC<
  Omit<SecureInputProps, 'sanitizationType'>
> = props => (
  <SecureInput
    {...props}
    sanitizationType="crypto-address"
    showSecurityIndicator
    placeholder="Enter cryptocurrency address..."
  />
)

/**
 * Specialized secure input for amounts and fees
 */
export const AmountInput: React.FC<
  Omit<SecureInputProps, 'sanitizationType'>
> = props => (
  <SecureInput
    {...props}
    sanitizationType="numeric"
    showSecurityIndicator
    placeholder="0.00"
  />
)

/**
 * Specialized secure input for email addresses
 */
export const EmailInput: React.FC<
  Omit<SecureInputProps, 'sanitizationType'>
> = props => (
  <SecureInput
    {...props}
    sanitizationType="email"
    type="email"
    showSecurityIndicator
    placeholder="Enter email address..."
  />
)

/**
 * Specialized secure input for private keys and sensitive data
 */
export const PrivateKeyInput: React.FC<
  Omit<SecureInputProps, 'maskSensitive' | 'sanitizationType'>
> = props => (
  <SecureInput
    {...props}
    sanitizationType="none"
    maskSensitive
    showSecurityIndicator
    placeholder="Enter private key..."
  />
)
