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
  FormControlLabel,
  Checkbox,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import {
  Download as DownloadIcon,
  Gavel as RegulatoryIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
} from '@mui/icons-material'
import { complianceService } from '../../services/export/complianceService'
import {
  ExportResult,
  ComplianceReportType,
  RegulatoryFramework,
} from '../../services/export/types'

interface RegulatoryReportingProps {
  onReportGenerated?: (result: ExportResult) => void
}

export const RegulatoryReporting: React.FC<RegulatoryReportingProps> = ({
  onReportGenerated,
}) => {
  const [reportType, setReportType] = useState<ComplianceReportType>('kyc_aml')
  const [regulatoryFramework, setRegulatoryFramework] =
    useState<RegulatoryFramework>('fatf')
  const [jurisdiction, setJurisdiction] = useState('')
  const [fromDate, setFromDate] = useState<string>(
    new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  )
  const [toDate, setToDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [format, setFormat] = useState<'csv' | 'json' | 'excel'>('excel')
  const [maskSensitiveData, setMaskSensitiveData] = useState(true)

  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const reportTypes = complianceService.getComplianceReportTypes()
  const frameworks = complianceService.getRegulatoryFrameworks()

  const regulatoryReportTypes = reportTypes.filter(type =>
    ['kyc_aml', 'tax_reporting', 'regulatory_filing'].includes(type.value)
  )

  const handleGenerateReport = useCallback(async () => {
    if (!fromDate || !toDate) {
      setError('Please select both from and to dates')
      return
    }

    if (!jurisdiction.trim()) {
      setError('Please specify the jurisdiction')
      return
    }

    setIsGenerating(true)
    setError(null)
    setSuccess(null)

    try {
      const dateRange = {
        from: new Date(fromDate).toISOString(),
        to: new Date(toDate).toISOString(),
      }

      const result = await complianceService.generateRegulatoryReport({
        reportType,
        regulatoryFramework,
        dateRange,
        jurisdiction: jurisdiction.trim(),
        format,
        maskSensitiveData,
      })

      setSuccess(`Regulatory report generated successfully: ${result.fileName}`)
      onReportGenerated?.(result)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to generate regulatory report'
      )
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
    maskSensitiveData,
    onReportGenerated,
  ])

  const getFrameworkRequirements = (framework: RegulatoryFramework) => {
    const requirements: Record<RegulatoryFramework, string[]> = {
      bsa: [
        'Customer identification and verification records',
        'Suspicious activity reports (SARs)',
        'Currency transaction reports (CTRs) for transactions over $10,000',
        'Record keeping for transactions over $3,000',
        'Anti-money laundering program documentation',
      ],
      amld5: [
        'Customer due diligence records',
        'Beneficial ownership information',
        'Transaction monitoring records',
        'Suspicious transaction reports (STRs)',
        'Enhanced due diligence for high-risk customers',
      ],
      fatf: [
        'Risk assessment documentation',
        'Customer identification and verification',
        'Ongoing monitoring records',
        'Suspicious transaction reporting',
        'Record keeping for 5+ years',
      ],
      fincen: [
        'Bank Secrecy Act compliance records',
        'Suspicious Activity Reports (SARs)',
        'Currency Transaction Reports (CTRs)',
        'Foreign Bank Account Reports (FBARs)',
        'Anti-money laundering program records',
      ],
      mifid2: [
        'Transaction reporting to regulators',
        'Best execution records',
        'Client categorization documentation',
        'Investment advice records',
        'Market data and research records',
      ],
      gdpr: [
        'Data processing records',
        'Consent management documentation',
        'Data breach notification records',
        'Data subject rights fulfillment',
        'Privacy impact assessments',
      ],
    }

    return requirements[framework] || []
  }

  const getJurisdictionExamples = (framework: RegulatoryFramework) => {
    const examples: Record<RegulatoryFramework, string[]> = {
      bsa: ['United States', 'US Territories'],
      amld5: [
        'European Union',
        'EU Member States',
        'Germany',
        'France',
        'Netherlands',
      ],
      fatf: ['Global', 'FATF Member Countries'],
      fincen: ['United States'],
      mifid2: ['European Union', 'EU Member States'],
      gdpr: ['European Union', 'EU Member States', 'EEA Countries'],
    }

    return examples[framework] || ['Please specify applicable jurisdiction']
  }

  return (
    <Box>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <RegulatoryIcon />
        Regulatory Reporting
      </Typography>

      <Typography variant="body2" color="text.secondary" paragraph>
        Generate reports formatted for specific regulatory frameworks and
        jurisdictions. All reports include appropriate data masking and
        compliance with local privacy laws.
      </Typography>

      <Grid container spacing={3}>
        {/* Configuration */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Report Configuration
              </Typography>

              <Grid container spacing={3}>
                {/* Report Type */}
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
                      {regulatoryReportTypes.map(type => (
                        <MenuItem key={type.value} value={type.value}>
                          <Box>
                            <Typography variant="body2">
                              {type.label}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {type.description}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Regulatory Framework */}
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

                {/* Jurisdiction */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Jurisdiction"
                    value={jurisdiction}
                    onChange={e => setJurisdiction(e.target.value)}
                    placeholder={getJurisdictionExamples(
                      regulatoryFramework
                    ).join(', ')}
                    helperText={`Examples: ${getJurisdictionExamples(regulatoryFramework).slice(0, 3).join(', ')}`}
                    required
                  />
                </Grid>

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

                {/* Export Format */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Export Format</InputLabel>
                    <Select
                      value={format}
                      label="Export Format"
                      onChange={e =>
                        setFormat(e.target.value as 'csv' | 'json' | 'excel')
                      }
                    >
                      <MenuItem value="excel">Excel (.xlsx)</MenuItem>
                      <MenuItem value="csv">CSV (.csv)</MenuItem>
                      <MenuItem value="json">JSON (.json)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Options */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Privacy & Security Options
                  </Typography>

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
                    Automatically mask wallet addresses, amounts, and personal
                    information according to privacy regulations
                  </Typography>
                </Grid>

                {/* Actions */}
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleGenerateReport}
                    disabled={isGenerating}
                    size="large"
                  >
                    Generate Regulatory Report
                  </Button>
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
                      Generating regulatory report for{' '}
                      {regulatoryFramework.toUpperCase()}...
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
        </Grid>

        {/* Framework Information */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Framework Requirements
              </Typography>

              <Typography variant="body2" color="text.secondary" paragraph>
                {
                  frameworks.find(f => f.value === regulatoryFramework)
                    ?.description
                }
              </Typography>

              <List dense>
                {getFrameworkRequirements(regulatoryFramework).map(
                  (requirement, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={requirement}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  )
                )}
              </List>
            </CardContent>
          </Card>

          {/* Compliance Notes */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <InfoIcon />
                Compliance Notes
              </Typography>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="body2">Data Retention</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    Reports are automatically encrypted and stored for the
                    required retention period. Access is logged and monitored
                    for compliance auditing.
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="body2">Data Masking</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    Sensitive information is automatically masked according to
                    privacy regulations. Full data is available only to
                    authorized compliance officers.
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="body2">Audit Trail</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    All report generation activities are logged with user
                    identification, timestamps, and data access details for
                    regulatory compliance.
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
