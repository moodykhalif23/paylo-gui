import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportService } from '../exportService'
import { ExportRequest } from '../types'

// Mock the API client
vi.mock('../../api/client', () => ({
  apiClient: {
    post: vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          id: 'export_123',
          status: 'completed',
          downloadUrl: 'http://example.com/download',
          fileName: 'export.csv',
          fileSize: 1024,
          recordCount: 100,
          createdAt: '2024-01-15T10:00:00Z',
          expiresAt: '2024-01-16T10:00:00Z',
        },
      },
    }),
  },
}))

// Mock window.URL and document methods for file download tests
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: vi.fn(() => 'mock-url'),
    revokeObjectURL: vi.fn(),
  },
})

Object.defineProperty(document, 'createElement', {
  value: vi.fn(() => ({
    href: '',
    download: '',
    click: vi.fn(),
  })),
})

Object.defineProperty(document.body, 'appendChild', {
  value: vi.fn(),
})

Object.defineProperty(document.body, 'removeChild', {
  value: vi.fn(),
})

describe('ExportService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('startExport', () => {
    it('should create and start an export job', async () => {
      const request: ExportRequest = {
        format: 'csv',
        type: 'transactions',
        dateRange: {
          from: '2024-01-01',
          to: '2024-01-31',
        },
      }

      const job = await exportService.startExport(request)

      expect(job).toBeDefined()
      expect(job.id).toMatch(/^export_\d+_[a-z0-9]+$/)
      expect(job.request).toEqual(request)

      // Initial state should be pending
      expect(job.progress.status).toBe('pending')
      expect(job.progress.progress).toBe(0)

      // Wait for async processing to complete
      await new Promise(resolve => setTimeout(resolve, 100))

      // Check that the job was processed
      const updatedJob = exportService.getJob(job.id)
      expect(updatedJob?.progress.status).toBe('completed')
    })
  })

  describe('getJob', () => {
    it('should return undefined for non-existent job', () => {
      const job = exportService.getJob('non-existent-id')
      expect(job).toBeUndefined()
    })

    it('should return job after creation', async () => {
      const request: ExportRequest = {
        format: 'json',
        type: 'invoices',
      }

      const createdJob = await exportService.startExport(request)
      const retrievedJob = exportService.getJob(createdJob.id)

      expect(retrievedJob).toEqual(createdJob)
    })
  })

  describe('exportToFile', () => {
    const sampleData = [
      { id: 1, name: 'Test 1', value: 100 },
      { id: 2, name: 'Test 2', value: 200 },
    ]

    it('should export CSV format', async () => {
      const request: ExportRequest = {
        format: 'csv',
        type: 'transactions',
        options: {
          fileName: 'test_export',
          includeHeaders: true,
        },
      }

      await expect(
        exportService.exportToFile(sampleData, request)
      ).resolves.not.toThrow()
    })

    it('should export JSON format', async () => {
      const request: ExportRequest = {
        format: 'json',
        type: 'transactions',
        options: {
          fileName: 'test_export',
        },
      }

      await expect(
        exportService.exportToFile(sampleData, request)
      ).resolves.not.toThrow()
    })

    it('should throw error for unsupported format', async () => {
      const request: ExportRequest = {
        format: 'unsupported' as 'excel' | 'csv' | 'json',
        type: 'transactions',
      }

      await expect(
        exportService.exportToFile(sampleData, request)
      ).rejects.toThrow('Unsupported export format')
    })
  })

  describe('cancelJob', () => {
    it('should return false for non-existent job', () => {
      const result = exportService.cancelJob('non-existent-id')
      expect(result).toBe(false)
    })
  })

  describe('progress callbacks', () => {
    it('should allow subscribing and unsubscribing to progress updates', async () => {
      const callback = vi.fn()
      const request: ExportRequest = {
        format: 'csv',
        type: 'transactions',
      }

      const job = await exportService.startExport(request)

      exportService.onProgress(job.id, callback)
      exportService.offProgress(job.id)

      // Callback should be registered and then removed
      expect(callback).not.toHaveBeenCalled()
    })
  })
})
