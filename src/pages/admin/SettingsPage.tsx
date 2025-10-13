import React from 'react'
import { Typography, Box } from '@mui/material'

const AdminSettingsPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        System Settings
      </Typography>
      <Typography variant="body1" color="text.secondary">
        System configuration will be implemented in task 7.4
      </Typography>
    </Box>
  )
}

export default AdminSettingsPage
