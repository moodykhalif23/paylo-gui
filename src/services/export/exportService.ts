import { apiClient } from '../api/client'
import { ExportRequest, ExportResult, ExportJob, ExportProgress } from './types'

class ExportService {
  private activeJobs = new Map<string, ExportJob>()
  private progressCallbacks = new Map<
    string,
    (progress: ExportProgress) => void
  >()

  /**
   * Start an export job
   */
  async startExport(request: ExportRequest): Promise<ExportJob> {
    const jobId = this.generateJobId()

    const job: ExportJob = {
      id: jobId,
      request,
      progress: {
        id: jobId,
        progress: 0,
        status: 'pending',
      },
      createdAt: new Date().toISOString(),
    }

    this.activeJobs.set(jobId, job)

    // Start the export process asynchronously
    setTimeout(() => this.processExport(job), 0)

    return job
  }

  /**
   * Get export job status
   */
  getJob(jobId: string): ExportJob | undefined {
    return this.activeJobs.get(jobId)
  }

  /**
   * Cancel an export job
   */
  cancelJob(jobId: string): boolean {
    const job = this.activeJobs.get(jobId)
    if (job && job.progress.status === 'processing') {
      job.progress.status = 'failed'
      job.progress.message = 'Export cancelled by user'
      this.updateProgress(jobId, job.progress)
      return true
    }
    return false
  }

  /**
   * Subscribe to progress updates
   */
  onProgress(
    jobId: string,
    callback: (progress: ExportProgress) => void
  ): void {
    this.progressCallbacks.set(jobId, callback)
  }

  /**
   * Unsubscribe from progress updates
   */
  offProgress(jobId: string): void {
    this.progressCallbacks.delete(jobId)
  }

  /**
   * Download exported file
   */
  async downloadFile(result: ExportResult): Promise<void> {
    if (!result.downloadUrl) {
      throw new Error('No download URL available')
    }

    try {
      const response = await fetch(result.downloadUrl)
      if (!response.ok) {
        throw new Error('Failed to download file')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = result.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      throw new Error(
        `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Export data directly to file (client-side)
   */
  async exportToFile(data: unknown[], request: ExportRequest): Promise<void> {
    const fileName = request.options?.fileName || `export_${Date.now()}`

    switch (request.format) {
      case 'csv':
        this.exportToCSV(data, fileName, request.options)
        break
      case 'json':
        this.exportToJSON(data, fileName)
        break
      case 'excel':
        await this.exportToExcel(data, fileName, request.options)
        break
      default:
        throw new Error(`Unsupported export format: ${request.format}`)
    }
  }

  private async processExport(job: ExportJob): Promise<void> {
    try {
      // Update status to processing
      job.progress.status = 'processing'
      job.progress.progress = 10
      this.updateProgress(job.id, job.progress)

      // Make API call to backend for export
      const response = await apiClient.post<{
        success: boolean
        data?: ExportResult
        error?: string
      }>('/api/v1/export', job.request)

      if (response.data.success && response.data.data) {
        job.result = response.data.data
        job.progress.status = 'completed'
        job.progress.progress = 100
      } else {
        throw new Error(response.data.error || 'Export failed')
      }
    } catch (error) {
      job.progress.status = 'failed'
      job.progress.message =
        error instanceof Error ? error.message : 'Unknown error'
    }

    this.updateProgress(job.id, job.progress)
  }

  private updateProgress(jobId: string, progress: ExportProgress): void {
    const callback = this.progressCallbacks.get(jobId)
    if (callback) {
      callback(progress)
    }
  }

  private generateJobId(): string {
    return `export_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  private exportToCSV(
    data: unknown[],
    fileName: string,
    options?: Record<string, unknown>
  ): void {
    const delimiter = options?.delimiter || ','
    const includeHeaders = options?.includeHeaders !== false

    if (data.length === 0) {
      throw new Error('No data to export')
    }

    const headers = Object.keys(data[0])
    let csvContent = ''

    if (includeHeaders) {
      csvContent += headers.join(delimiter) + '\n'
    }

    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header]
        // Escape values that contain delimiter, quotes, or newlines
        if (
          typeof value === 'string' &&
          (value.includes(delimiter) ||
            value.includes('"') ||
            value.includes('\n'))
        ) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value || ''
      })
      csvContent += values.join(delimiter) + '\n'
    })

    this.downloadBlob(csvContent, `${fileName}.csv`, 'text/csv')
  }

  private exportToJSON(data: unknown[], fileName: string): void {
    const jsonContent = JSON.stringify(data, null, 2)
    this.downloadBlob(jsonContent, `${fileName}.json`, 'application/json')
  }

  private async exportToExcel(
    data: unknown[],
    fileName: string,
    options?: Record<string, unknown>
  ): Promise<void> {
    try {
      // Dynamic import to avoid bundling xlsx if not used
      const XLSX = await import('xlsx')

      if (data.length === 0) {
        throw new Error('No data to export')
      }

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(data)

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Export')

      // Generate Excel file and download
      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      })
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${fileName}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Excel export failed, falling back to CSV:', error)
      this.exportToCSV(data, fileName, options)
    }
  }

  private downloadBlob(
    content: string,
    fileName: string,
    mimeType: string
  ): void {
    const blob = new Blob([content], { type: mimeType })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }
}

export const exportService = new ExportService()
