'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { KPICard } from '@/components/ui/kpi-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Download, 
  Filter, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { mockReconciliationReports, mockInvoices } from '@/lib/mock-data'
import { VarianceTrendlineChart } from '@/components/reports/variance-trendline-chart'
import { VendorRenewalCountdown } from '@/components/reports/vendor-renewal-countdown'
import { RealTimeProgress } from '@/components/ui/real-time-progress'
import { RealTimeIndicator, useRealTimeConnection } from '@/components/ui/real-time-indicator'
import { ExportDialog } from '@/components/exports/export-dialog'

export default function Reports() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [vendorFilter, setVendorFilter] = useState('all')
  const [facilityFilter, setFacilityFilter] = useState('all')
  const [relevanceFilter, setRelevanceFilter] = useState('all')
  const [dateRange, setDateRange] = useState('mtd') // Default to MTD as per PRD
  const [reportType, setReportType] = useState<'facility' | 'vendor'>('facility')
  const [isExporting, setIsExporting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showProgress, setShowProgress] = useState(false)
  const [progressSteps, setProgressSteps] = useState<Array<{
    id: string
    label: string
    status: 'pending' | 'processing' | 'completed' | 'error'
    duration?: number
    error?: string
  }>>([])
  
  // Export dialog state per PRD requirements
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [exportType, setExportType] = useState<'invoices' | 'findings' | 'disputes'>('invoices')
  
  // Real-time connection status
  const { isConnected, lastUpdate, updateLastUpdate } = useRealTimeConnection()

  // Fetch invoice statistics with filters
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['invoice-stats', vendorFilter, dateRange],
    queryFn: async () => {
      const dateRangeObj = getDateRangeFromString(dateRange)
      const response = await apiClient.getInvoiceStats(
        vendorFilter !== 'all' ? vendorFilter : undefined,
        dateRangeObj
      )
      return response.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30000, // Real-time updates
    refetchIntervalInBackground: true
  })
  
  // Fetch vendors for filter dropdown
  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const response = await apiClient.getVendors()
      return response.data || []
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
  
  // Convert date range string to date objects
  const getDateRangeFromString = (range: string) => {
    const now = new Date()
    switch (range) {
      case '7d':
        return { from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), to: now }
      case '30d':
        return { from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), to: now }
      case 'mtd':
        return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now }
      case '3m':
        return { from: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), to: now }
      case '1y':
        return { from: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000), to: now }
      default:
        return { from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), to: now }
    }
  }

  // Mock data for reports - in real app this would come from API
  const reports = mockReconciliationReports.map(report => {
    const invoice = mockInvoices.find(inv => inv.id === report.invoiceId)
    return {
      ...report,
      invoice,
      status: report.hasDiscrepancies ? 'flagged' : 'clean',
      priority: report.hasDiscrepancies 
        ? report.discrepancies[0]?.priority || 'medium'
        : 'none'
    }
  })

  // Filter reports based on search and filters
  const filteredReports = reports.filter(report => {
    const matchesSearch = searchTerm === '' || 
      report.invoice?.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.invoice?.vendor?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter
    const matchesVendor = vendorFilter === 'all' || report.invoice?.vendorId === vendorFilter
    
    // Simulate relevance filtering (would be based on AI confidence or user feedback in real implementation)
    const matchesRelevance = relevanceFilter === 'all' || 
      (relevanceFilter === 'high' && (report.priority === 'high' || report.totalDiscrepancyAmount > 10000)) ||
      (relevanceFilter === 'medium' && report.priority === 'medium') ||
      (relevanceFilter === 'low' && report.priority === 'low')
    
    return matchesSearch && matchesStatus && matchesPriority && matchesVendor && matchesRelevance
  })

  // Enhanced export handlers per PRD requirements
  const handleExportInvoices = () => {
    setExportType('invoices')
    setShowExportDialog(true)
  }

  const handleExportFindings = () => {
    setExportType('findings')
    setShowExportDialog(true)
  }

  const handleExportDisputes = () => {
    setExportType('disputes')
    setShowExportDialog(true)
  }

  // Get current export filters
  const getCurrentFilters = () => {
    const filters: any = {}
    
    const dateRangeObj = getDateRangeFromString(dateRange)
    if (dateRangeObj.from) {
      filters.start_date = dateRangeObj.from.toISOString().split('T')[0]
    }
    if (dateRangeObj.to) {
      filters.end_date = dateRangeObj.to.toISOString().split('T')[0]
    }
    
    if (vendorFilter !== 'all') {
      filters.vendor_id = vendorFilter
    }
    
    if (priorityFilter !== 'all') {
      filters.priority = priorityFilter
    }
    
    if (relevanceFilter !== 'all') {
      filters.relevance = relevanceFilter
    }
    
    return filters
  }

  // Legacy export handler (keep for backward compatibility)
  const handleExport = async () => {
    handleExportInvoices() // Default to invoices export
  }
  
  const handleGenerateReport = async () => {
    setIsGenerating(true)
    
    // Simulate real-time report generation
    await new Promise(resolve => setTimeout(resolve, 4000))
    
    setIsGenerating(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'clean': return <CheckCircle className="h-4 w-4 text-success" />
      case 'flagged': return <AlertTriangle className="h-4 w-4 text-warning" />
      case 'rejected': return <XCircle className="h-4 w-4 text-error" />
      default: return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-error/10 text-error border-error/20">High</Badge>
      case 'medium':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Medium</Badge>
      case 'low':
        return <Badge className="bg-info/10 text-info border-info/20">Low</Badge>
      default:
        return <Badge variant="secondary">None</Badge>
    }
  }

  return (
    <div className="min-h-screen">
      {/* Reports Header */}
      <DashboardHeader
        title="Reports & Analytics"
        description="Comprehensive insights into your contract reconciliation performance and findings."
      />
      
      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          
          {/* Report Type Selection */}
          <Card className="p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {reportType === 'facility' ? 'Facility Reports' : 'Vendor Reports'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {reportType === 'facility' 
                    ? 'Comprehensive facility-wide analysis with date, vendor, priority, and relevance filters. Default window: MTD.'
                    : 'Vendor-specific reports with variance trendlines and renewal countdown. Export scoped to selected vendor.'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={reportType === 'facility' ? 'default' : 'outline'}
                  onClick={() => setReportType('facility')}
                  size="sm"
                >
                  Facility Reports
                </Button>
                <Button
                  variant={reportType === 'vendor' ? 'default' : 'outline'}
                  onClick={() => setReportType('vendor')}
                  size="sm"
                >
                  Vendor Reports
                </Button>
              </div>
            </div>
          </Card>
          
          {/* KPI Cards */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="TOTAL PROCESSED"
              value={stats?.total || 0}
              icon={FileText}
              variant="info"
              trend={{
                value: 12.3,
                label: "this month",
                isPositive: true
              }}
            />
            
            <KPICard
              title="TOTAL SAVINGS"
              value={`$${(stats?.totalSavings || 0).toLocaleString()}`}
              icon={DollarSign}
              variant="success"
              trend={{
                value: 8.7,
                label: "from last month",
                isPositive: true
              }}
            />
            
            <KPICard
              title="FLAGGED ITEMS"
              value={stats?.flagged || 0}
              icon={AlertTriangle}
              variant="warning"
              trend={{
                value: -15.2,
                label: "improvement",
                isPositive: true
              }}
            />
            
            <KPICard
              title="SUCCESS RATE"
              value="94.2%"
              icon={TrendingUp}
              variant="success"
              trend={{
                value: 2.1,
                label: "accuracy",
                isPositive: true
              }}
            />
          </div>

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Reconciliation Reports</CardTitle>
                  <CardDescription>
                    Detailed analysis of invoice reconciliation results and findings
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleGenerateReport}
                    disabled={isGenerating}
                    variant="outline"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Generating...
                      </div>
                    ) : (
                      'Generate Report'
                    )}
                  </Button>
                  
                  {/* Enhanced Export Menu per PRD requirements */}
                  <div className="relative inline-block text-left">
                    <Button 
                      onClick={() => {
                        // Show dropdown menu or default to invoices
                        handleExportInvoices()
                      }}
                      disabled={isExporting || filteredReports.length === 0}
                      className="self-start sm:self-auto"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                    </Button>
                    
                    {/* Quick export buttons for different types */}
                    <div className="flex gap-1 ml-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleExportInvoices}
                        disabled={isExporting}
                        title="Export Invoices CSV"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleExportFindings}
                        disabled={isExporting}
                        title="Export Findings CSV"
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleExportDisputes}
                        disabled={isExporting}
                        title="Export Disputes CSV (High Priority)"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Enhanced Filter Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="relative sm:col-span-2 lg:col-span-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by invoice or vendor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="mtd">Current Month (MTD)</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="3m">Last 3 months</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
                
                {reportType === 'facility' ? (
                  <Select value={vendorFilter} onValueChange={setVendorFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Vendors</SelectItem>
                      {vendors?.map(vendor => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select value={vendorFilter} onValueChange={setVendorFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors?.map(vendor => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="none">No Issues</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Second row of filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="clean">Clean</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={relevanceFilter} onValueChange={setRelevanceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by relevance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Relevance</SelectItem>
                    <SelectItem value="high">High Relevance</SelectItem>
                    <SelectItem value="medium">Medium Relevance</SelectItem>
                    <SelectItem value="low">Low Relevance</SelectItem>
                  </SelectContent>
                </Select>
                
                {reportType === 'facility' && (
                  <Select value={facilityFilter} onValueChange={setFacilityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by facility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Facilities</SelectItem>
                      <SelectItem value="main">Main Facility</SelectItem>
                      <SelectItem value="branch1">Branch Office 1</SelectItem>
                      <SelectItem value="branch2">Branch Office 2</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Results Table */}
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Discrepancy</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No reports match your current filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {report.invoice?.invoiceNumber}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {report.id}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {report.invoice?.vendor?.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(report.status)}
                              <span className="capitalize">{report.status}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getPriorityBadge(report.priority)}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              ${(report.invoice?.totalAmount || 0).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            {report.totalDiscrepancyAmount > 0 ? (
                              <div className="font-medium text-error">
                                ${report.totalDiscrepancyAmount.toLocaleString()}
                              </div>
                            ) : (
                              <div className="text-muted-foreground">—</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                              {report.hasDiscrepancies && (
                                <Button variant="outline" size="sm">
                                  Review
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {filteredReports.length > 0 && (
                <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                  <div>
                    Showing {filteredReports.length} of {reports.length} reports
                  </div>
                  <div>
                    Total potential savings: ${filteredReports.reduce((sum, r) => sum + r.totalDiscrepancyAmount, 0).toLocaleString()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Vendor-Specific Charts and Analysis */}
          {reportType === 'vendor' && vendorFilter !== 'all' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <VarianceTrendlineChart
                vendorName={vendors?.find(v => v.id === vendorFilter)?.name || 'Selected Vendor'}
                data={generateMockVarianceData()}
                totalVariance={filteredReports.reduce((sum, r) => sum + r.totalDiscrepancyAmount, 0)}
                trendDirection={Math.random() > 0.5 ? 'up' : 'down'}
                trendPercentage={Math.random() * 20 + 5}
              />
              
              <VendorRenewalCountdown
                vendorId={vendorFilter}
                vendorName={vendors?.find(v => v.id === vendorFilter)?.name || 'Selected Vendor'}
              />
            </div>
          )}
          
          {/* Facility-Wide Analytics */}
          {reportType === 'facility' && (
            <Card>
              <CardHeader>
                <CardTitle>Facility-Wide Variance Analysis</CardTitle>
                <CardDescription>
                  Comprehensive analysis across all vendors and contracts for the selected time period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="text-center p-4 bg-surface-secondary/50 rounded-lg">
                    <div className="text-2xl font-bold text-success">
                      ${filteredReports.reduce((sum, r) => sum + r.totalDiscrepancyAmount, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Total Variance Identified</div>
                  </div>
                  
                  <div className="text-center p-4 bg-surface-secondary/50 rounded-lg">
                    <div className="text-2xl font-bold text-info">
                      {filteredReports.filter(r => r.hasDiscrepancies).length}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Invoices with Issues</div>
                  </div>
                  
                  <div className="text-center p-4 bg-surface-secondary/50 rounded-lg">
                    <div className="text-2xl font-bold text-warning">
                      {Math.round((filteredReports.filter(r => r.hasDiscrepancies).length / Math.max(filteredReports.length, 1)) * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Issue Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Progress Indicator for Real-time Operations */}
      <RealTimeProgress
        title={isGenerating ? "Generating Report" : "Exporting Data"}
        description={isGenerating 
          ? "Analyzing contract data and generating comprehensive reports with real-time variance calculations..."
          : "Processing filtered data and generating CSV export with progress indicators..."}
        steps={progressSteps}
        isVisible={showProgress}
        onComplete={() => {
          setShowProgress(false)
          setIsExporting(false)
          setIsGenerating(false)
          setProgressSteps([])
        }}
        onCancel={() => {
          setShowProgress(false)
          setIsExporting(false)
          setIsGenerating(false)
          setProgressSteps([])
        }}
        autoClose={true}
      />
      
      {/* Enhanced Export Dialog per PRD requirements */}
      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        exportType={exportType}
        initialFilters={getCurrentFilters()}
        vendors={vendors?.map(v => ({ id: v.id, name: v.name })) || []}
      />
    </div>
  )
}

// Helper function to generate mock variance data for charts
function generateMockVarianceData() {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]
  
  return months.map(month => {
    const baseVariance = Math.floor(Math.random() * 15000) + 5000
    const baseline = Math.floor(Math.random() * 10000) + 8000
    const savings = Math.floor(Math.random() * 5000) + 1000
    
    return {
      month,
      variance: baseVariance,
      baseline,
      savings
    }
  })
}