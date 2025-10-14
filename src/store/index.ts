import { configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { setupListeners } from '@reduxjs/toolkit/query'

// Import API
import { baseApi } from './api/baseApi'

// Import slices
import authSlice from './slices/authSlice'
import userSlice from './slices/userSlice'
import uiSlice from './slices/uiSlice'
import websocketSlice from './slices/websocketSlice'
import notificationSlice from './slices/notificationSlice'
import transactionSlice from './slices/transactionSlice'
import walletSlice from './slices/walletSlice'
import systemSlice from './slices/systemSlice'

// Import middleware
import errorMiddleware from './middleware/errorMiddleware'
import loggingMiddleware, {
  performanceMiddleware,
} from './middleware/loggingMiddleware'

export const store = configureStore({
  reducer: {
    // API slice
    [baseApi.reducerPath]: baseApi.reducer,

    // Feature slices
    auth: authSlice,
    user: userSlice,
    ui: uiSlice,
    websocket: websocketSlice,
    notifications: notificationSlice,
    transactions: transactionSlice,
    wallets: walletSlice,
    system: systemSlice,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          // Ignore RTK Query actions
          'api/executeQuery/pending',
          'api/executeQuery/fulfilled',
          'api/executeQuery/rejected',
        ],
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['api.queries', 'api.mutations'],
      },
    })
      // Add RTK Query middleware
      .concat(baseApi.middleware)
      // Add custom middleware
      .concat(errorMiddleware)
      .concat(performanceMiddleware)
      .concat(import.meta.env.DEV ? [loggingMiddleware] : []),
})

// Setup listeners for RTK Query
setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
