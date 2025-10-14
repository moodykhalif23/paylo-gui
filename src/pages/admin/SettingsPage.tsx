import React from 'react'
import { Box } from '@mui/material'
import { SystemConfigurationPanel } from '../../components/admin'

const AdminSettingsPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <SystemConfigurationPanel />
    </Box>
  )
}

export default AdminSettingsPage
