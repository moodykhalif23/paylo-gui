import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  Security as SecurityIcon,
  Assessment as ReportIcon,
  History as AuditIcon,
  Warning as WarningIcon,
  Download as DownloadIcon,
} from '@mui/icons-material'
import { ComplianceReporting } from '../../components/admin/ComplianceReporting'
import { AuditTrailViewer } from '../../components/admin/AuditTrailViewer'
import { TransactionLogExporter } from '../../components/admin/TransactionLogExporter'
import { RegulatoryReporting } from '../../components/admin/RegulatoryReporting'
import { ExportResult } from '../../services/export/types'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`compliance-tabpanel-${index}`}
      aria-labelledby={`compliance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export const CompliancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [recentReports, setRecentReports] = useState<ExportResult[]>([])
  const [complianceStats, setComplianceStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    auditTrailEntries: 0,
    suspiciousActivities: 0,
  })

  useEffect(() => {
    // Load recent reports and compliance statistics
    loadComplianceData()
  }, [])

  const loadComplianceData = async () => {
    try {
      // Mock data - in real implementation, fetch from API
      setRecentReports([
        {
          id: '1',
          status: 'completed',
          fileName: 'audit_trail_2024_01.xlsx',
          fileSize: 2048576,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          downloadUrl: '/api/v1/compliance/download/1',
        },
        {
          id: '2',
          status: 'completed',
          fileName: 'suspicious_activity_report_2024_01.pdf',
          fileSize: 1024768,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(
            Date.now() + 6 * 24 * 60 * 60 * 1000
          ).toISOString(),
          downloadUrl: '/api/v1/compliance/download/2',
        },
        {
          id: '3',
          status: 'processing',
          fileName: 'transaction_logs_2024_01.csv',
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          expiresAt: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      ])

      setComplianceStats({
        totalReports: 156,
        pendingReports: 3,
        auditTrailEntries: 45230,
        suspiciousActivities: 12,
      })
    } catch (error) {
      console.error('Failed to load compliance data:', error)
    }
  }

  const handleReportGenerated = (result: ExportResult) => {
    setRecentReports(prev => [result, ...prev])
  }

  const handleDownloadReport = (report: ExportResult) => {
    if (report.downloadUrl) {
      window.open(report.downloadUrl, '_blank')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'processing':
        return 'warning'
      case 'failed':
        return 'error'
      default:
        return 'default'
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <SecurityIcon />
          Compliance & Audit
        </Typography>

        <Typography variant="body1" color="text.secondary" paragraph>
          Generate compliance reports, audit trails, and regulatory
          documentation. All reports are automatically encrypted and include
          appropriate data masking.
        </Typography>

        {/* Compliance Statistics */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ReportIcon color="primary" />
                  <Box>
                    <Typography variant="h4">
                      {complianceStats.totalReports}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Reports
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningIcon color="warning" />
                  <Box>
                    <Typography variant="h4">
                      {complianceStats.pendingReports}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Reports
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AuditIcon color="info" />
                  <Box>
                    <Typography variant="h4">
                      {complianceStats.auditTrailEntries.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Audit Entries
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SecurityIcon color="error" />
                  <Box>
                    <Typography variant="h4">
                      {complianceStats.suspiciousActivities}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Suspicious Activities
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              aria-label="compliance tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Generate Reports" />
              <Tab label="Audit Trail" />
              <Tab label="Transaction Logs" />
              <Tab label="Regulatory Reports" />
              <Tab label="Recent Reports" />
              <Tab label="Guidelines" />
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            <ComplianceReporting onReportGenerated={handleReportGenerated} />
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <AuditTrailViewer />
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <TransactionLogExporter onExportGenerated={handleReportGenerated} />
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <RegulatoryReporting onReportGenerated={handleReportGenerated} />
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Recent Compliance Reports
              </Typography>

              {recentReports.length === 0 ? (
                <Alert severity="info">
                  No reports generated yet. Use the "Generate Reports" tab to
                  create your first compliance report.
                </Alert>
              ) : (
                <List>
                  {recentReports.map(report => (
                    <ListItem key={report.id} divider>
                      <ListItemIcon>
                        <ReportIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={report.fileName}
                        secondary={
                          <Box>
                            <Typography variant="body2" component="span">
                              Created: {formatDate(report.createdAt)}
                            </Typography>
                            {report.fileSize && (
                              <Typography
                                variant="body2"
                                component="span"
                                sx={{ ml: 2 }}
                              >
                                Size: {formatFileSize(report.fileSize)}
                              </Typography>
                            )}
                            <Typography
                              variant="body2"
                              component="span"
                              sx={{ ml: 2 }}
                            >
                              Expires: {formatDate(report.expiresAt)}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Chip
                            label={report.status}
                            color={
                              getStatusColor(report.status) as
                                | 'default'
                                | 'primary'
                                | 'secondary'
                                | 'error'
                                | 'info'
                                | 'success'
                                | 'warning'
                            }
                            size="small"
                          />
                          {report.status === 'completed' &&
                            report.downloadUrl && (
                              <Tooltip title="Download Report">
                                <IconButton
                                  edge="end"
                                  onClick={() => handleDownloadReport(report)}
                                >
                                  <DownloadIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={5}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Compliance Guidelines
              </Typography>

              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  All compliance reports are generated with appropriate data
                  protection measures and regulatory compliance standards.
                  Reports are automatically encrypted and access is logged.
                </Typography>
              </Alert>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        Audit Trail Reports
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Complete record of all user actions, system events, and
                        administrative changes. Includes timestamps, IP
                        addresses, and change details for full accountability.
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • User login/logout events
                        <br />
                        • Transaction approvals
                        <br />
                        • System configuration changes
                        <br />• Administrative actions
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        Transaction Logs
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Detailed transaction history with blockchain
                        confirmations, fees, and status changes. Includes
                        technical metadata for forensic analysis.
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • Transaction lifecycle events
                        <br />
                        • Blockchain confirmations
                        <br />
                        • Fee calculations
                        <br />• Error conditions
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        Suspicious Activity Reports
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Automated and manual flagging of potentially suspicious
                        transactions and patterns. Includes risk scoring and
                        investigation details.
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • High-value transactions
                        <br />
                        • Unusual patterns
                        <br />
                        • Velocity checks
                        <br />• Investigation outcomes
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        Regulatory Reports
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Formatted reports for specific regulatory frameworks
                        including BSA, AMLD5, FATF guidelines, and other
                        jurisdiction-specific requirements.
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • KYC/AML compliance
                        <br />
                        • Tax reporting formats
                        <br />
                        • Regulatory filings
                        <br />• Cross-border reporting
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
        </Card>
      </Box>
    </Container>
  )
}

export default CompliancePage
