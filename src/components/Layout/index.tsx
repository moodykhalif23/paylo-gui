import { Outlet } from 'react-router-dom'
import { Box, Container } from '@mui/material'

// Placeholder layout component - will be enhanced in task 4
const Layout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header will be added in task 4 */}
      <Box component="header" sx={{ bgcolor: 'primary.main', color: 'white', p: 2 }}>
        <Container maxWidth="lg">
          Paylo - Payment Gateway
        </Container>
      </Box>

      {/* Main content */}
      <Box component="main" sx={{ flex: 1, py: 3 }}>
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ bgcolor: 'grey.100', p: 2, mt: 'auto' }}>
        <Container maxWidth="lg">
          © 2024 Paylo. All rights reserved.
        </Container>
      </Box>
    </Box>
  )
}

export default Layout