'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Download, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  X,
  Settings,
  Database
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

export interface ExportFilters {
  start_date?: string;
  end_date?: string;
  vendor_id?: string;
  priority?: string;
  relevance?: string;
  finding_type?: string;
  read_status?: boolean;
  include_not_relevant?: boolean;
  chunk_size?: number;
}

export interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  exportType: 'invoices' | 'findings' | 'disputes';
  initialFilters?: ExportFilters;
  vendors?: Array<{ id: string; name: string }>;
}

interface ExportProgress {
  export_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  total_records: number;
  processed_records: number;
  current_step: string;
  estimated_completion?: string;
  error?: string;
  created_at: string;
  updated_at: string;
}

export function ExportDialog({
  isOpen,
  onClose,
  exportType,
  initialFilters = {},
  vendors = []
}: ExportDialogProps) {
  const [filters, setFilters] = useState<ExportFilters>(initialFilters)
  const [currentExportId, setCurrentExportId] = useState<string | null>(null)
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [validationResult, setValidationResult] = useState<any>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  const { toast } = useToast()

  // Get export type configuration
  const getExportConfig = () => {
    switch (exportType) {
      case 'invoices':
        return {
          title: 'Export Invoices CSV',
          description: 'Export invoice summary data with vendor information, totals, and variance amounts.',
          icon: FileText,
          filename: `invoices_${new Date().toISOString().split('T')[0]}.csv`
        }
      case 'findings':
        return {
          title: 'Export Findings CSV', 
          description: 'Export detailed findings with priority, relevance, and evidence references. Default: Relevant + Pending findings.',
          icon: AlertTriangle,
          filename: `findings_${new Date().toISOString().split('T')[0]}.csv`
        }
      case 'disputes':
        return {
          title: 'Export Disputes CSV',
          description: 'Export high priority findings only with dispute drafts and evidence references.',
          icon: XCircle,
          filename: `disputes_${new Date().toISOString().split('T')[0]}.csv`
        }
      default:
        return {
          title: 'Export CSV',
          description: 'Export data to CSV format.',
          icon: Download,
          filename: `export_${new Date().toISOString().split('T')[0]}.csv`
        }
    }
  }

  const config = getExportConfig()

  // Validate export parameters
  const validateExport = useMutation({
    mutationFn: async () => {
      const response = await apiClient.validateExportParams(exportType, filters)
      if (response.error) {
        throw new Error(response.error)
      }
      return response.data
    },
    onSuccess: (data) => {
      setValidationResult(data)
    },
    onError: (error) => {
      toast({
        title: 'Validation Error',
        description: error instanceof Error ? error.message : 'Failed to validate export parameters',
        variant: 'destructive'
      })
    }
  })

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async () => {
      setIsExporting(true)
      
      let result: { blob: Blob; exportId: string }
      
      if (exportType === 'invoices') {
        result = await apiClient.exportInvoicesCSV(filters)
      } else if (exportType === 'findings') {
        result = await apiClient.exportFindingsCSV(filters)
      } else {
        result = await apiClient.exportDisputesCSV(filters)
      }
      
      return result
    },
    onSuccess: ({ blob, exportId }) => {
      setCurrentExportId(exportId)
      
      // Download the file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = config.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Export Completed',
        description: `${config.title.replace('Export ', '')} has been downloaded successfully.`,
        variant: 'default'
      })
      
      // Reset state after a delay
      setTimeout(() => {
        setIsExporting(false)
        setCurrentExportId(null)
        setExportProgress(null)
        onClose()
      }, 2000)
    },
    onError: (error) => {
      setIsExporting(false)
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to export CSV',
        variant: 'destructive'
      })
    }
  })

  // Poll for export progress
  const { data: progressData } = useQuery({
    queryKey: ['export-progress', currentExportId],
    queryFn: async () => {
      if (!currentExportId) return null
      const response = await apiClient.getExportProgress(currentExportId)
      return response.data
    },
    enabled: !!currentExportId && isExporting,
    refetchInterval: 1000, // Poll every second
    refetchIntervalInBackground: true
  })

  useEffect(() => {
    if (progressData) {
      setExportProgress(progressData)
    }
  }, [progressData])

  // Cancel export
  const cancelExport = useMutation({
    mutationFn: async () => {
      if (!currentExportId) throw new Error('No active export')
      const response = await apiClient.cancelExport(currentExportId)
      if (response.error) {
        throw new Error(response.error)
      }
      return response.data
    },
    onSuccess: () => {
      setIsExporting(false)
      setCurrentExportId(null)
      setExportProgress(null)
      toast({
        title: 'Export Cancelled',
        description: 'The export has been cancelled.',
        variant: 'default'
      })
    },
    onError: (error) => {
      toast({
        title: 'Cancel Failed',
        description: error instanceof Error ? error.message : 'Failed to cancel export',
        variant: 'destructive'
      })
    }
  })

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setValidationResult(null) // Reset validation when filters change
  }

  const handleExport = () => {
    // Validate first
    validateExport.mutate()
    
    // Start export after validation
    setTimeout(() => {
      exportMutation.mutate()
    }, 500)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-muted-foreground animate-pulse" />
      case 'processing':
        return <Database className="h-4 w-4 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'cancelled':
        return <X className="h-4 w-4 text-orange-500" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const formatEstimatedTime = (seconds: number) => {
    if (seconds < 60) return `${Math.ceil(seconds)} seconds`
    if (seconds < 3600) return `${Math.ceil(seconds / 60)} minutes`
    return `${Math.ceil(seconds / 3600)} hours`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <config.icon className="h-5 w-5" />
            {config.title}
          </DialogTitle>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Progress */}
          {isExporting && exportProgress && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(exportProgress.status)}
                    <CardTitle className="text-lg">Export In Progress</CardTitle>
                  </div>
                  <Badge variant={
                    exportProgress.status === 'completed' ? 'default' :
                    exportProgress.status === 'failed' ? 'destructive' :
                    exportProgress.status === 'cancelled' ? 'secondary' : 'outline'
                  }>
                    {exportProgress.status}
                  </Badge>
                </div>
                <CardDescription>
                  {exportProgress.current_step}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{exportProgress.progress}%</span>
                  </div>
                  <Progress value={exportProgress.progress} className="w-full" />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Records:</span>{' '}
                      {exportProgress.processed_records.toLocaleString()} / {exportProgress.total_records.toLocaleString()}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Export ID:</span>{' '}
                      <code className="text-xs">{exportProgress.export_id.slice(0, 8)}...</code>
                    </div>
                  </div>

                  {exportProgress.error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800">{exportProgress.error}</p>
                    </div>
                  )}

                  {exportProgress.status === 'processing' && (
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelExport.mutate()}
                        disabled={cancelExport.isPending}
                      >
                        {cancelExport.isPending ? 'Cancelling...' : 'Cancel Export'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Validation Results */}
          {validationResult && (
            <Card className={validationResult.valid ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  {validationResult.valid ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium">
                      {validationResult.valid ? 'Export Ready' : 'Validation Failed'}
                    </h4>
                    {validationResult.valid ? (
                      <div className="text-sm text-muted-foreground mt-1">
                        <p>Estimated {validationResult.estimated_records.toLocaleString()} records</p>
                        <p>Duration: ~{formatEstimatedTime(validationResult.estimated_duration_seconds)}</p>
                      </div>
                    ) : (
                      <ul className="text-sm text-red-700 mt-1 list-disc list-inside">
                        {validationResult.errors.map((error: string, index: number) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filter Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Export Filters</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <Settings className="h-4 w-4 mr-2" />
                {showAdvanced ? 'Basic' : 'Advanced'} Options
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Range */}
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={filters.start_date || ''}
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={filters.end_date || ''}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                />
              </div>

              {/* Vendor Filter (if applicable) */}
              {exportType !== 'disputes' && vendors.length > 0 && (
                <div className="md:col-span-2">
                  <Label htmlFor="vendor">Vendor</Label>
                  <Select value={filters.vendor_id || ''} onValueChange={(value) => handleFilterChange('vendor_id', value || undefined)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All vendors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All vendors</SelectItem>
                      {vendors.map(vendor => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Findings/Disputes specific filters */}
              {(exportType === 'findings' || exportType === 'disputes') && (
                <>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={filters.priority || ''} onValueChange={(value) => handleFilterChange('priority', value || undefined)}>
                      <SelectTrigger>
                        <SelectValue placeholder={exportType === 'disputes' ? 'High (fixed)' : 'All priorities'} />
                      </SelectTrigger>
                      <SelectContent>
                        {exportType === 'disputes' ? (
                          <SelectItem value="High">High (Disputes only)</SelectItem>
                        ) : (
                          <>
                            <SelectItem value="">All priorities</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="finding_type">Finding Type</Label>
                    <Select value={filters.finding_type || ''} onValueChange={(value) => handleFilterChange('finding_type', value || undefined)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All types</SelectItem>
                        <SelectItem value="Price">Price</SelectItem>
                        <SelectItem value="Fee">Fee</SelectItem>
                        <SelectItem value="OutsideTerm">Outside Term</SelectItem>
                        <SelectItem value="Duplicate">Duplicate</SelectItem>
                        <SelectItem value="DiscountMissing">Discount Missing</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Findings specific: Relevance filter */}
              {exportType === 'findings' && (
                <>
                  <div>
                    <Label htmlFor="relevance">Relevance</Label>
                    <Select value={filters.relevance || ''} onValueChange={(value) => handleFilterChange('relevance', value || undefined)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Relevant + Pending (default)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Relevant + Pending</SelectItem>
                        <SelectItem value="Relevant">Relevant only</SelectItem>
                        <SelectItem value="Pending">Pending only</SelectItem>
                        <SelectItem value="Not relevant">Not relevant only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="include_not_relevant"
                      checked={filters.include_not_relevant || false}
                      onChange={(e) => handleFilterChange('include_not_relevant', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="include_not_relevant" className="text-sm">
                      Include "Not relevant" findings
                    </Label>
                  </div>
                </>
              )}

              {/* Invoice specific filters */}
              {exportType === 'invoices' && (
                <div>
                  <Label htmlFor="read_status">Read Status</Label>
                  <Select 
                    value={filters.read_status === true ? 'true' : filters.read_status === false ? 'false' : ''} 
                    onValueChange={(value) => handleFilterChange('read_status', value === '' ? undefined : value === 'true')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="true">Read</SelectItem>
                      <SelectItem value="false">Unread</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Advanced Options */}
              {showAdvanced && (
                <div className="md:col-span-2">
                  <Label htmlFor="chunk_size">Chunk Size (records per batch)</Label>
                  <Input
                    id="chunk_size"
                    type="number"
                    min={100}
                    max={5000}
                    step={100}
                    value={filters.chunk_size || 1000}
                    onChange={(e) => handleFilterChange('chunk_size', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Smaller chunks = more frequent progress updates but slower overall speed
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            {isExporting ? 'Export in Progress...' : 'Cancel'}
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={isExporting || validateExport.isPending || (validationResult && !validationResult.valid)}
          >
            {isExporting ? (
              <>
                <Database className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : validateExport.isPending ? (
              'Validating...'
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}