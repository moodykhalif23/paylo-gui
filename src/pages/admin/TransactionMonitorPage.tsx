import React from 'react'
import { Typography, Box } from '@mui/material'

const TransactionMonitorPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Transaction Monitor
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Transaction monitoring will be implemented in task 7.3
      </Typography>
    </Box>
  )
}

export default TransactionMonitorPage
