'use client'

import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import React from 'react'

/**
 * DashboardKPICard Component
 *
 * Clean, minimal KPI card with consistent height (140-160px)
 * Features:
 * - Large bold metric (text-3xl to text-4xl)
 * - Short label (text-sm)
 * - Optional small icon top-left (16x16px)
 * - Minimal 1px borders (gray-200)
 * - Auto-wraps responsively (1 col mobile → 2 col tablet → 4 col desktop)
 * - Hover state with shadow-md
 *
 * Brand compliance: Uses #FF6B35 for focus rings and active states
 */

interface DashboardKPICardProps {
  /**
   * The main metric label (e.g., "Total Savings", "Invoices Processed")
   */
  title: string

  /**
   * The primary value to display (e.g., "$127,500", "1,261")
   */
  value: string | number

  /**
   * Optional secondary description (e.g., "All-time cost reductions")
   */
  description?: string

  /**
   * Optional icon to display in top-left corner (16x16px)
   */
  icon?: LucideIcon

  /**
   * Whether the card should be interactive (clickable)
   */
  interactive?: boolean

  /**
   * Click handler for interactive cards
   */
  onClick?: () => void

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * ARIA label for accessibility
   */
  'aria-label'?: string
}

export function DashboardKPICard({
  title,
  value,
  description,
  icon: Icon,
  interactive = false,
  onClick,
  className,
  'aria-label': ariaLabel
}: DashboardKPICardProps) {
  const cardId = React.useId()

  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return (val / 1000000).toFixed(1) + 'M'
      } else if (val >= 1000) {
        return (val / 1000).toFixed(1) + 'K'
      }
      return val.toLocaleString()
    }
    return String(val)
  }

  return (
    <div
      className={cn(
        // Base styles
        'bg-white rounded-lg border border-gray-200 p-6 transition-all duration-200',
        // Fixed height for consistency
        'h-[140px] sm:h-[150px] lg:h-[160px]',
        // Layout
        'flex flex-col justify-between',
        // Hover state
        'hover:shadow-md',
        // Interactive states
        interactive && 'cursor-pointer hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]',
        interactive && 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6B35]',
        className
      )}
      onClick={interactive ? onClick : undefined}
      role={interactive ? 'button' : 'region'}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick?.()
          : undefined
      }
      aria-label={ariaLabel || `${title}: ${value}`}
    >
      {/* Top section: Icon + Title */}
      <div className="flex items-center gap-2">
        {Icon && (
          <Icon
            className="h-4 w-4 text-gray-500 flex-shrink-0"
            aria-hidden="true"
          />
        )}
        <h3
          className="text-sm font-medium text-gray-600 truncate"
          id={`${cardId}-title`}
        >
          {title}
        </h3>
      </div>

      {/* Middle section: Main value */}
      <div
        className={cn(
          'font-bold leading-none truncate',
          'text-3xl sm:text-3xl lg:text-4xl',
          'text-gray-900'
        )}
        id={`${cardId}-value`}
        aria-live="polite"
      >
        {formatValue(value)}
      </div>

      {/* Bottom section: Description */}
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
