import { describe, it, expect, vi, beforeEach } from 'vitest'
import { complianceService } from '../complianceService'
import { apiClient } from '../../api/client'

// Mock the API client
vi.mock('../../api/client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

describe('ComplianceService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateAuditTrailReport', () => {
    it('should generate audit trail report successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: 'audit-123',
            status: 'completed',
            fileName: 'audit_trail_2024.xlsx',
            downloadUrl: '/api/v1/compliance/download/audit-123',
            createdAt: '2024-01-15T10:00:00Z',
            expiresAt: '2024-01-22T10:00:00Z',
          },
        },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const request = {
        dateRange: {
          from: '2024-01-01T00:00:00Z',
          to: '2024-01-31T23:59:59Z',
        },
        format: 'excel' as const,
        includePersonalData: false,
      }

      const result = await complianceService.generateAuditTrailReport(request)

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/compliance/audit-trail',
        {
          ...request,
          type: 'audit_trail',
        }
      )
      expect(result).toEqual(mockResponse.data.data)
    })

    it('should handle API errors', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Network error'))

      const request = {
        dateRange: {
          from: '2024-01-01T00:00:00Z',
          to: '2024-01-31T23:59:59Z',
        },
        format: 'csv' as const,
      }

      await expect(
        complianceService.generateAuditTrailReport(request)
      ).rejects.toThrow('Audit trail report generation failed: Network error')
    })
  })

  describe('generateTransactionLogs', () => {
    it('should generate transaction logs successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: 'txlogs-123',
            status: 'completed',
            fileName: 'transaction_logs_2024.csv',
            downloadUrl: '/api/v1/compliance/download/txlogs-123',
            createdAt: '2024-01-15T10:00:00Z',
            expiresAt: '2024-01-22T10:00:00Z',
          },
        },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const request = {
        dateRange: {
          from: '2024-01-01T00:00:00Z',
          to: '2024-01-31T23:59:59Z',
        },
        blockchain: ['bitcoin', 'ethereum'],
        format: 'csv' as const,
        includeMetadata: true,
      }

      const result = await complianceService.generateTransactionLogs(request)

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/compliance/transaction-logs',
        {
          ...request,
          type: 'transaction_logs',
        }
      )
      expect(result).toEqual(mockResponse.data.data)
    })

    it('should handle transaction logs API errors', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Server error'))

      const request = {
        dateRange: {
          from: '2024-01-01T00:00:00Z',
          to: '2024-01-31T23:59:59Z',
        },
        format: 'json' as const,
      }

      await expect(
        complianceService.generateTransactionLogs(request)
      ).rejects.toThrow('Transaction logs generation failed: Server error')
    })
  })

  describe('generateRegulatoryReport', () => {
    it('should generate regulatory report successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: 'regulatory-123',
            status: 'completed',
            fileName: 'kyc_aml_report_2024.xlsx',
            downloadUrl: '/api/v1/compliance/download/regulatory-123',
            createdAt: '2024-01-15T10:00:00Z',
            expiresAt: '2024-01-22T10:00:00Z',
          },
        },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const request = {
        reportType: 'kyc_aml' as const,
        regulatoryFramework: 'fatf' as const,
        dateRange: {
          from: '2024-01-01T00:00:00Z',
          to: '2024-01-31T23:59:59Z',
        },
        jurisdiction: 'United States',
        format: 'excel' as const,
        maskSensitiveData: true,
      }

      const result = await complianceService.generateRegulatoryReport(request)

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/compliance/regulatory-report',
        {
          ...request,
          type: 'regulatory_report',
        }
      )
      expect(result).toEqual(mockResponse.data.data)
    })

    it('should handle regulatory report API errors', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Validation error'))

      const request = {
        reportType: 'tax_reporting' as const,
        regulatoryFramework: 'bsa' as const,
        dateRange: {
          from: '2024-01-01T00:00:00Z',
          to: '2024-01-31T23:59:59Z',
        },
        jurisdiction: 'United States',
        format: 'csv' as const,
      }

      await expect(
        complianceService.generateRegulatoryReport(request)
      ).rejects.toThrow('Regulatory report generation failed: Validation error')
    })
  })

  describe('generateSuspiciousActivityReport', () => {
    it('should generate suspicious activity report successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: 'sar-123',
            status: 'completed',
            fileName: 'suspicious_activity_2024.xlsx',
            downloadUrl: '/api/v1/compliance/download/sar-123',
            createdAt: '2024-01-15T10:00:00Z',
            expiresAt: '2024-01-22T10:00:00Z',
          },
        },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const request = {
        dateRange: {
          from: '2024-01-01T00:00:00Z',
          to: '2024-01-31T23:59:59Z',
        },
        riskLevel: ['high', 'critical'],
        format: 'excel' as const,
        includeInvestigations: true,
      }

      const result =
        await complianceService.generateSuspiciousActivityReport(request)

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/compliance/suspicious-activity',
        {
          ...request,
          type: 'suspicious_activity',
        }
      )
      expect(result).toEqual(mockResponse.data.data)
    })
  })

  describe('getAuditTrailEntries', () => {
    it('should fetch audit trail entries successfully', async () => {
      const mockEntries = [
        {
          id: 'audit-1',
          timestamp: '2024-01-15T10:00:00Z',
          userId: 'user-123',
          userEmail: 'admin@example.com',
          userRole: 'admin',
          action: 'login',
          resource: 'authentication',
          resourceId: 'session-456',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0...',
          sessionId: 'session-456',
          riskLevel: 'low' as const,
        },
      ]

      const mockResponse = {
        data: {
          success: true,
          data: mockEntries,
          pagination: { totalCount: 1 },
        },
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const filters = {
        dateRange: {
          from: '2024-01-01T00:00:00Z',
          to: '2024-01-31T23:59:59Z',
        },
        userId: 'user-123',
        page: 1,
        limit: 25,
      }

      const result = await complianceService.getAuditTrailEntries(filters)

      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/v1/compliance/audit-trail/entries',
        {
          params: filters,
        }
      )
      expect(result).toEqual({
        entries: mockEntries,
        totalCount: 1,
      })
    })
  })

  describe('validateComplianceRequest', () => {
    it('should validate compliance request successfully', () => {
      const validRequest = {
        type: 'compliance_report' as const,
        reportType: 'audit_trail' as const,
        dateRange: {
          from: '2024-01-01T00:00:00Z',
          to: '2024-01-31T23:59:59Z',
        },
        format: 'excel' as const,
      }

      const result = complianceService.validateComplianceRequest(validRequest)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should return errors for invalid date range', () => {
      const invalidRequest = {
        type: 'compliance_report' as const,
        reportType: 'audit_trail' as const,
        dateRange: {
          from: '2024-01-31T00:00:00Z',
          to: '2024-01-01T23:59:59Z', // Invalid: to date before from date
        },
        format: 'excel' as const,
      }

      const result = complianceService.validateComplianceRequest(invalidRequest)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('From date must be before to date')
    })

    it('should return errors for missing regulatory framework', () => {
      const invalidRequest = {
        type: 'regulatory_report' as const,
        reportType: 'regulatory_filing' as const,
        dateRange: {
          from: '2024-01-01T00:00:00Z',
          to: '2024-01-31T23:59:59Z',
        },
        format: 'excel' as const,
        // Missing regulatoryFramework and jurisdiction
      }

      const result = complianceService.validateComplianceRequest(invalidRequest)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(
        'Regulatory framework is required for regulatory reports'
      )
      expect(result.errors).toContain(
        'Jurisdiction is required for regulatory reports'
      )
    })

    it('should return error for date range exceeding 1 year', () => {
      const twoYearsAgo = new Date()
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)

      const invalidRequest = {
        type: 'compliance_report' as const,
        reportType: 'audit_trail' as const,
        dateRange: {
          from: twoYearsAgo.toISOString(),
          to: new Date().toISOString(),
        },
        format: 'excel' as const,
      }

      const result = complianceService.validateComplianceRequest(invalidRequest)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(
        'Date range cannot exceed 1 year for compliance reports'
      )
    })
  })

  describe('getRegulatoryFrameworks', () => {
    it('should return all available regulatory frameworks', () => {
      const frameworks = complianceService.getRegulatoryFrameworks()

      expect(frameworks).toHaveLength(6)
      expect(frameworks.map(f => f.value)).toEqual([
        'bsa',
        'amld5',
        'fatf',
        'fincen',
        'mifid2',
        'gdpr',
      ])

      frameworks.forEach(framework => {
        expect(framework).toHaveProperty('value')
        expect(framework).toHaveProperty('label')
        expect(framework).toHaveProperty('description')
      })
    })
  })

  describe('getComplianceReportTypes', () => {
    it('should return all available compliance report types', () => {
      const reportTypes = complianceService.getComplianceReportTypes()

      expect(reportTypes).toHaveLength(6)
      expect(reportTypes.map(t => t.value)).toEqual([
        'audit_trail',
        'transaction_monitoring',
        'suspicious_activity',
        'kyc_aml',
        'tax_reporting',
        'regulatory_filing',
      ])

      reportTypes.forEach(reportType => {
        expect(reportType).toHaveProperty('value')
        expect(reportType).toHaveProperty('label')
        expect(reportType).toHaveProperty('description')
      })
    })
  })
})
