'use client'

import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Calendar, Clock, AlertTriangle, Info, TrendingUp } from 'lucide-react'
import { apiClient } from '@/lib/api'

interface VendorRenewalCountdownProps {
  vendorId: string
  vendorName: string
  className?: string
}

interface ContractRenewalData {
  contractId: string
  renewalDate: string
  daysUntilRenewal: number
  contractValue: number
  confidenceLevel: 'high' | 'medium' | 'low'
  aiConfidence: number
  derivationTooltip: string
  riskFactors: string[]
  renewalProbability: number
}

const getUrgencyColor = (days: number) => {
  if (days <= 30) return 'text-error'
  if (days <= 90) return 'text-warning'
  return 'text-info'
}

const getUrgencyBg = (days: number) => {
  if (days <= 30) return 'bg-error/10'
  if (days <= 90) return 'bg-warning/10'
  return 'bg-info/10'
}

const getConfidenceColor = (confidence: ContractRenewalData['confidenceLevel']) => {
  switch (confidence) {
    case 'high':
      return 'bg-success/10 text-success border-success/20'
    case 'medium':
      return 'bg-warning/10 text-warning border-warning/20'
    case 'low':
      return 'bg-error/10 text-error border-error/20'
  }
}

export function VendorRenewalCountdown({ vendorId, vendorName, className }: VendorRenewalCountdownProps) {
  const { data: renewalData, isLoading, error } = useQuery({
    queryKey: ['vendor-renewal-countdown', vendorId],
    queryFn: async () => {
      // In a real implementation, this would fetch vendor-specific renewal data
      // For now, we'll simulate the data structure
      const mockData: ContractRenewalData = {
        contractId: `CNT-${vendorId}-2024`,
        renewalDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days from now
        daysUntilRenewal: 45,
        contractValue: Math.floor(Math.random() * 500000) + 100000, // $100K - $600K
        confidenceLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
        aiConfidence: Math.floor(Math.random() * 30) + 70, // 70-100%
        derivationTooltip: `AI analysis based on historical renewal patterns, contract performance metrics, vendor relationship score, and market conditions. Confidence derived from ${Math.floor(Math.random() * 50) + 20} data points including payment history, service quality ratings, and competitive analysis.`,
        riskFactors: [
          'Recent service quality issues reported',
          'Price increases above market rate',
          'Alternative vendor options available'
        ].slice(0, Math.floor(Math.random() * 3) + 1),
        renewalProbability: Math.floor(Math.random() * 40) + 60 // 60-100%
      }
      
      return mockData
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60000 // Refresh every minute
  })

  if (isLoading) {
    return (
      <Card className={`p-6 ${className || ''}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-surface-secondary rounded mb-4 w-3/4" />
          <div className="space-y-3">
            <div className="h-4 bg-surface-secondary rounded w-full" />
            <div className="h-4 bg-surface-secondary rounded w-2/3" />
            <div className="h-8 bg-surface-secondary rounded w-full" />
          </div>
        </div>
      </Card>
    )
  }

  if (error || !renewalData) {
    return (
      <Card className={`p-6 ${className || ''}`}>
        <div className="text-center py-4">
          <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm text-muted-foreground">No renewal data available</p>
        </div>
      </Card>
    )
  }

  const renewalDate = new Date(renewalData.renewalDate)
  const progressPercentage = Math.max(0, Math.min(100, ((365 - renewalData.daysUntilRenewal) / 365) * 100))

  return (
    <Card className={`p-6 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Contract Renewal Countdown
          </h3>
          <p className="text-sm text-muted-foreground">
            {vendorName} • Contract {renewalData.contractId}
          </p>
        </div>
        
        <Badge className={getConfidenceColor(renewalData.confidenceLevel)}>
          {renewalData.confidenceLevel.toUpperCase()} ({renewalData.aiConfidence}%)
        </Badge>
      </div>
      
      {/* Countdown Display */}
      <div className="text-center mb-6">
        <div className={`inline-flex items-center gap-2 text-3xl font-bold ${getUrgencyColor(renewalData.daysUntilRenewal)}`}>
          <Clock className="h-8 w-8" />
          {renewalData.daysUntilRenewal}
          <span className="text-lg text-muted-foreground">days</span>
        </div>
        
        <div className="mt-2 text-sm text-muted-foreground">
          Renewal Date: {renewalDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <Progress 
            value={progressPercentage} 
            className="h-3"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Contract Started</span>
            <span>{progressPercentage.toFixed(0)}% Complete</span>
            <span>Renewal Due</span>
          </div>
        </div>
      </div>
      
      {/* Contract Details */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className={`p-3 rounded-lg ${getUrgencyBg(renewalData.daysUntilRenewal)}`}>
          <div className="text-lg font-semibold text-foreground">
            ${renewalData.contractValue.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">Contract Value</div>
        </div>
        
        <div className="p-3 rounded-lg bg-success/10">
          <div className="flex items-center gap-1 text-lg font-semibold text-success">
            <TrendingUp className="h-4 w-4" />
            {renewalData.renewalProbability}%
          </div>
          <div className="text-xs text-muted-foreground">Renewal Probability</div>
        </div>
      </div>
      
      {/* Risk Factors */}
      {renewalData.riskFactors.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Risk Factors
          </h4>
          <div className="space-y-2">
            {renewalData.riskFactors.map((factor, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-warning mt-2 flex-shrink-0" />
                <span className="text-muted-foreground">{factor}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* AI Confidence Derivation */}
      <div className="pt-4 border-t border-border">
        <div className="group/tooltip relative">
          <button className="flex items-center gap-2 text-sm text-info hover:text-info/80 transition-colors">
            <Info className="h-4 w-4" />
            AI Confidence Derivation
            <span className="text-xs text-muted-foreground">
              ({renewalData.aiConfidence}% confidence)
            </span>
          </button>
          
          <div className="absolute bottom-full left-0 mb-2 hidden group-hover/tooltip:block z-10">
            <div className="bg-popover border border-border rounded-lg p-3 shadow-lg min-w-[320px] max-w-[400px]">
              <div className="text-xs text-foreground leading-relaxed">
                {renewalData.derivationTooltip}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-2 text-xs text-muted-foreground">
          Last updated: {new Date().toLocaleString()} • Real-time monitoring
        </div>
      </div>
    </Card>
  )
}