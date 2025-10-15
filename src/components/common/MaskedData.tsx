import React, { useState, useCallback } from 'react'
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  Chip,
  useTheme,
  alpha,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  ContentCopy,
  Security,
} from '@mui/icons-material'
import { SecurityUtils } from '../../utils/security'

interface MaskedDataProps {
  data: string
  type?: 'address' | 'private-key' | 'general'
  showCopyButton?: boolean
  showToggleButton?: boolean
  variant?: 'text' | 'chip' | 'code'
  color?: 'primary' | 'secondary' | 'default'
  size?: 'small' | 'medium' | 'large'
  visibleChars?: number
}

/**
 * Component for displaying masked sensitive data with optional reveal functionality
 */
export const MaskedData: React.FC<MaskedDataProps> = ({
  data,
  type = 'general',
  showCopyButton = true,
  showToggleButton = true,
  variant = 'text',
  color = 'default',
  size = 'medium',
  visibleChars,
}) => {
  const [isRevealed, setIsRevealed] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const theme = useTheme()

  const getMaskedData = useCallback(() => {
    if (isRevealed) return data

    switch (type) {
      case 'address':
        return SecurityUtils.maskCryptoAddress(data)
      case 'private-key':
        return SecurityUtils.maskPrivateKey(data)
      case 'general':
        return SecurityUtils.maskSensitiveData(data, visibleChars)
      default:
        return SecurityUtils.maskSensitiveData(data, visibleChars)
    }
  }, [data, type, isRevealed, visibleChars])

  const toggleReveal = useCallback(() => {
    setIsRevealed(prev => !prev)
  }, [])

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(data)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }, [data])

  const getTextColor = () => {
    switch (color) {
      case 'primary':
        return theme.palette.primary.main
      case 'secondary':
        return theme.palette.secondary.main
      default:
        return theme.palette.text.primary
    }
  }

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return '0.875rem'
      case 'large':
        return '1.125rem'
      default:
        return '1rem'
    }
  }

  const renderControls = () => {
    if (!showToggleButton && !showCopyButton) return null

    return (
      <Box sx={{ ml: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {showToggleButton && (
          <Tooltip title={isRevealed ? 'Hide data' : 'Show data'}>
            <IconButton
              size="small"
              onClick={toggleReveal}
              sx={{
                color: theme.palette.action.active,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.action.active, 0.1),
                },
              }}
            >
              {isRevealed ? (
                <VisibilityOff fontSize="small" />
              ) : (
                <Visibility fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        )}

        {showCopyButton && (
          <Tooltip title={copySuccess ? 'Copied!' : 'Copy to clipboard'}>
            <IconButton
              size="small"
              onClick={copyToClipboard}
              sx={{
                color: copySuccess
                  ? theme.palette.success.main
                  : theme.palette.action.active,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.action.active, 0.1),
                },
              }}
            >
              <ContentCopy fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title="Sensitive data is masked for security">
          <Security
            fontSize="small"
            sx={{
              color: theme.palette.action.disabled,
              ml: 0.5,
            }}
          />
        </Tooltip>
      </Box>
    )
  }

  const renderContent = () => {
    const maskedData = getMaskedData()

    switch (variant) {
      case 'chip':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip
              label={maskedData}
              size={size === 'large' ? 'medium' : 'small'}
              color={color === 'default' ? undefined : color}
              sx={{
                fontFamily: 'monospace',
                fontSize: getFontSize(),
              }}
            />
            {renderControls()}
          </Box>
        )

      case 'code':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              component="code"
              sx={{
                backgroundColor: alpha(theme.palette.action.selected, 0.1),
                border: `1px solid ${alpha(theme.palette.action.selected, 0.2)}`,
                borderRadius: 1,
                padding: '4px 8px',
                fontFamily: 'monospace',
                fontSize: getFontSize(),
                color: getTextColor(),
                wordBreak: 'break-all',
              }}
            >
              {maskedData}
            </Box>
            {renderControls()}
          </Box>
        )

      default:
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              component="span"
              sx={{
                fontFamily:
                  type === 'address' || type === 'private-key'
                    ? 'monospace'
                    : 'inherit',
                fontSize: getFontSize(),
                color: getTextColor(),
                wordBreak: 'break-all',
              }}
            >
              {maskedData}
            </Typography>
            {renderControls()}
          </Box>
        )
    }
  }

  return renderContent()
}

/**
 * Specialized component for cryptocurrency addresses
 */
export const MaskedAddress: React.FC<Omit<MaskedDataProps, 'type'>> = props => (
  <MaskedData {...props} type="address" variant="code" />
)

/**
 * Specialized component for private keys
 */
export const MaskedPrivateKey: React.FC<
  Omit<MaskedDataProps, 'type'>
> = props => (
  <MaskedData
    {...props}
    type="private-key"
    variant="code"
    showToggleButton={false}
  />
)

/**
 * Specialized component for transaction hashes
 */
export const MaskedTransactionHash: React.FC<
  Omit<MaskedDataProps, 'type'>
> = props => <MaskedData {...props} type="address" variant="code" />
