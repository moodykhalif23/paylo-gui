import React, { forwardRef, useRef, useEffect } from 'react'
import {
  Button,
  ButtonProps,
  CircularProgress,
  Tooltip,
  Box,
  Typography,
} from '@mui/material'
// import { AccessibilityUtils } from '../../utils/accessibility';
import { useAccessibility } from '../../contexts/AccessibilityContext'

interface AccessibleButtonProps extends ButtonProps {
  loadingText?: string
  keyboardShortcut?: string
  tooltip?: string
  confirmAction?: boolean
  confirmMessage?: string
  loading?: boolean
  ariaDescribedBy?: string
}

export const AccessibleButton = forwardRef<
  HTMLButtonElement,
  AccessibleButtonProps
>(
  (
    {
      children,
      loadingText = 'Loading...',
      keyboardShortcut,
      tooltip,
      confirmAction = false,
      confirmMessage = 'Are you sure?',
      loading = false,
      disabled,
      onClick,
      ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const { settings, announceMessage } = useAccessibility()
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [showConfirm, setShowConfirm] = React.useState(false)

    // Merge refs
    React.useImperativeHandle(ref, () => buttonRef.current!)

    useEffect(() => {
      if (keyboardShortcut && buttonRef.current) {
        const handleKeyDown = (event: KeyboardEvent) => {
          if (
            event.key.toLowerCase() === keyboardShortcut.toLowerCase() &&
            (event.ctrlKey || event.metaKey)
          ) {
            event.preventDefault()
            buttonRef.current?.click()
          }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
      }
    }, [keyboardShortcut])

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) return

      if (confirmAction && !showConfirm) {
        setShowConfirm(true)
        announceMessage(confirmMessage)
        return
      }

      if (onClick) {
        onClick(event)
      }

      if (showConfirm) {
        setShowConfirm(false)
      }
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'Escape' && showConfirm) {
        setShowConfirm(false)
        announceMessage('Action cancelled')
      }
    }

    const ariaLabel = React.useMemo(() => {
      let label = children?.toString() || ''

      if (keyboardShortcut) {
        label += ` (Keyboard shortcut: Ctrl+${keyboardShortcut})`
      }

      if (loading) {
        label = loadingText
      }

      if (showConfirm) {
        label = `${confirmMessage} Press Enter to confirm or Escape to cancel`
      }

      return label
    }, [
      children,
      keyboardShortcut,
      loading,
      loadingText,
      showConfirm,
      confirmMessage,
    ])

    const buttonContent = (
      <Button
        {...props}
        ref={buttonRef}
        disabled={disabled || loading}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-pressed={showConfirm ? true : undefined}
        sx={{
          ...props.sx,
          minHeight: '44px', // WCAG minimum touch target
          position: 'relative',
          '&:focus-visible': {
            outline: '3px solid',
            outlineColor: 'primary.main',
            outlineOffset: '2px',
            borderRadius: '4px',
          },
          // Enhanced focus for keyboard navigation
          ...(settings.keyboardNavigation && {
            '&:focus': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: '2px',
            },
          }),
          // High contrast mode
          ...(settings.highContrast && {
            border: '2px solid currentColor',
            fontWeight: 600,
          }),
          // Reduced motion
          ...(settings.reducedMotion && {
            transition: 'none',
            '&:hover': {
              transform: 'none',
            },
          }),
          // Confirmation state
          ...(showConfirm && {
            backgroundColor: 'warning.main',
            color: 'warning.contrastText',
            '&:hover': {
              backgroundColor: 'warning.dark',
            },
          }),
        }}
      >
        {loading && (
          <CircularProgress
            size={16}
            sx={{
              marginRight: 1,
              color: 'inherit',
            }}
          />
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {showConfirm ? confirmMessage : loading ? loadingText : children}

          {keyboardShortcut && !loading && !showConfirm && (
            <Typography
              variant="caption"
              component="span"
              sx={{
                opacity: 0.7,
                fontSize: '0.75rem',
                marginLeft: 0.5,
              }}
            >
              Ctrl+{keyboardShortcut}
            </Typography>
          )}
        </Box>
      </Button>
    )

    if (tooltip) {
      return (
        <Tooltip title={tooltip} arrow>
          {buttonContent}
        </Tooltip>
      )
    }

    return buttonContent
  }
)

AccessibleButton.displayName = 'AccessibleButton'

export default AccessibleButton
