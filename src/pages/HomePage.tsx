import { Typography, Box, Card, CardContent, Grid, Button } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { Accessibility } from '@mui/icons-material'

const HomePage = () => {
  return (
    <Box>
      <Typography variant="h2" component="h1" gutterBottom>
        Welcome to Paylo
      </Typography>

      <Typography variant="h5" color="text.secondary" paragraph>
        Secure cryptocurrency payment gateway for P2P transfers and merchant
        transactions
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                P2P Transfers
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Send and receive Bitcoin, Ethereum, and Solana directly between
                wallets
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Merchant Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Accept cryptocurrency payments and manage your business
                transactions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Admin Panel
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Monitor system health and manage users with comprehensive admin
                tools
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Accessibility Demo Section */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'action.hover', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Accessibility color="primary" />
          <Typography variant="h6">Accessibility Features</Typography>
        </Box>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Paylo is built with comprehensive accessibility features including
          keyboard navigation, screen reader support, high contrast mode, and
          WCAG compliance.
        </Typography>
        <Button
          component={RouterLink}
          to="/accessibility-demo"
          variant="contained"
          startIcon={<Accessibility />}
          sx={{
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: '2px',
            },
          }}
        >
          Explore Accessibility Features
        </Button>
      </Box>
    </Box>
  )
}

export default HomePage
