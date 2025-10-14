import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
  Alert,
  LinearProgress,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  Visibility as ViewIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
} from '@mui/icons-material'
import { complianceService } from '../../services/export/complianceService'
import { AuditTrailEntry } from '../../services/export/types'

interface AuditTrailViewerProps {
  onExport?: (entries: AuditTrailEntry[]) => void
}

export const AuditTrailViewer: React.FC<AuditTrailViewerProps> = ({
  onExport,
}) => {
  const [entries, setEntries] = useState<AuditTrailEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Filters
  const [userIdFilter, setUserIdFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [riskLevelFilter, setRiskLevelFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  // Detail dialog
  const [selectedEntry, setSelectedEntry] = useState<AuditTrailEntry | null>(
    null
  )
  const [detailOpen, setDetailOpen] = useState(false)

  const pageSize = 25

  const loadAuditTrail = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const dateRange =
        fromDate && toDate
          ? {
              from: new Date(fromDate).toISOString(),
              to: new Date(toDate).toISOString(),
            }
          : {
              from: new Date(
                Date.now() - 30 * 24 * 60 * 60 * 1000
              ).toISOString(), // Last 30 days
              to: new Date().toISOString(),
            }

      const filters = {
        dateRange,
        userId: userIdFilter || undefined,
        actions: actionFilter ? [actionFilter] : undefined,
        page,
        limit: pageSize,
      }

      const result = await complianceService.getAuditTrailEntries(filters)
      setEntries(result.entries)
      setTotalCount(result.totalCount)
      setTotalPages(Math.ceil(result.totalCount / pageSize))
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load audit trail'
      )
    } finally {
      setLoading(false)
    }
  }, [page, userIdFilter, actionFilter, fromDate, toDate])

  useEffect(() => {
    loadAuditTrail()
  }, [loadAuditTrail])

  const handleViewDetails = (entry: AuditTrailEntry) => {
    setSelectedEntry(entry)
    setDetailOpen(true)
  }

  const handleExport = () => {
    if (onExport) {
      onExport(entries)
    }
  }

  const handleRefresh = () => {
    setPage(1)
    loadAuditTrail()
  }

  const handleClearFilters = () => {
    setUserIdFilter('')
    setActionFilter('')
    setRiskLevelFilter('')
    setFromDate('')
    setToDate('')
    setPage(1)
  }

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return 'error'
      case 'high':
        return 'warning'
      case 'medium':
        return 'info'
      case 'low':
        return 'success'
      default:
        return 'default'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatChanges = (
    changes?: Record<string, { before: unknown; after: unknown }>
  ) => {
    if (!changes) return 'No changes recorded'

    return Object.entries(changes)
      .map(
        ([field, change]) =>
          `${field}: ${JSON.stringify(change.before)} → ${JSON.stringify(change.after)}`
      )
      .join(', ')
  }

  return (
    <Box>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <SecurityIcon />
        Audit Trail Viewer
      </Typography>

      <Typography variant="body2" color="text.secondary" paragraph>
        Complete record of all user actions and system events with detailed
        change tracking.
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <FilterIcon />
            Filters
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="User ID"
                value={userIdFilter}
                onChange={e => setUserIdFilter(e.target.value)}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Action</InputLabel>
                <Select
                  value={actionFilter}
                  label="Action"
                  onChange={e => setActionFilter(e.target.value)}
                >
                  <MenuItem value="">All Actions</MenuItem>
                  <MenuItem value="login">Login</MenuItem>
                  <MenuItem value="logout">Logout</MenuItem>
                  <MenuItem value="create">Create</MenuItem>
                  <MenuItem value="update">Update</MenuItem>
                  <MenuItem value="delete">Delete</MenuItem>
                  <MenuItem value="approve">Approve</MenuItem>
                  <MenuItem value="reject">Reject</MenuItem>
                  <MenuItem value="configure">Configure</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Risk Level</InputLabel>
                <Select
                  value={riskLevelFilter}
                  label="Risk Level"
                  onChange={e => setRiskLevelFilter(e.target.value)}
                >
                  <MenuItem value="">All Levels</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={handleClearFilters}
                  size="small"
                >
                  Clear
                </Button>
                <Button
                  variant="contained"
                  onClick={handleRefresh}
                  startIcon={<RefreshIcon />}
                  size="small"
                >
                  Refresh
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="From Date"
                type="datetime-local"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="To Date"
                type="datetime-local"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                onClick={handleExport}
                startIcon={<DownloadIcon />}
                disabled={entries.length === 0}
                size="small"
              >
                Export ({entries.length})
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h6">
              Audit Trail Entries ({totalCount.toLocaleString()})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Page {page} of {totalPages}
            </Typography>
          </Box>

          {loading && <LinearProgress sx={{ mb: 2 }} />}

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Resource</TableCell>
                  <TableCell>Risk Level</TableCell>
                  <TableCell>IP Address</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entries.map(entry => (
                  <TableRow key={entry.id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {formatTimestamp(entry.timestamp)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {entry.userEmail}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {entry.userRole}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace' }}
                      >
                        {entry.action}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {entry.resource}
                        </Typography>
                        {entry.resourceId && (
                          <Typography variant="caption" color="text.secondary">
                            ID: {entry.resourceId}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={entry.riskLevel}
                        color={
                          getRiskLevelColor(entry.riskLevel) as
                            | 'default'
                            | 'primary'
                            | 'secondary'
                            | 'error'
                            | 'info'
                            | 'success'
                            | 'warning'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace' }}
                      >
                        {entry.ipAddress}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(entry)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {entries.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No audit trail entries found for the selected criteria.
              </Typography>
            </Box>
          )}

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Audit Trail Entry Details</DialogTitle>
        <DialogContent>
          {selectedEntry && (
            <Box sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Timestamp
                  </Typography>
                  <Typography variant="body2">
                    {formatTimestamp(selectedEntry.timestamp)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    User
                  </Typography>
                  <Typography variant="body2">
                    {selectedEntry.userEmail} ({selectedEntry.userRole})
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Action
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {selectedEntry.action}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Resource
                  </Typography>
                  <Typography variant="body2">
                    {selectedEntry.resource}
                    {selectedEntry.resourceId &&
                      ` (ID: ${selectedEntry.resourceId})`}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    IP Address
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {selectedEntry.ipAddress}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Session ID
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {selectedEntry.sessionId}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Risk Level
                  </Typography>
                  <Chip
                    label={selectedEntry.riskLevel}
                    color={
                      getRiskLevelColor(selectedEntry.riskLevel) as
                        | 'default'
                        | 'primary'
                        | 'secondary'
                        | 'error'
                        | 'info'
                        | 'success'
                        | 'warning'
                    }
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    User Agent
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: '0.75rem', wordBreak: 'break-all' }}
                  >
                    {selectedEntry.userAgent}
                  </Typography>
                </Grid>

                {selectedEntry.changes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Changes
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                      >
                        {formatChanges(selectedEntry.changes)}
                      </Typography>
                    </Paper>
                  </Grid>
                )}

                {selectedEntry.metadata && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Metadata
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                      >
                        {JSON.stringify(selectedEntry.metadata, null, 2)}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
