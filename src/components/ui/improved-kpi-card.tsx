import { cn } from '@/lib/utils'
import { LucideIcon, CheckCircle, Clock, AlertTriangle, TrendingUp, Info } from 'lucide-react'
import React from 'react'

interface ImprovedKPICardProps {
  title: string
  value: string | number
  description?: string
  variant?: 'success' | 'processing' | 'brand' | 'attention' | 'neutral'
  size?: 'compact' | 'default' | 'large'
  className?: string
  interactive?: boolean
  onClick?: () => void
  'aria-label'?: string
}

export function ImprovedKPICard({
  title,
  value,
  description,
  variant = 'neutral',
  size = 'default',
  className,
  interactive = false,
  onClick,
  'aria-label': ariaLabel
}: ImprovedKPICardProps) {
  
  const getVariantStyles = () => {
    const baseStyles = "bg-white border-l-4 shadow-sm border border-gray-200 transition-all duration-200"
    
    switch (variant) {
      case 'success':
        return cn(baseStyles, "bg-gradient-to-br from-emerald-50/50 to-white border-l-emerald-600")
      case 'processing':
        return cn(baseStyles, "bg-gradient-to-br from-amber-50/50 to-white border-l-amber-600")
      case 'brand':
        return cn(baseStyles, "bg-gradient-to-br from-orange-50/50 to-white border-l-orange-600")
      case 'attention':
        return cn(baseStyles, "bg-gradient-to-br from-rose-50/50 to-white border-l-rose-600")
      default:
        return cn(baseStyles, "bg-gradient-to-br from-slate-50/50 to-white border-l-slate-600")
    }
  }

  const getTextColor = () => {
    switch (variant) {
      case 'success': return 'text-emerald-700'
      case 'processing': return 'text-amber-700'
      case 'brand': return 'text-orange-700'
      case 'attention': return 'text-rose-700'
      default: return 'text-slate-700'
    }
  }

  const getIcon = (): LucideIcon => {
    switch (variant) {
      case 'success': return CheckCircle
      case 'processing': return Clock
      case 'brand': return TrendingUp
      case 'attention': return AlertTriangle
      default: return Info
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'compact':
        return {
          container: 'h-[120px] p-4',
          value: 'text-2xl sm:text-3xl',
          spacing: 'space-y-1'
        }
      case 'large':
        return {
          container: 'h-[180px] p-6',
          value: 'text-3xl sm:text-4xl',
          spacing: 'space-y-3'
        }
      default:
        return {
          container: 'h-[160px] p-6',
          value: 'text-2xl sm:text-3xl lg:text-4xl',
          spacing: 'space-y-2'
        }
    }
  }

  const variantStyles = getVariantStyles()
  const textColor = getTextColor()
  const Icon = getIcon()
  const sizeStyles = getSizeStyles()
  const cardId = React.useId()

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return (val / 1000000).toFixed(1) + 'M'
      } else if (val >= 1000) {
        return (val / 1000).toFixed(1) + 'K'
      }
      return val.toLocaleString()
    }
    return val
  }

  return (
    <div
      className={cn(
        variantStyles,
        sizeStyles.container,
        "rounded-lg flex flex-col justify-between",
        interactive && "cursor-pointer hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500",
        !interactive && "hover:shadow-md",
        className
      )}
      onClick={interactive ? onClick : undefined}
      role={interactive ? "button" : "region"}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick?.() : undefined}
      aria-label={ariaLabel || `${title}: ${value}`}
    >
      {/* Header with title and icon */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Icon 
            className={cn("h-4 w-4 flex-shrink-0", textColor)} 
            aria-hidden="true"
          />
          <h3 
            className="text-xs font-medium text-gray-600 uppercase tracking-wide truncate"
            id={`${cardId}-title`}
          >
            {title}
          </h3>
        </div>
      </div>

      {/* Main value */}
      <div 
        className={cn(
          "font-bold leading-tight truncate",
          sizeStyles.value,
          textColor
        )}
        id={`${cardId}-value`}
        aria-live="polite"
      >
        {formatValue(value)}
      </div>

      {/* Description */}
      {description && (
        <div 
          className="text-sm text-gray-500 truncate"
          id={`${cardId}-description`}
        >
          {description}
        </div>
      )}
    </div>
  )
}