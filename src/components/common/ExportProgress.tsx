import React, { useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Button,
  IconButton,
  Collapse,
  Alert,
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Download as DownloadIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { exportService } from '../../services/export'
import {
  ExportJob,
  ExportProgress as ExportProgressType,
} from '../../services/export/types'

interface ExportProgressProps {
  job: ExportJob
  onComplete?: (job: ExportJob) => void
  onError?: (error: string) => void
  onCancel?: (jobId: string) => void
  showDetails?: boolean
}

export const ExportProgress: React.FC<ExportProgressProps> = ({
  job,
  onComplete,
  onError,
  onCancel,
  showDetails = false,
}) => {
  const [progress, setProgress] = useState<ExportProgressType>(job.progress)
  const [expanded, setExpanded] = useState(showDetails)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Subscribe to progress updates
    exportService.onProgress(job.id, progressUpdate => {
      setProgress(progressUpdate)

      if (progressUpdate.status === 'completed' && onComplete) {
        const updatedJob = exportService.getJob(job.id)
        if (updatedJob) {
          onComplete(updatedJob)
        }
      }

      if (progressUpdate.status === 'failed') {
        const errorMessage = progressUpdate.message || 'Export failed'
        setError(errorMessage)
        if (onError) {
          onError(errorMessage)
        }
      }
    })

    return () => {
      exportService.offProgress(job.id)
    }
  }, [job.id, onComplete, onError])

  const handleCancel = () => {
    if (exportService.cancelJob(job.id)) {
      if (onCancel) {
        onCancel(job.id)
      }
    }
  }

  const handleDownload = async () => {
    const currentJob = exportService.getJob(job.id)
    if (currentJob?.result) {
      try {
        await exportService.downloadFile(currentJob.result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Download failed')
      }
    }
  }

  const handleRetry = () => {
    // In a real implementation, you might want to restart the export
    setError(null)
    setProgress({ ...progress, status: 'pending', progress: 0 })
  }

  const isProcessing = progress.status === 'processing'
  const isCompleted = progress.status === 'completed'
  const isFailed = progress.status === 'failed'
  const isPending = progress.status === 'pending'

  const getStatusColor = () => {
    if (isFailed) return 'error'
    if (isCompleted) return 'success'
    if (isProcessing) return 'primary'
    return 'info'
  }

  const getStatusText = () => {
    if (isPending) return 'Pending'
    if (isProcessing) return 'Processing'
    if (isCompleted) return 'Completed'
    if (isFailed) return 'Failed'
    return 'Unknown'
  }

  const formatTimeRemaining = (seconds?: number) => {
    if (!seconds) return null

    if (seconds < 60) return `${Math.round(seconds)}s remaining`
    if (seconds < 3600) return `${Math.round(seconds / 60)}m remaining`
    return `${Math.round(seconds / 3600)}h remaining`
  }

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent sx={{ pb: 2 }}>
        <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
          <Box flex={1}>
            <Typography variant="subtitle2" gutterBottom>
              Export: {job.request.type} ({job.request.format.toUpperCase()})
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body2" color="text.secondary">
                {getStatusText()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round(progress.progress)}%
              </Typography>
              {progress.estimatedTimeRemaining && (
                <Typography variant="caption" color="text.secondary">
                  {formatTimeRemaining(progress.estimatedTimeRemaining)}
                </Typography>
              )}
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            {isProcessing && (
              <IconButton
                size="small"
                onClick={handleCancel}
                title="Cancel Export"
              >
                <CancelIcon />
              </IconButton>
            )}

            {isCompleted && (
              <Button
                size="small"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
                variant="contained"
                color="success"
              >
                Download
              </Button>
            )}

            {isFailed && (
              <IconButton
                size="small"
                onClick={handleRetry}
                title="Retry Export"
              >
                <RefreshIcon />
              </IconButton>
            )}

            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              title={expanded ? 'Hide Details' : 'Show Details'}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

        <LinearProgress
          variant="determinate"
          value={progress.progress}
          color={getStatusColor()}
          sx={{ mb: 1 }}
        />

        {progress.message && (
          <Typography variant="caption" color="text.secondary" display="block">
            {progress.message}
          </Typography>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 1 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Collapse in={expanded}>
          <Box mt={2} pt={2} borderTop={1} borderColor="divider">
            <Typography variant="subtitle1" gutterBottom>
              Export Details
            </Typography>
            <Box
              display="grid"
              gridTemplateColumns="1fr 1fr"
              gap={1}
              sx={{ fontSize: '0.875rem' }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Format:
                </Typography>
                <Typography variant="body2">
                  {job.request.format.toUpperCase()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Type:
                </Typography>
                <Typography variant="body2">{job.request.type}</Typography>
              </Box>
              {job.request.dateRange && (
                <>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      From:
                    </Typography>
                    <Typography variant="body2">
                      {job.request.dateRange.from}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      To:
                    </Typography>
                    <Typography variant="body2">
                      {job.request.dateRange.to}
                    </Typography>
                  </Box>
                </>
              )}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Started:
                </Typography>
                <Typography variant="body2">
                  {new Date(job.createdAt).toLocaleString()}
                </Typography>
              </Box>
              {job.result && (
                <>
                  {job.result.recordCount && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Records:
                      </Typography>
                      <Typography variant="body2">
                        {job.result.recordCount.toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                  {job.result.fileSize && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        File Size:
                      </Typography>
                      <Typography variant="body2">
                        {(job.result.fileSize / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  )
}
