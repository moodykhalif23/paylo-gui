import React, { useState, useEffect } from 'react'
import { Box, Container, useTheme, useMediaQuery, Toolbar } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { useAppSelector } from '../../store'

import Header from './Header'
import Sidebar from './Sidebar'

const MainLayout: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'))
  const { isAuthenticated } = useAppSelector(state => state.auth)

  // Hide footer on all authenticated pages (MainLayout is only used for authenticated pages)
  const isAuthenticatedPage = isAuthenticated

  // Sidebar always open on large screens, controlled on mobile/tablet
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)

  // Sidebar width constant
  const sidebarWidth = 280

  // Close sidebar on mobile when screen size changes, always open on large screens
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    } else if (isLargeScreen) {
      setSidebarOpen(true)
    } else {
      setSidebarOpen(true)
    }
  }, [isMobile, isLargeScreen])

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleSidebarClose = () => {
    setSidebarOpen(false)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Header - Fixed position */}
      <Header onMenuToggle={handleSidebarToggle} />

      {/* Sidebar - only show when authenticated */}
      {isAuthenticated && (
        <Sidebar open={sidebarOpen} onClose={handleSidebarClose} />
      )}

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: '100%',
          background: isAuthenticated
            ? 'linear-gradient(135deg, rgba(7, 24, 13, 0.92) 0%, rgba(7, 24, 13, 0.95) 100%)'
            : 'transparent',
          paddingTop: 0,
        }}
      >
        {/* Toolbar spacer */}
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }} />

        {/* Content container */}
        <Container
          maxWidth={false}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            py: { xs: 2, sm: 2 },
            px: { xs: 2, sm: 2, md: 2, lg: 2 },
            width: '100%',
            ml: 0,
            mr: 0,
            pl: {
              xs: 2,
              md: isAuthenticated && sidebarOpen ? `${sidebarWidth + 16}px` : 2,
            },
            transition: theme.transitions.create(['padding-left'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }}
        >
          {/* Page content */}
          <Box sx={{ flex: 1 }}>
            <Outlet />
          </Box>
        </Container>

        {/* Footer - Hidden on all authenticated pages */}
        {!isAuthenticatedPage && (
          <Box
            component="footer"
            sx={{
              mt: 'auto',
              py: 2,
              px: 3,
              backgroundColor: theme.palette.grey[50],
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            <Container maxWidth="xl">
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                  © 2024 Paylo. All rights reserved.
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    fontSize: '0.875rem',
                    color: 'text.secondary',
                    flexWrap: 'wrap',
                  }}
                >
                  <Box component="span">Privacy Policy</Box>
                  <Box component="span">Terms of Service</Box>
                  <Box component="span">Support</Box>
                </Box>
              </Box>
            </Container>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default MainLayout
