// Enhanced Dashboard Types for KPI System

export interface PriorityBreakdown {
  high: number
  medium: number
  low: number
  overdue?: number
  total?: number
}

export interface ContractRenewal {
  id: string
  vendorName: string
  renewalDate: string
  daysUntilRenewal: number
  status: 'expired' | 'due_soon' | 'future'
  value?: number
  category?: string
  confidenceLevel?: string
  aiConfidence?: number
}

export interface Badge {
  text: string
  variant: 'success' | 'warning' | 'error' | 'info' | 'default'
}

export interface TrendData {
  value: number
  isPositive: boolean
  label?: string
}

export interface KPIVariant {
  type: 'primary' | 'metric' | 'success' | 'warning' | 'error' | 'info'
  size: 'default' | 'large' | 'compact'
  gradient?: boolean
  interactive?: boolean
}

// Dashboard Statistics Response Types

export interface DashboardStats {
  totalDrift: number
  totalProcessed: number
  activeVendors: number
  highPriorityFindings: number
  attentionRequired: number
  monthlySavings: number
  priorityBreakdown: PriorityBreakdown
  processingRate: {
    daily: number
    weekly: number
    monthly: number
  }
  vendorGrowth: {
    thisMonth: number
    lastMonth: number
    percentChange: number
  }
  upcomingRenewals: ContractRenewal[]
  previousPeriodComparisons: {
    driftChange: number
    processedChange: number
    vendorsChange: number
  }
  lastUpdated: string
}

export interface ProcessingMetrics {
  totalProcessed: number
  averageProcessingTime: number // in minutes
  processingRate: {
    hourly: number
    daily: number
    weekly: number
  }
  successRate: number // percentage
  errorRate: number // percentage
  recentActivity: Array<{
    hour: string
    processed: number
    errors: number
  }>
}

export interface VendorAnalytics {
  totalVendors: number
  activeVendors: number
  inactiveVendors: number
  newVendorsThisMonth: number
  averageContractValue: number
  topVendorsByValue: Array<{
    id: string
    name: string
    contractValue: number
    category: string
  }>
  vendorsByCategory: Array<{
    category: string
    count: number
    totalValue: number
  }>
}

// Priority Invoice Types

export interface PriorityInvoice {
  id: string
  invoiceNumber: string
  vendorName: string
  amount: number
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  daysOverdue?: number
  reason: string
  findings?: string[]
}

export interface PriorityInvoicesResponse {
  high: number
  medium: number
  low: number
  overdue: number
  total: number
  invoices?: PriorityInvoice[]
}

// Contract Calendar Types

export interface ContractEvent {
  id: string
  vendorName: string
  eventType: 'renewal' | 'expiry' | 'review'
  date: string
  status: 'expired' | 'due_soon' | 'future' | 'completed'
  daysUntil: number
  value?: number
  category?: string
  notes?: string
}

export interface CalendarPreviewData {
  thisMonth: ContractEvent[]
  nextMonth: ContractEvent[]
  upcoming: ContractEvent[]
  overdue: ContractEvent[]
}

// Dashboard Filter Types

export interface DateRange {
  from: Date
  to: Date
  preset?: 'mtd' | 'qtd' | 'ytd' | 'custom'
}

export interface DashboardFilters {
  dateRange?: DateRange
  vendorIds?: string[]
  priorities?: ('high' | 'medium' | 'low')[]
  categories?: string[]
  includeInactive?: boolean
}

// KPI Card Configuration Types

export interface KPICardConfig {
  id: string
  title: string
  description?: string
  variant: KPIVariant['type']
  size: KPIVariant['size']
  icon?: string // Lucide icon name
  dataSource: 'dashboard' | 'processing' | 'vendor' | 'priority' | 'contracts'
  refreshInterval?: number // in milliseconds
  features: {
    trend?: boolean
    badge?: boolean
    breakdown?: boolean
    calendar?: boolean
    interactive?: boolean
    gradient?: boolean
  }
  position: {
    row: number
    col: number
    span?: number
  }
}

export interface DashboardLayout {
  kpiCards: KPICardConfig[]
  sections: {
    id: string
    title: string
    component: string
    position: number
    visible: boolean
  }[]
}

// API Response wrapper types

export interface ApiResponse<T> {
  data?: T
  error?: string
  status: number
  message?: string
  timestamp?: string
}

// Error handling types

export interface DashboardError {
  code: string
  message: string
  details?: any
  timestamp: string
  component: string
}

export interface LoadingState {
  isLoading: boolean
  component?: string
  progress?: number
  message?: string
}

// Real-time update types

export interface RealtimeUpdate {
  type: 'kpi_update' | 'priority_change' | 'contract_renewal' | 'processing_complete'
  data: any
  timestamp: string
  affectedComponents: string[]
}

export interface WebSocketMessage {
  event: string
  data: RealtimeUpdate
  clientId: string
  timestamp: string
}

// Export all types as a namespace for convenience
export namespace Dashboard {
  export type Stats = DashboardStats
  export type Processing = ProcessingMetrics
  export type Vendor = VendorAnalytics
  export type Priority = PriorityInvoicesResponse
  export type Renewal = ContractRenewal
  export type Event = ContractEvent
  export type Filter = DashboardFilters
  export type Config = KPICardConfig
  export type Layout = DashboardLayout
  export type Error = DashboardError
  export type Loading = LoadingState
  export type Update = RealtimeUpdate
}