import React from 'react'
import { Typography, Box } from '@mui/material'

const AdminDashboard: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Admin dashboard will be implemented in task 7.1
      </Typography>
    </Box>
  )
}

export default AdminDashboard
