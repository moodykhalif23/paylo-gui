import { Typography, Box, Card, CardContent, Grid } from '@mui/material'

const HomePage = () => {
  return (
    <Box>
      <Typography variant="h2" component="h1" gutterBottom>
        Welcome to Paylo
      </Typography>
      
      <Typography variant="h5" color="text.secondary" paragraph>
        Secure cryptocurrency payment gateway for P2P transfers and merchant transactions
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                P2P Transfers
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Send and receive Bitcoin, Ethereum, and Solana directly between wallets
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
                Accept cryptocurrency payments and manage your business transactions
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
                Monitor system health and manage users with comprehensive admin tools
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default HomePage