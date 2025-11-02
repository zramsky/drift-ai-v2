'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  Search, 
  Filter, 
  Eye,
  ExternalLink,
  DollarSign,
  Calendar,
  FileText,
  TrendingUp
} from 'lucide-react'

interface Finding {
  id: string
  type: 'rate_discrepancy' | 'payment_terms' | 'missing_clause' | 'amount_mismatch' | 'date_inconsistency' | 'quantity_variance'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  invoiceId: string
  vendorName: string
  contractId?: string
  amount?: number
  expectedValue?: any
  actualValue?: any
  confidence: number
  status: 'new' | 'reviewed' | 'resolved' | 'dismissed'
  createdAt: string
  reviewedBy?: string
  reviewedAt?: string
  notes?: string
}

interface FindingsListProps {
  findings: Finding[]
  onViewEvidence?: (findingId: string) => void
  onUpdateStatus?: (findingId: string, status: Finding['status'], notes?: string) => void
  onBulkAction?: (findingIds: string[], action: string) => void
}

const mockFindings: Finding[] = [
  {
    id: 'F001',
    type: 'rate_discrepancy',
    priority: 'high',
    title: 'Rate Exceeds Contract Terms',
    description: 'Hourly rate of $125.00 exceeds contracted rate of $95.00',
    invoiceId: 'INV-2024-001',
    vendorName: 'TechServices LLC',
    contractId: 'CON-2024-089',
    amount: 1200.00,
    expectedValue: 95.00,
    actualValue: 125.00,
    confidence: 96,
    status: 'new',
    createdAt: '2024-01-27T10:30:00Z'
  },
  {
    id: 'F002',
    type: 'amount_mismatch',
    priority: 'medium',
    title: 'Line Item Total Mismatch',
    description: 'Calculated total ($1,850) differs from stated amount ($1,920)',
    invoiceId: 'INV-2024-002',
    vendorName: 'CleanCorp Services',
    amount: 70.00,
    expectedValue: 1850.00,
    actualValue: 1920.00,
    confidence: 92,
    status: 'reviewed',
    createdAt: '2024-01-26T14:15:00Z',
    reviewedBy: 'Sarah Johnson',
    reviewedAt: '2024-01-27T09:00:00Z',
    notes: 'Vendor confirmed error in calculation. Awaiting corrected invoice.'
  },
  {
    id: 'F003',
    type: 'payment_terms',
    priority: 'low',
    title: 'Payment Terms Discrepancy',
    description: 'Invoice shows Net 45 terms, contract specifies Net 30',
    invoiceId: 'INV-2024-003',
    vendorName: 'FoodService Plus',
    contractId: 'CON-2024-001',
    expectedValue: 'Net 30',
    actualValue: 'Net 45',
    confidence: 88,
    status: 'resolved',
    createdAt: '2024-01-25T16:45:00Z',
    reviewedBy: 'Mike Chen',
    reviewedAt: '2024-01-26T11:30:00Z',
    notes: 'Contract amendment allows Net 45 for orders over $5,000.'
  },
  {
    id: 'F004',
    type: 'missing_clause',
    priority: 'medium',
    title: 'Missing Discount Application',
    description: 'Volume discount of 5% not applied to qualifying order',
    invoiceId: 'INV-2024-004',
    vendorName: 'MedSupply Co.',
    contractId: 'CON-2024-002',
    amount: 425.00,
    confidence: 89,
    status: 'new',
    createdAt: '2024-01-27T08:20:00Z'
  }
]

