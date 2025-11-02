import { cn } from '@/lib/utils'
import { LucideIcon, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import React, { useState, useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { PriorityBreakdown, ContractRenewal, Badge, TrendData } from '@/types/dashboard'

// Re-export types for backward compatibility
export type { PriorityBreakdown, ContractRenewal, Badge, TrendData }

interface KPICardProps {
  title: string
  value: string | number
  description?: string
  variant?: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'metric'
  size?: 'default' | 'large' | 'compact'
  className?: string
  icon?: LucideIcon
  badge?: Badge
  trend?: TrendData
  // Enhanced features
  priorityBreakdown?: PriorityBreakdown
  contractRenewals?: ContractRenewal[]
  gradient?: boolean
  interactive?: boolean
  onClick?: () => void
  // Accessibility
  'aria-label'?: string
  'aria-describedby'?: string
}

export function KPICard({
  title,
  value,
  description,
  variant = 'success',
  size = 'default',
  className,
  icon: Icon,
  badge,
  trend,
  priorityBreakdown,
  contractRenewals,
  gradient = false,
  interactive = false,
  onClick,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy
}: KPICardProps) {
  // Animation state - Fix hydration by initializing with actual value
  const [hasAnimated, setHasAnimated] = useState(false)
  const [animatedValue, setAnimatedValue] = useState<string | number>(value) // Fix: Initialize with actual value
  const [isClient, setIsClient] = useState(false) // Fix: Track hydration state
  const prefersReducedMotion = useReducedMotion()
  const animationRef = useRef<number | null>(null)

  // Fix: Track client-side hydration to prevent mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Number animation effect - Only run after hydration
  useEffect(() => {
    // Skip if not hydrated yet
    if (!isClient) {
      return
    }

    // Skip animation if user prefers reduced motion or already animated
    if (prefersReducedMotion || hasAnimated) {
      setAnimatedValue(value)
      return
    }

    // Skip animation for non-numeric values or loading states
    const numericValue = typeof value === 'number' ? value : 
                        typeof value === 'string' && !isNaN(Number(value.replace(/[,$]/g, ''))) ? 
                        Number(value.replace(/[,$]/g, '')) : null

    if (numericValue === null || value === 'Loading...' || value === 'Error') {
      setAnimatedValue(value)
      return
    }

    // Animate the number
    const startValue = 0
    const endValue = numericValue
    const duration = 1200 // 1.2 seconds
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentValue = Math.floor(startValue + (endValue - startValue) * easeOut)
      
      // Format the animated value similar to the original
      if (typeof value === 'string' && value.includes('$')) {
        setAnimatedValue(`$${currentValue.toLocaleString()}`)
      } else {
        setAnimatedValue(currentValue)
      }
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setAnimatedValue(value) // Set final value
        setHasAnimated(true)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [value, hasAnimated, prefersReducedMotion, isClient])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])
  
  // Ultra-minimal mode - remove all decorative elements
  const isUltraMinimal = className?.includes('ultra-minimal-kpi')
  const formatValue = (val: string | number) => {
    // For ultra-minimal design, keep full numbers visible for clarity
    if (isUltraMinimal) {
      if (typeof val === 'number') {
        return val.toLocaleString()
      }
      return val
    }
    
    // Standard formatting for non-minimal cards
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return (val / 1000000).toFixed(1) + 'M'
      } else if (val >= 1000) {
        return (val / 1000).toFixed(1) + 'K'
      }
      return val.toString()
    }
    return val
  }

  const getVariantStyles = () => {
    const baseStyles = {
      accent: '',
      background: '',
      text: ''
    }

    switch (variant) {
      case 'success':
        // Professional sage tint - subtle green
        baseStyles.accent = 'border-l-emerald-600'
        baseStyles.background = gradient ? 'bg-gradient-to-br from-emerald-50/50 to-white' : 'bg-white'
        baseStyles.text = 'text-emerald-700'
        break
      case 'warning':
        // Warm amber tint - professional orange
        baseStyles.accent = 'border-l-amber-500'
        baseStyles.background = gradient ? 'bg-gradient-to-br from-amber-50/50 to-white' : 'bg-white'
        baseStyles.text = 'text-amber-700'
        break
      case 'error':
        // Elegant coral tint - subtle red
        baseStyles.accent = 'border-l-rose-500'
        baseStyles.background = gradient ? 'bg-gradient-to-br from-rose-50/50 to-white' : 'bg-white'
        baseStyles.text = 'text-rose-700'
        break
      case 'info':
        baseStyles.accent = 'border-l-blue-500'
        baseStyles.background = gradient ? 'bg-gradient-to-br from-blue-50/50 to-white' : 'bg-white'
        baseStyles.text = 'text-blue-600'
        break
      case 'primary':
        baseStyles.accent = 'border-l-orange-500'
        baseStyles.background = gradient ? 'bg-gradient-to-br from-orange-50/30 via-green-50/30 to-white shadow-lg' : 'bg-white'
        baseStyles.text = 'text-orange-600'
        break
      case 'metric':
        baseStyles.accent = 'border-l-gray-400'
        baseStyles.background = 'bg-white'
        baseStyles.text = 'text-gray-600'
        break
      default:
        baseStyles.accent = 'border-l-emerald-600'
        baseStyles.background = 'bg-white'
        baseStyles.text = 'text-emerald-700'
    }

    return baseStyles
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'large':
        return {
          container: 'p-6 h-[160px]',
          value: 'text-2xl sm:text-3xl lg:text-4xl',
          spacing: 'space-y-2'
        }
      case 'compact':
        return {
          container: 'p-4 h-[120px]',
          value: 'text-xl sm:text-2xl lg:text-3xl',
          spacing: 'space-y-1'
        }
      default:
        return {
          container: 'p-6 h-[160px]',
          value: 'text-2xl sm:text-3xl lg:text-4xl',
          spacing: 'space-y-2'
        }
    }
  }

  const variantStyles = getVariantStyles()
  const sizeStyles = getSizeStyles()

  const getBadgeStyles = (badgeVariant: Badge['variant']) => {
    switch (badgeVariant) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200'
      case 'warning': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Generate unique IDs for accessibility
  const cardId = React.useId()
  const descriptionId = `${cardId}-description`
  const valueId = `${cardId}-value`
  
  // Loading state for skeleton UI
  const isLoading = value === 'Loading...' || value === ''
  
  // Improved professional card design
  if (isUltraMinimal) {
    return (
      <div 
        className={cn(
          "bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-300 h-[160px]",
          "hover:shadow-md hover:border-gray-200",
          "p-6", // Fixed 24px padding
          interactive && "cursor-pointer hover:scale-[1.01] active:scale-[0.99]",
          variant === 'primary' && "border-l-4 border-orange-500 bg-gradient-to-br from-orange-50/30 to-white",
          variant === 'success' && "border-l-4 border-emerald-600 bg-gradient-to-br from-emerald-50/50 to-white",
          variant === 'warning' && "border-l-4 border-amber-500 bg-gradient-to-br from-amber-50/50 to-white",
          variant === 'error' && "border-l-4 border-rose-500 bg-gradient-to-br from-rose-50/50 to-white",
          className
        )}
        onClick={interactive ? onClick : undefined}
        role={interactive ? "button" : "region"}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={interactive ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick?.() : undefined}
        aria-label={ariaLabel || title}
      >
        <div className="text-center space-y-4 h-full flex flex-col justify-center">
          {/* Professional title - smaller and subtle */}
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-widest">
            {isLoading ? <div className="h-3 bg-gray-200 rounded w-24 mx-auto animate-pulse" /> : title}
          </h3>
          
          {/* Professional value with overflow protection */}
          <div className={cn(
            "font-bold leading-none overflow-hidden text-ellipsis whitespace-nowrap",
            "text-2xl lg:text-3xl", // Reduced from text-6xl/7xl to prevent overflow
            variant === 'primary' ? "text-orange-600" : 
            variant === 'success' ? "text-emerald-700" : 
            variant === 'warning' ? "text-amber-700" : 
            variant === 'error' ? "text-rose-700" : 
            "text-gray-900"
          )}>
            {isLoading ? <div className="h-10 bg-gray-200 rounded w-32 mx-auto animate-pulse" /> : formatValue(isClient ? animatedValue : value)}
          </div>
          
          {/* Professional description with overflow protection */}
          {description && (
            <div className="text-xs text-gray-500 max-w-xs mx-auto font-light overflow-hidden text-ellipsis whitespace-nowrap">
              {isLoading ? <div className="h-3 bg-gray-100 rounded w-32 mx-auto animate-pulse" /> : description}
            </div>
          )}
        </div>
      </div>
    )
  }
  
  // Standard KPI card with all features
  return (
    <div 
      className={cn(
        "rounded-lg shadow-sm border border-gray-200 relative transition-all duration-200",
        "border-l-4 kpi-focus",
        variantStyles.background,
        variantStyles.accent,
        sizeStyles.container,
        interactive && "kpi-interactive cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        !interactive && "hover:shadow-md",
        variant === 'primary' && "ring-1 ring-orange-100",
        isLoading && "kpi-skeleton",
        className
      )}
      onClick={interactive ? onClick : undefined}
      role={interactive ? "button" : "region"}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick?.() : undefined}
      aria-label={ariaLabel || (interactive ? `${title} - Click for details` : title)}
      aria-describedby={ariaDescribedBy || descriptionId}
    >
      <div className={cn("h-full flex flex-col justify-between", sizeStyles.spacing)}>
        {/* Header with title, icon, and badge */}
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            {Icon && (
              <Icon 
                className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 flex-shrink-0" 
                aria-hidden="true"
              />
            )}
            <h3 
              className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide line-clamp-2 flex-1"
              id={`${cardId}-title`}
            >
              {isLoading ? <span className="kpi-skeleton-title" /> : title}
            </h3>
          </div>
          {badge && !isLoading && (
            <span 
              className={cn(
                "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0",
                getBadgeStyles(badge.variant)
              )}
              role="status"
              aria-label={`Status: ${badge.text}`}
            >
              {badge.text}
            </span>
          )}
        </div>
        
        {/* Main Value with overflow protection */}
        <div 
          className={cn(
            "font-bold text-gray-900 leading-tight overflow-hidden text-ellipsis whitespace-nowrap max-w-full",
            sizeStyles.value,
            variant === 'primary' && "bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent"
          )}
          id={valueId}
          role="text"
          aria-label={`Current value: ${formatValue(value)}`}
        >
          {isLoading ? <div className="kpi-skeleton-value" /> : formatValue(isClient ? animatedValue : value)}
        </div>
        
        {/* Content area - Description, Priority Breakdown, or Contract Renewals */}
        <div className="space-y-3 flex-shrink-0">
          {/* Priority Breakdown */}
          {priorityBreakdown && (
            <PriorityBreakdownView breakdown={priorityBreakdown} />
          )}
          
          {/* Contract Renewals Preview */}
          {contractRenewals && (
            <ContractRenewalsPreview renewals={contractRenewals} />
          )}
          
          {/* Standard description */}
          {description && !priorityBreakdown && !contractRenewals && (
            <div 
              className="text-xs sm:text-sm text-gray-500 line-clamp-2"
              id={descriptionId}
            >
              {isLoading ? <div className="kpi-skeleton-description" /> : description}
            </div>
          )}

          {/* Trend - mobile optimized */}
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs sm:text-sm font-medium",
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            )}>
              <span className="text-base sm:text-lg leading-none">
                {trend.isPositive ? '↗' : '↘'}
              </span>
              <span>{Math.abs(trend.value)}%</span>
              {trend.label && (
                <span className="text-gray-500 text-xs hidden sm:inline">
                  ({trend.label})
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Priority Breakdown Component
function PriorityBreakdownView({ breakdown }: { breakdown: PriorityBreakdown }) {
  const total = breakdown.high + breakdown.medium + breakdown.low
  
  if (total === 0) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <CheckCircle className="h-4 w-4" />
        <span className="text-xs sm:text-sm">No pending approvals</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Priority badges */}
      <div className="flex flex-wrap gap-1.5">
        {breakdown.high > 0 && (
          <div className="flex items-center gap-1 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
            <AlertTriangle className="h-3 w-3" />
            <span>{breakdown.high} High</span>
          </div>
        )}
        {breakdown.medium > 0 && (
          <div className="flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
            <Clock className="h-3 w-3" />
            <span>{breakdown.medium} Med</span>
          </div>
        )}
        {breakdown.low > 0 && (
          <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            <span>{breakdown.low} Low</span>
          </div>
        )}
        {breakdown.overdue && breakdown.overdue > 0 && (
          <div className="flex items-center gap-1 bg-red-200 text-red-900 px-2 py-1 rounded-full text-xs font-bold animate-pulse">
            <span>{breakdown.overdue} Overdue</span>
          </div>
        )}
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div className="h-full flex">
          {breakdown.high > 0 && (
            <div 
              className="bg-red-500 h-full" 
              style={{ width: `${(breakdown.high / total) * 100}%` }}
            />
          )}
          {breakdown.medium > 0 && (
            <div 
              className="bg-orange-500 h-full" 
              style={{ width: `${(breakdown.medium / total) * 100}%` }}
            />
          )}
          {breakdown.low > 0 && (
            <div 
              className="bg-blue-500 h-full" 
              style={{ width: `${(breakdown.low / total) * 100}%` }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// Contract Renewals Preview Component
function ContractRenewalsPreview({ renewals }: { renewals: ContractRenewal[] }) {
  if (renewals.length === 0) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Calendar className="h-4 w-4" />
        <span className="text-xs sm:text-sm">No upcoming renewals</span>
      </div>
    )
  }

  const getStatusColor = (status: ContractRenewal['status']) => {
    switch (status) {
      case 'expired': return 'text-red-600 bg-red-100'
      case 'due_soon': return 'text-orange-600 bg-orange-100'
      case 'future': return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: ContractRenewal['status']) => {
    switch (status) {
      case 'expired': return <AlertTriangle className="h-3 w-3" />
      case 'due_soon': return <Clock className="h-3 w-3" />
      case 'future': return <Calendar className="h-3 w-3" />
    }
  }

  const displayRenewals = renewals.slice(0, 3) // Show max 3 upcoming

  return (
    <div className="space-y-2">
      {displayRenewals.map((renewal, index) => (
        <div key={renewal.id} className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={cn(
              "flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0",
              getStatusColor(renewal.status)
            )}>
              {getStatusIcon(renewal.status)}
              <span>{renewal.daysUntilRenewal}d</span>
            </div>
            <span className="text-xs text-gray-700 truncate">
              {renewal.vendorName}
            </span>
          </div>
        </div>
      ))}
      
      {renewals.length > 3 && (
        <div className="text-xs text-gray-500 pt-1 border-t border-gray-200">
          +{renewals.length - 3} more contracts
        </div>
      )}
    </div>
  )
}