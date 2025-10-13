import React from 'react'
import { Typography, Box } from '@mui/material'

const MerchantSettingsPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Merchant Settings
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Merchant settings (API keys, webhooks) will be implemented in task 6.2
      </Typography>
    </Box>
  )
}

export default MerchantSettingsPage
