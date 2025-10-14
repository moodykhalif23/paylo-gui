import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Box,
  Tooltip,
  TablePagination,
} from '@mui/material'
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material'
import { AdminUser } from '../../../types'
import { formatDistanceToNow } from 'date-fns'

interface UserListTableProps {
  users: AdminUser[]
  loading: boolean
  totalCount: number
  page: number
  rowsPerPage: number
  onPageChange: (event: unknown, newPage: number) => void
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onEditUser: (user: AdminUser) => void
  onViewUser: (user: AdminUser) => void
  onSuspendUser: (user: AdminUser) => void
  onUnsuspendUser: (user: AdminUser) => void
}

const UserListTable: React.FC<UserListTableProps> = ({
  users,
  loading,
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEditUser,
  onViewUser,
  onSuspendUser,
  onUnsuspendUser,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    user: AdminUser
  ) => {
    setAnchorEl(event.currentTarget)
    setSelectedUser(user)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedUser(null)
  }

  const handleMenuAction = (action: string) => {
    if (!selectedUser) return

    switch (action) {
      case 'view':
        onViewUser(selectedUser)
        break
      case 'edit':
        onEditUser(selectedUser)
        break
      case 'suspend':
        onSuspendUser(selectedUser)
        break
      case 'unsuspend':
        onUnsuspendUser(selectedUser)
        break
    }
    handleMenuClose()
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error'
      case 'merchant':
        return 'warning'
      case 'user':
        return 'primary'
      default:
        return 'default'
    }
  }

  const getStatusColor = (isActive: boolean, isLocked: boolean) => {
    if (isLocked) return 'error'
    if (isActive) return 'success'
    return 'default'
  }

  const getStatusText = (isActive: boolean, isLocked: boolean) => {
    if (isLocked) return 'Locked'
    if (isActive) return 'Active'
    return 'Inactive'
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Email Verified</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell>Login Count</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography>Loading users...</Typography>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="text.secondary">No users found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map(user => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        src={user.avatarUrl}
                        alt={`${user.firstName} ${user.lastName}`}
                        sx={{ width: 40, height: 40 }}
                      >
                        {user.firstName[0]}
                        {user.lastName[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {user.firstName} {user.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role.toUpperCase()}
                      color={
                        getRoleColor(user.role) as
                          | 'primary'
                          | 'secondary'
                          | 'error'
                          | 'info'
                          | 'success'
                          | 'warning'
                      }
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(user.isActive, user.isLocked)}
                      color={
                        getStatusColor(user.isActive, user.isLocked) as
                          | 'success'
                          | 'warning'
                          | 'error'
                      }
                      size="small"
                      icon={
                        user.isLocked ? (
                          <BlockIcon />
                        ) : user.isActive ? (
                          <CheckCircleIcon />
                        ) : (
                          <CancelIcon />
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isEmailVerified ? 'Verified' : 'Unverified'}
                      color={user.isEmailVerified ? 'success' : 'warning'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {user.lastLoginAt ? (
                      <Tooltip
                        title={new Date(user.lastLoginAt).toLocaleString()}
                      >
                        <Typography variant="body2">
                          {formatDistanceToNow(new Date(user.lastLoginAt), {
                            addSuffix: true,
                          })}
                        </Typography>
                      </Tooltip>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Never
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.loginCount.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={new Date(user.createdAt).toLocaleString()}>
                      <Typography variant="body2">
                        {formatDistanceToNow(new Date(user.createdAt), {
                          addSuffix: true,
                        })}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={e => handleMenuOpen(e, user)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleMenuAction('view')}>
          <VisibilityIcon sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('edit')}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit User
        </MenuItem>
        {selectedUser?.isActive && !selectedUser?.isLocked ? (
          <MenuItem onClick={() => handleMenuAction('suspend')}>
            <BlockIcon sx={{ mr: 1 }} fontSize="small" />
            Suspend User
          </MenuItem>
        ) : (
          <MenuItem onClick={() => handleMenuAction('unsuspend')}>
            <CheckCircleIcon sx={{ mr: 1 }} fontSize="small" />
            Unsuspend User
          </MenuItem>
        )}
      </Menu>
    </Paper>
  )
}

export default UserListTable
