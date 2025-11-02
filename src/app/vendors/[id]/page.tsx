'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Building2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { apiClient } from '@/lib/api'
import { mockInvoices, mockContracts, mockReconciliationReports } from '@/lib/mock-data'
import { EditVendorDialog } from '@/components/vendors/edit-vendor-dialog'
import { ReplaceContractDialog } from '@/components/vendors/replace-contract-dialog'
import { VendorSummaryView } from '@/components/vendors/vendor-summary-view'
import { InvoiceDetailView } from '@/components/vendors/invoice-detail-view'

interface VendorDetailPageProps {
  params: {
    id: string
  }
}

export default function VendorDetailPage({ params }: VendorDetailPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const invoiceId = searchParams.get('invoice')
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

  // Navigation handlers
  const handleInvoiceClick = (id: string) => {
    router.replace(`/vendors/${params.id}?invoice=${id}`)
  }

  const handleBackToSummary = () => {
    router.replace(`/vendors/${params.id}`)
  }

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

  // If invoice ID is present in URL, show invoice detail view
  if (invoiceId) {
    return (
      <div className="min-h-screen">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <InvoiceDetailView
              vendorId={params.id}
              invoiceId={invoiceId}
              onBack={handleBackToSummary}
            />
          </div>
        </div>
      </div>
    )
  }

  // Otherwise show the tab interface with summary/invoices/reports
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
            <Button
              className="bg-brand-orange hover:bg-orange-600 text-white"
              onClick={() => alert('Add Invoice functionality coming soon')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Invoice
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
              <VendorSummaryView
                vendorId={params.id}
                onInvoiceClick={handleInvoiceClick}
                onEditVendor={() => setIsEditDialogOpen(true)}
              />
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
                        <div
                          key={invoice.id}
                          onClick={() => router.replace(`/vendors/${params.id}?invoice=${invoice.id}`)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              router.replace(`/vendors/${params.id}?invoice=${invoice.id}`)
                            }
                          }}
                          role="button"
                          tabIndex={0}
                          className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-orange transition-colors"
                          aria-label={`View invoice ${invoice.invoiceNumber}`}
                        >
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
                            <Badge
                              variant={
                                invoice.status === 'reconciled' ? 'success' :
                                invoice.status === 'flagged' ? 'warning' :
                                invoice.status === 'rejected' ? 'error' : 'secondary'
                              }
                            >
                              {invoice.status}
                            </Badge>
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