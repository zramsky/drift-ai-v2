'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { 
  ArrowLeft, 
  FileText, 
  Eye, 
  Download, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Calendar,
  DollarSign,
  Building2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EvidenceViewer } from '@/components/evidence/evidence-viewer'
import { apiClient } from '@/lib/api'
import { mockInvoices, mockReconciliationReports, mockContracts } from '@/lib/mock-data'

interface InvoiceDetailPageProps {
  params: {
    id: string
  }
}

export default function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('details')

  // Mock data - in real app this would come from API
  const invoice = mockInvoices.find(inv => inv.id === params.id)
  const reconciliationReport = mockReconciliationReports.find(report => report.invoiceId === params.id)
  const relatedContract = mockContracts.find(contract => contract.vendorId === invoice?.vendorId)

  if (!invoice) {
    return (
      <div className="min-h-screen">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-error mb-2">Invoice Not Found</h3>
              <p className="text-muted-foreground mb-6">
                The requested invoice could not be found.
              </p>
              <Button onClick={() => router.push('/invoices')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Invoices
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'reconciled': 
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-success" />
      case 'flagged': 
      case 'pending':
        return <AlertTriangle className="h-5 w-5 text-warning" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-error" />
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reconciled':
      case 'approved':
        return 'success'
      case 'flagged':
      case 'pending':
        return 'warning'
      case 'rejected':
        return 'error'
      default:
        return 'secondary'
    }
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
              onClick={() => router.push('/invoices')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center bg-brand-steel/10 rounded-lg">
                  <FileText className="h-6 w-6 text-brand-steel" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {invoice.invoiceNumber}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {invoice.vendor?.name}
                  </p>
                </div>
                <Badge variant={getStatusColor(invoice.status)}>
                  {getStatusIcon(invoice.status)}
                  <span className="ml-2 capitalize">{invoice.status}</span>
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                View Original
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Invoice Details</TabsTrigger>
              <TabsTrigger value="evidence">Evidence Viewer</TabsTrigger>
              <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
            </TabsList>

            {/* Invoice Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Invoice Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Invoice Information</CardTitle>
                    <CardDescription>
                      Basic invoice details and amounts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Invoice Number
                          </label>
                          <p className="text-foreground mt-1 font-medium">
                            {invoice.invoiceNumber}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Status
                          </label>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusIcon(invoice.status)}
                            <span className="capitalize">{invoice.status}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Invoice Date
                          </label>
                          <p className="text-foreground mt-1">
                            {new Date(invoice.invoiceDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Due Date
                          </label>
                          <p className="text-foreground mt-1">
                            {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'Not specified'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Subtotal
                          </label>
                          <p className="text-foreground mt-1 font-semibold">
                            ${invoice.subtotal.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Tax Amount
                          </label>
                          <p className="text-foreground mt-1">
                            ${(invoice.taxAmount || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Total Amount
                        </label>
                        <p className="text-foreground mt-1 text-xl font-bold">
                          ${invoice.totalAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Vendor Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Vendor Information</CardTitle>
                    <CardDescription>
                      Details about the invoice vendor
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center bg-brand-steel/10 rounded-lg">
                        <Building2 className="h-5 w-5 text-brand-steel" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {invoice.vendor?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.vendor?.canonicalName}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Business Type
                      </label>
                      <p className="text-foreground mt-1">
                        {invoice.vendor?.businessDescription || 'Not specified'}
                      </p>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => router.push(`/vendors/${invoice.vendorId}`)}
                    >
                      View Vendor Details
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Line Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Line Items</CardTitle>
                  <CardDescription>
                    Detailed breakdown of invoice charges
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Rate</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoice.lineItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {item.description}
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.unit}</TableCell>
                            <TableCell>${item.rate.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-medium">
                              ${item.total.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Evidence Viewer Tab */}
            <TabsContent value="evidence" className="space-y-6">
              {relatedContract ? (
                <EvidenceViewer 
                  invoice={invoice}
                  contract={relatedContract}
                  reconciliationReport={reconciliationReport}
                  showFullDocuments={false}
                  onRefreshEvidence={async () => {
                    // Implement refresh logic here
                    console.log('Refreshing evidence anchors...')
                  }}
                />
              ) : (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No Contract Found</h3>
                      <p>No related contract found for evidence comparison.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Reconciliation Tab */}
            <TabsContent value="reconciliation" className="space-y-6">
              {reconciliationReport ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Reconciliation Report</CardTitle>
                    <CardDescription>
                      AI analysis and contract compliance results
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Status Summary */}
                    <div className={`p-4 rounded-lg border-2 ${
                      reconciliationReport.hasDiscrepancies 
                        ? 'bg-warning/10 border-warning/20' 
                        : 'bg-success/10 border-success/20'
                    }`}>
                      <div className="flex items-center gap-3">
                        {reconciliationReport.hasDiscrepancies ? (
                          <AlertTriangle className="h-6 w-6 text-warning" />
                        ) : (
                          <CheckCircle className="h-6 w-6 text-success" />
                        )}
                        <div>
                          <h3 className="font-semibold">
                            {reconciliationReport.hasDiscrepancies ? 'Issues Found' : 'All Clear'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {reconciliationReport.hasDiscrepancies 
                              ? `${reconciliationReport.discrepancies.length} discrepancy(ies) identified`
                              : 'Invoice matches contract terms'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Discrepancies */}
                    {reconciliationReport.hasDiscrepancies && (
                      <div>
                        <h4 className="font-semibold mb-4">Discrepancies Found</h4>
                        <div className="space-y-4">
                          {reconciliationReport.discrepancies.map((discrepancy, index) => (
                            <div key={index} className="p-4 border border-border rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h5 className="font-medium">{discrepancy.description}</h5>
                                  <Badge 
                                    className={`mt-2 ${
                                      discrepancy.priority === 'high' ? 'bg-error/10 text-error' :
                                      discrepancy.priority === 'medium' ? 'bg-warning/10 text-warning' :
                                      'bg-info/10 text-info'
                                    }`}
                                  >
                                    {discrepancy.priority} priority
                                  </Badge>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-error">
                                    ${discrepancy.amount.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                                <div>
                                  <label className="text-muted-foreground">Expected</label>
                                  <p className="font-medium">{discrepancy.expectedValue}</p>
                                </div>
                                <div>
                                  <label className="text-muted-foreground">Actual</label>
                                  <p className="font-medium">{discrepancy.actualValue}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Checklist */}
                    <div>
                      <h4 className="font-semibold mb-4">Compliance Checklist</h4>
                      <div className="space-y-3">
                        {reconciliationReport.checklist.map((item, index) => (
                          <div key={index} className="flex items-start gap-3">
                            {item.passed ? (
                              <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                            ) : (
                              <XCircle className="h-5 w-5 text-error mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium">{item.item}</p>
                              <p className="text-sm text-muted-foreground">{item.details}</p>
                              <p className="text-xs text-muted-foreground">
                                Confidence: {Math.round(item.confidence * 100)}%
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Rationale */}
                    <div>
                      <h4 className="font-semibold mb-2">AI Analysis</h4>
                      <div className="bg-surface-secondary p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground italic">
                          "{reconciliationReport.rationaleText}"
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span>Processing time: {reconciliationReport.metadata?.processingTime}s</span>
                          <span>Model: {reconciliationReport.metadata?.aiModel}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No Reconciliation Report</h3>
                      <p>This invoice has not been reconciled yet.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}