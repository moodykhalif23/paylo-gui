import React from 'react'
import {
  Breadcrumbs as MuiBreadcrumbs,
  Link,
  Typography,
  Box,
  useTheme,
} from '@mui/material'
import {
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
} from '@mui/icons-material'
import { useLocation, Link as RouterLink } from 'react-router-dom'
import { useAppSelector } from '../../store'
import { UserRole } from '../../types'

interface BreadcrumbItem {
  label: string
  path?: string
  icon?: React.ReactElement
}

interface BreadcrumbsProps {
  customBreadcrumbs?: BreadcrumbItem[]
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ customBreadcrumbs }) => {
  const theme = useTheme()
  const location = useLocation()
  const { user } = useAppSelector(state => state.auth)

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (customBreadcrumbs) {
      return customBreadcrumbs
    }

    const pathSegments = location.pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []

    // Add home breadcrumb based on user role
    if (user) {
      const homeItem = getHomeBreadcrumb(user.role)
      breadcrumbs.push(homeItem)
    }

    // Generate breadcrumbs from path segments
    let currentPath = ''
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`

      // Skip if this is the home path
      if (isHomePath(currentPath, user?.role)) {
        return
      }

      const label = getBreadcrumbLabel(segment, pathSegments, index)
      const isLast = index === pathSegments.length - 1

      breadcrumbs.push({
        label,
        path: isLast ? undefined : currentPath, // Don't make the last item clickable
      })
    })

    return breadcrumbs
  }

  const getHomeBreadcrumb = (role: UserRole): BreadcrumbItem => {
    switch (role) {
      case 'admin':
        return {
          label: 'Admin Dashboard',
          path: '/admin/dashboard',
          icon: <HomeIcon sx={{ fontSize: 16 }} />,
        }
      case 'merchant':
        return {
          label: 'Merchant Dashboard',
          path: '/merchant/dashboard',
          icon: <HomeIcon sx={{ fontSize: 16 }} />,
        }
      case 'user':
        return {
          label: 'Dashboard',
          path: '/dashboard',
          icon: <HomeIcon sx={{ fontSize: 16 }} />,
        }
      default:
        return {
          label: 'Home',
          path: '/',
          icon: <HomeIcon sx={{ fontSize: 16 }} />,
        }
    }
  }

  const isHomePath = (path: string, role?: UserRole): boolean => {
    if (!role) return false

    const homePaths = {
      admin: '/admin/dashboard',
      merchant: '/merchant/dashboard',
      user: '/dashboard',
    }

    return path === homePaths[role]
  }

  const getBreadcrumbLabel = (
    segment: string,
    pathSegments: string[],
    index: number
  ): string => {
    // Handle specific route segments
    const labelMap: Record<string, string> = {
      // General
      dashboard: 'Dashboard',
      settings: 'Settings',
      profile: 'Profile',

      // P2P User routes
      wallets: 'Wallets',
      transfer: 'Send Payment',
      transactions: 'Transaction History',

      // Merchant routes
      merchant: 'Merchant',
      invoices: 'Invoices',
      analytics: 'Analytics',
      'api-keys': 'API Keys',
      webhooks: 'Webhooks',

      // Admin routes
      admin: 'Admin',
      users: 'User Management',
      system: 'System Health',
      blockchain: 'Blockchain Config',
      security: 'Security Settings',

      // Actions
      create: 'Create',
      edit: 'Edit',
      view: 'View',
      new: 'New',
    }

    // Check if it's a UUID or ID (for dynamic routes)
    if (isUUID(segment) || isNumericId(segment)) {
      // Try to determine the entity type from the previous segment
      const previousSegment = pathSegments[index - 1]
      if (previousSegment) {
        const entityMap: Record<string, string> = {
          users: 'User Details',
          invoices: 'Invoice Details',
          transactions: 'Transaction Details',
          wallets: 'Wallet Details',
        }
        return entityMap[previousSegment] || 'Details'
      }
      return 'Details'
    }

    // Return mapped label or capitalize the segment
    return labelMap[segment] || capitalizeFirst(segment.replace(/-/g, ' '))
  }

  const isUUID = (str: string): boolean => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(str)
  }

  const isNumericId = (str: string): boolean => {
    return /^\d+$/.test(str)
  }

  const capitalizeFirst = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  const breadcrumbs = generateBreadcrumbs()

  // Don't render if there's only one breadcrumb (home)
  if (breadcrumbs.length <= 1) {
    return null
  }

  return (
    <Box sx={{ mb: 2 }}>
      <MuiBreadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb navigation"
        sx={{
          '& .MuiBreadcrumbs-separator': {
            color: theme.palette.text.secondary,
          },
        }}
      >
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1

          if (isLast || !breadcrumb.path) {
            return (
              <Typography
                key={index}
                color="text.primary"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: isLast ? 600 : 400,
                  fontSize: '0.875rem',
                }}
              >
                {breadcrumb.icon && (
                  <Box sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>
                    {breadcrumb.icon}
                  </Box>
                )}
                {breadcrumb.label}
              </Typography>
            )
          }

          return (
            <Link
              key={index}
              component={RouterLink}
              to={breadcrumb.path}
              underline="hover"
              color="inherit"
              sx={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.875rem',
                '&:hover': {
                  color: theme.palette.primary.main,
                },
              }}
            >
              {breadcrumb.icon && (
                <Box sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>
                  {breadcrumb.icon}
                </Box>
              )}
              {breadcrumb.label}
            </Link>
          )
        })}
      </MuiBreadcrumbs>
    </Box>
  )
}

export default Breadcrumbs
