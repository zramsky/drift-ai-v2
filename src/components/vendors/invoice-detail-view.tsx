'use client'

import { useState } from 'react'
import {
  ArrowLeft,
  Building2,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { mockInvoices, mockVendors, mockReconciliationReports } from '@/lib/mock-data'
import { format } from 'date-fns'

interface InvoiceDetailViewProps {
  vendorId: string
  invoiceId: string
  onBack: () => void
}

export function InvoiceDetailView({ vendorId, invoiceId, onBack }: InvoiceDetailViewProps) {
  // Find invoice and vendor from mock data
  const invoice = mockInvoices.find(inv => inv.id === invoiceId)
  const vendor = mockVendors.find(v => v.id === vendorId)
  const reconciliationReport = mockReconciliationReports.find(report => report.invoiceId === invoiceId)

  // Handle not found cases
  if (!invoice) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-error opacity-50" />
        <h3 className="text-lg font-semibold text-error mb-2">Invoice Not Found</h3>
        <p className="text-muted-foreground mb-6">
          The requested invoice could not be found.
        </p>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-error opacity-50" />
        <h3 className="text-lg font-semibold text-error mb-2">Vendor Not Found</h3>
        <p className="text-muted-foreground mb-6">
          The vendor for this invoice could not be found.
        </p>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
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

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'secondary' => {
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

  const handleApprove = () => {
    alert('Invoice approved! (Demo mode)')
  }

  const handleReject = () => {
    alert('Invoice rejected! (Demo mode)')
  }

  const handleDownload = () => {
    alert('Download PDF functionality coming soon!')
  }

  return (
    <div className="space-y-6">
      {/* Back Button / Breadcrumb */}
      <div>
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-brand-orange hover:text-orange-600 hover:bg-brand-orange/10 -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to {vendor.name}
        </Button>
      </div>

      {/* Invoice Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center bg-brand-steel/10 rounded-lg">
            <FileText className="h-6 w-6 text-brand-steel" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Invoice {invoice.invoiceNumber}
            </h1>
            <p className="text-sm text-muted-foreground">
              {format(new Date(invoice.invoiceDate), 'MMMM dd, yyyy')} • ${invoice.totalAmount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </p>
          </div>
        </div>
        <Badge variant={getStatusColor(invoice.status)}>
          {getStatusIcon(invoice.status)}
          <span className="ml-2 capitalize">{invoice.status}</span>
        </Badge>
      </div>

      {/* Reconciliation Report - Two Column Layout */}
      {reconciliationReport ? (
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          {/* Left Column: Reconciliation Details */}
          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle>Reconciliation Report</CardTitle>
              <CardDescription>
                Contract compliance and discrepancy details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex-grow">
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
                      <div key={index} className="p-4 border border-border rounded-lg bg-warning/5">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h5 className="font-medium">{discrepancy.description}</h5>
                            <Badge
                              className="mt-2"
                              variant={
                                discrepancy.priority === 'high' ? 'error' :
                                discrepancy.priority === 'medium' ? 'warning' :
                                'secondary'
                              }
                            >
                              {discrepancy.priority} priority
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-error">
                              ${discrepancy.amount.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
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
            </CardContent>
          </Card>

          {/* Right Column: AI Analysis */}
          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle>AI Analysis</CardTitle>
              <CardDescription>
                GPT-4 Vision rationale and processing details
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <div className="bg-surface-secondary p-4 rounded-lg">
                <p className="text-sm text-muted-foreground italic">
                  "{reconciliationReport.rationaleText}"
                </p>
                {reconciliationReport.metadata && (
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span>Processing time: {reconciliationReport.metadata.processingTime}s</span>
                    <span>Model: {reconciliationReport.metadata.aiModel}</span>
                  </div>
                )}
              </div>

              {/* Evidence Viewer Button */}
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3 text-sm">Supporting Evidence</h4>
                <Button
                  onClick={() => {
                    window.location.href = `/vendors/${vendorId}/invoice/${invoiceId}/evidence`
                  }}
                  className="w-full bg-brand-orange hover:bg-orange-600 text-white py-6 text-base font-semibold"
                >
                  <Eye className="h-5 w-5 mr-2" />
                  View Interactive Evidence
                </Button>
                <p className="text-sm text-muted-foreground mt-3 text-center">
                  See highlighted invoice sections with AI explanations
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Reconciliation Report</CardTitle>
            <CardDescription>
              AI analysis and contract compliance results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-muted-foreground">
                No reconciliation report available for this invoice
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Line Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
          <CardDescription>
            Detailed breakdown of invoice charges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-center">Unit</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.lineItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {item.description}
                    </TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-center">{item.unit}</TableCell>
                    <TableCell className="text-right">
                      ${item.rate.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${item.total.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
        <Button variant="outline" onClick={handleReject}>
          Reject
        </Button>
        <Button
          onClick={handleApprove}
          className="bg-brand-orange hover:bg-orange-600 text-white"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Approve Invoice
        </Button>
      </div>
    </div>
  )
}
