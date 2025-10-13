import React from 'react'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Collapse,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  AccountBalanceWallet,
  SwapHoriz,
  History,
  Receipt,
  Analytics,
  People,
  Settings,
  MonitorHeart,
  Security,
  ExpandLess,
  ExpandMore,
  Home,
  Business,
  AdminPanelSettings,
} from '@mui/icons-material'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../store'
import { UserRole } from '../../types'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

interface NavigationItem {
  id: string
  label: string
  icon: React.ReactElement
  path?: string
  roles: UserRole[]
  children?: NavigationItem[]
}

const navigationItems: NavigationItem[] = [
  // P2P User Navigation
  {
    id: 'p2p-dashboard',
    label: 'Dashboard',
    icon: <Home />,
    path: '/dashboard',
    roles: ['user'],
  },
  {
    id: 'p2p-wallets',
    label: 'Wallets',
    icon: <AccountBalanceWallet />,
    path: '/wallets',
    roles: ['user'],
  },
  {
    id: 'p2p-transfer',
    label: 'Send Payment',
    icon: <SwapHoriz />,
    path: '/transfer',
    roles: ['user'],
  },
  {
    id: 'p2p-history',
    label: 'Transaction History',
    icon: <History />,
    path: '/transactions',
    roles: ['user'],
  },

  // Merchant Navigation
  {
    id: 'merchant-dashboard',
    label: 'Dashboard',
    icon: <Business />,
    path: '/merchant/dashboard',
    roles: ['merchant'],
  },
  {
    id: 'merchant-invoices',
    label: 'Invoices',
    icon: <Receipt />,
    path: '/merchant/invoices',
    roles: ['merchant'],
  },
  {
    id: 'merchant-analytics',
    label: 'Analytics',
    icon: <Analytics />,
    path: '/merchant/analytics',
    roles: ['merchant'],
  },
  {
    id: 'merchant-settings',
    label: 'Settings',
    icon: <Settings />,
    roles: ['merchant'],
    children: [
      {
        id: 'merchant-api-keys',
        label: 'API Keys',
        icon: <Security />,
        path: '/merchant/settings/api-keys',
        roles: ['merchant'],
      },
      {
        id: 'merchant-webhooks',
        label: 'Webhooks',
        icon: <Settings />,
        path: '/merchant/settings/webhooks',
        roles: ['merchant'],
      },
    ],
  },

  // Admin Navigation
  {
    id: 'admin-dashboard',
    label: 'Admin Dashboard',
    icon: <AdminPanelSettings />,
    path: '/admin/dashboard',
    roles: ['admin'],
  },
  {
    id: 'admin-users',
    label: 'User Management',
    icon: <People />,
    path: '/admin/users',
    roles: ['admin'],
  },
  {
    id: 'admin-transactions',
    label: 'Transaction Monitor',
    icon: <History />,
    path: '/admin/transactions',
    roles: ['admin'],
  },
  {
    id: 'admin-system',
    label: 'System Health',
    icon: <MonitorHeart />,
    path: '/admin/system',
    roles: ['admin'],
  },
  {
    id: 'admin-settings',
    label: 'System Settings',
    icon: <Settings />,
    roles: ['admin'],
    children: [
      {
        id: 'admin-blockchain-config',
        label: 'Blockchain Config',
        icon: <Settings />,
        path: '/admin/settings/blockchain',
        roles: ['admin'],
      },
      {
        id: 'admin-security-config',
        label: 'Security Settings',
        icon: <Security />,
        path: '/admin/settings/security',
        roles: ['admin'],
      },
    ],
  },
]

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const location = useLocation()
  const navigate = useNavigate()

  const { user } = useAppSelector(state => state.auth)
  const [expandedItems, setExpandedItems] = React.useState<string[]>([])

  const drawerWidth = 280

  const handleItemClick = (item: NavigationItem) => {
    if (item.children) {
      // Toggle expansion for items with children
      setExpandedItems(prev =>
        prev.includes(item.id)
          ? prev.filter(id => id !== item.id)
          : [...prev, item.id]
      )
    } else if (item.path) {
      // Navigate to the path
      navigate(item.path)
      if (isMobile) {
        onClose()
      }
    }
  }

  const isItemActive = (item: NavigationItem): boolean => {
    if (item.path) {
      return location.pathname === item.path
    }
    // Check if any child is active
    return (
      item.children?.some(child => child.path === location.pathname) || false
    )
  }

  const isItemExpanded = (itemId: string): boolean => {
    return expandedItems.includes(itemId)
  }

  const filterItemsByRole = (items: NavigationItem[]): NavigationItem[] => {
    if (!user) return []

    return items.filter(item => {
      // Check if user role is allowed for this item
      const hasAccess = item.roles.includes(user.role)
      if (!hasAccess) return false

      // Filter children by role as well
      if (item.children) {
        item.children = filterItemsByRole(item.children)
      }

      return true
    })
  }

  const renderNavigationItem = (item: NavigationItem, depth = 0) => {
    const isActive = isItemActive(item)
    const isExpanded = isItemExpanded(item.id)
    const hasChildren = item.children && item.children.length > 0

    return (
      <React.Fragment key={item.id}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleItemClick(item)}
            selected={isActive}
            sx={{
              pl: 2 + depth * 2,
              minHeight: 48,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main + '20',
                borderRight: `3px solid ${theme.palette.primary.main}`,
                '&:hover': {
                  backgroundColor: theme.palette.primary.main + '30',
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: isActive ? theme.palette.primary.main : 'inherit',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? theme.palette.primary.main : 'inherit',
              }}
            />
            {hasChildren && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </ListItem>

        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map(child =>
                renderNavigationItem(child, depth + 1)
              )}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    )
  }

  const getRoleTitle = (role: UserRole): string => {
    switch (role) {
      case 'admin':
        return 'Administrator Panel'
      case 'merchant':
        return 'Merchant Dashboard'
      case 'user':
        return 'P2P Wallet'
      default:
        return 'Dashboard'
    }
  }

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar spacer */}
      <Box sx={{ height: theme.mixins.toolbar.minHeight }} />

      {/* Role indicator */}
      {user && (
        <Box sx={{ px: 2, py: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ fontSize: '0.75rem' }}
          >
            {getRoleTitle(user.role)}
          </Typography>
        </Box>
      )}

      {/* Navigation items */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ pt: 1 }}>
          {filterItemsByRole(navigationItems).map(item =>
            renderNavigationItem(item)
          )}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography
          variant="caption"
          color="text.secondary"
          align="center"
          display="block"
        >
          Paylo v1.0.0
        </Typography>
      </Box>
    </Box>
  )

  return (
    <>
      {/* Mobile drawer */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        /* Desktop drawer */
        <Drawer
          variant="persistent"
          open={open}
          sx={{
            width: open ? drawerWidth : 0,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  )
}

export default Sidebar
