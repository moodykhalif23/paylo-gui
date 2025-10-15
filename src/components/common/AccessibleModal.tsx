import React, { ReactNode, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Fade,
  Backdrop,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { AccessibilityUtils } from '../../utils/accessibility'
import { useAccessibility } from '../../contexts/AccessibilityContext'
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation'

interface AccessibleModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  actions?: ReactNode
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
  disableEscapeKeyDown?: boolean
  disableBackdropClick?: boolean
  ariaDescribedBy?: string
  closeButtonLabel?: string
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
  disableEscapeKeyDown = false,
  disableBackdropClick = false,
  ariaDescribedBy,
  closeButtonLabel = 'Close dialog',
}) => {
  const { announceMessage, focusTrap } = useAccessibility()
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const titleId = AccessibilityUtils.generateId('modal-title')
  const contentId = AccessibilityUtils.generateId('modal-content')

  // Set up keyboard navigation
  useKeyboardNavigation(modalRef, {
    onEscape: disableEscapeKeyDown ? undefined : onClose,
    trapFocus: true,
    autoFocus: true,
  })

  // Handle focus management
  useEffect(() => {
    if (open) {
      // Store the previously focused element
      previousFocusRef.current = document.activeElement as HTMLElement

      // Announce modal opening
      announceMessage(`Dialog opened: ${title}`)

      // Set up focus trap
      if (modalRef.current) {
        const cleanup = focusTrap(modalRef.current)
        return cleanup
      }
    } else {
      // Restore focus to previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
      }

      // Announce modal closing
      announceMessage('Dialog closed')
    }
  }, [open, title, announceMessage, focusTrap])

  const handleClose = (_event: unknown, reason?: string) => {
    // Prevent closing on backdrop click if disabled
    if (reason === 'backdropClick' && disableBackdropClick) {
      return
    }

    // Prevent closing on escape key if disabled
    if (reason === 'escapeKeyDown' && disableEscapeKeyDown) {
      return
    }

    onClose()
  }

  return (
    <Dialog
      ref={modalRef}
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      aria-labelledby={titleId}
      aria-describedby={ariaDescribedBy || contentId}
      aria-modal="true"
      role="dialog"
      TransitionComponent={Fade}
      TransitionProps={{
        timeout: 300,
      }}
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 300,
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 24,
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: '2px',
          },
        },
      }}
    >
      <DialogTitle
        id={titleId}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingRight: 1,
        }}
      >
        <Typography variant="h6" component="h2">
          {title}
        </Typography>
        <IconButton
          onClick={onClose}
          aria-label={closeButtonLabel}
          size="small"
          sx={{
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: '2px',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        id={contentId}
        sx={{
          paddingTop: 2,
          '&:focus': {
            outline: 'none',
          },
        }}
      >
        {children}
      </DialogContent>

      {actions && (
        <DialogActions
          sx={{
            padding: 2,
            paddingTop: 1,
            gap: 1,
          }}
        >
          {actions}
        </DialogActions>
      )}

      {/* Screen reader instructions */}
      <Box
        sx={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        <Typography>
          Press Escape to close this dialog. Use Tab to navigate between
          interactive elements.
        </Typography>
      </Box>
    </Dialog>
  )
}

export default AccessibleModal
