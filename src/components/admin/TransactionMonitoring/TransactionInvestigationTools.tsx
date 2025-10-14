import React, { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Card,
  CardContent,
  ListItemIcon,
  Avatar,
} from '@mui/material'
import {
  Add as AddIcon,
  Note as NoteIcon,
  Security as SecurityIcon,
  Flag as FlagIcon,
  Description as DescriptionIcon,
  TrendingUp as EscalateIcon,
  Close as CloseIcon,
  Edit as EditIcon,
} from '@mui/icons-material'
import { Transaction } from '../../../types'
import { formatDate } from '../../../utils/formatters'
import {
  useGetInvestigationByIdQuery,
  useCreateInvestigationMutation,
  useUpdateInvestigationMutation,
  useAddInvestigationNoteMutation,
  useAddInvestigationActionMutation,
} from '../../../store/api/adminApi'

interface TransactionInvestigationToolsProps {
  transaction: Transaction | null
  open: boolean
  onClose: () => void
}

const TransactionInvestigationTools: React.FC<
  TransactionInvestigationToolsProps
> = ({ transaction, open, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'actions'>(
    'overview'
  )
  const [newNoteContent, setNewNoteContent] = useState('')
  const [newActionType, setNewActionType] = useState<
    | 'freeze_account'
    | 'flag_transaction'
    | 'request_documents'
    | 'escalate'
    | 'close_case'
  >('flag_transaction')
  const [newActionDescription, setNewActionDescription] = useState('')
  const [investigationPriority, setInvestigationPriority] = useState<
    'low' | 'medium' | 'high' | 'critical'
  >('medium')
  const [investigationStatus, setInvestigationStatus] = useState<
    'open' | 'in_progress' | 'closed'
  >('open')

  const { data: investigation, refetch: refetchInvestigation } =
    useGetInvestigationByIdQuery(transaction?.id || '', {
      skip: !transaction?.id || !open,
    })

  const [createInvestigation, { isLoading: isCreating }] =
    useCreateInvestigationMutation()
  const [updateInvestigation, { isLoading: isUpdating }] =
    useUpdateInvestigationMutation()
  const [addNote, { isLoading: isAddingNote }] =
    useAddInvestigationNoteMutation()
  const [addAction, { isLoading: isAddingAction }] =
    useAddInvestigationActionMutation()

  const handleCreateInvestigation = async () => {
    if (!transaction) return

    try {
      await createInvestigation({
        transactionId: transaction.id,
        priority: investigationPriority,
        initialNote: 'Investigation opened for suspicious transaction',
      }).unwrap()
      refetchInvestigation()
    } catch (error) {
      console.error('Failed to create investigation:', error)
    }
  }

  const handleUpdateInvestigation = async () => {
    if (!investigation) return

    try {
      await updateInvestigation({
        investigationId: investigation.id,
        data: {
          status: investigationStatus,
          priority: investigationPriority,
        },
      }).unwrap()
      refetchInvestigation()
    } catch (error) {
      console.error('Failed to update investigation:', error)
    }
  }

  const handleAddNote = async () => {
    if (!investigation || !newNoteContent.trim()) return

    try {
      await addNote({
        investigationId: investigation.id,
        content: newNoteContent,
      }).unwrap()
      setNewNoteContent('')
      refetchInvestigation()
    } catch (error) {
      console.error('Failed to add note:', error)
    }
  }

  const handleAddAction = async () => {
    if (!investigation || !newActionDescription.trim()) return

    try {
      await addAction({
        investigationId: investigation.id,
        type: newActionType,
        description: newActionDescription,
      }).unwrap()
      setNewActionDescription('')
      refetchInvestigation()
    } catch (error) {
      console.error('Failed to add action:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'info'
      case 'medium':
        return 'warning'
      case 'high':
        return 'error'
      case 'critical':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'warning'
      case 'in_progress':
        return 'info'
      case 'closed':
        return 'success'
      default:
        return 'default'
    }
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'freeze_account':
        return <SecurityIcon />
      case 'flag_transaction':
        return <FlagIcon />
      case 'request_documents':
        return <DescriptionIcon />
      case 'escalate':
        return <EscalateIcon />
      case 'close_case':
        return <CloseIcon />
      default:
        return <EditIcon />
    }
  }

  if (!transaction) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6">Transaction Investigation</Typography>
          <Typography variant="body2" color="text.secondary">
            TX: {transaction.id.slice(0, 8)}...
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* Investigation Overview */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Investigation Status
                </Typography>

                {!investigation ? (
                  <Box>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      No investigation exists for this transaction
                    </Alert>
                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                      <InputLabel>Priority</InputLabel>
                      <Select
                        value={investigationPriority}
                        label="Priority"
                        onChange={e =>
                          setInvestigationPriority(
                            e.target.value as
                              | 'low'
                              | 'medium'
                              | 'high'
                              | 'critical'
                          )
                        }
                      >
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="critical">Critical</MenuItem>
                      </Select>
                    </FormControl>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleCreateInvestigation}
                      disabled={isCreating}
                    >
                      {isCreating ? 'Creating...' : 'Create Investigation'}
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={investigation.status
                          .replace('_', ' ')
                          .toUpperCase()}
                        color={
                          getStatusColor(investigation.status) as
                            | 'success'
                            | 'warning'
                            | 'error'
                            | 'info'
                        }
                        sx={{ mr: 1, mb: 1 }}
                      />
                      <Chip
                        label={`${investigation.priority.toUpperCase()} Priority`}
                        color={
                          getPriorityColor(investigation.priority) as
                            | 'success'
                            | 'warning'
                            | 'error'
                            | 'info'
                        }
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Created: {formatDate(investigation.createdAt)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Last Updated: {formatDate(investigation.updatedAt)}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={1}>
                      <Grid item xs={12}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Status</InputLabel>
                          <Select
                            value={investigationStatus}
                            label="Status"
                            onChange={e =>
                              setInvestigationStatus(
                                e.target.value as
                                  | 'open'
                                  | 'in_progress'
                                  | 'closed'
                              )
                            }
                          >
                            <MenuItem value="open">Open</MenuItem>
                            <MenuItem value="in_progress">In Progress</MenuItem>
                            <MenuItem value="closed">Closed</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Priority</InputLabel>
                          <Select
                            value={investigationPriority}
                            label="Priority"
                            onChange={e =>
                              setInvestigationPriority(
                                e.target.value as
                                  | 'low'
                                  | 'medium'
                                  | 'high'
                                  | 'critical'
                              )
                            }
                          >
                            <MenuItem value="low">Low</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                            <MenuItem value="critical">Critical</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={handleUpdateInvestigation}
                          disabled={isUpdating}
                        >
                          {isUpdating ? 'Updating...' : 'Update Investigation'}
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Investigation Details */}
          <Grid item xs={12} md={8}>
            {investigation && (
              <Box>
                {/* Tab Navigation */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                  <Button
                    variant={activeTab === 'overview' ? 'contained' : 'text'}
                    onClick={() => setActiveTab('overview')}
                    sx={{ mr: 1 }}
                  >
                    Overview
                  </Button>
                  <Button
                    variant={activeTab === 'notes' ? 'contained' : 'text'}
                    onClick={() => setActiveTab('notes')}
                    sx={{ mr: 1 }}
                  >
                    Notes ({investigation.notes?.length || 0})
                  </Button>
                  <Button
                    variant={activeTab === 'actions' ? 'contained' : 'text'}
                    onClick={() => setActiveTab('actions')}
                  >
                    Actions ({investigation.actions?.length || 0})
                  </Button>
                </Box>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Investigation Findings
                      </Typography>
                      {investigation.findings &&
                      investigation.findings.length > 0 ? (
                        <List>
                          {investigation.findings.map((finding, index) => (
                            <ListItem key={index}>
                              <ListItemText
                                primary={finding.description}
                                secondary={`${finding.type} - ${finding.severity} severity`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No findings recorded yet
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'notes' && (
                  <Card>
                    <CardContent>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', mb: 2 }}
                      >
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                          Investigation Notes
                        </Typography>
                      </Box>

                      {/* Add Note */}
                      <Box sx={{ mb: 3 }}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          placeholder="Add a note to the investigation..."
                          value={newNoteContent}
                          onChange={e => setNewNoteContent(e.target.value)}
                          sx={{ mb: 1 }}
                        />
                        <Button
                          startIcon={<AddIcon />}
                          onClick={handleAddNote}
                          disabled={!newNoteContent.trim() || isAddingNote}
                        >
                          {isAddingNote ? 'Adding...' : 'Add Note'}
                        </Button>
                      </Box>

                      {/* Notes List */}
                      {investigation.notes && investigation.notes.length > 0 ? (
                        <List>
                          {investigation.notes.map(note => (
                            <ListItem key={note.id} alignItems="flex-start">
                              <ListItemIcon>
                                <Avatar
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: 'primary.main',
                                  }}
                                >
                                  <NoteIcon fontSize="small" />
                                </Avatar>
                              </ListItemIcon>
                              <ListItemText
                                primary={note.content}
                                secondary={
                                  <Box>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {note.authorName} •{' '}
                                      {formatDate(note.createdAt)}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No notes added yet
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'actions' && (
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Investigation Actions
                      </Typography>

                      {/* Add Action */}
                      <Box sx={{ mb: 3 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Action Type</InputLabel>
                              <Select
                                value={newActionType}
                                label="Action Type"
                                onChange={e =>
                                  setNewActionType(
                                    e.target.value as
                                      | 'freeze_account'
                                      | 'flag_transaction'
                                      | 'request_documents'
                                      | 'escalate'
                                      | 'close_case'
                                  )
                                }
                              >
                                <MenuItem value="freeze_account">
                                  Freeze Account
                                </MenuItem>
                                <MenuItem value="flag_transaction">
                                  Flag Transaction
                                </MenuItem>
                                <MenuItem value="request_documents">
                                  Request Documents
                                </MenuItem>
                                <MenuItem value="escalate">Escalate</MenuItem>
                                <MenuItem value="close_case">
                                  Close Case
                                </MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid item xs={12} sm={8}>
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="Action description..."
                              value={newActionDescription}
                              onChange={e =>
                                setNewActionDescription(e.target.value)
                              }
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <Button
                              startIcon={<AddIcon />}
                              onClick={handleAddAction}
                              disabled={
                                !newActionDescription.trim() || isAddingAction
                              }
                            >
                              {isAddingAction ? 'Adding...' : 'Add Action'}
                            </Button>
                          </Grid>
                        </Grid>
                      </Box>

                      {/* Actions List */}
                      {investigation.actions &&
                      investigation.actions.length > 0 ? (
                        <List>
                          {investigation.actions.map(action => (
                            <ListItem key={action.id} alignItems="flex-start">
                              <ListItemIcon>
                                <Avatar
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: 'secondary.main',
                                  }}
                                >
                                  {getActionIcon(action.type)}
                                </Avatar>
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Typography variant="subtitle2">
                                    {action.type
                                      .replace('_', ' ')
                                      .toUpperCase()}
                                  </Typography>
                                }
                                secondary={
                                  <Box>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {action.description}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {action.performedBy} •{' '}
                                      {formatDate(action.performedAt)}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No actions taken yet
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                )}
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default TransactionInvestigationTools
