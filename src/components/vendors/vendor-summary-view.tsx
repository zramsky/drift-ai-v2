'use client'

import { useQuery } from '@tanstack/react-query'
import {
  Building2,
  FileText,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Settings,
  Upload,
  Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DashboardKPICard } from '@/components/dashboard/dashboard-kpi-card'
import { apiClient } from '@/lib/api'
import { mockInvoices, mockContracts } from '@/lib/mock-data'
import { format } from 'date-fns'

interface VendorSummaryViewProps {
  vendorId: string
  onInvoiceClick: (invoiceId: string) => void
  onEditVendor: () => void
}

export function VendorSummaryView({ vendorId, onInvoiceClick, onEditVendor }: VendorSummaryViewProps) {
  // Fetch vendor details
  const { data: vendor, isLoading } = useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: async () => {
      const response = await apiClient.getVendor(vendorId)
      if (response.error) {
        throw new Error(response.error)
      }
      return response.data
    },
  })

  // Fetch vendor contracts
  const { data: vendorContracts = [] } = useQuery({
    queryKey: ['contracts', vendorId],
    queryFn: async () => {
      const response = await apiClient.getContracts(vendorId)
      if (response.error) {
        throw new Error(response.error)
      }
      return response.data || []
    },
  })

  // Fetch vendor invoices
  const { data: vendorInvoices = [] } = useQuery({
    queryKey: ['invoices', vendorId],
    queryFn: async () => {
      const response = await apiClient.getInvoices(vendorId)
      if (response.error) {
        throw new Error(response.error)
      }
      return response.data || []
    },
  })

  // Get the active contract
  const activeContract = vendorContracts.find(c => c.status === 'active')

  // Mock data filtered for this vendor (fallback)
  const mockVendorInvoices = mockInvoices.filter(inv => inv.vendorId === vendorId)
  const displayInvoices = vendorInvoices.length > 0 ? vendorInvoices : mockVendorInvoices

  if (isLoading || !vendor) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Loading vendor summary...
      </div>
    )
  }

  return (
    <div className="space-y-6">
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

      {/* Two-Column Layout for Vendor and Contract Cards */}
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
              <Button
                variant="ghost"
                size="sm"
                onClick={onEditVendor}
                className="h-8 w-8 p-0 hover:bg-orange-50 hover:text-brand-orange"
                aria-label="Edit vendor settings"
              >
                <Settings className="h-4 w-4" />
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
        </CardHeader>
        <CardContent>
          {displayInvoices.length === 0 ? (
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
                  {displayInvoices
                    .slice(0, 6)
                    .map((invoice) => (
                      <TableRow
                        key={invoice.id}
                        className="cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-orange"
                        onClick={() => onInvoiceClick(invoice.id)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            onInvoiceClick(invoice.id)
                          }
                        }}
                        role="button"
                        aria-label={`View invoice ${invoice.invoiceNumber}`}
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
    </div>
  )
}
