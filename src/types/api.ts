// API-specific type definitions

// ============================================================================
// Base API Response Types
// ============================================================================

export interface BaseApiResponse {
  success: boolean
  timestamp: string
  requestId: string
  version: string
}

export interface ApiResponse<T = unknown> extends BaseApiResponse {
  data?: T
  message?: string
  errors?: ApiFieldError[]
  warnings?: string[]
  meta?: ApiResponseMeta
}

export interface PaginatedApiResponse<T> extends BaseApiResponse {
  data: T[]
  pagination: PaginationMeta
  filters?: Record<string, unknown>
  sorting?: SortingMeta
  meta?: ApiResponseMeta
}

export interface ApiResponseMeta {
  executionTime: number
  cacheHit?: boolean
  cacheExpiry?: string
  rateLimit?: RateLimitInfo
  deprecationWarning?: string
  nextVersion?: string
}

// ============================================================================
// Pagination Types
// ============================================================================

export interface PaginationMeta {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  nextPage?: number
  previousPage?: number
}

export interface PaginationRequest {
  page?: number
  limit?: number
  offset?: number
}

export interface SortingMeta {
  field: string
  order: 'asc' | 'desc'
  defaultField?: string
  availableFields: string[]
}

export interface SortingRequest {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// ============================================================================
// Error Types
// ============================================================================

export interface ApiError extends Error {
  status: number
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp: string
  requestId?: string
  path?: string
  method?: string
  stack?: string
  cause?: Error
}

export interface ApiFieldError {
  field: string
  code: string
  message: string
  value?: unknown
  constraints?: Record<string, unknown>
}

export interface ValidationError extends ApiError {
  fieldErrors: ApiFieldError[]
  invalidFields: string[]
}

export interface AuthenticationError extends ApiError {
  authType: 'token' | 'session' | 'api_key'
  expired: boolean
  refreshable: boolean
}

export interface AuthorizationError extends ApiError {
  requiredPermissions: string[]
  userPermissions: string[]
  resource?: string
  action?: string
}

export interface RateLimitError extends ApiError {
  limit: number
  remaining: number
  resetTime: string
  retryAfter: number
}

export interface NetworkError extends ApiError {
  timeout: boolean
  offline: boolean
  retryable: boolean
  retryAfter?: number
}

// ============================================================================
// Rate Limiting Types
// ============================================================================

export interface RateLimitInfo {
  limit: number
  remaining: number
  resetTime: string
  retryAfter?: number
  policy: string
}

export interface RateLimitHeaders {
  'x-ratelimit-limit': string
  'x-ratelimit-remaining': string
  'x-ratelimit-reset': string
  'x-ratelimit-retry-after'?: string
  'x-ratelimit-policy': string
}

// ============================================================================
// Request Types
// ============================================================================

export interface ApiRequestConfig {
  timeout?: number
  retries?: number
  retryDelay?: number
  cache?: boolean
  cacheTimeout?: number
  headers?: Record<string, string>
  params?: Record<string, unknown>
  validateStatus?: (status: number) => boolean
}

export interface ApiRequestContext {
  userId?: string
  sessionId?: string
  requestId: string
  userAgent: string
  ipAddress: string
  timestamp: string
}

// ============================================================================
// Batch Operations
// ============================================================================

export interface BatchRequest<T = unknown> {
  operations: BatchOperation<T>[]
  transactional?: boolean
  continueOnError?: boolean
}

export interface BatchOperation<T = unknown> {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  url: string
  data?: T
  headers?: Record<string, string>
}

export interface BatchResponse<T = unknown> {
  results: BatchOperationResult<T>[]
  success: boolean
  totalOperations: number
  successfulOperations: number
  failedOperations: number
  executionTime: number
}

export interface BatchOperationResult<T = unknown> {
  id: string
  success: boolean
  status: number
  data?: T
  error?: ApiError
}

// ============================================================================
// File Upload Types
// ============================================================================

export interface FileUploadRequest {
  file: File
  fileName?: string
  contentType?: string
  metadata?: Record<string, unknown>
  tags?: string[]
  public?: boolean
  expiresAt?: string
}

export interface FileUploadResponse {
  fileId: string
  fileName: string
  fileSize: number
  contentType: string
  url: string
  publicUrl?: string
  thumbnailUrl?: string
  metadata?: Record<string, unknown>
  uploadedAt: string
  expiresAt?: string
}

export interface FileUploadProgress {
  fileId: string
  loaded: number
  total: number
  percentage: number
  speed: number
  estimatedTimeRemaining: number
}

// ============================================================================
// Search and Filter Types
// ============================================================================

export interface SearchRequest {
  query: string
  fields?: string[]
  filters?: FilterRequest[]
  sorting?: SortingRequest
  pagination?: PaginationRequest
  facets?: string[]
  highlight?: boolean
}

export interface SearchResponse<T> {
  results: T[]
  totalCount: number
  facets?: SearchFacet[]
  suggestions?: string[]
  executionTime: number
  pagination: PaginationMeta
}

export interface SearchFacet {
  field: string
  values: SearchFacetValue[]
}

export interface SearchFacetValue {
  value: string
  count: number
  selected: boolean
}

export interface FilterRequest {
  field: string
  operator: FilterOperator
  value: unknown
  values?: unknown[]
}

export type FilterOperator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'nin'
  | 'contains'
  | 'startswith'
  | 'endswith'
  | 'between'
  | 'exists'
  | 'regex'

// ============================================================================
// Export Types
// ============================================================================

export interface ExportRequest {
  format: ExportFormat
  filters?: FilterRequest[]
  fields?: string[]
  sorting?: SortingRequest
  dateRange?: DateRange
  options?: ExportOptions
}

export type ExportFormat = 'csv' | 'json' | 'excel' | 'pdf' | 'xml'

export interface ExportOptions {
  includeHeaders?: boolean
  delimiter?: string
  encoding?: string
  compression?: boolean
  password?: string
  template?: string
}

export interface ExportResponse {
  exportId: string
  status: ExportStatus
  downloadUrl?: string
  fileName: string
  fileSize?: number
  recordCount?: number
  createdAt: string
  expiresAt: string
  progress?: number
  error?: string
}

export type ExportStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'expired'

// ============================================================================
// Webhook Types
// ============================================================================

export interface WebhookRequest {
  url: string
  events: string[]
  secret?: string
  headers?: Record<string, string>
  retryPolicy?: WebhookRetryPolicy
  filters?: Record<string, unknown>
}

export interface WebhookRetryPolicy {
  maxRetries: number
  retryDelay: number
  backoffMultiplier: number
  maxRetryDelay: number
}

export interface WebhookResponse {
  webhookId: string
  url: string
  events: string[]
  isActive: boolean
  secret: string
  createdAt: string
  lastTriggeredAt?: string
  deliveryStats: WebhookDeliveryStats
}

export interface WebhookDeliveryStats {
  totalDeliveries: number
  successfulDeliveries: number
  failedDeliveries: number
  averageResponseTime: number
  lastDeliveryStatus: 'success' | 'failed'
  lastDeliveryAt?: string
}

// ============================================================================
// Utility Types
// ============================================================================

export interface DateRange {
  from: string
  to: string
}

export interface TimeRange {
  from: string
  to: string
  timezone?: string
}

export interface GeoLocation {
  latitude: number
  longitude: number
  accuracy?: number
  altitude?: number
  heading?: number
  speed?: number
}

export interface IPInfo {
  ip: string
  country: string
  region: string
  city: string
  timezone: string
  isp: string
  proxy: boolean
  vpn: boolean
}

// ============================================================================
// Health Check Types
// ============================================================================

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  version: string
  uptime: number
  timestamp: string
  checks: HealthCheck[]
  metrics?: HealthMetrics
}

export interface HealthCheck {
  name: string
  status: 'pass' | 'fail' | 'warn'
  responseTime: number
  message?: string
  details?: Record<string, unknown>
}

export interface HealthMetrics {
  memoryUsage: number
  cpuUsage: number
  diskUsage: number
  activeConnections: number
  requestsPerSecond: number
  errorRate: number
}
