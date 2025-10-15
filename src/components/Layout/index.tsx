import { Outlet } from 'react-router-dom'
import { Box, Container, Typography } from '@mui/material'
import { useAccessibility } from '../../contexts/AccessibilityContext'
import AccessibilitySettings from '../common/AccessibilitySettings'

// Enhanced layout component with accessibility features
const Layout = () => {
  const { settings } = useAccessibility()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        // Apply accessibility classes
        '&.high-contrast': {
          filter: 'contrast(150%)',
        },
        '&.reduced-motion *': {
          animationDuration: '0.01ms !important',
          animationIterationCount: '1 !important',
          transitionDuration: '0.01ms !important',
        },
      }}
      className={[
        settings.highContrast ? 'high-contrast' : '',
        settings.reducedMotion ? 'reduced-motion' : '',
        settings.keyboardNavigation ? 'keyboard-navigation' : '',
        settings.screenReaderMode ? 'screen-reader-mode' : '',
        settings.focusIndicators ? 'focus-indicators' : '',
        `accessibility-font-${settings.fontSize}`,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Header with proper semantic markup */}
      <Box
        component="header"
        role="banner"
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: '1.5rem',
              fontWeight: 600,
              margin: 0,
            }}
          >
            Paylo - Payment Gateway
          </Typography>

          {/* Accessibility settings in header */}
          <AccessibilitySettings compact />
        </Container>
      </Box>

      {/* Navigation landmark - will be enhanced in task 4 */}
      <Box
        component="nav"
        role="navigation"
        aria-label="Main navigation"
        id="main-navigation"
        sx={{
          bgcolor: 'primary.dark',
          color: 'white',
          py: 1,
          display: 'none', // Will be shown when navigation is implemented
        }}
      >
        <Container maxWidth="lg">
          {/* Navigation items will be added in task 4 */}
        </Container>
      </Box>

      {/* Main content with proper landmark */}
      <Box
        component="main"
        role="main"
        id="main-content"
        tabIndex={-1} // Allow programmatic focus for skip links
        sx={{
          flex: 1,
          py: 3,
          '&:focus': {
            outline: 'none',
          },
        }}
      >
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>

      {/* Footer with proper semantic markup */}
      <Box
        component="footer"
        role="contentinfo"
        sx={{
          bgcolor: 'grey.100',
          p: 2,
          mt: 'auto',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center' }}
          >
            © 2024 Paylo. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}

export default Layout