export function FindingsList({ 
  findings = mockFindings, 
  onViewEvidence,
  onUpdateStatus,
  onBulkAction 
}: FindingsListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedFindings, setSelectedFindings] = useState<string[]>([])

  // Filter findings based on search and filters
  const filteredFindings = findings.filter(finding => {
    const matchesSearch = searchTerm === '' || 
      finding.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      finding.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      finding.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      finding.invoiceId.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPriority = priorityFilter === 'all' || finding.priority === priorityFilter
    const matchesStatus = statusFilter === 'all' || finding.status === statusFilter
    const matchesType = typeFilter === 'all' || finding.type === typeFilter
    
    return matchesSearch && matchesPriority && matchesStatus && matchesType
  })

  const getPriorityIcon = (priority: Finding['priority']) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-error" />
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-warning" />
      case 'low':
        return <Info className="h-4 w-4 text-info" />
    }
  }

  const getPriorityBadge = (priority: Finding['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-error/10 text-error border-error/20">High</Badge>
      case 'medium':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Medium</Badge>
      case 'low':
        return <Badge className="bg-info/10 text-info border-info/20">Low</Badge>
    }
  }

  const getStatusBadge = (status: Finding['status']) => {
    switch (status) {
      case 'new':
        return <Badge variant="error">New</Badge>
      case 'reviewed':
        return <Badge variant="warning">Reviewed</Badge>
      case 'resolved':
        return <Badge variant="success">Resolved</Badge>
      case 'dismissed':
        return <Badge variant="secondary">Dismissed</Badge>
    }
  }

  const getTypeIcon = (type: Finding['type']) => {
    switch (type) {
      case 'rate_discrepancy':
      case 'amount_mismatch':
        return <DollarSign className="h-4 w-4" />
      case 'payment_terms':
      case 'date_inconsistency':
        return <Calendar className="h-4 w-4" />
      case 'missing_clause':
        return <FileText className="h-4 w-4" />
      case 'quantity_variance':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const handleSelectFinding = (findingId: string) => {
    setSelectedFindings(prev => 
      prev.includes(findingId) 
        ? prev.filter(id => id !== findingId)
        : [...prev, findingId]
    )
  }

  const handleSelectAll = () => {
    setSelectedFindings(
      selectedFindings.length === filteredFindings.length 
        ? []
        : filteredFindings.map(f => f.id)
    )
  }

  const getTotalAmount = () => {
    return filteredFindings
      .filter(f => f.amount)
      .reduce((sum, f) => sum + (f.amount || 0), 0)
  }

  const getStatistics = () => {
    const total = filteredFindings.length
    const byPriority = {
      high: filteredFindings.filter(f => f.priority === 'high').length,
      medium: filteredFindings.filter(f => f.priority === 'medium').length,
      low: filteredFindings.filter(f => f.priority === 'low').length
    }
    const byStatus = {
      new: filteredFindings.filter(f => f.status === 'new').length,
      reviewed: filteredFindings.filter(f => f.status === 'reviewed').length,
      resolved: filteredFindings.filter(f => f.status === 'resolved').length,
      dismissed: filteredFindings.filter(f => f.status === 'dismissed').length
    }
    return { total, byPriority, byStatus }
  }

  const stats = getStatistics()

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Findings</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-error">{stats.byPriority.high}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-error" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unresolved</p>
                <p className="text-2xl font-bold text-warning">
                  {stats.byStatus.new + stats.byStatus.reviewed}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Impact</p>
                <p className="text-2xl font-bold text-success">
                  ${getTotalAmount().toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Findings Dashboard</CardTitle>
              <CardDescription>
                AI-identified discrepancies and contract compliance issues
              </CardDescription>
            </div>
            {selectedFindings.length > 0 && onBulkAction && (
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {selectedFindings.length} selected
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBulkAction(selectedFindings, 'mark_reviewed')}
                >
                  Mark Reviewed
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBulkAction(selectedFindings, 'resolve')}
                >
                  Resolve
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search findings, vendors, or invoice numbers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="rate_discrepancy">Rate Discrepancy</SelectItem>
                <SelectItem value="amount_mismatch">Amount Mismatch</SelectItem>
                <SelectItem value="payment_terms">Payment Terms</SelectItem>
                <SelectItem value="missing_clause">Missing Clause</SelectItem>
                <SelectItem value="date_inconsistency">Date Issue</SelectItem>
                <SelectItem value="quantity_variance">Quantity Variance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Selection */}
          {filteredFindings.length > 0 && (
            <div className="flex items-center gap-2 mb-4 pb-4 border-b">
              <input
                type="checkbox"
                checked={selectedFindings.length === filteredFindings.length}
                onChange={handleSelectAll}
                className="rounded"
              />
              <span className="text-sm text-muted-foreground">
                Select all {filteredFindings.length} findings
              </span>
            </div>
          )}

          {/* Findings List */}
          <div className="space-y-4">
            {filteredFindings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Findings</h3>
                <p>No findings match your current filters.</p>
              </div>
            ) : (
              filteredFindings.map((finding) => (
                <div
                  key={finding.id}
                  className={`border rounded-lg p-4 transition-all hover:shadow-sm
                    ${selectedFindings.includes(finding.id) ? 'border-primary bg-primary/5' : 'border-border'}
                  `}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedFindings.includes(finding.id)}
                      onChange={() => handleSelectFinding(finding.id)}
                      className="mt-1 rounded"
                    />
                    
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(finding.priority)}
                      {getTypeIcon(finding.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{finding.title}</h4>
                            {getPriorityBadge(finding.priority)}
                            {getStatusBadge(finding.status)}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {finding.description}
                          </p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Invoice</p>
                              <p className="font-medium">{finding.invoiceId}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Vendor</p>
                              <p className="font-medium">{finding.vendorName}</p>
                            </div>
                            {finding.amount && (
                              <div>
                                <p className="text-muted-foreground">Impact</p>
                                <p className="font-medium text-error">
                                  ${finding.amount.toLocaleString()}
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-muted-foreground">Confidence</p>
                              <p className="font-medium">{finding.confidence}%</p>
                            </div>
                          </div>

                          {finding.expectedValue && finding.actualValue && (
                            <div className="mt-3 p-3 bg-surface-secondary rounded-lg">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Expected</p>
                                  <p className="font-medium">{finding.expectedValue}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Actual</p>
                                  <p className="font-medium">{finding.actualValue}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {finding.notes && (
                            <div className="mt-3 p-3 bg-info/10 border border-info/20 rounded-lg">
                              <p className="text-sm text-info font-medium mb-1">Review Notes</p>
                              <p className="text-sm">{finding.notes}</p>
                              {finding.reviewedBy && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  Reviewed by {finding.reviewedBy} on{' '}
                                  {new Date(finding.reviewedAt!).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-xs text-muted-foreground">
                            {new Date(finding.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            {onViewEvidence && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onViewEvidence(finding.id)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Evidence
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`/invoices/${finding.invoiceId}`, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Invoice
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination info */}
          {filteredFindings.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t text-sm text-muted-foreground">
              <div>
                Showing {filteredFindings.length} of {findings.length} findings
              </div>
              <div>
                Total potential savings: ${getTotalAmount().toLocaleString()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}