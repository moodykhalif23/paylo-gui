// Export service types

export interface ExportRequest {
  format: ExportFormat
  type: ExportType
  filters?: Record<string, unknown>
  dateRange?: DateRange
  columns?: string[]
  options?: ExportOptions
}

export type ExportFormat = 'csv' | 'json' | 'excel'
export type ExportType =
  | 'transactions'
  | 'invoices'
  | 'analytics'
  | 'users'
  | 'audit_trail'
  | 'compliance_report'
  | 'regulatory_report'
  | 'transaction_logs'

export interface DateRange {
  from: string
  to: string
}

export interface ExportOptions {
  includeHeaders?: boolean
  delimiter?: string
  encoding?: string
  compression?: boolean
  fileName?: string
}

export interface ExportResult {
  id: string
  status: ExportStatus
  downloadUrl?: string
  fileName: string
  fileSize?: number
  recordCount?: number
  progress?: number
  error?: string
  createdAt: string
  expiresAt: string
}

export type ExportStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'expired'

export interface ExportProgress {
  id: string
  progress: number
  status: ExportStatus
  message?: string
  estimatedTimeRemaining?: number
}

export interface ExportJob {
  id: string
  request: ExportRequest
  result?: ExportResult
  progress: ExportProgress
  createdAt: string
}

// Compliance-specific types
export interface ComplianceReportRequest extends ExportRequest {
  type: 'compliance_report' | 'regulatory_report' | 'transaction_logs'
  reportType: ComplianceReportType
  jurisdiction?: string
  regulatoryFramework?: RegulatoryFramework
  includePersonalData?: boolean
  maskSensitiveData?: boolean
}

export type ComplianceReportType =
  | 'audit_trail'
  | 'transaction_monitoring'
  | 'suspicious_activity'
  | 'kyc_aml'
  | 'tax_reporting'
  | 'regulatory_filing'

export type RegulatoryFramework =
  | 'bsa' // Bank Secrecy Act (US)
  | 'amld5' // Anti-Money Laundering Directive 5 (EU)
  | 'fatf' // Financial Action Task Force
  | 'fincen' // Financial Crimes Enforcement Network (US)
  | 'mifid2' // Markets in Financial Instruments Directive 2 (EU)
  | 'gdpr' // General Data Protection Regulation (EU)

export interface AuditTrailEntry {
  id: string
  timestamp: string
  userId: string
  userEmail: string
  userRole: string
  action: string
  resource: string
  resourceId: string
  ipAddress: string
  userAgent: string
  sessionId: string
  changes?: Record<string, { before: unknown; after: unknown }>
  metadata?: Record<string, unknown>
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

export interface TransactionLogEntry {
  id: string
  transactionId: string
  timestamp: string
  event: TransactionLogEvent
  status: string
  blockchain: string
  fromAddress: string
  toAddress: string
  amount: string
  fee: string
  txHash?: string
  confirmations: number
  blockNumber?: number
  gasUsed?: string
  gasPrice?: string
  metadata?: Record<string, unknown>
}

export type TransactionLogEvent =
  | 'created'
  | 'submitted'
  | 'confirmed'
  | 'failed'
  | 'cancelled'
  | 'flagged'
  | 'investigated'
  | 'cleared'

export interface SuspiciousActivityReport {
  id: string
  transactionId: string
  reportDate: string
  reportedBy: string
  activityType: string
  description: string
  riskScore: number
  flags: string[]
  investigation?: {
    status: string
    assignedTo: string
    findings: string
    resolution: string
  }
  regulatoryFiling?: {
    filed: boolean
    filingDate?: string
    referenceNumber?: string
    jurisdiction: string
  }
}
