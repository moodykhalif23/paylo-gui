import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Drawer,
  IconButton,
  Badge,
  Divider,
  Alert,
  Stack,
} from '@mui/material'
import {
  FileDownload as FileDownloadIcon,
  Close as CloseIcon,
  ClearAll as ClearAllIcon,
} from '@mui/icons-material'
import { ExportProgress } from './ExportProgress'
import { ExportJob } from '../../services/export/types'

interface ExportManagerProps {
  open: boolean
  onClose: () => void
  jobs: ExportJob[]
  onJobComplete?: (job: ExportJob) => void
  onJobCancel?: (jobId: string) => void
  onClearCompleted?: () => void
}

export const ExportManager: React.FC<ExportManagerProps> = ({
  open,
  onClose,
  jobs,
  onJobComplete,
  onJobCancel,
  onClearCompleted,
}) => {
  const [completedJobs, setCompletedJobs] = useState<ExportJob[]>([])
  const [activeJobs, setActiveJobs] = useState<ExportJob[]>([])

  useEffect(() => {
    const active = jobs.filter(
      job =>
        job.progress.status === 'pending' ||
        job.progress.status === 'processing'
    )
    const completed = jobs.filter(
      job =>
        job.progress.status === 'completed' || job.progress.status === 'failed'
    )

    setActiveJobs(active)
    setCompletedJobs(completed)
  }, [jobs])

  const handleJobComplete = (job: ExportJob) => {
    if (onJobComplete) {
      onJobComplete(job)
    }
  }

  const handleJobCancel = (jobId: string) => {
    if (onJobCancel) {
      onJobCancel(jobId)
    }
  }

  const handleClearCompleted = () => {
    if (onClearCompleted) {
      onClearCompleted()
    }
  }

  const totalJobs = jobs.length
  const activeCount = activeJobs.length
  const completedCount = completedJobs.filter(
    job => job.progress.status === 'completed'
  ).length
  const failedCount = completedJobs.filter(
    job => job.progress.status === 'failed'
  ).length

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 } },
      }}
    >
      <Box
        sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">
            Export Manager
            {totalJobs > 0 && (
              <Badge badgeContent={activeCount} color="primary" sx={{ ml: 1 }}>
                <FileDownloadIcon />
              </Badge>
            )}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Summary */}
        {totalJobs > 0 && (
          <Box mb={2}>
            <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Active: {activeCount}
              </Typography>
              <Typography variant="body2" color="success.main">
                Completed: {completedCount}
              </Typography>
              {failedCount > 0 && (
                <Typography variant="body2" color="error.main">
                  Failed: {failedCount}
                </Typography>
              )}
            </Stack>
            <Divider />
          </Box>
        )}

        {/* Content */}
        <Box flex={1} sx={{ overflowY: 'auto' }}>
          {totalJobs === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              height="100%"
              textAlign="center"
            >
              <FileDownloadIcon
                sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No exports yet
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Start an export from any data table to see progress here
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {/* Active Jobs */}
              {activeJobs.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Active Exports ({activeJobs.length})
                  </Typography>
                  {activeJobs.map(job => (
                    <ExportProgress
                      key={job.id}
                      job={job}
                      onComplete={handleJobComplete}
                      onCancel={handleJobCancel}
                      showDetails={false}
                    />
                  ))}
                </Box>
              )}

              {/* Completed Jobs */}
              {completedJobs.length > 0 && (
                <Box>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Typography variant="subtitle2">
                      Recent Exports ({completedJobs.length})
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<ClearAllIcon />}
                      onClick={handleClearCompleted}
                      variant="outlined"
                    >
                      Clear
                    </Button>
                  </Box>
                  {completedJobs.map(job => (
                    <ExportProgress
                      key={job.id}
                      job={job}
                      onComplete={handleJobComplete}
                      showDetails={false}
                    />
                  ))}
                </Box>
              )}
            </Stack>
          )}
        </Box>

        {/* Footer */}
        {activeJobs.length > 0 && (
          <Box mt={2} pt={2} borderTop={1} borderColor="divider">
            <Alert severity="info">
              {activeJobs.length} export{activeJobs.length > 1 ? 's' : ''} in
              progress. You can close this panel and continue working.
            </Alert>
          </Box>
        )}
      </Box>
    </Drawer>
  )
}
