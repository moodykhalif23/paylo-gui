import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tooltip,
  LinearProgress,
  Grid,
} from '@mui/material'
import {
  Visibility as VisibilityIcon,
  Flag as FlagIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material'
import { SuspiciousActivity } from '../../../types'
import { formatDate } from '../../../utils/formatters'
import {
  useGetSuspiciousActivitiesQuery,
  useUpdateSuspiciousActivityStatusMutation,
} from '../../../store/api/adminApi'

interface SuspiciousActivityPanelProps {
  onViewTransaction: (transactionId: string) => void
}

const SuspiciousActivityPanel: React.FC<SuspiciousActivityPanelProps> = ({
  onViewTransaction,
}) => {
  const [page] = useState(0)
  const [rowsPerPage] = useState(10)
  const [selectedActivity, setSelectedActivity] =
    useState<SuspiciousActivity | null>(null)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<
    'investigating' | 'resolved' | 'false_positive'
  >('investigating')
  const [resolution, setResolution] = useState('')

  const {
    data: suspiciousActivitiesData,
    isLoading,
    error,
    refetch,
  } = useGetSuspiciousActivitiesQuery({
    page: page + 1,
    limit: rowsPerPage,
  })

  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateSuspiciousActivityStatusMutation()

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'info'
      case 'medium':
        return 'warning'
      case 'high':
        return 'error'
      case 'critical':
        return 'error'
      default:
        return 'default'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low':
        return <SecurityIcon fontSize="small" />
      case 'medium':
        return <WarningIcon fontSize="small" />
      case 'high':
        return <FlagIcon fontSize="small" />
      case 'critical':
        return <FlagIcon fontSize="small" />
      default:
        return <SecurityIcon fontSize="small" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'investigating':
        return 'info'
      case 'resolved':
        return 'success'
      case 'false_positive':
        return 'default'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircleIcon fontSize="small" />
      case 'false_positive':
        return <CancelIcon fontSize="small" />
      default:
        return null
    }
  }

  const handleStatusUpdate = async () => {
    if (!selectedActivity) return

    try {
      await updateStatus({
        activityId: selectedActivity.id,
        status: newStatus,
        resolution: resolution || undefined,
      }).unwrap()

      setStatusDialogOpen(false)
      setSelectedActivity(null)
      setResolution('')
      refetch()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const openStatusDialog = (activity: SuspiciousActivity) => {
    setSelectedActivity(activity)
    setNewStatus('investigating')
    setResolution('')
    setStatusDialogOpen(true)
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load suspicious activities
      </Alert>
    )
  }

  const activities = suspiciousActivitiesData?.data || []
  const totalCount = suspiciousActivitiesData?.pagination.totalCount || 0

  return (
    <Box>
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography
            variant="h6"
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <SecurityIcon />
            Suspicious Activities
            <Chip label={totalCount} size="small" color="warning" />
          </Typography>
        </Box>

        {isLoading && <LinearProgress />}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Detected</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Risk Score</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No suspicious activities found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                activities.map(activity => (
                  <TableRow key={activity.id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(activity.detectedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={activity.type.replace('_', ' ').toUpperCase()}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getSeverityIcon(activity.severity)}
                        label={activity.severity.toUpperCase()}
                        size="small"
                        color={
                          getSeverityColor(activity.severity) as
                            | 'error'
                            | 'warning'
                            | 'info'
                        }
                        variant={
                          activity.severity === 'critical'
                            ? 'filled'
                            : 'outlined'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Typography variant="body2" fontWeight="medium">
                          {activity.riskScore}/100
                        </Typography>
                        <Box sx={{ width: 60 }}>
                          <LinearProgress
                            variant="determinate"
                            value={activity.riskScore}
                            color={
                              activity.riskScore >= 80
                                ? 'error'
                                : activity.riskScore >= 60
                                  ? 'warning'
                                  : 'success'
                            }
                            sx={{ height: 4, borderRadius: 2 }}
                          />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200 }}>
                        {activity.description}
                      </Typography>
                      {activity.flags.length > 0 && (
                        <Box sx={{ mt: 0.5 }}>
                          {activity.flags.slice(0, 2).map((flag, index) => (
                            <Chip
                              key={index}
                              label={flag}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 0.5, fontSize: '0.7rem' }}
                            />
                          ))}
                          {activity.flags.length > 2 && (
                            <Chip
                              label={`+${activity.flags.length - 2} more`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusIcon(activity.status) ? (
                        <Chip
                          icon={getStatusIcon(activity.status)!}
                          label={activity.status
                            .replace('_', ' ')
                            .toUpperCase()}
                          size="small"
                          color={
                            getStatusColor(activity.status) as
                              | 'success'
                              | 'warning'
                              | 'error'
                              | 'info'
                          }
                          variant={
                            activity.status === 'resolved'
                              ? 'filled'
                              : 'outlined'
                          }
                        />
                      ) : (
                        <Chip
                          label={activity.status
                            .replace('_', ' ')
                            .toUpperCase()}
                          size="small"
                          color={
                            getStatusColor(activity.status) as
                              | 'success'
                              | 'warning'
                              | 'error'
                              | 'info'
                          }
                          variant={
                            activity.status === 'resolved'
                              ? 'filled'
                              : 'outlined'
                          }
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Transaction">
                          <IconButton
                            size="small"
                            onClick={() =>
                              onViewTransaction(activity.transactionId)
                            }
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {activity.status === 'pending' && (
                          <Tooltip title="Update Status">
                            <IconButton
                              size="small"
                              onClick={() => openStatusDialog(activity)}
                            >
                              <FlagIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Status Update Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Suspicious Activity Status</DialogTitle>
        <DialogContent>
          {selectedActivity && (
            <Box sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Activity: {selectedActivity.description}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>New Status</InputLabel>
                    <Select
                      value={newStatus}
                      label="New Status"
                      onChange={e =>
                        setNewStatus(
                          e.target.value as
                            | 'investigating'
                            | 'resolved'
                            | 'false_positive'
                        )
                      }
                    >
                      <MenuItem value="investigating">Investigating</MenuItem>
                      <MenuItem value="resolved">Resolved</MenuItem>
                      <MenuItem value="false_positive">False Positive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Resolution Notes"
                    placeholder="Add notes about the resolution..."
                    value={resolution}
                    onChange={e => setResolution(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleStatusUpdate}
            variant="contained"
            disabled={isUpdating}
          >
            {isUpdating ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SuspiciousActivityPanel
