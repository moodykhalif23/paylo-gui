import React, { useState, useCallback } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  Alert,
  LinearProgress,
  FormControlLabel,
  Checkbox,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import {
  Download as DownloadIcon,
  Visibility as PreviewIcon,
  History as HistoryIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material'
import { complianceService } from '../../services/export/complianceService'
import {
  ExportResult,
  TransactionLogEntry,
  TransactionLogEvent,
} from '../../services/export/types'

interface TransactionLogExporterProps {
  onExportGenerated?: (result: ExportResult) => void
}

export const TransactionLogExporter: React.FC<TransactionLogExporterProps> = ({
  onExportGenerated,
}) => {
  const [fromDate, setFromDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  )
  const [toDate, setToDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [format, setFormat] = useState<'csv' | 'json' | 'excel'>('excel')
  const [blockchain, setBlockchain] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [event, setEvent] = useState<TransactionLogEvent | ''>('')
  const [includeMetadata, setIncludeMetadata] = useState(false)

  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<TransactionLogEntry[]>([])
  const [previewLoading, setPreviewLoading] = useState(false)

  const blockchains = ['bitcoin', 'ethereum', 'solana']
  const statuses = ['pending', 'confirmed', 'failed', 'cancelled']
  const events: TransactionLogEvent[] = [
    'created',
    'submitted',
    'confirmed',
    'failed',
    'cancelled',
    'flagged',
    'investigated',
    'cleared',
  ]

  const handleGenerateExport = useCallback(async () => {
    if (!fromDate || !toDate) {
      setError('Please select both from and to dates')
      return
    }

    setIsGenerating(true)
    setError(null)
    setSuccess(null)

    try {
      const dateRange = {
        from: new Date(fromDate).toISOString(),
        to: new Date(toDate).toISOString(),
      }

      const result = await complianceService.generateTransactionLogs({
        dateRange,
        blockchain: blockchain ? [blockchain] : undefined,
        status: status ? [status] : undefined,
        events: event ? [event] : undefined,
        format,
        includeMetadata,
      })

      setSuccess(
        `Transaction log export generated successfully: ${result.fileName}`
      )
      onExportGenerated?.(result)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to generate transaction log export'
      )
    } finally {
      setIsGenerating(false)
    }
  }, [
    fromDate,
    toDate,
    blockchain,
    status,
    event,
    format,
    includeMetadata,
    onExportGenerated,
  ])

  const handlePreview = useCallback(async () => {
    if (!fromDate || !toDate) {
      setError('Please select both from and to dates')
      return
    }

    setPreviewLoading(true)
    setError(null)

    try {
      const dateRange = {
        from: new Date(fromDate).toISOString(),
        to: new Date(toDate).toISOString(),
      }

      const result = await complianceService.getTransactionLogEntries({
        dateRange,
        blockchain: blockchain ? [blockchain] : undefined,
        status: status ? [status] : undefined,
        limit: 100,
      })

      setPreviewData(result.entries)
      setPreviewOpen(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preview')
    } finally {
      setPreviewLoading(false)
    }
  }, [fromDate, toDate, blockchain, status])

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatAmount = (amount: string) => {
    return parseFloat(amount).toFixed(8)
  }

  const getEventColor = (event: string) => {
    switch (event) {
      case 'confirmed':
      case 'cleared':
        return 'success'
      case 'failed':
      case 'cancelled':
        return 'error'
      case 'flagged':
      case 'investigated':
        return 'warning'
      default:
        return 'default'
    }
  }

  const renderPreviewTable = () => {
    if (previewData.length === 0) {
      return (
        <Typography>
          No transaction log entries found for the selected criteria
        </Typography>
      )
    }

    return (
      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Transaction ID</TableCell>
              <TableCell>Event</TableCell>
              <TableCell>Blockchain</TableCell>
              <TableCell>From</TableCell>
              <TableCell>To</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {previewData.slice(0, 50).map(entry => (
              <TableRow key={entry.id}>
                <TableCell>
                  <Typography variant="body2">
                    {formatTimestamp(entry.timestamp)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {entry.transactionId.substring(0, 8)}...
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={entry.event}
                    color={
                      getEventColor(entry.event) as
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
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {entry.blockchain}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {entry.fromAddress.substring(0, 8)}...
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {entry.toAddress.substring(0, 8)}...
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatAmount(entry.amount)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {entry.status}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }

  return (
    <Box>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <HistoryIcon />
        Transaction Log Exporter
      </Typography>

      <Typography variant="body2" color="text.secondary" paragraph>
        Export detailed transaction logs with blockchain confirmations, fees,
        and technical metadata. Includes complete transaction lifecycle events
        for compliance and audit purposes.
      </Typography>

      <Card>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <FilterIcon />
            Export Configuration
          </Typography>

          <Grid container spacing={3}>
            {/* Date Range */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="From Date"
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="To Date"
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Filters */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Blockchain</InputLabel>
                <Select
                  value={blockchain}
                  label="Blockchain"
                  onChange={e => setBlockchain(e.target.value)}
                >
                  <MenuItem value="">All Blockchains</MenuItem>
                  {blockchains.map(chain => (
                    <MenuItem key={chain} value={chain}>
                      {chain.charAt(0).toUpperCase() + chain.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  label="Status"
                  onChange={e => setStatus(e.target.value)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {statuses.map(s => (
                    <MenuItem key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Event Type</InputLabel>
                <Select
                  value={event}
                  label="Event Type"
                  onChange={e =>
                    setEvent(e.target.value as TransactionLogEvent)
                  }
                >
                  <MenuItem value="">All Events</MenuItem>
                  {events.map(e => (
                    <MenuItem key={e} value={e}>
                      {e.charAt(0).toUpperCase() + e.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Export Format */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Export Format</InputLabel>
                <Select
                  value={format}
                  label="Export Format"
                  onChange={e =>
                    setFormat(e.target.value as 'csv' | 'json' | 'excel')
                  }
                >
                  <MenuItem value="excel">Excel (.xlsx)</MenuItem>
                  <MenuItem value="csv">CSV (.csv)</MenuItem>
                  <MenuItem value="json">JSON (.json)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Options */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Export Options
              </Typography>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeMetadata}
                    onChange={e => setIncludeMetadata(e.target.checked)}
                  />
                }
                label="Include Technical Metadata"
              />
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
              >
                Include gas prices, block numbers, confirmation counts, and
                other technical details
              </Typography>
            </Grid>

            {/* Actions */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<PreviewIcon />}
                  onClick={handlePreview}
                  disabled={isGenerating || previewLoading}
                >
                  Preview Data
                </Button>

                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleGenerateExport}
                  disabled={isGenerating || previewLoading}
                >
                  Generate Export
                </Button>
              </Box>
            </Grid>

            {/* Progress */}
            {isGenerating && (
              <Grid item xs={12}>
                <LinearProgress />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Generating transaction log export...
                </Typography>
              </Grid>
            )}

            {/* Messages */}
            {error && (
              <Grid item xs={12}>
                <Alert severity="error" onClose={() => setError(null)}>
                  {error}
                </Alert>
              </Grid>
            )}

            {success && (
              <Grid item xs={12}>
                <Alert severity="success" onClose={() => setSuccess(null)}>
                  {success}
                </Alert>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Transaction Log Preview
          <Typography variant="body2" color="text.secondary">
            Showing first 50 records (max 100 loaded)
          </Typography>
        </DialogTitle>
        <DialogContent>
          {previewLoading ? <LinearProgress /> : renderPreviewTable()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
