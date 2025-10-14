import { useState } from 'react'
import { ExportJob } from '../services/export/types'

// Hook for managing export jobs
export const useExportManager = () => {
  const [jobs, setJobs] = useState<ExportJob[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const addJob = (job: ExportJob) => {
    setJobs(prev => [job, ...prev])
    setIsOpen(true)
  }

  const updateJob = (jobId: string, updates: Partial<ExportJob>) => {
    setJobs(prev =>
      prev.map(job => (job.id === jobId ? { ...job, ...updates } : job))
    )
  }

  const removeJob = (jobId: string) => {
    setJobs(prev => prev.filter(job => job.id !== jobId))
  }

  const clearCompleted = () => {
    setJobs(prev =>
      prev.filter(
        job =>
          job.progress.status === 'pending' ||
          job.progress.status === 'processing'
      )
    )
  }

  const getActiveCount = () => {
    return jobs.filter(
      job =>
        job.progress.status === 'pending' ||
        job.progress.status === 'processing'
    ).length
  }

  return {
    jobs,
    isOpen,
    setIsOpen,
    addJob,
    updateJob,
    removeJob,
    clearCompleted,
    getActiveCount,
  }
}
