const DEFAULT_API_BASE_URL = 'http://localhost:8080'

const removeTrailingSlashes = (url: string) => url.replace(/\/+$/, '')
const stripApiSuffix = (url: string) => url.replace(/\/api$/i, '')

const rawApiBaseUrl =
  (import.meta.env.VITE_API_BASE_URL &&
    import.meta.env.VITE_API_BASE_URL.trim()) ||
  DEFAULT_API_BASE_URL

const normalizedApiBaseUrl = removeTrailingSlashes(rawApiBaseUrl)
const sanitizedApiBaseUrl = stripApiSuffix(normalizedApiBaseUrl)
const resolvedApiBaseUrl = sanitizedApiBaseUrl || DEFAULT_API_BASE_URL

export const config = {
  api: {
    baseUrl: resolvedApiBaseUrl,
    rawBaseUrl: normalizedApiBaseUrl,
    wsUrl: import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8080/ws',
  },
  app: {
    env: import.meta.env.VITE_APP_ENV || 'development',
    version: import.meta.env.VITE_APP_VERSION || '0.0.0',
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  },
  blockchain: {
    bitcoin: {
      network: import.meta.env.VITE_BITCOIN_NETWORK || 'testnet',
    },
    ethereum: {
      network: import.meta.env.VITE_ETHEREUM_NETWORK || 'goerli',
    },
    solana: {
      network: import.meta.env.VITE_SOLANA_NETWORK || 'devnet',
    },
  },
} as const

// Type definitions for environment
export type Environment = 'development' | 'staging' | 'production'
export type BlockchainNetwork = 'mainnet' | 'testnet' | 'goerli' | 'devnet'

// Validation
if (!config.api.baseUrl) {
  throw new Error('VITE_API_BASE_URL is required')
}

// Development helpers
export const isDevelopment = config.app.env === 'development'
export const isProduction = config.app.env === 'production'
export const isStaging = config.app.env === 'staging'
