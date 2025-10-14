// System Configuration Types

export interface SystemConfiguration {
  blockchain: BlockchainConfiguration
  security: SecurityConfiguration
  rateLimit: RateLimitConfiguration
  system: SystemParameters
}

export interface BlockchainConfiguration {
  bitcoin: BlockchainRPCConfig
  ethereum: BlockchainRPCConfig
  solana: BlockchainRPCConfig
}

export interface BlockchainRPCConfig {
  enabled: boolean
  rpcEndpoint: string
  backupEndpoints: string[]
  timeout: number
  maxRetries: number
  confirmationsRequired: number
  gasSettings?: {
    maxGasPrice?: string
    gasLimit?: string
    priorityFee?: string
  }
  testConnection?: boolean
  lastHealthCheck?: string
  status?: 'healthy' | 'degraded' | 'down'
}

export interface SecurityConfiguration {
  authentication: {
    jwtExpirationTime: number
    refreshTokenExpirationTime: number
    maxLoginAttempts: number
    lockoutDuration: number
    requireTwoFactor: boolean
    passwordPolicy: {
      minLength: number
      requireUppercase: boolean
      requireLowercase: boolean
      requireNumbers: boolean
      requireSpecialChars: boolean
      maxAge: number
    }
  }
  encryption: {
    algorithm: string
    keyRotationInterval: number
    backupEncryption: boolean
  }
  apiSecurity: {
    corsOrigins: string[]
    rateLimitEnabled: boolean
    ipWhitelist: string[]
    ipBlacklist: string[]
    requireApiKeyForMerchants: boolean
  }
}

export interface RateLimitConfiguration {
  global: RateLimitRule
  authentication: RateLimitRule
  api: RateLimitRule
  transactions: RateLimitRule
  webhooks: RateLimitRule
}

export interface RateLimitRule {
  enabled: boolean
  requests: number
  windowMs: number
  skipSuccessfulRequests: boolean
  skipFailedRequests: boolean
  keyGenerator?: string
  onLimitReached?: string
}

export interface SystemParameters {
  maintenance: {
    enabled: boolean
    message: string
    allowedIPs: string[]
    scheduledMaintenance?: {
      startTime: string
      endTime: string
      description: string
    }
  }
  monitoring: {
    healthCheckInterval: number
    alertThresholds: {
      cpuUsage: number
      memoryUsage: number
      diskUsage: number
      responseTime: number
      errorRate: number
    }
    logLevel: 'debug' | 'info' | 'warn' | 'error'
    logRetentionDays: number
  }
  performance: {
    cacheEnabled: boolean
    cacheTTL: number
    compressionEnabled: boolean
    maxRequestSize: number
    connectionPoolSize: number
    queryTimeout: number
  }
}

export interface ConfigurationValidationResult {
  isValid: boolean
  errors: ConfigurationError[]
  warnings: ConfigurationWarning[]
}

export interface ConfigurationError {
  field: string
  message: string
  code: string
  severity: 'error' | 'warning'
}

export interface ConfigurationWarning {
  field: string
  message: string
  recommendation: string
}

export interface ConfigurationTestResult {
  field: string
  success: boolean
  message: string
  responseTime?: number
  details?: Record<string, unknown>
}

// Form data types for the configuration panel
export interface SystemConfigFormData {
  blockchain: {
    bitcoin: BlockchainRPCFormData
    ethereum: BlockchainRPCFormData
    solana: BlockchainRPCFormData
  }
  security: SecurityFormData
  rateLimit: RateLimitFormData
  system: SystemParametersFormData
}

export interface BlockchainRPCFormData {
  enabled: boolean
  rpcEndpoint: string
  backupEndpoints: string
  timeout: number
  maxRetries: number
  confirmationsRequired: number
  gasSettings?: {
    maxGasPrice?: string
    gasLimit?: string
    priorityFee?: string
  }
}

export interface SecurityFormData {
  jwtExpirationTime: number
  refreshTokenExpirationTime: number
  maxLoginAttempts: number
  lockoutDuration: number
  requireTwoFactor: boolean
  passwordMinLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  passwordMaxAge: number
  corsOrigins: string
  rateLimitEnabled: boolean
  ipWhitelist: string
  ipBlacklist: string
  requireApiKeyForMerchants: boolean
}

export interface RateLimitFormData {
  globalEnabled: boolean
  globalRequests: number
  globalWindowMs: number
  authEnabled: boolean
  authRequests: number
  authWindowMs: number
  apiEnabled: boolean
  apiRequests: number
  apiWindowMs: number
  transactionsEnabled: boolean
  transactionsRequests: number
  transactionsWindowMs: number
  webhooksEnabled: boolean
  webhooksRequests: number
  webhooksWindowMs: number
}

export interface SystemParametersFormData {
  maintenanceEnabled: boolean
  maintenanceMessage: string
  maintenanceAllowedIPs: string
  healthCheckInterval: number
  cpuThreshold: number
  memoryThreshold: number
  diskThreshold: number
  responseTimeThreshold: number
  errorRateThreshold: number
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  logRetentionDays: number
  cacheEnabled: boolean
  cacheTTL: number
  compressionEnabled: boolean
  maxRequestSize: number
  connectionPoolSize: number
  queryTimeout: number
}
