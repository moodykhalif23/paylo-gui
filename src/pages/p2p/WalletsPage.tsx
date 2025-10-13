import React from 'react'
import { Typography, Box } from '@mui/material'

const WalletsPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Wallets
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Wallet management will be implemented in task 5.1
      </Typography>
    </Box>
  )
}

export default WalletsPage
