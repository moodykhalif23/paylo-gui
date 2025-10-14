import React, { useState } from 'react'
import { Box, Typography, Button, Alert, Snackbar } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import {
  UserListTable,
  UserFilters,
  CreateUserDialog,
  UserDetailsDialog,
} from '../../components/admin/UserManagement'
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useSuspendUserMutation,
  useUnsuspendUserMutation,
  UserFilters as UserFiltersType,
} from '../../store/api/adminApi'
import { AdminUser } from '../../types'

const UserManagementPage: React.FC = () => {
  // State for filters and pagination
  const [filters, setFilters] = useState<UserFiltersType>({})
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)

  // State for dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)

  // State for notifications
  const [notification, setNotification] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error' | 'warning' | 'info'
  }>({
    open: false,
    message: '',
    severity: 'success',
  })

  // API hooks
  const {
    data: usersResponse,
    isLoading: usersLoading,
    error: usersError,
  } = useGetUsersQuery({
    page: page + 1, // API uses 1-based pagination
    limit: rowsPerPage,
    filters,
  })

  const [createUser] = useCreateUserMutation()
  const [suspendUser] = useSuspendUserMutation()
  const [unsuspendUser] = useUnsuspendUserMutation()

  // Event handlers
  const handleFiltersChange = (newFilters: UserFiltersType) => {
    setFilters(newFilters)
    setPage(0) // Reset to first page when filters change
  }

  const handleClearFilters = () => {
    setFilters({})
    setPage(0)
  }

  const handlePageChange = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleCreateUser = async (userData: {
    firstName: string
    lastName: string
    email: string
    password: string
    role: string
    isActive: boolean
    isEmailVerified: boolean
  }) => {
    try {
      await createUser({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        isActive: userData.isActive,
        isEmailVerified: userData.isEmailVerified,
      }).unwrap()

      showNotification('User created successfully', 'success')
      setCreateDialogOpen(false)
    } catch (error) {
      showNotification('Failed to create user', 'error')
      throw error
    }
  }

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user)
    setDetailsDialogOpen(true)
  }

  const handleViewUser = (user: AdminUser) => {
    setSelectedUser(user)
    setDetailsDialogOpen(true)
  }

  const handleSuspendUser = async (user: AdminUser) => {
    try {
      await suspendUser({
        userId: user.id,
        reason: 'Suspended by administrator',
      }).unwrap()

      showNotification(
        `User ${user.firstName} ${user.lastName} has been suspended`,
        'success'
      )
    } catch {
      showNotification('Failed to suspend user', 'error')
    }
  }

  const handleUnsuspendUser = async (user: AdminUser) => {
    try {
      await unsuspendUser(user.id).unwrap()

      showNotification(
        `User ${user.firstName} ${user.lastName} has been unsuspended`,
        'success'
      )
    } catch {
      showNotification('Failed to unsuspend user', 'error')
    }
  }

  const showNotification = (
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info'
  ) => {
    setNotification({
      open: true,
      message,
      severity,
    })
  }

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }))
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage users, roles, and monitor user activity across the platform
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create User
        </Button>
      </Box>

      {/* Error Alert */}
      {usersError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load users. Please try again.
        </Alert>
      )}

      {/* Filters */}
      <UserFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      {/* Users Table */}
      <UserListTable
        users={usersResponse?.data || []}
        loading={usersLoading}
        totalCount={usersResponse?.pagination?.totalCount || 0}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onEditUser={handleEditUser}
        onViewUser={handleViewUser}
        onSuspendUser={handleSuspendUser}
        onUnsuspendUser={handleUnsuspendUser}
      />

      {/* Create User Dialog */}
      <CreateUserDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateUser}
      />

      {/* User Details Dialog */}
      <UserDetailsDialog
        open={detailsDialogOpen}
        user={selectedUser}
        onClose={() => {
          setDetailsDialogOpen(false)
          setSelectedUser(null)
        }}
        onEdit={handleEditUser}
        onSuspend={handleSuspendUser}
        onUnsuspend={handleUnsuspendUser}
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default UserManagementPage
