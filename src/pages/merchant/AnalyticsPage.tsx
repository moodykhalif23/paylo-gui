import React from 'react'
import { Typography, Box } from '@mui/material'

const AnalyticsPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Analytics
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Merchant analytics will be implemented in task 6.3
      </Typography>
    </Box>
  )
}

export default AnalyticsPage
