'use client'

import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, AlertCircle, Info } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { DateRange } from '@/components/ui/date-range-picker'
import { differenceInDays, addDays } from 'date-fns'

interface ContractRenewal {
  id: string
  vendorName: string
  contractId: string
  renewalDate: Date
  daysUntilRenewal: number
  confidenceLevel: 'high' | 'medium' | 'low'
  aiConfidence: number
  derivation: string
  category: string
  value: number
}

interface ContractRenewalsProps {
  dateRange?: DateRange
  className?: string
}

const getConfidenceBadge = (confidence: ContractRenewal['confidenceLevel'], score: number) => {
  switch (confidence) {
    case 'high':
      return (
        <Badge className="bg-success/10 text-success border-success/20 text-xs">
          High ({score}%)
        </Badge>
      )
    case 'medium':
      return (
        <Badge className="bg-warning/10 text-warning border-warning/20 text-xs">
          Medium ({score}%)
        </Badge>
      )
    case 'low':
      return (
        <Badge className="bg-error/10 text-error border-error/20 text-xs">
          Low ({score}%)
        </Badge>
      )
  }
}

const getUrgencyIcon = (days: number) => {
  if (days <= 7) return <AlertCircle className="h-4 w-4 text-error" />
  if (days <= 30) return <Clock className="h-4 w-4 text-warning" />
  return <Calendar className="h-4 w-4 text-info" />
}

export function ContractRenewals({ dateRange, className }: ContractRenewalsProps) {
  const { data: renewals, isLoading, error } = useQuery({
    queryKey: ['contract-renewals', dateRange],
    queryFn: async () => {
      // Fetch contracts and calculate renewals within next 30 days
      const response = await apiClient.getContractRenewals(30)
      if (response.error) {
        throw new Error(response.error)
      }
      
      // Transform API response to ContractRenewal format
      
      const upcomingRenewals: ContractRenewal[] = (response.data || [])
        .map(renewal => ({
          id: renewal.id,
          vendorName: renewal.vendorName,
          contractId: renewal.id,
          renewalDate: new Date(renewal.renewalDate),
          daysUntilRenewal: renewal.daysUntilRenewal,
          confidenceLevel: renewal.confidenceLevel as ContractRenewal['confidenceLevel'],
          aiConfidence: renewal.aiConfidence,
          derivation: `Based on contract terms analysis, vendor history, and renewal pattern recognition (${renewal.aiConfidence}% confidence)`,
          category: renewal.category,
          value: renewal.value
        }))
          .sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal)
          .slice(0, 5) // Show top 5 most urgent
      
      return upcomingRenewals
    },
    refetchInterval: 60000 // Refresh every minute
  })

  if (isLoading) {
    return (
      <Card className={`p-6 ${className || ''}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-surface-secondary rounded mb-4 w-1/2" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-surface-secondary rounded" />
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`p-6 ${className || ''}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-h3 font-heading font-semibold text-foreground">
          Contract Renewals
        </h2>
        <Badge variant="secondary" className="bg-info/10 text-info">
          Next 30 days
        </Badge>
      </div>
      
      {!renewals || renewals.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No contract renewals in the next 30 days</p>
        </div>
      ) : (
        <div className="space-y-4">
          {renewals.map((renewal) => (
            <div
              key={renewal.id}
              className="group relative p-4 rounded-lg bg-surface-secondary/50 border border-border/50 hover:bg-surface-secondary transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getUrgencyIcon(renewal.daysUntilRenewal)}
                  <h3 className="text-sm font-medium text-foreground group-hover:text-brand-steel transition-colors">
                    {renewal.vendorName}
                  </h3>
                  {getConfidenceBadge(renewal.confidenceLevel, renewal.aiConfidence)}
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-foreground">
                    {renewal.daysUntilRenewal} days
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${renewal.value.toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-1">
                  {renewal.category} • Renewal: {renewal.renewalDate.toLocaleDateString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Contract ID: {renewal.contractId}
                </p>
              </div>
              
              {/* AI Confidence Tooltip */}
              <div className="group/tooltip relative">
                <button className="flex items-center gap-1 text-xs text-info hover:text-info/80 transition-colors">
                  <Info className="h-3 w-3" />
                  AI Confidence Derivation
                </button>
                <div className="absolute bottom-full left-0 mb-2 hidden group-hover/tooltip:block z-10">
                  <div className="bg-popover border border-border rounded-lg p-3 shadow-lg min-w-[280px] max-w-[320px]">
                    <div className="text-xs text-foreground leading-relaxed">
                      {renewal.derivation}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {renewals && renewals.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" className="text-brand-steel hover:text-brand-steel/80">
              View all renewals →
            </Button>
            <div className="text-xs text-muted-foreground">
              Total value: ${renewals.reduce((sum, r) => sum + r.value, 0).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}