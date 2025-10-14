import { Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'

// Import components (will be created in subsequent tasks)
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import WebSocketProvider from './components/providers/WebSocketProvider'
import NotificationProvider from './components/providers/NotificationProvider'

function App() {
  return (
    <WebSocketProvider>
      <NotificationProvider>
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Box>
      </NotificationProvider>
    </WebSocketProvider>
  )
}

export default App
