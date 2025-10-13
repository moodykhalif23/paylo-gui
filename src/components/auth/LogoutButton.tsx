import React, { useState } from 'react'
import {
  Button,
  IconButton,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
} from '@mui/material'
import { Logout, ExitToApp } from '@mui/icons-material'
import { useAuth } from '../../hooks/useAuth'

interface LogoutButtonProps {
  variant?: 'button' | 'icon' | 'menuItem'
  showConfirmDialog?: boolean
  onLogoutComplete?: () => void
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = 'button',
  showConfirmDialog = true,
  onLogoutComplete,
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { logout, user } = useAuth()

  const handleLogoutClick = () => {
    if (showConfirmDialog) {
      setConfirmOpen(true)
    } else {
      handleConfirmLogout()
    }
  }

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true)
    setConfirmOpen(false)

    try {
      await logout()
      onLogoutComplete?.()
    } catch (error) {
      console.error('Logout error:', error)
      // Even if logout fails, the tokens are cleared locally
      onLogoutComplete?.()
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleCancelLogout = () => {
    setConfirmOpen(false)
  }

  const renderButton = () => {
    switch (variant) {
      case 'icon':
        return (
          <IconButton
            onClick={handleLogoutClick}
            disabled={isLoggingOut}
            color="inherit"
            title="Sign Out"
          >
            {isLoggingOut ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <Logout />
            )}
          </IconButton>
        )

      case 'menuItem':
        return (
          <MenuItem onClick={handleLogoutClick} disabled={isLoggingOut}>
            <ListItemIcon>
              {isLoggingOut ? (
                <CircularProgress size={20} />
              ) : (
                <ExitToApp fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText>
              {isLoggingOut ? 'Signing out...' : 'Sign Out'}
            </ListItemText>
          </MenuItem>
        )

      default:
        return (
          <Button
            onClick={handleLogoutClick}
            disabled={isLoggingOut}
            startIcon={
              isLoggingOut ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Logout />
              )
            }
            variant="outlined"
            color="inherit"
          >
            {isLoggingOut ? 'Signing out...' : 'Sign Out'}
          </Button>
        )
    }
  }

  return (
    <>
      {renderButton()}

      <Dialog
        open={confirmOpen}
        onClose={handleCancelLogout}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Sign Out</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to sign out
            {user?.firstName ? `, ${user.firstName}` : ''}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelLogout} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmLogout}
            color="primary"
            variant="contained"
            disabled={isLoggingOut}
            startIcon={
              isLoggingOut ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <ExitToApp />
              )
            }
          >
            {isLoggingOut ? 'Signing out...' : 'Sign Out'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default LogoutButton
