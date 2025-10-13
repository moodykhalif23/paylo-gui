/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_WS_BASE_URL: string
  readonly VITE_APP_ENV: string
  readonly VITE_APP_VERSION: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_DEBUG: string
  readonly VITE_BITCOIN_NETWORK: string
  readonly VITE_ETHEREUM_NETWORK: string
  readonly VITE_SOLANA_NETWORK: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
