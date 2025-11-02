'use client'

import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Clock, DollarSign, FileWarning, ExternalLink, CheckCircle } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { DateRange } from '@/components/ui/date-range-picker'

interface AttentionItem {
  id: string
  type: 'overdue' | 'expiring' | 'discrepancy' | 'review'
  title: string
  description: string
  value?: string
  daysUntil?: number
  priority: 'high' | 'medium' | 'low'
  invoiceId?: string
  contractId?: string
  actionRequired: boolean
}

interface AttentionRequiredProps {
  dateRange?: DateRange
  className?: string
}

// Mock attention items will be replaced with real data from API

const getItemIcon = (type: AttentionItem['type']) => {
  switch (type) {
    case 'overdue':
      return AlertTriangle
    case 'expiring':
      return Clock
    case 'discrepancy':
      return DollarSign
    case 'review':
      return FileWarning
    default:
      return AlertTriangle
  }
}

const getItemVariant = (type: AttentionItem['type']) => {
  switch (type) {
    case 'overdue':
      return 'error' as const
    case 'expiring':
      return 'warning' as const
    case 'discrepancy':
      return 'error' as const
    case 'review':
      return 'info' as const
    default:
      return 'info' as const
  }
}

export function AttentionRequired({ dateRange, className }: AttentionRequiredProps) {
  // Ultra-minimal mode for simplified dashboard
  const isUltraMinimal = className?.includes('ultra-minimal-action')
  const { data: attentionItems, isLoading, refetch, error } = useQuery({
    queryKey: ['attention-required', dateRange],
    queryFn: async () => {
      const validDateRange = dateRange?.from && dateRange?.to ? { from: dateRange.from, to: dateRange.to } : undefined;
      const response = await apiClient.getAttentionItems(validDateRange)
      if (response.error) {
        throw new Error(response.error)
      }
      
      // Transform API response to AttentionItem format
      const items: AttentionItem[] = (response.data || []).map(item => ({
        id: item.id,
        type: item.type as AttentionItem['type'],
        title: item.title,
        description: item.description,
        value: item.amount ? `$${item.amount.toLocaleString()}` : undefined,
        priority: item.priority as AttentionItem['priority'],
        invoiceId: item.invoiceId,
        contractId: item.contractId,
        actionRequired: true
      }))
      
      return items
    },
    staleTime: 30 * 1000, // 30 seconds for attention items (need to be current)
    refetchInterval: 30000, // Refresh every 30 seconds
    refetchIntervalInBackground: true
  })
  
  const handleAction = async (item: AttentionItem, action: 'review' | 'approve' | 'dismiss') => {
    // Handle different actions based on item type and action
    console.log('Action:', action, 'Item:', item)
    
    // In a real implementation, this would call appropriate API endpoints
    // For now, just trigger a refetch to simulate state change
    if (action === 'dismiss') {
      // Remove item from attention list
      refetch()
    }
  }
  
  if (isLoading) {
    if (isUltraMinimal) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 min-h-[400px]">
          <div className="animate-pulse text-center space-y-8">
            <div className="h-5 bg-gray-200 rounded w-36 mx-auto" />
            <div className="h-3 bg-gray-100 rounded w-24 mx-auto" />
            <div className="space-y-6 max-w-3xl mx-auto">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between items-center p-8 bg-gray-50 rounded-xl">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-48" />
                    <div className="h-3 bg-gray-100 rounded w-32" />
                  </div>
                  <div className="h-5 bg-gray-200 rounded w-20 ml-8" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }
    return (
      <Card className={`p-6 ${className || ''}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-surface-secondary rounded mb-4 w-1/2" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-surface-secondary rounded" />
            ))}
          </div>
        </div>
      </Card>
    )
  }

  // Ultra-minimal action section - EXTREME SIMPLIFICATION
  if (isUltraMinimal) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 min-h-[400px]">
        <div className="text-center mb-16">
          <h2 className="text-lg font-medium text-gray-900 mb-3">
            Attention Required
          </h2>
          <p className="text-xs text-gray-500 font-light">
            {attentionItems?.length || 0} items need review
          </p>
        </div>
        
        {!attentionItems || attentionItems.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <CheckCircle className="h-20 w-20 mx-auto mb-8 text-gray-300" />
            <div className="mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                SETUP
              </span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Upload your first contract</h3>
            <p className="text-sm text-gray-500 mb-6">Start by uploading a vendor contract to begin reconciliation</p>
            <button className="text-sm text-orange-600 hover:text-orange-700 font-medium py-2 px-4 rounded-lg hover:bg-orange-50 transition-colors">
              Upload Contract →
            </button>
          </div>
        ) : (
          <div className="space-y-6 max-w-3xl mx-auto">
            {attentionItems.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="group flex items-center justify-between p-8 rounded-xl bg-gray-50/50 hover:bg-gray-100/70 transition-all duration-300 cursor-pointer border border-transparent hover:border-gray-200"
                onClick={() => handleAction(item, 'review')}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors text-base mb-2 truncate">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-1">
                    {item.description}
                  </p>
                </div>
                {item.value && (
                  <div className="text-right ml-8 flex-shrink-0">
                    <div className="font-mono font-semibold text-lg text-gray-900">
                      {item.value}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {attentionItems.length > 6 && (
              <div className="text-center pt-8">
                <button className="text-sm text-orange-600 hover:text-orange-700 font-medium py-3 px-6 rounded-lg hover:bg-orange-50 transition-colors">
                  View {attentionItems.length - 6} more items
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
  
  return (
    <Card className={`p-4 sm:p-6 lg:p-8 bg-card border-border ${className || ''}`}>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">
          Attention Required
        </h2>
        <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200 text-xs sm:text-sm">
          {attentionItems?.length || 0} items
        </Badge>
      </div>
      
      {!attentionItems || attentionItems.length === 0 ? (
        <div className="text-center py-8 sm:py-12 text-muted-foreground">
          <FileWarning className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 sm:mb-6 opacity-40" />
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
              SETUP
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">Upload your first contract</h3>
          <p className="text-sm px-4 mb-6">Start by uploading a vendor contract to begin reconciliation</p>
          <Button 
            variant="outline" 
            className="text-orange-600 border-orange-600 hover:bg-orange-50 hover:text-orange-700"
          >
            Upload Contract →
          </Button>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {attentionItems.map((item) => {
            const Icon = getItemIcon(item.type)
            const variant = getItemVariant(item.type)
            
            return (
              <div
                key={item.id}
                className="group relative p-3 sm:p-4 rounded-lg bg-surface-secondary/50 border border-border/50 hover:bg-surface-secondary transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 ${
                    variant === 'error' ? 'bg-error/10 text-error' :
                    variant === 'warning' ? 'bg-warning/10 text-warning' :
                    'bg-info/10 text-info'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Mobile-first layout: stack title and badge */}
                    <div className="space-y-2 sm:space-y-0 sm:flex sm:items-start sm:justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <h3 className="text-sm font-medium text-foreground group-hover:text-brand-steel transition-colors line-clamp-2">
                            {item.title}
                          </h3>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs w-fit ${
                              item.priority === 'high' ? 'bg-error/10 text-error' :
                              item.priority === 'medium' ? 'bg-warning/10 text-warning' :
                              'bg-info/10 text-info'
                            }`}
                          >
                            {item.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                      
                      {/* Value/days info - stack on mobile */}
                      <div className="flex flex-row sm:flex-col sm:text-right gap-2 sm:gap-0 flex-shrink-0">
                        {item.value && (
                          <span className="text-sm font-mono text-foreground">
                            {item.value}
                          </span>
                        )}
                        {item.daysUntil && (
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            {item.daysUntil} days
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Action buttons - mobile optimized */}
                    {item.actionRequired && (
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAction(item, 'review')}
                          className="h-8 sm:h-7 px-3 text-xs min-h-[44px] sm:min-h-[28px]"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Review
                        </Button>
                        
                        {item.type === 'discrepancy' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAction(item, 'approve')}
                            className="h-8 sm:h-7 px-3 text-xs min-h-[44px] sm:min-h-[28px]"
                          >
                            Approve
                          </Button>
                        )}
                        
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleAction(item, 'dismiss')}
                          className="h-8 sm:h-7 px-3 text-xs text-muted-foreground hover:text-foreground min-h-[44px] sm:min-h-[28px]"
                        >
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      
      <div className="mt-4 sm:mt-6 pt-4 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <Button 
            variant="ghost" 
            className="text-sm text-brand-steel hover:text-brand-steel/80 font-medium transition-colors p-0 min-h-[44px] sm:min-h-auto self-start"
          >
            View all issues →
          </Button>
          {attentionItems && attentionItems.length > 0 && (
            <div className="text-xs text-muted-foreground">
              {attentionItems.filter(i => i.priority === 'high').length} high priority
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}