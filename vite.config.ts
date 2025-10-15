import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Performance optimizations
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'mui-vendor': [
            '@mui/material',
            '@mui/icons-material',
            '@emotion/react',
            '@emotion/styled',
          ],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          'router-vendor': ['react-router-dom'],
          'chart-vendor': ['recharts'],
          'utils-vendor': ['axios', 'date-fns', 'formik', 'yup'],

          // Feature-based chunks
          'auth-features': [
            './src/pages/auth/LoginPage',
            './src/pages/auth/RegisterPage',
            './src/components/auth/AuthGuard',
            './src/components/auth/ProtectedRoute',
          ],
          'p2p-features': [
            './src/pages/p2p/Dashboard',
            './src/pages/p2p/WalletsPage',
            './src/pages/p2p/TransferPage',
            './src/pages/p2p/TransactionsPage',
          ],
          'merchant-features': [
            './src/pages/merchant/Dashboard',
            './src/pages/merchant/InvoicesPage',
            './src/pages/merchant/AnalyticsPage',
            './src/pages/merchant/SettingsPage',
          ],
          'admin-features': [
            './src/pages/admin/Dashboard',
            './src/pages/admin/UserManagementPage',
            './src/pages/admin/TransactionMonitorPage',
            './src/pages/admin/SystemHealthPage',
            './src/pages/admin/SettingsPage',
            './src/pages/admin/CompliancePage',
          ],
        },
        // Optimize chunk file names
        chunkFileNames: () => {
          return `js/[name]-[hash].js`
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: assetInfo => {
          const info = assetInfo.name!.split('.')
          const ext = info[info.length - 1]
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`
          }
          if (/css/i.test(ext)) {
            return `css/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        },
      },
    },
    // Optimize build performance
    target: 'esnext',
    minify: 'esbuild',
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize dependencies
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
      '@reduxjs/toolkit',
      'react-redux',
      'react-router-dom',
      'recharts',
      'axios',
      'date-fns',
      'formik',
      'yup',
    ],
    // Force optimization of these packages
    force: true,
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  // Performance monitoring in development
  esbuild: {
    // Remove console logs in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
})
