'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Building2, TrendingUp, TrendingDown, AlertCircle, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { DateRange } from '@/components/ui/date-range-picker'

interface TopOffender {
  id: string
  name: string
  issues: number
  varianceAmount: number
  savings: string
  riskLevel: 'high' | 'medium' | 'low'
  category: string
  trend: {
    direction: 'up' | 'down' | 'stable'
    percentage: number
    period: string
  }
  monthlyVariances: number[] // Last 12 months for trendline
}

interface TopOffendersProps {
  dateRange?: DateRange
  className?: string
}

// Mock data will be replaced with real API data

const getRiskColor = (risk: TopOffender['riskLevel']) => {
  switch (risk) {
    case 'high':
      return 'bg-error text-error-foreground'
    case 'medium':
      return 'bg-warning text-warning-foreground'
    case 'low':
      return 'bg-success text-success-foreground'
  }
}

const getRiskIcon = (risk: TopOffender['riskLevel']) => {
  switch (risk) {
    case 'high':
      return AlertCircle
    case 'medium':
      return TrendingUp
    case 'low':
      return TrendingUp
  }
}

export function TopOffenders({ dateRange, className }: TopOffendersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showTrendlines, setShowTrendlines] = useState(false)
  const displayCount = isExpanded ? 10 : 3
  
  // Ultra-minimal mode for simplified dashboard
  const isUltraMinimal = className?.includes('ultra-minimal-action')
  
  const { data: topOffenders, isLoading, error } = useQuery({
    queryKey: ['top-offenders', dateRange, displayCount],
    queryFn: async () => {
      const validDateRange = dateRange?.from && dateRange?.to ? { from: dateRange.from, to: dateRange.to } : undefined;
      const response = await apiClient.getTopOffenders(10, validDateRange)
      if (response.error) {
        throw new Error(response.error)
      }
      
      // Transform API response to TopOffender format
      const offendersData: TopOffender[] = (response.data || []).map(offender => {
        // Calculate trend from monthly variances
        const lastThreeMonths = offender.monthlyVariances.slice(-3)
        const previousThreeMonths = offender.monthlyVariances.slice(-6, -3)
        const lastAvg = lastThreeMonths.reduce((a, b) => a + b, 0) / 3
        const prevAvg = previousThreeMonths.reduce((a, b) => a + b, 0) / 3
        
        const trendPercentage = prevAvg > 0 ? ((lastAvg - prevAvg) / prevAvg) * 100 : 0
        let trendDirection: 'up' | 'down' | 'stable' = 'stable'
        
        if (Math.abs(trendPercentage) > 5) {
          trendDirection = trendPercentage > 0 ? 'up' : 'down'
        }
        
        return {
          id: offender.id,
          name: offender.name,
          issues: offender.issuesCount,
          varianceAmount: offender.totalVariance,
          savings: `$${offender.totalVariance.toLocaleString()}`,
          riskLevel: offender.riskLevel as TopOffender['riskLevel'],
          category: offender.category,
          trend: {
            direction: trendDirection,
            percentage: Math.abs(trendPercentage),
            period: '3 months'
          },
          monthlyVariances: offender.monthlyVariances
        }
      })
      
      return offendersData
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60000, // Refresh every minute
    refetchIntervalInBackground: true
  })
  
  const getTrendIcon = (direction: TopOffender['trend']['direction']) => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-3 w-3" />
      case 'down':
        return <TrendingDown className="h-3 w-3" />
      default:
        return <BarChart3 className="h-3 w-3" />
    }
  }
  
  const getTrendColor = (direction: TopOffender['trend']['direction']) => {
    switch (direction) {
      case 'up':
        return 'text-error'
      case 'down':
        return 'text-success'
      default:
        return 'text-muted-foreground'
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
              {[...Array(3)].map((_, i) => (
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
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-surface-secondary rounded" />
            ))}
          </div>
        </div>
      </Card>
    )
  }

  // Ultra-minimal top offenders for simplified dashboard
  if (isUltraMinimal) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 min-h-[400px]">
        <div className="text-center mb-16">
          <h2 className="text-lg font-medium text-gray-900 mb-3">
            Top Variance Vendors
          </h2>
          <p className="text-xs text-gray-500 font-light">
            Largest absolute confirmed variance
          </p>
        </div>
        
        {!topOffenders || topOffenders.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <BarChart3 className="h-20 w-20 mx-auto mb-8 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-3">No data available</h3>
            <p className="text-sm text-gray-500">Upload contracts and invoices to see analysis</p>
          </div>
        ) : (
          <div className="space-y-6 max-w-3xl mx-auto">
            {topOffenders.slice(0, 3).map((offender, index) => (
              <div
                key={offender.id}
                className="group flex items-center justify-between p-8 rounded-xl bg-gray-50/50 hover:bg-gray-100/70 transition-all duration-300 cursor-pointer border border-transparent hover:border-gray-200"
              >
                <div className="flex items-center space-x-6 flex-1 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 group-hover:text-red-600 transition-colors text-base mb-1 truncate">
                      {offender.name}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {offender.issues} issues • {offender.category}
                    </p>
                  </div>
                </div>
                <div className="text-right ml-8 flex-shrink-0">
                  <div className="font-mono font-semibold text-lg text-gray-900">
                    {offender.savings}
                  </div>
                </div>
              </div>
            ))}
            
            {topOffenders.length > 3 && (
              <div className="text-center pt-8">
                <button className="text-sm text-orange-600 hover:text-orange-700 font-medium py-3 px-6 rounded-lg hover:bg-orange-50 transition-colors">
                  View Top 10
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">
          Top Variance Vendors
        </h2>
        <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200 w-fit text-xs sm:text-sm">
          Largest Confirmed Variance
        </Badge>
      </div>
      
      {!topOffenders || topOffenders.length === 0 ? (
        <div className="text-center py-8 sm:py-12 text-muted-foreground">
          <BarChart3 className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 sm:mb-6 opacity-40" />
          <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">No data available</h3>
          <p className="text-sm px-4">Upload contracts and invoices to see analysis</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {topOffenders.slice(0, displayCount).map((offender, index) => {
            const RiskIcon = getRiskIcon(offender.riskLevel)
            const TrendIcon = getTrendIcon(offender.trend.direction)
            
            return (
              <div
                key={offender.id}
                className="group relative p-3 sm:p-4 rounded-lg bg-surface-secondary/50 border border-border/50 hover:bg-surface-secondary transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                  {/* Mobile: Rank badge and title row */}
                  <div className="flex items-center sm:flex-col sm:items-center space-x-3 sm:space-x-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-orange text-white text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    {/* Mobile trend indicator - visible on small screens */}
                    <div className={`flex items-center gap-1 text-xs sm:hidden ${getTrendColor(offender.trend.direction)}`}>
                      {TrendIcon}
                      <span>
                        {offender.trend.direction === 'stable' ? 'Stable' : 
                         `${offender.trend.percentage.toFixed(1)}%`}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <h3 className="text-sm font-medium text-foreground group-hover:text-brand-steel transition-colors line-clamp-1">
                            {offender.name}
                          </h3>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={`${getRiskColor(offender.riskLevel)} text-xs w-fit`}
                        >
                          <RiskIcon className="h-3 w-3 mr-1" />
                          {offender.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                      
                      {/* Desktop trend indicator - hidden on small screens */}
                      <div className={`hidden sm:flex items-center gap-1 text-xs ${getTrendColor(offender.trend.direction)}`}>
                        {TrendIcon}
                        <span>
                          {offender.trend.direction === 'stable' ? 'Stable' : 
                           `${offender.trend.percentage.toFixed(1)}%`}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                      {offender.category}
                    </p>
                    
                    {/* Trendline visualization - simplified for mobile */}
                    {showTrendlines && (
                      <div className="mb-3 p-2 bg-surface-primary rounded">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs text-muted-foreground mb-2">
                          <span>12-Month Variance Trend</span>
                          <span className="font-mono">${offender.varianceAmount.toLocaleString()} total</span>
                        </div>
                        <div className="flex items-end space-x-1 h-6 sm:h-8">
                          {offender.monthlyVariances.map((value, idx) => {
                            const maxValue = Math.max(...offender.monthlyVariances)
                            const height = (value / maxValue) * 100
                            return (
                              <div
                                key={idx}
                                className={`flex-1 rounded-sm ${
                                  idx >= 9 ? 'bg-warning' : 'bg-muted-foreground/30'
                                }`}
                                style={{ height: `${Math.max(height, 10)}%` }}
                                title={`Month ${idx + 1}: $${value.toLocaleString()}`}
                              />
                            )
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Mobile-optimized metrics layout */}
                    <div className="grid grid-cols-3 gap-3 sm:flex sm:items-center sm:space-x-4">
                      <div>
                        <span className="text-xs text-muted-foreground block">Issues</span>
                        <div className="text-sm font-semibold text-error">
                          {offender.issues}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">Variance</span>
                        <div className="text-sm font-semibold text-warning line-clamp-1">
                          {offender.savings}
                        </div>
                      </div>
                      <div className="sm:hidden">
                        <span className="text-xs text-muted-foreground block">Trend</span>
                        <div className={`text-sm font-semibold ${getTrendColor(offender.trend.direction)}`}>
                          {offender.trend.direction === 'stable' ? 'Stable' : 
                           `${offender.trend.direction === 'up' ? '↗' : '↘'} ${offender.trend.percentage.toFixed(1)}%`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      
      <div className="mt-4 sm:mt-6 pt-4 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-brand-steel hover:text-brand-steel/80 font-medium transition-colors p-0 min-h-[44px] sm:min-h-auto self-start"
            >
              {isExpanded ? (
                <><ChevronUp className="h-4 w-4 mr-1" />Show Top 3</>
              ) : (
                <><ChevronDown className="h-4 w-4 mr-1" />View Top 10</>
              )}
            </Button>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground hidden sm:inline">•</span>
              <Button 
                variant="ghost" 
                className="text-sm text-brand-steel hover:text-brand-steel/80 font-medium transition-colors p-0 min-h-[44px] sm:min-h-auto self-start"
              >
                View detailed analysis →
              </Button>
            </div>
          </div>
          
          {topOffenders && topOffenders.length > 0 && (
            <div className="text-xs text-muted-foreground font-mono">
              Total: ${topOffenders.slice(0, displayCount).reduce((sum, o) => sum + o.varianceAmount, 0).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}