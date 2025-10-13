import React from 'react'
import { Typography, Box } from '@mui/material'

const UserManagementPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>
      <Typography variant="body1" color="text.secondary">
        User management will be implemented in task 7.2
      </Typography>
    </Box>
  )
}

export default UserManagementPage
