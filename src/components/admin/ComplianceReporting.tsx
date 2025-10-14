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
  Alert,
  LinearProgress,
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
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material'
import {
  Download as DownloadIcon,
  Visibility as PreviewIcon,
  Security as SecurityIcon,
} from '@mui/icons-material'
import { complianceService } from '../../services/export/complianceService'
import {
  ComplianceReportType,
  RegulatoryFramework,
  ExportResult,
} from '../../services/export/types'

interface ComplianceReportingProps {
  onReportGenerated?: (result: ExportResult) => void
}

export const ComplianceReporting: React.FC<ComplianceReportingProps> = ({
  onReportGenerated,
}) => {
  const [reportType, setReportType] =
    useState<ComplianceReportType>('audit_trail')
  const [regulatoryFramework, setRegulatoryFramework] =
    useState<RegulatoryFramework>('fatf')
  const [jurisdiction, setJurisdiction] = useState('')
  const [fromDate, setFromDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  )
  const [toDate, setToDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [format, setFormat] = useState<'csv' | 'json' | 'excel'>('excel')
  const [includePersonalData, setIncludePersonalData] = useState(false)
  const [maskSensitiveData, setMaskSensitiveData] = useState(true)
  const [includeMetadata, setIncludeMetadata] = useState(false)
  const [includeInvestigations, setIncludeInvestigations] = useState(true)

  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<unknown[]>([])
  const [previewType, setPreviewType] = useState<string>('')
  const [previewLoading, setPreviewLoading] = useState(false)

  const reportTypes = complianceService.getComplianceReportTypes()
  const frameworks = complianceService.getRegulatoryFrameworks()

  const handleGenerateReport = useCallback(async () => {
    if (!fromDate || !toDate) {
      setError('Please select both from and to dates')
      return
    }

    setIsGenerating(true)
    setError(null)
    setSuccess(null)

    try {
      let result: ExportResult

      const dateRange = {
        from: new Date(fromDate).toISOString(),
        to: new Date(toDate).toISOString(),
      }

      switch (reportType) {
        case 'audit_trail':
          result = await complianceService.generateAuditTrailReport({
            dateRange,
            format,
            includePersonalData,
          })
          break

        case 'transaction_monitoring':
          result = await complianceService.generateTransactionLogs({
            dateRange,
            format,
            includeMetadata,
          })
          break

        case 'suspicious_activity':
          result = await complianceService.generateSuspiciousActivityReport({
            dateRange,
            format,
            includeInvestigations,
          })
          break

        default:
          result = await complianceService.generateRegulatoryReport({
            reportType,
            regulatoryFramework,
            dateRange,
            jurisdiction,
            format,
            maskSensitiveData,
          })
      }

      setSuccess(`Report generated successfully: ${result.fileName}`)
      onReportGenerated?.(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report')
    } finally {
      setIsGenerating(false)
    }
  }, [
    reportType,
    regulatoryFramework,
    jurisdiction,
    fromDate,
    toDate,
    format,
    includePersonalData,
    maskSensitiveData,
    includeMetadata,
    includeInvestigations,
    onReportGenerated,
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

      let data: unknown[] = []
      let type = ''

      switch (reportType) {
        case 'audit_trail': {
          const auditResult = await complianceService.getAuditTrailEntries({
            dateRange,
            limit: 100,
          })
          data = auditResult.entries
          type = 'Audit Trail'
          break
        }

        case 'transaction_monitoring': {
          const txResult = await complianceService.getTransactionLogEntries({
            dateRange,
            limit: 100,
          })
          data = txResult.entries
          type = 'Transaction Logs'
          break
        }

        case 'suspicious_activity': {
          const sarResult =
            await complianceService.getSuspiciousActivityReports({
              dateRange,
              limit: 100,
            })
          data = sarResult.reports
          type = 'Suspicious Activity Reports'
          break
        }

        default:
          setError('Preview not available for this report type')
          return
      }

      setPreviewData(data)
      setPreviewType(type)
      setPreviewOpen(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preview')
    } finally {
      setPreviewLoading(false)
    }
  }, [reportType, fromDate, toDate])

  const renderPreviewTable = () => {
    if (previewData.length === 0) {
      return (
        <Typography>No data available for the selected criteria</Typography>
      )
    }

    const columns = Object.keys(previewData[0])

    return (
      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableCell key={column} sx={{ fontWeight: 'bold' }}>
                  {column.replace(/_/g, ' ').toUpperCase()}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {previewData.slice(0, 50).map((row, index) => (
              <TableRow key={index}>
                {columns.map(column => (
                  <TableCell key={column}>
                    {typeof row[column] === 'object'
                      ? JSON.stringify(row[column])
                      : String(row[column] || '-')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }

  const requiresRegulatoryInfo = [
    'kyc_aml',
    'tax_reporting',
    'regulatory_filing',
  ].includes(reportType)

  return (
    <Box>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <SecurityIcon />
        Compliance Reporting
      </Typography>

      <Typography variant="body2" color="text.secondary" paragraph>
        Generate compliance reports for audit trails, regulatory requirements,
        and transaction monitoring. All reports include appropriate data masking
        and privacy controls.
      </Typography>

      <Card>
        <CardContent>
          <Grid container spacing={3}>
            {/* Report Type Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportType}
                  label="Report Type"
                  onChange={e =>
                    setReportType(e.target.value as ComplianceReportType)
                  }
                >
                  {reportTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box>
                        <Typography variant="body2">{type.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {type.description}
                        </Typography>
                      </Box>
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
                  onChange={e => setFormat(e.target.value as string)}
                >
                  <MenuItem value="excel">Excel (.xlsx)</MenuItem>
                  <MenuItem value="csv">CSV (.csv)</MenuItem>
                  <MenuItem value="json">JSON (.json)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Regulatory Framework (conditional) */}
            {requiresRegulatoryInfo && (
              <>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Regulatory Framework</InputLabel>
                    <Select
                      value={regulatoryFramework}
                      label="Regulatory Framework"
                      onChange={e =>
                        setRegulatoryFramework(
                          e.target.value as RegulatoryFramework
                        )
                      }
                    >
                      {frameworks.map(framework => (
                        <MenuItem key={framework.value} value={framework.value}>
                          <Box>
                            <Typography variant="body2">
                              {framework.label}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {framework.description}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Jurisdiction"
                    value={jurisdiction}
                    onChange={e => setJurisdiction(e.target.value)}
                    placeholder="e.g., United States, European Union"
                    helperText="Specify the regulatory jurisdiction for this report"
                  />
                </Grid>
              </>
            )}

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

            {/* Options */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Report Options
              </Typography>

              <Grid container spacing={2}>
                {reportType === 'audit_trail' && (
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={includePersonalData}
                          onChange={e =>
                            setIncludePersonalData(e.target.checked)
                          }
                        />
                      }
                      label="Include Personal Data"
                    />
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.secondary"
                    >
                      Include personally identifiable information (requires
                      additional permissions)
                    </Typography>
                  </Grid>
                )}

                {requiresRegulatoryInfo && (
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={maskSensitiveData}
                          onChange={e => setMaskSensitiveData(e.target.checked)}
                        />
                      }
                      label="Mask Sensitive Data"
                    />
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.secondary"
                    >
                      Automatically mask sensitive information like addresses
                      and amounts
                    </Typography>
                  </Grid>
                )}

                {reportType === 'transaction_monitoring' && (
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={includeMetadata}
                          onChange={e => setIncludeMetadata(e.target.checked)}
                        />
                      }
                      label="Include Metadata"
                    />
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.secondary"
                    >
                      Include additional transaction metadata and technical
                      details
                    </Typography>
                  </Grid>
                )}

                {reportType === 'suspicious_activity' && (
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={includeInvestigations}
                          onChange={e =>
                            setIncludeInvestigations(e.target.checked)
                          }
                        />
                      }
                      label="Include Investigation Details"
                    />
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.secondary"
                    >
                      Include investigation findings and resolution details
                    </Typography>
                  </Grid>
                )}
              </Grid>
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
                  onClick={handleGenerateReport}
                  disabled={isGenerating || previewLoading}
                >
                  Generate Report
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
                  Generating compliance report...
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
          {previewType} Preview
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
