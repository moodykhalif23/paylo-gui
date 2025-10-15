import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'

// Layout components
import Layout from '../components/Layout'
import MainLayout from '../components/Layout/MainLayout'
import ErrorBoundary from '../components/common/ErrorBoundary'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import AuthGuard from '../components/auth/AuthGuard'
import { usePerformanceMonitoring } from '../hooks/usePerformanceMonitoring'

// Pages - only import non-lazy loaded pages
import HomePage from '../pages/HomePage'
import NotFoundPage from '../pages/NotFoundPage'
import AccessibilityDemo from '../pages/AccessibilityDemo'

// Lazy load page components for better performance
const LoginPage = React.lazy(() => import('../pages/auth/LoginPage'))
const RegisterPage = React.lazy(() => import('../pages/auth/RegisterPage'))

// P2P User pages
const P2PDashboard = React.lazy(() => import('../pages/p2p/Dashboard'))
const WalletsPage = React.lazy(() => import('../pages/p2p/WalletsPage'))
const TransferPage = React.lazy(() => import('../pages/p2p/TransferPage'))
const TransactionsPage = React.lazy(
  () => import('../pages/p2p/TransactionsPage')
)

// Merchant pages
const MerchantDashboard = React.lazy(
  () => import('../pages/merchant/Dashboard')
)
const InvoicesPage = React.lazy(() => import('../pages/merchant/InvoicesPage'))
const AnalyticsPage = React.lazy(
  () => import('../pages/merchant/AnalyticsPage')
)
const MerchantSettingsPage = React.lazy(
  () => import('../pages/merchant/SettingsPage')
)

// Admin pages
const AdminDashboard = React.lazy(() => import('../pages/admin/Dashboard'))
const UserManagementPage = React.lazy(
  () => import('../pages/admin/UserManagementPage')
)
const TransactionMonitorPage = React.lazy(
  () => import('../pages/admin/TransactionMonitorPage')
)
const SystemHealthPage = React.lazy(
  () => import('../pages/admin/SystemHealthPage')
)
const AdminSettingsPage = React.lazy(
  () => import('../pages/admin/SettingsPage')
)
const CompliancePage = React.lazy(() => import('../pages/admin/CompliancePage'))

// Enhanced loading component with performance monitoring
const PageLoader: React.FC<{ pageName?: string }> = ({ pageName = 'Page' }) => {
  usePerformanceMonitoring(`${pageName}Loader`, {
    enabled: process.env.NODE_ENV === 'development',
    threshold: 100,
  })

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        Loading {pageName}...
      </Typography>
    </Box>
  )
}

// Enhanced wrapper for lazy-loaded components with performance monitoring
const LazyWrapper: React.FC<{
  children: React.ReactNode
  pageName?: string
}> = ({ children, pageName = 'Component' }) => {
  usePerformanceMonitoring(`LazyWrapper-${pageName}`, {
    enabled: process.env.NODE_ENV === 'development',
    threshold: 16,
  })

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader pageName={pageName} />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

const AppRoutes: React.FC = () => {
  return (
    <AuthGuard>
      <Routes>
        {/* Public routes - use basic Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />

          {/* Accessibility Demo */}
          <Route path="accessibility-demo" element={<AccessibilityDemo />} />

          {/* Authentication routes */}
          <Route
            path="auth/login"
            element={
              <LazyWrapper pageName="Login">
                <LoginPage />
              </LazyWrapper>
            }
          />
          <Route
            path="auth/register"
            element={
              <LazyWrapper pageName="Register">
                <RegisterPage />
              </LazyWrapper>
            }
          />

          {/* 404 page for public routes */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Dashboard routes - use MainLayout with sidebar */}
        <Route path="/" element={<MainLayout />}>
          {/* P2P User routes */}
          <Route
            path="dashboard"
            element={
              <ProtectedRoute requiredRoles={['user']}>
                <LazyWrapper pageName="P2P Dashboard">
                  <P2PDashboard />
                </LazyWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="wallets"
            element={
              <ProtectedRoute requiredRoles={['user']}>
                <LazyWrapper>
                  <WalletsPage />
                </LazyWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="transfer"
            element={
              <ProtectedRoute requiredRoles={['user']}>
                <LazyWrapper>
                  <TransferPage />
                </LazyWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="transactions"
            element={
              <ProtectedRoute requiredRoles={['user']}>
                <LazyWrapper>
                  <TransactionsPage />
                </LazyWrapper>
              </ProtectedRoute>
            }
          />

          {/* Merchant routes */}
          <Route path="merchant">
            <Route
              path="dashboard"
              element={
                <ProtectedRoute requiredRoles={['merchant']}>
                  <LazyWrapper>
                    <MerchantDashboard />
                  </LazyWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="invoices"
              element={
                <ProtectedRoute requiredRoles={['merchant']}>
                  <LazyWrapper>
                    <InvoicesPage />
                  </LazyWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="analytics"
              element={
                <ProtectedRoute requiredRoles={['merchant']}>
                  <LazyWrapper>
                    <AnalyticsPage />
                  </LazyWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="settings/*"
              element={
                <ProtectedRoute requiredRoles={['merchant']}>
                  <LazyWrapper>
                    <MerchantSettingsPage />
                  </LazyWrapper>
                </ProtectedRoute>
              }
            />
            {/* Redirect /merchant to /merchant/dashboard */}
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Admin routes */}
          <Route path="admin">
            <Route
              path="dashboard"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <LazyWrapper>
                    <AdminDashboard />
                  </LazyWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="users"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <LazyWrapper>
                    <UserManagementPage />
                  </LazyWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="transactions"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <LazyWrapper>
                    <TransactionMonitorPage />
                  </LazyWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="system"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <LazyWrapper>
                    <SystemHealthPage />
                  </LazyWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="compliance"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <LazyWrapper>
                    <CompliancePage />
                  </LazyWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="settings/*"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <LazyWrapper>
                    <AdminSettingsPage />
                  </LazyWrapper>
                </ProtectedRoute>
              }
            />
            {/* Redirect /admin to /admin/dashboard */}
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>
        </Route>
      </Routes>
    </AuthGuard>
  )
}

export default AppRoutes
