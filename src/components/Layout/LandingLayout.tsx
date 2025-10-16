import React from 'react'
import { Box, Container } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { useAccessibility } from '../../contexts/AccessibilityContext'

const LandingLayout: React.FC = () => {
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
      {/* Main content - full width, centered */}
      <Box
        component="main"
        role="main"
        id="main-content"
        tabIndex={-1} // Allow programmatic focus for skip links
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          '&:focus': {
            outline: 'none',
          },
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            py: { xs: 2, sm: 4, md: 6 },
            px: { xs: 2, sm: 3 },
          }}
        >
          <Outlet />
        </Container>
      </Box>
    </Box>
  )
}

export default LandingLayout
