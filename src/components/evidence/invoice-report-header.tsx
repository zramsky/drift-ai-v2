'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { 
  FileText, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Eye
} from 'lucide-react'
import type { Invoice } from '@/lib/api'

interface InvoiceReportHeaderProps {
  invoice: Invoice
  highestPriority: 'high' | 'medium' | 'low'
  totalVariance: number
  reviewed: boolean
  onViewFullDocuments: () => void
  onToggleReviewed?: () => void
}

export function InvoiceReportHeader({
  invoice,
  highestPriority,
  totalVariance,
  reviewed,
  onViewFullDocuments,
  onToggleReviewed
}: InvoiceReportHeaderProps) {
  const getPriorityBadge = () => {
    switch (highestPriority) {
      case 'high':
        return (
          <Badge className="bg-error text-error-foreground border-error">
            <AlertTriangle className="h-3 w-3 mr-1" />
            HIGH PRIORITY
          </Badge>
        )
      case 'medium':
        return (
          <Badge className="bg-warning text-warning-foreground border-warning">
            <AlertTriangle className="h-3 w-3 mr-1" />
            MEDIUM PRIORITY
          </Badge>
        )
      case 'low':
        return (
          <Badge className="bg-success text-success-foreground border-success">
            <CheckCircle className="h-3 w-3 mr-1" />
            LOW PRIORITY
          </Badge>
        )
    }
  }

  const getVarianceDisplay = () => {
    if (totalVariance === 0) {
      return (
        <div className="flex items-center gap-2 text-success">
          <CheckCircle className="h-4 w-4" />
          <span className="font-semibold">No Variance</span>
        </div>
      )
    }
    
    const isPositive = totalVariance > 0
    return (
      <div className={`flex items-center gap-2 ${isPositive ? 'text-error' : 'text-success'}`}>
        {isPositive ? (
          <TrendingUp className="h-4 w-4" />
        ) : (
          <TrendingDown className="h-4 w-4" />
        )}
        <span className="font-semibold">
          ${Math.abs(totalVariance).toLocaleString()}
        </span>
        <span className="text-sm text-muted-foreground">
          {isPositive ? 'over budget' : 'under budget'}
        </span>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left side - Invoice info and priority */}
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center bg-brand-steel/10 rounded-lg">
              <FileText className="h-6 w-6 text-brand-steel" />
            </div>
            
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h2 className="text-xl font-bold text-foreground">
                  {invoice.invoiceNumber}
                </h2>
                {getPriorityBadge()}
              </div>
              <p className="text-sm text-muted-foreground">
                {invoice.vendor?.name} • {new Date(invoice.invoiceDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            {/* New/Reviewed Toggle */}
            {onToggleReviewed && (
              <Button
                variant={reviewed ? "default" : "outline"}
                size="sm"
                onClick={onToggleReviewed}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                {reviewed ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span className="sm:inline">Reviewed</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4" />
                    <span className="sm:inline">New</span>
                  </>
                )}
              </Button>
            )}
            
            {/* View Full Documents Button - Always accessible per PRD */}
            <Button
              variant="outline"
              size="sm"
              onClick={onViewFullDocuments}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <Eye className="h-4 w-4" />
              <span className="sm:inline">View Full Documents</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Key metrics - Stack on mobile, 3 columns on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Invoice Total */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-medium">Invoice Total</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${invoice.totalAmount.toLocaleString()}
            </p>
          </div>

          {/* Total Variance */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Total Variance</span>
            </div>
            <div className="text-2xl font-bold">
              {getVarianceDisplay()}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Review Status</span>
            </div>
            <div className="text-lg font-semibold">
              {reviewed ? (
                <span className="text-success">Reviewed</span>
              ) : (
                <span className="text-warning">Needs Review</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}