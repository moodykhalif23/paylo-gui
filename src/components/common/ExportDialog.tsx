import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
  LinearProgress,
  Alert,
  Chip,
  Stack,
  Divider,
} from '@mui/material'
import {
  Download as DownloadIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material'
import { DateRangePicker } from './DateRangePicker'
import { exportService } from '../../services/export'
import {
  ExportRequest,
  ExportFormat,
  ExportType,
  ExportJob,
  ExportProgress,
  DateRange,
} from '../../services/export/types'

interface ExportDialogProps {
  open: boolean
  onClose: () => void
  exportType: ExportType
  title?: string
  availableColumns?: string[]
  defaultFilters?: Record<string, unknown>
}

const formatLabels: Record<ExportFormat, string> = {
  csv: 'CSV',
  json: 'JSON',
  excel: 'Excel (XLSX)',
}

const typeLabels: Record<ExportType, string> = {
  transactions: 'Transactions',
  invoices: 'Invoices',
  analytics: 'Analytics',
  users: 'Users',
  audit_trail: 'Audit Trail',
  compliance_report: 'Compliance Report',
  regulatory_report: 'Regulatory Report',
  transaction_logs: 'Transaction Logs',
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onClose,
  exportType,
  title,
  availableColumns = [],
  defaultFilters = {},
}) => {
  const [format, setFormat] = useState<ExportFormat>('csv')
  const [fileName, setFileName] = useState('')
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0], // 30 days ago
    to: new Date().toISOString().split('T')[0], // today
  })
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [includeHeaders, setIncludeHeaders] = useState(true)
  const [currentJob, setCurrentJob] = useState<ExportJob | null>(null)
  const [progress, setProgress] = useState<ExportProgress | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormat('csv')
      setFileName(
        `${exportType}_export_${new Date().toISOString().split('T')[0]}`
      )
      setSelectedColumns([])
      setIncludeHeaders(true)
      setCurrentJob(null)
      setProgress(null)
      setError(null)
    }
  }, [open, exportType])

  // Subscribe to progress updates
  useEffect(() => {
    if (currentJob) {
      exportService.onProgress(currentJob.id, progressUpdate => {
        setProgress(progressUpdate)
      })

      return () => {
        exportService.offProgress(currentJob.id)
      }
    }
  }, [currentJob])

  const handleExport = async () => {
    try {
      setError(null)

      const request: ExportRequest = {
        format,
        type: exportType,
        dateRange,
        filters: defaultFilters,
        columns: selectedColumns.length > 0 ? selectedColumns : undefined,
        options: {
          includeHeaders,
          fileName,
        },
      }

      const job = await exportService.startExport(request)
      setCurrentJob(job)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
    }
  }

  const handleDownload = async () => {
    if (currentJob?.result) {
      try {
        await exportService.downloadFile(currentJob.result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Download failed')
      }
    }
  }

  const handleClose = () => {
    if (currentJob && progress?.status === 'processing') {
      exportService.cancelJob(currentJob.id)
    }
    onClose()
  }

  const isExporting = progress?.status === 'processing'
  const isCompleted = progress?.status === 'completed'
  const isFailed = progress?.status === 'failed'

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {title || `Export ${typeLabels[exportType]}`}
          </Typography>
          <Button
            onClick={handleClose}
            size="small"
            sx={{ minWidth: 'auto', p: 0.5 }}
          >
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {progress && (
            <Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
              >
                <Typography variant="body2">
                  {progress.status === 'processing' && 'Exporting...'}
                  {progress.status === 'completed' && 'Export completed'}
                  {progress.status === 'failed' && 'Export failed'}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  {isCompleted && (
                    <CheckCircleIcon color="success" fontSize="small" />
                  )}
                  {isFailed && <ErrorIcon color="error" fontSize="small" />}
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(progress.progress)}%
                  </Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress.progress}
                color={isFailed ? 'error' : isCompleted ? 'success' : 'primary'}
              />
              {progress.message && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: 'block' }}
                >
                  {progress.message}
                </Typography>
              )}
            </Box>
          )}

          {!currentJob && (
            <>
              <FormControl fullWidth>
                <InputLabel>Export Format</InputLabel>
                <Select
                  value={format}
                  label="Export Format"
                  onChange={e => setFormat(e.target.value as ExportFormat)}
                >
                  {Object.entries(formatLabels).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="File Name"
                value={fileName}
                onChange={e => setFileName(e.target.value)}
                helperText="File extension will be added automatically"
              />

              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                label="Date Range"
              />

              {availableColumns.length > 0 && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Columns to Export (leave empty for all)
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {availableColumns.map(column => (
                        <Chip
                          key={column}
                          label={column}
                          variant={
                            selectedColumns.includes(column)
                              ? 'filled'
                              : 'outlined'
                          }
                          onClick={() => {
                            setSelectedColumns(prev =>
                              prev.includes(column)
                                ? prev.filter(c => c !== column)
                                : [...prev, column]
                            )
                          }}
                          size="small"
                        />
                      ))}
                    </Box>
                  </Box>
                </>
              )}

              <FormControl fullWidth>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="body2">Include Headers:</Typography>
                  <Button
                    variant={includeHeaders ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setIncludeHeaders(!includeHeaders)}
                  >
                    {includeHeaders ? 'Yes' : 'No'}
                  </Button>
                </Box>
              </FormControl>
            </>
          )}

          {currentJob?.result && isCompleted && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Export Details
              </Typography>
              <Stack spacing={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    File Name:
                  </Typography>
                  <Typography variant="body2">
                    {currentJob.result.fileName}
                  </Typography>
                </Box>
                {currentJob.result.recordCount && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Records:
                    </Typography>
                    <Typography variant="body2">
                      {currentJob.result.recordCount.toLocaleString()}
                    </Typography>
                  </Box>
                )}
                {currentJob.result.fileSize && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      File Size:
                    </Typography>
                    <Typography variant="body2">
                      {(currentJob.result.fileSize / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isExporting}>
          {isExporting ? 'Cancel' : 'Close'}
        </Button>

        {!currentJob && (
          <Button
            onClick={handleExport}
            variant="contained"
            disabled={!fileName.trim()}
          >
            Start Export
          </Button>
        )}

        {isCompleted && currentJob?.result && (
          <Button
            onClick={handleDownload}
            variant="contained"
            startIcon={<DownloadIcon />}
          >
            Download
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
