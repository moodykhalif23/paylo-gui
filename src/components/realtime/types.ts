// Real-time component prop types

export interface RealTimeTransactionStatusProps {
  userId?: string
  showRecentUpdates?: boolean
  showStats?: boolean
  maxUpdates?: number
}

export interface RealTimeWalletBalancesProps {
  userId?: string
  showRecentUpdates?: boolean
  showBreakdown?: boolean
  maxUpdates?: number
}

export interface RealTimeSystemHealthProps {
  showMetrics?: boolean
  showServices?: boolean
  showAlerts?: boolean
  refreshInterval?: number
}
