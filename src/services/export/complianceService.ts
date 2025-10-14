import { apiClient } from '../api/client'
import {
  ComplianceReportRequest,
  AuditTrailEntry,
  TransactionLogEntry,
  SuspiciousActivityReport,
  ExportResult,
  ComplianceReportType,
  RegulatoryFramework,
} from './types'

class ComplianceService {
  /**
   * Generate audit trail report
   */
  async generateAuditTrailReport(request: {
    dateRange: { from: string; to: string }
    userId?: string
    actions?: string[]
    riskLevel?: string[]
    format: 'csv' | 'json' | 'excel'
    includePersonalData?: boolean
  }): Promise<ExportResult> {
    try {
      const response = await apiClient.post<{
        success: boolean
        data: ExportResult
      }>('/api/v1/compliance/audit-trail', {
        ...request,
        type: 'audit_trail',
      })

      if (response.data.success) {
        return response.data.data
      }
      throw new Error('Failed to generate audit trail report')
    } catch (error) {
      throw new Error(
        `Audit trail report generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Generate transaction logs export
   */
  async generateTransactionLogs(request: {
    dateRange: { from: string; to: string }
    blockchain?: string[]
    status?: string[]
    events?: string[]
    format: 'csv' | 'json' | 'excel'
    includeMetadata?: boolean
  }): Promise<ExportResult> {
    try {
      const response = await apiClient.post<{
        success: boolean
        data: ExportResult
      }>('/api/v1/compliance/transaction-logs', {
        ...request,
        type: 'transaction_logs',
      })

      if (response.data.success) {
        return response.data.data
      }
      throw new Error('Failed to generate transaction logs')
    } catch (error) {
      throw new Error(
        `Transaction logs generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Generate regulatory compliance report
   */
  async generateRegulatoryReport(request: {
    reportType: ComplianceReportType
    regulatoryFramework: RegulatoryFramework
    dateRange: { from: string; to: string }
    jurisdiction: string
    format: 'csv' | 'json' | 'excel'
    maskSensitiveData?: boolean
  }): Promise<ExportResult> {
    try {
      const response = await apiClient.post<{
        success: boolean
        data: ExportResult
      }>('/api/v1/compliance/regulatory-report', {
        ...request,
        type: 'regulatory_report',
      })

      if (response.data.success) {
        return response.data.data
      }
      throw new Error('Failed to generate regulatory report')
    } catch (error) {
      throw new Error(
        `Regulatory report generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Generate suspicious activity report
   */
  async generateSuspiciousActivityReport(request: {
    dateRange: { from: string; to: string }
    riskLevel?: string[]
    status?: string[]
    format: 'csv' | 'json' | 'excel'
    includeInvestigations?: boolean
  }): Promise<ExportResult> {
    try {
      const response = await apiClient.post<{
        success: boolean
        data: ExportResult
      }>('/api/v1/compliance/suspicious-activity', {
        ...request,
        type: 'suspicious_activity',
      })

      if (response.data.success) {
        return response.data.data
      }
      throw new Error('Failed to generate suspicious activity report')
    } catch (error) {
      throw new Error(
        `Suspicious activity report generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Get audit trail entries (for preview)
   */
  async getAuditTrailEntries(filters: {
    dateRange: { from: string; to: string }
    userId?: string
    actions?: string[]
    page?: number
    limit?: number
  }): Promise<{ entries: AuditTrailEntry[]; totalCount: number }> {
    try {
      const response = await apiClient.get<{
        success: boolean
        data: AuditTrailEntry[]
        pagination: { totalCount: number }
      }>('/api/v1/compliance/audit-trail/entries', {
        params: filters,
      })

      if (response.data.success) {
        return {
          entries: response.data.data,
          totalCount: response.data.pagination.totalCount,
        }
      }
      throw new Error('Failed to fetch audit trail entries')
    } catch (error) {
      throw new Error(
        `Failed to fetch audit trail: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Get transaction log entries (for preview)
   */
  async getTransactionLogEntries(filters: {
    dateRange: { from: string; to: string }
    blockchain?: string[]
    status?: string[]
    page?: number
    limit?: number
  }): Promise<{ entries: TransactionLogEntry[]; totalCount: number }> {
    try {
      const response = await apiClient.get<{
        success: boolean
        data: TransactionLogEntry[]
        pagination: { totalCount: number }
      }>('/api/v1/compliance/transaction-logs/entries', {
        params: filters,
      })

      if (response.data.success) {
        return {
          entries: response.data.data,
          totalCount: response.data.pagination.totalCount,
        }
      }
      throw new Error('Failed to fetch transaction log entries')
    } catch (error) {
      throw new Error(
        `Failed to fetch transaction logs: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Get suspicious activity reports (for preview)
   */
  async getSuspiciousActivityReports(filters: {
    dateRange: { from: string; to: string }
    riskLevel?: string[]
    status?: string[]
    page?: number
    limit?: number
  }): Promise<{ reports: SuspiciousActivityReport[]; totalCount: number }> {
    try {
      const response = await apiClient.get<{
        success: boolean
        data: SuspiciousActivityReport[]
        pagination: { totalCount: number }
      }>('/api/v1/compliance/suspicious-activity/reports', {
        params: filters,
      })

      if (response.data.success) {
        return {
          reports: response.data.data,
          totalCount: response.data.pagination.totalCount,
        }
      }
      throw new Error('Failed to fetch suspicious activity reports')
    } catch (error) {
      throw new Error(
        `Failed to fetch suspicious activity reports: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Validate compliance report request
   */
  validateComplianceRequest(request: ComplianceReportRequest): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // Validate date range
    if (!request.dateRange?.from || !request.dateRange?.to) {
      errors.push('Date range is required')
    } else {
      const fromDate = new Date(request.dateRange.from)
      const toDate = new Date(request.dateRange.to)

      if (fromDate >= toDate) {
        errors.push('From date must be before to date')
      }

      // Check if date range is not too large (max 1 year for compliance reports)
      const maxRange = 365 * 24 * 60 * 60 * 1000 // 1 year in milliseconds
      if (toDate.getTime() - fromDate.getTime() > maxRange) {
        errors.push('Date range cannot exceed 1 year for compliance reports')
      }
    }

    // Validate regulatory framework requirements
    if (request.type === 'regulatory_report') {
      if (!request.regulatoryFramework) {
        errors.push('Regulatory framework is required for regulatory reports')
      }
      if (!request.jurisdiction) {
        errors.push('Jurisdiction is required for regulatory reports')
      }
    }

    // Validate format
    if (!['csv', 'json', 'excel'].includes(request.format)) {
      errors.push('Invalid export format')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Get available regulatory frameworks
   */
  getRegulatoryFrameworks(): Array<{
    value: RegulatoryFramework
    label: string
    description: string
  }> {
    return [
      {
        value: 'bsa',
        label: 'Bank Secrecy Act (BSA)',
        description:
          'US federal law requiring financial institutions to assist government agencies in detecting money laundering',
      },
      {
        value: 'amld5',
        label: 'Anti-Money Laundering Directive 5 (AMLD5)',
        description:
          'EU directive on the prevention of the use of the financial system for money laundering',
      },
      {
        value: 'fatf',
        label: 'Financial Action Task Force (FATF)',
        description:
          'International standards for combating money laundering and terrorist financing',
      },
      {
        value: 'fincen',
        label: 'Financial Crimes Enforcement Network (FinCEN)',
        description:
          'US Treasury bureau that collects and analyzes financial transaction information',
      },
      {
        value: 'mifid2',
        label: 'Markets in Financial Instruments Directive 2 (MiFID II)',
        description:
          'EU regulation governing investment services and activities',
      },
      {
        value: 'gdpr',
        label: 'General Data Protection Regulation (GDPR)',
        description: 'EU regulation on data protection and privacy',
      },
    ]
  }

  /**
   * Get available compliance report types
   */
  getComplianceReportTypes(): Array<{
    value: ComplianceReportType
    label: string
    description: string
  }> {
    return [
      {
        value: 'audit_trail',
        label: 'Audit Trail',
        description: 'Complete record of all user actions and system events',
      },
      {
        value: 'transaction_monitoring',
        label: 'Transaction Monitoring',
        description: 'Detailed analysis of transaction patterns and anomalies',
      },
      {
        value: 'suspicious_activity',
        label: 'Suspicious Activity Reports',
        description:
          'Reports of potentially suspicious or fraudulent activities',
      },
      {
        value: 'kyc_aml',
        label: 'KYC/AML Reports',
        description:
          'Know Your Customer and Anti-Money Laundering compliance reports',
      },
      {
        value: 'tax_reporting',
        label: 'Tax Reporting',
        description:
          'Transaction data formatted for tax reporting requirements',
      },
      {
        value: 'regulatory_filing',
        label: 'Regulatory Filing',
        description:
          'Reports formatted for specific regulatory filing requirements',
      },
    ]
  }
}

export const complianceService = new ComplianceService()
