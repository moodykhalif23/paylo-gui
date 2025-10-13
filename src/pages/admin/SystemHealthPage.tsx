import React from 'react'
import { Typography, Box } from '@mui/material'

const SystemHealthPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        System Health
      </Typography>
      <Typography variant="body1" color="text.secondary">
        System health monitoring will be implemented in task 7.1
      </Typography>
    </Box>
  )
}

export default SystemHealthPage
