'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Building2, MapPin, Phone, Mail, Globe, Calendar, DollarSign, FileText, Edit, Upload, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DashboardKPICard } from '@/components/dashboard/dashboard-kpi-card'
import { apiClient } from '@/lib/api'
import { mockInvoices, mockContracts, mockReconciliationReports } from '@/lib/mock-data'
import { EditVendorDialog } from '@/components/vendors/edit-vendor-dialog'
import { ReplaceContractDialog } from '@/components/vendors/replace-contract-dialog'
import { format } from 'date-fns'

interface VendorDetailPageProps {
  params: {
    id: string
  }
}

export default function VendorDetailPage({ params }: VendorDetailPageProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('summary')
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isReplaceContractOpen, setIsReplaceContractOpen] = useState(false)

  // Fetch vendor details
  const { data: vendor, isLoading, error, refetch } = useQuery({
    queryKey: ['vendor', params.id],
    queryFn: async () => {
      const response = await apiClient.getVendor(params.id)
      if (response.error) {
        throw new Error(response.error)
      }
      return response.data
    },
  })

  // Fetch vendor contracts
  const { data: vendorContracts = [] } = useQuery({
    queryKey: ['contracts', params.id],
    queryFn: async () => {
      const response = await apiClient.getContracts(params.id)
      if (response.error) {
        throw new Error(response.error)
      }
      return response.data || []
    },
  })

  // Fetch vendor invoices
  const { data: vendorInvoices = [] } = useQuery({
    queryKey: ['invoices', params.id],
    queryFn: async () => {
      const response = await apiClient.getInvoices(params.id)
      if (response.error) {
        throw new Error(response.error)
      }
      return response.data || []
    },
  })

  // Get the active contract
  const activeContract = vendorContracts.find(c => c.status === 'active')

  // Mock data filtered for this vendor (fallback)
  const mockVendorInvoices = mockInvoices.filter(inv => inv.vendorId === params.id)
  const mockVendorContracts = mockContracts.filter(contract => contract.vendorId === params.id)
  const vendorReports = mockReconciliationReports.filter(report => 
    (vendorInvoices.length > 0 ? vendorInvoices : mockVendorInvoices).some(inv => inv.id === report.invoiceId)
  )

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">Loading vendor details...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-error mb-2">Vendor Not Found</h3>
              <p className="text-muted-foreground mb-6">
                The requested vendor could not be found.
              </p>
              <Button onClick={() => router.push('/vendors')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Vendors
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/vendors')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center bg-brand-steel/10 rounded-lg">
                  <Building2 className="h-6 w-6 text-brand-steel" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {vendor.name}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {vendor.canonicalName}
                  </p>
                </div>
                <Badge variant={vendor.active ? 'success' : 'secondary'}>
                  {vendor.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Vendor Details
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            {/* Summary Tab */}
            <TabsContent value="summary" className="space-y-6">
              {/* KPI Cards */}
              <div className="dashboard-grid-kpi">
                <DashboardKPICard
                  title="Total Invoices"
                  value={vendor.totalInvoices}
                  description="Total processed"
                  icon={Building2}
                  aria-label="Total number of invoices processed for this vendor"
                />

                <DashboardKPICard
                  title="Total Savings"
                  value={`$${vendor.totalSavings.toLocaleString()}`}
                  description="Cost reductions"
                  icon={DollarSign}
                  aria-label="Total savings found for this vendor"
                />

                <DashboardKPICard
                  title="Discrepancies"
                  value={vendor.totalDiscrepancies}
                  description="Items flagged"
                  icon={AlertCircle}
                  aria-label="Number of invoice discrepancies detected"
                />

                <DashboardKPICard
                  title="Success Rate"
                  value={`${vendor.totalInvoices > 0 ? Math.round(((vendor.totalInvoices - vendor.totalDiscrepancies) / vendor.totalInvoices) * 100) : 0}%`}
                  description="Clean invoices"
                  icon={CheckCircle}
                  aria-label="Percentage of invoices processed without issues"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-stretch">
                {/* Vendor Information */}
                <Card className="flex flex-col h-full">
                  <CardHeader className="flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          Vendor Information
                        </CardTitle>
                        <CardDescription>
                          Basic details and business information
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-4">
                    <div className="grid gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Primary Vendor Name
                        </label>
                        <p className="text-foreground mt-1 font-medium">
                          {vendor.name}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          DBA/Display Name
                        </label>
                        <p className="text-foreground mt-1">
                          {vendor.canonicalName || 'Same as primary name'}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Category
                        </label>
                        <p className="text-foreground mt-1">
                          {vendor.businessDescription || 'Not specified'}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Status
                        </label>
                        <div className="mt-1">
                          <Badge variant={vendor.active ? 'success' : 'secondary'}>
                            {vendor.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Created
                          </label>
                          <p className="text-foreground mt-1 text-sm">
                            {format(new Date(vendor.createdAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Last Updated
                          </label>
                          <p className="text-foreground mt-1 text-sm">
                            {format(new Date(vendor.updatedAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contract Information */}
                <Card className="flex flex-col h-full">
                  <CardHeader className="flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Contract Information
                        </CardTitle>
                        <CardDescription>
                          Current active contract details
                        </CardDescription>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsReplaceContractOpen(true)}
                        disabled={!activeContract}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Replace
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    {activeContract ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-900">Active Contract</p>
                            <p className="text-sm text-green-700">{activeContract.fileName}</p>
                          </div>
                        </div>

                        <div className="grid gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Effective Date
                            </label>
                            <p className="text-foreground mt-1">
                              {format(new Date(activeContract.effectiveDate), 'MMM dd, yyyy')}
                            </p>
                          </div>

                          {activeContract.renewalDate && (
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">
                                Renewal/End Date
                              </label>
                              <p className="text-foreground mt-1">
                                {format(new Date(activeContract.renewalDate), 'MMM dd, yyyy')}
                              </p>
                            </div>
                          )}

                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Contract Status
                            </label>
                            <div className="mt-1">
                              <Badge 
                                variant={
                                  activeContract.status === 'active' ? 'success' :
                                  activeContract.status === 'needs_review' ? 'warning' :
                                  activeContract.status === 'expired' ? 'error' : 'secondary'
                                }
                              >
                                {activeContract.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Last Processed
                            </label>
                            <p className="text-foreground mt-1 text-sm">
                              {format(new Date(activeContract.updatedAt), 'MMM dd, yyyy HH:mm')}
                            </p>
                          </div>
                        </div>

                        {activeContract.extractedText && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Contract Summary
                            </label>
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg border text-sm">
                              {activeContract.extractedText.substring(0, 200)}...
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <div className="text-gray-600 mb-4">
                          <p className="font-medium">No Active Contract</p>
                          <p className="text-sm">Upload a contract to get started</p>
                        </div>
                        <Button onClick={() => setIsReplaceContractOpen(true)}>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Contract
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Latest invoices and reconciliation results
                    </CardDescription>
                  </div>
                  {((vendorInvoices.length > 0 ? vendorInvoices : mockVendorInvoices).length > 6) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const tabsElement = document.querySelector('[role="tablist"]');
                        const invoicesTab = Array.from(tabsElement?.querySelectorAll('[role="tab"]') || [])
                          .find(tab => tab.textContent === 'Invoices');
                        if (invoicesTab) {
                          (invoicesTab as HTMLElement).click();
                        }
                      }}
                    >
                      View All
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {(vendorInvoices.length > 0 ? vendorInvoices : mockVendorInvoices).length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="font-medium">No invoices yet</p>
                      <p className="text-sm">Invoice activity will appear here</p>
                    </div>
                  ) : (
                    <div className="rounded-md border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[140px]">Invoice Date</TableHead>
                            <TableHead>Invoice Number</TableHead>
                            <TableHead className="text-right w-[120px]">Amount</TableHead>
                            <TableHead className="w-[120px]">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(vendorInvoices.length > 0 ? vendorInvoices : mockVendorInvoices)
                            .slice(0, 6)
                            .map((invoice) => (
                              <TableRow
                                key={invoice.id}
                                className="cursor-pointer hover:bg-gray-50"
                                onClick={() => router.push(`/invoices/${invoice.id}`)}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    router.push(`/invoices/${invoice.id}`)
                                  }
                                }}
                              >
                                <TableCell className="font-medium">
                                  {format(new Date(invoice.invoiceDate), 'MMM dd, yyyy')}
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{invoice.invoiceNumber}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {invoice.lineItems?.length || 0} items
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  ${invoice.totalAmount.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  })}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      invoice.status === 'reconciled' ? 'success' :
                                      invoice.status === 'flagged' ? 'warning' :
                                      invoice.status === 'rejected' ? 'error' : 'secondary'
                                    }
                                  >
                                    {invoice.status === 'reconciled' ? 'Clean' :
                                     invoice.status === 'flagged' ? 'Flagged' :
                                     invoice.status === 'rejected' ? 'Rejected' :
                                     invoice.status === 'approved' ? 'Approved' : 'Pending'}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Invoices Tab */}
            <TabsContent value="invoices" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Invoice History</CardTitle>
                  <CardDescription>
                    All invoices for {vendor.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {vendorInvoices.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No invoices found for this vendor.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {vendorInvoices.map((invoice) => (
                        <div key={invoice.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-surface-secondary/50 transition-colors">
                          <div className="space-y-1">
                            <h4 className="font-medium">
                              {invoice.invoiceNumber}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Invoice Date: {new Date(invoice.invoiceDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Due Date: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'Not specified'}
                            </p>
                          </div>
                          <div className="text-right space-y-2">
                            <p className="font-semibold">
                              ${invoice.totalAmount.toLocaleString()}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={
                                  invoice.status === 'reconciled' ? 'success' :
                                  invoice.status === 'flagged' ? 'warning' :
                                  invoice.status === 'rejected' ? 'error' : 'secondary'
                                }
                              >
                                {invoice.status}
                              </Badge>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reconciliation Reports</CardTitle>
                  <CardDescription>
                    Detailed reconciliation results for {vendor.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {vendorReports.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No reconciliation reports found for this vendor.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {vendorReports.map((report) => {
                        const relatedInvoice = vendorInvoices.find(inv => inv.id === report.invoiceId)
                        return (
                          <div key={report.id} className="p-4 border border-border rounded-lg">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-medium">
                                  Report: {report.id}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Invoice: {relatedInvoice?.invoiceNumber}
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge 
                                  variant={report.hasDiscrepancies ? "warning" : "success"}
                                >
                                  {report.hasDiscrepancies ? "Has Issues" : "Clean"}
                                </Badge>
                              </div>
                            </div>
                            
                            {report.hasDiscrepancies && (
                              <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 mb-3">
                                <p className="text-sm text-warning font-medium">
                                  Discrepancy: ${report.totalDiscrepancyAmount.toLocaleString()}
                                </p>
                                {report.discrepancies.map((discrepancy, index) => (
                                  <p key={index} className="text-sm text-muted-foreground mt-1">
                                    {discrepancy.description}
                                  </p>
                                ))}
                              </div>
                            )}
                            
                            <div className="text-sm text-muted-foreground">
                              Generated: {new Date(report.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Edit Vendor Dialog */}
          <EditVendorDialog
            vendor={vendor}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onSuccess={() => {
              refetch()
              setIsEditDialogOpen(false)
            }}
          />

          {/* Replace Contract Dialog */}
          <ReplaceContractDialog
            vendor={vendor}
            currentContract={activeContract}
            open={isReplaceContractOpen}
            onOpenChange={setIsReplaceContractOpen}
            onSuccess={() => {
              refetch()
              setIsReplaceContractOpen(false)
            }}
          />
        </div>
      </div>
    </div>
  )
}