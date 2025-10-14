import React from 'react'
import {
  Box,
  Grid,
  Typography,
  Chip,
  Alert,
  Tabs,
  Tab,
  Paper,
} from '@mui/material'
import { useAppSelector } from '../../store'
import { selectConnectionStatus } from '../../store/slices/systemSlice'
import { useRealTimeByRole } from '../../hooks/useRealTimeData'
import RealTimeTransactionStatus from './RealTimeTransactionStatus'
import RealTimeWalletBalances from './RealTimeWalletBalances'
import RealTimeSystemHealth from './RealTimeSystemHealth'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  ...other
}) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`real-time-tabpanel-${index}`}
      aria-labelledby={`real-time-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

const a11yProps = (index: number) => {
  return {
    id: `real-time-tab-${index}`,
    'aria-controls': `real-time-tabpanel-${index}`,
  }
}

export const RealTimeDashboard: React.FC = () => {
  const { isConnected, user, userRole } = useRealTimeByRole()
  const connectionStatus = useAppSelector(selectConnectionStatus)
  const [tabValue, setTabValue] = React.useState(0)

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  if (!user) {
    return (
      <Alert severity="warning">Please log in to view real-time data.</Alert>
    )
  }

  const renderUserDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <RealTimeWalletBalances userId={user.id} />
      </Grid>
      <Grid item xs={12} md={6}>
        <RealTimeTransactionStatus userId={user.id} />
      </Grid>
    </Grid>
  )

  const renderMerchantDashboard = () => (
    <Paper sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="merchant real-time tabs"
        >
          <Tab label="Wallets & Balances" {...a11yProps(0)} />
          <Tab label="Transactions" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <TabPanel value={tabValue} index={0}>
        <RealTimeWalletBalances userId={user.id} showBreakdown={true} />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <RealTimeTransactionStatus userId={user.id} showStats={true} />
      </TabPanel>
    </Paper>
  )

  const renderAdminDashboard = () => (
    <Paper sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="admin real-time tabs"
        >
          <Tab label="System Health" {...a11yProps(0)} />
          <Tab label="Global Transactions" {...a11yProps(1)} />
          <Tab label="System Wallets" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <TabPanel value={tabValue} index={0}>
        <RealTimeSystemHealth
          showMetrics={true}
          showServices={true}
          showAlerts={true}
        />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <RealTimeTransactionStatus showStats={true} maxUpdates={20} />
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <RealTimeWalletBalances showBreakdown={true} maxUpdates={15} />
      </TabPanel>
    </Paper>
  )

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          Real-Time Dashboard
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Chip
            size="small"
            label={isConnected ? 'Connected' : 'Disconnected'}
            color={isConnected ? 'success' : 'error'}
            variant={isConnected ? 'filled' : 'outlined'}
          />
          <Chip
            size="small"
            label={`Role: ${userRole}`}
            color="primary"
            variant="outlined"
          />
          <Chip
            size="small"
            label={`Status: ${connectionStatus}`}
            color={connectionStatus === 'connected' ? 'success' : 'warning'}
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Connection Warning */}
      {!isConnected && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Real-time updates are currently unavailable. Data may not be up to
          date.
        </Alert>
      )}

      {/* Role-based Dashboard Content */}
      {userRole === 'user' && renderUserDashboard()}
      {userRole === 'merchant' && renderMerchantDashboard()}
      {userRole === 'admin' && renderAdminDashboard()}
    </Box>
  )
}

export default RealTimeDashboard
