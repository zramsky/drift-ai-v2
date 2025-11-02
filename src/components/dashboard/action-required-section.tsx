'use client'

import { CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * ActionRequiredSection Component
 *
 * Full-width card for items requiring user attention
 * Features:
 * - Title: "Action Required" (text-xl font-semibold)
 * - Empty state: Centered "All caught up" with checkmark icon
 * - Active items: Stacked mini-cards showing:
 *   - Vendor name (bold)
 *   - Issue type + description
 *   - Quick action button (right-aligned, "Review" or "Resolve")
 * - Compact with uniform padding (16-20px per item)
 *
 * Brand compliance: Uses #FF6B35 for action buttons
 */

interface ActionItem {
  id: string
  vendorId: string
  vendorName: string
  issueType: string
  description: string
  actionLabel: 'Review' | 'Resolve'
  onAction: () => void
}

interface ActionRequiredSectionProps {
  items?: ActionItem[]
  isLoading?: boolean
  className?: string
}

export function ActionRequiredSection({
  items = [],
  isLoading = false,
  className
}: ActionRequiredSectionProps) {
  const hasItems = items.length > 0

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-6 ${className || ''}`}
      role="region"
      aria-label="Action required items"
    >
      {/* Section Title */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Action Required
      </h2>

      {/* Loading State */}
      {isLoading && (
        <div className="py-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !hasItems && (
        <div className="py-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <p className="text-base font-medium text-gray-900">All caught up!</p>
          <p className="text-sm text-gray-500 mt-1">
            No items require your attention at this time.
          </p>
        </div>
      )}

      {/* Active Items */}
      {!isLoading && hasItems && (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm hover:bg-gray-50 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:ring-offset-2"
              onClick={item.onAction}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  item.onAction()
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`${item.actionLabel} issue for ${item.vendorName}: ${item.issueType} - ${item.description}`}
            >
              {/* Left: Issue info */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {item.vendorName}
                  </h3>
                  <p className="text-sm text-gray-600 mt-0.5">
                    <span className="font-medium">{item.issueType}:</span>{' '}
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Right: Action button */}
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  item.onAction()
                }}
                className="bg-[#FF6B35] hover:bg-[#FF5722] text-white flex-shrink-0 focus:ring-2 focus:ring-[#FF6B35] focus:ring-offset-2"
                size="sm"
                aria-label={`${item.actionLabel} issue for ${item.vendorName}`}
              >
                {item.actionLabel}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
