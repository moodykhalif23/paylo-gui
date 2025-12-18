import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import { Menu as MenuIcon, Logout, Settings, Person } from '@mui/icons-material'
import { useAppSelector, useAppDispatch } from '../../store'
import { logoutUser } from '../../store/slices/authSlice'
import { UserRole } from '../../types'
import ConnectionStatus from '../common/ConnectionStatus'
import { NotificationBell } from '../notifications'

interface HeaderProps {
  onMenuToggle: () => void
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const dispatch = useAppDispatch()

  const { user, isAuthenticated } = useAppSelector(state => state.auth)

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    dispatch(logoutUser())
    handleProfileMenuClose()
  }

  const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
      case 'admin':
        return 'Administrator'
      case 'merchant':
        return 'Merchant'
      case 'user':
        return 'P2P User'
      default:
        return 'User'
    }
  }

  const getInitials = (firstName?: string, lastName?: string): string => {
    if (!firstName && !lastName) return 'U'
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
  }

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.primary.main,
        width: '100%',
        left: 0,
        right: 0,
      }}
    >
      <Toolbar>
        {/* Menu toggle button */}
        <IconButton
          color="inherit"
          aria-label="toggle sidebar"
          onClick={onMenuToggle}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo and title */}
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            flexGrow: isMobile ? 1 : 0,
            mr: isMobile ? 0 : 4,
            fontWeight: 'bold',
          }}
        >
          Paylo
        </Typography>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Right side actions */}
        {isAuthenticated && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Connection Status */}
            <ConnectionStatus showDetails variant="icon" size="small" />

            {/* Notifications */}
            <NotificationBell />

            {/* User profile */}
            <Tooltip title="Account">
              <IconButton
                onClick={handleProfileMenuOpen}
                color="inherit"
                aria-label="account"
                sx={{ ml: 1 }}
              >
                {user?.avatarUrl ? (
                  <Avatar
                    src={user.avatarUrl}
                    alt={`${user.firstName} ${user.lastName}`}
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <Avatar
                    sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}
                  >
                    {getInitials(user?.firstName, user?.lastName)}
                  </Avatar>
                )}
              </IconButton>
            </Tooltip>

            {/* User info (desktop only) */}
            {!isMobile && user && (
              <Box sx={{ ml: 1, textAlign: 'right' }}>
                <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {getRoleDisplayName(user.role)}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          onClick={handleProfileMenuClose}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1.5,
              minWidth: 200,
              '& .MuiMenuItem-root': {
                px: 2,
                py: 1,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {user && (
            <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.email}
              </Typography>
              <Typography
                variant="caption"
                color="primary"
                sx={{ display: 'block' }}
              >
                {getRoleDisplayName(user.role)}
              </Typography>
            </Box>
          )}

          <MenuItem onClick={handleProfileMenuClose}>
            <Person sx={{ mr: 1 }} />
            Profile
          </MenuItem>

          <MenuItem onClick={handleProfileMenuClose}>
            <Settings sx={{ mr: 1 }} />
            Settings
          </MenuItem>

          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <Logout sx={{ mr: 1 }} />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}

export default Header
