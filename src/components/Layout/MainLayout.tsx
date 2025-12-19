import React, { useState, useEffect } from 'react'
import { Box, Container, useTheme, useMediaQuery, Toolbar } from '@mui/material'
import { Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '../../store'

import Header from './Header'
import Sidebar from './Sidebar'
import Breadcrumbs from './Breadcrumbs'

const MainLayout: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { isAuthenticated } = useAppSelector(state => state.auth)
  const location = useLocation()

  // Hide footer on dashboard pages
  const isDashboardPage =
    location.pathname.includes('/dashboard') ||
    location.pathname.includes('/wallets') ||
    location.pathname.includes('/analytics')

  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)

  // Sidebar width constant
  const sidebarWidth = 280

  // Close sidebar on mobile when screen size changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    } else {
      setSidebarOpen(true)
    }
  }, [isMobile])

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleSidebarClose = () => {
    setSidebarOpen(false)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
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
          width: {
            xs: '100%',
            md:
              isAuthenticated && sidebarOpen
                ? `calc(100% - ${sidebarWidth}px)`
                : '100%',
          },
          marginLeft: {
            xs: 0,
            md: isAuthenticated && sidebarOpen ? `${sidebarWidth}px` : 0,
          },
          transition: theme.transitions.create(['margin-left', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {/* Toolbar spacer */}
        <Toolbar />

        {/* Content container */}
        <Container
          maxWidth="xl"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            py: { xs: 2, sm: 3 },
            px: { xs: 1, sm: 2, md: 3 },
            width: '100%',
            maxWidth: '100%',
          }}
        >
          {/* Breadcrumbs - only show when authenticated */}
          {isAuthenticated && <Breadcrumbs />}

          {/* Page content */}
          <Box sx={{ flex: 1 }}>
            <Outlet />
          </Box>
        </Container>

        {/* Footer - Hidden on dashboard pages */}
        {!isDashboardPage && (
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
