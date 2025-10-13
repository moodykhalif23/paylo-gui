import React from 'react'
import { Typography, Box } from '@mui/material'

const InvoicesPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Invoices
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Invoice management will be implemented in task 6.2
      </Typography>
    </Box>
  )
}

export default InvoicesPage
