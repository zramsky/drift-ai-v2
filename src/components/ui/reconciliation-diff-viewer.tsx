'use client'

import { useState } from 'react'
import { Card } from './card'
import { Badge } from './badge'
import { Button } from './button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'
import { ConfidenceIndicator } from './confidence-indicator'
import { 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown,
  ArrowRight,
  FileText,
  Receipt,
  Zap,
  Eye,
  RotateCcw
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DiffItem {
  field: string
  label: string
  contractValue: string | number
  invoiceValue: string | number
  discrepancy: {
    type: 'missing' | 'mismatch' | 'extra' | 'variance'
    severity: 'low' | 'medium' | 'high' | 'critical'
    impact: number
    description: string
    confidence: number
  }
  status: 'flagged' | 'reviewed' | 'approved' | 'rejected'
}

interface ReconciliationDiffViewerProps {
  contractData: Record<string, any>
  invoiceData: Record<string, any>
  differences: DiffItem[]
  onItemStatusChange?: (field: string, status: DiffItem['status']) => void
  onBulkApprove?: (fields: string[]) => void
  className?: string
}

export function ReconciliationDiffViewer({
  contractData,
  invoiceData,
  differences,
  onItemStatusChange,
  onBulkApprove,
  className
}: ReconciliationDiffViewerProps) {
  const [activeView, setActiveView] = useState<'overview' | 'detailed' | 'side-by-side'>('overview')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [filterSeverity, setFilterSeverity] = useState<string>('all')

  const criticalDiffs = differences.filter(d => d.discrepancy.severity === 'critical')
  const highDiffs = differences.filter(d => d.discrepancy.severity === 'high')
  const mediumDiffs = differences.filter(d => d.discrepancy.severity === 'medium')
  const lowDiffs = differences.filter(d => d.discrepancy.severity === 'low')

  const totalImpact = differences.reduce((sum, d) => sum + d.discrepancy.impact, 0)
  const flaggedCount = differences.filter(d => d.status === 'flagged').length
  const reviewedCount = differences.filter(d => d.status === 'reviewed').length

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />
      case 'medium':
        return <TrendingDown className="h-4 w-4" />
      case 'low':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <CheckCircle className="h-4 w-4" />
    }
  }

  const filteredDifferences = filterSeverity === 'all' 
    ? differences 
    : differences.filter(d => d.discrepancy.severity === filterSeverity)

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{criticalDiffs.length + highDiffs.length}</p>
              <p className="text-sm text-muted-foreground">Critical Issues</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingDown className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{mediumDiffs.length}</p>
              <p className="text-sm text-muted-foreground">Medium Priority</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{reviewedCount}</p>
              <p className="text-sm text-muted-foreground">Reviewed</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">${totalImpact.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Total Impact</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Priority Items */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          High Priority Discrepancies
        </h3>
        <div className="space-y-3">
          {[...criticalDiffs, ...highDiffs].slice(0, 5).map(renderDiffItem)}
          {criticalDiffs.length + highDiffs.length > 5 && (
            <Button 
              variant="outline" 
              onClick={() => setActiveView('detailed')}
              className="w-full"
            >
              View All {criticalDiffs.length + highDiffs.length} High Priority Items
            </Button>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => onBulkApprove?.(lowDiffs.map(d => d.field))}
            disabled={lowDiffs.length === 0}
          >
            Auto-approve {lowDiffs.length} Low Priority Items
          </Button>
          <Button 
            variant="outline"
            onClick={() => setActiveView('detailed')}
          >
            Review All Items
          </Button>
          <Button 
            variant="outline"
            onClick={() => setActiveView('side-by-side')}
          >
            Compare Documents
          </Button>
        </div>
      </Card>
    </div>
  )

  const renderDetailed = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filter by severity:</span>
          <div className="flex gap-1">
            {['all', 'critical', 'high', 'medium', 'low'].map(severity => (
              <Button
                key={severity}
                variant={filterSeverity === severity ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterSeverity(severity)}
              >
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
                {severity !== 'all' && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {differences.filter(d => d.discrepancy.severity === severity).length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedItems([])}
            disabled={selectedItems.length === 0}
          >
            Clear Selection
          </Button>
          <Button
            size="sm"
            onClick={() => onBulkApprove?.(selectedItems)}
            disabled={selectedItems.length === 0}
          >
            Approve Selected ({selectedItems.length})
          </Button>
        </div>
      </div>

      {/* Detailed List */}
      <div className="space-y-3">
        {filteredDifferences.map(renderDiffItem)}
      </div>
    </div>
  )

  const renderSideBySide = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Contract Data */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold">Contract Terms</h3>
          <Badge variant="outline">Reference</Badge>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {Object.entries(contractData).map(([key, value]) => (
            <div key={key} className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-900">{key}</div>
              <div className="text-sm font-mono mt-1">{String(value)}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Invoice Data */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold">Invoice Data</h3>
          <Badge variant="outline">Extracted</Badge>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {Object.entries(invoiceData).map(([key, value]) => {
            const hasDiff = differences.some(d => d.field === key)
            return (
              <div 
                key={key} 
                className={cn(
                  "p-3 rounded-lg",
                  hasDiff ? "bg-red-50 border border-red-200" : "bg-green-50"
                )}
              >
                <div className={cn(
                  "text-sm font-medium",
                  hasDiff ? "text-red-900" : "text-green-900"
                )}>
                  {key}
                  {hasDiff && <AlertTriangle className="inline h-3 w-3 ml-1" />}
                </div>
                <div className="text-sm font-mono mt-1">{String(value)}</div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )

  const renderDiffItem = (diff: DiffItem) => {
    const isSelected = selectedItems.includes(diff.field)

    return (
      <Card 
        key={diff.field}
        className={cn(
          "p-4 border transition-all duration-200",
          getSeverityColor(diff.discrepancy.severity),
          isSelected && "ring-2 ring-blue-500"
        )}
      >
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedItems(prev => [...prev, diff.field])
                  } else {
                    setSelectedItems(prev => prev.filter(f => f !== diff.field))
                  }
                }}
                className="rounded border-gray-300"
              />
              
              {getSeverityIcon(diff.discrepancy.severity)}
              
              <div>
                <h4 className="font-medium">{diff.label}</h4>
                <p className="text-sm opacity-80">{diff.discrepancy.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={diff.discrepancy.severity === 'critical' ? 'destructive' : 'secondary'}>
                {diff.discrepancy.severity}
              </Badge>
              
              <ConfidenceIndicator 
                score={diff.discrepancy.confidence} 
                variant="compact"
                size="sm"
              />

              {diff.discrepancy.impact > 0 && (
                <Badge variant="outline" className="text-xs">
                  ${diff.discrepancy.impact.toFixed(2)}
                </Badge>
              )}
            </div>
          </div>

          {/* Value Comparison */}
          <div className="flex items-center gap-4 p-3 bg-white/50 rounded-lg">
            <div className="flex-1">
              <div className="text-xs font-medium opacity-70 mb-1">Contract</div>
              <div className="font-mono text-sm">{String(diff.contractValue)}</div>
            </div>
            
            <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            
            <div className="flex-1">
              <div className="text-xs font-medium opacity-70 mb-1">Invoice</div>
              <div className="font-mono text-sm">{String(diff.invoiceValue)}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-current/10">
            <div className="flex items-center gap-2">
              <Badge 
                variant={
                  diff.status === 'approved' ? 'default' :
                  diff.status === 'rejected' ? 'destructive' :
                  diff.status === 'reviewed' ? 'secondary' :
                  'outline'
                }
                className="text-xs"
              >
                {diff.status}
              </Badge>
              
              <span className="text-xs text-muted-foreground">
                Type: {diff.discrepancy.type}
              </span>
            </div>

            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onItemStatusChange?.(diff.field, 'approved')}
                disabled={diff.status === 'approved'}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Approve
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onItemStatusChange?.(diff.field, 'reviewed')}
                disabled={diff.status === 'reviewed'}
              >
                <Eye className="h-3 w-3 mr-1" />
                Review
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onItemStatusChange?.(diff.field, 'flagged')}
                className="text-red-600 hover:text-red-700"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Flag
              </Button>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Contract vs Invoice Reconciliation</h2>
          <Badge variant={flaggedCount > 0 ? 'destructive' : 'default'}>
            {differences.length} differences found
          </Badge>
        </div>

        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed</TabsTrigger>
            <TabsTrigger value="side-by-side">Side by Side</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-auto">
        {activeView === 'overview' && renderOverview()}
        {activeView === 'detailed' && renderDetailed()}
        {activeView === 'side-by-side' && renderSideBySide()}
      </div>
    </div>
  )
}