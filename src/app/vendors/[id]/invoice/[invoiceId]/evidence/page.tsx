'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { mockInvoices, mockVendors } from '@/lib/mock-data'
import { format } from 'date-fns'

// Mock evidence highlight data
interface EvidenceHighlight {
  id: string
  section: string
  text: string
  explanation: string
  matchType: 'exact' | 'compliant' | 'discrepancy'
  contractReference: string
  position: {
    top: number // percentage
    left: number // percentage
    width: number // percentage
    height: number // percentage
  }
}

const mockHighlights: EvidenceHighlight[] = [
  {
    id: 'h1',
    section: 'Payment Terms',
    text: 'Net 30 Days',
    explanation: 'Payment terms match contract specification of Net 30 Days. This complies with the agreed-upon payment schedule in Section 4.2 of the master contract.',
    matchType: 'exact',
    contractReference: 'Contract Section 4.2 - Payment Terms',
    position: { top: 15, left: 60, width: 25, height: 3 }
  },
  {
    id: 'h2',
    section: 'Unit Price',
    text: '$4.50 per unit',
    explanation: 'Unit price of $4.50 matches the contracted rate for standard medical supplies. Volume discount of 10% has been correctly applied as per contract terms.',
    matchType: 'compliant',
    contractReference: 'Contract Section 3.1 - Pricing Schedule',
    position: { top: 35, left: 65, width: 20, height: 3 }
  },
  {
    id: 'h3',
    section: 'Invoice Date',
    text: 'January 15, 2025',
    explanation: 'Invoice date is within the billing period specified in the contract. Matches the monthly invoicing schedule outlined in the service agreement.',
    matchType: 'exact',
    contractReference: 'Contract Section 5.1 - Billing Schedule',
    position: { top: 8, left: 15, width: 22, height: 3 }
  },
  {
    id: 'h4',
    section: 'Quantity',
    text: '1,500 units',
    explanation: 'Quantity exceeds the maximum order amount of 1,200 units specified in the contract. This represents a discrepancy of 300 units ($1,350.00 overage).',
    matchType: 'discrepancy',
    contractReference: 'Contract Section 3.3 - Order Limits',
    position: { top: 35, left: 20, width: 18, height: 3 }
  },
  {
    id: 'h5',
    section: 'Tax Rate',
    text: '8.5% Sales Tax',
    explanation: 'Tax rate of 8.5% matches the state sales tax requirement for medical supplies in Ohio. Correctly applied to taxable items only.',
    matchType: 'exact',
    contractReference: 'Contract Section 6.2 - Tax Compliance',
    position: { top: 75, left: 60, width: 25, height: 3 }
  }
]

export default function EvidenceViewerPage() {
  const params = useParams()
  const router = useRouter()
  const [hoveredHighlight, setHoveredHighlight] = useState<string | null>(null)
  const [selectedHighlight, setSelectedHighlight] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null)

  const vendorId = params.id as string
  const invoiceId = params.invoiceId as string

  const handleHighlightHover = (highlightId: string, event: React.MouseEvent) => {
    setHoveredHighlight(highlightId)
    setTooltipPosition({ x: event.clientX, y: event.clientY })
  }

  const handleHighlightLeave = () => {
    setHoveredHighlight(null)
    setTooltipPosition(null)
  }

  // Find invoice and vendor from mock data
  const invoice = mockInvoices.find(inv => inv.id === invoiceId)
  const vendor = mockVendors.find(v => v.id === vendorId)

  if (!invoice || !vendor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-error" />
          <h2 className="text-xl font-semibold mb-2">Invoice or Vendor Not Found</h2>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const getHighlightColor = (matchType: EvidenceHighlight['matchType']) => {
    switch (matchType) {
      case 'exact':
        return 'bg-success/20 border-success hover:bg-success/30'
      case 'compliant':
        return 'bg-blue-500/20 border-blue-500 hover:bg-blue-500/30'
      case 'discrepancy':
        return 'bg-error/20 border-error hover:bg-error/30'
      default:
        return 'bg-gray-500/20 border-gray-500'
    }
  }

  const getHighlightIcon = (matchType: EvidenceHighlight['matchType']) => {
    switch (matchType) {
      case 'exact':
        return <CheckCircle className="h-4 w-4 text-success" />
      case 'compliant':
        return <Info className="h-4 w-4 text-blue-500" />
      case 'discrepancy':
        return <AlertTriangle className="h-4 w-4 text-error" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  // Component for rendering highlighted text inline
  const HighlightedText = ({
    children,
    highlightId,
    matchType
  }: {
    children: React.ReactNode
    highlightId: string
    matchType: EvidenceHighlight['matchType']
  }) => {
    const getHighlightStyle = () => {
      const baseClasses = "cursor-pointer transition-all duration-150 rounded px-1 relative"
      switch (matchType) {
        case 'exact':
          return `${baseClasses} bg-success/20 hover:bg-success/40 border-b-2 border-success`
        case 'compliant':
          return `${baseClasses} bg-blue-500/20 hover:bg-blue-500/40 border-b-2 border-blue-500`
        case 'discrepancy':
          return `${baseClasses} bg-error/20 hover:bg-error/40 border-b-2 border-error`
        default:
          return baseClasses
      }
    }

    return (
      <span
        className={getHighlightStyle()}
        onMouseEnter={(e) => handleHighlightHover(highlightId, e)}
        onMouseLeave={handleHighlightLeave}
        onMouseMove={(e) => setTooltipPosition({ x: e.clientX, y: e.clientY })}
        onClick={() => setSelectedHighlight(selectedHighlight === highlightId ? null : highlightId)}
      >
        {children}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push(`/vendors/${vendorId}?invoice=${invoiceId}`)}
                className="text-brand-orange hover:text-orange-600 hover:bg-brand-orange/10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Invoice
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Evidence Viewer
                </h1>
                <p className="text-sm text-muted-foreground">
                  {vendor.name} • Invoice {invoice.invoiceNumber}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {mockHighlights.length} Highlights
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Invoice Preview with Highlights (Left - 2 columns) */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Document</CardTitle>
                <CardDescription>
                  Hover over highlighted sections to see AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Simulated Invoice Document */}
                <div className="bg-white border-2 border-gray-200 rounded-lg p-8 min-h-[800px] shadow-sm">
                  {/* Invoice Header */}
                  <div className="mb-8">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{vendor.name}</h2>
                        <p className="text-sm text-gray-600">{vendor.canonicalName}</p>
                        <p className="text-sm text-gray-600 mt-1">Medical Supply Services</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Invoice</p>
                        <p className="text-xl font-bold text-gray-900">{invoice.invoiceNumber}</p>
                      </div>
                    </div>
                  </div>

                  {/* Invoice Details */}
                  <div className="mb-6 text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium">Date:</span>{' '}
                      <HighlightedText highlightId="h3" matchType="exact">
                        {format(new Date(invoice.invoiceDate), 'MMMM dd, yyyy')}
                      </HighlightedText>
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Due Date:</span> {invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM dd, yyyy') : 'Upon Receipt'}
                    </p>
                  </div>

                  <div className="mb-8 text-sm bg-gray-50 p-3 rounded">
                    <p className="text-gray-700">
                      <span className="font-medium">Payment Terms:</span>{' '}
                      <HighlightedText highlightId="h1" matchType="exact">
                        Net 30 Days
                      </HighlightedText>
                    </p>
                  </div>

                  {/* Line Items */}
                  <div className="border border-gray-300 rounded-lg overflow-hidden mb-6">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Description</th>
                          <th className="text-center py-2 px-3 font-medium text-gray-700">Qty</th>
                          <th className="text-right py-2 px-3 font-medium text-gray-700">Rate</th>
                          <th className="text-right py-2 px-3 font-medium text-gray-700">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoice.lineItems.map((item, index) => (
                          <tr key={index} className="border-t border-gray-200">
                            <td className="py-2 px-3 text-gray-700">{item.description}</td>

                            <td className="py-2 px-3 text-center text-gray-700">
                              {index === 0 ? (
                                <HighlightedText highlightId="h4" matchType="discrepancy">
                                  {item.quantity} {item.unit}
                                </HighlightedText>
                              ) : (
                                `${item.quantity} ${item.unit}`
                              )}
                            </td>

                            <td className="py-2 px-3 text-right text-gray-700">
                              {index === 0 ? (
                                <HighlightedText highlightId="h2" matchType="compliant">
                                  ${item.rate.toFixed(2)}
                                </HighlightedText>
                              ) : (
                                `$${item.rate.toFixed(2)}`
                              )}
                            </td>

                            <td className="py-2 px-3 text-right text-gray-700 font-medium">
                              ${item.total.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals */}
                  <div className="flex justify-end mb-6">
                    <div className="w-64 space-y-2 text-sm">
                      <div className="flex justify-between text-gray-700">
                        <span>Subtotal:</span>
                        <span>${invoice.subtotal.toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between text-gray-700">
                        <span>Tax (
                          <HighlightedText highlightId="h5" matchType="exact">
                            8.5%
                          </HighlightedText>
                          ):</span>
                        <span>${(invoice.taxAmount || 0).toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between text-gray-900 font-bold text-base border-t-2 border-gray-300 pt-2">
                        <span>Total:</span>
                        <span>${invoice.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tooltip for Hovered Highlight */}
                  {hoveredHighlight && tooltipPosition && (
                    <div
                      className="fixed z-50 max-w-sm p-4 bg-white border-2 border-gray-300 rounded-lg shadow-xl pointer-events-none"
                      style={{
                        left: `${tooltipPosition.x + 15}px`,
                        top: `${tooltipPosition.y + 15}px`,
                        transform: tooltipPosition.x > window.innerWidth / 2 ? 'translateX(-100%)' : 'none'
                      }}
                    >
                      {(() => {
                        const highlight = mockHighlights.find(h => h.id === hoveredHighlight)
                        if (!highlight) return null

                        return (
                          <div>
                            <div className="flex items-start gap-2 mb-2">
                              {getHighlightIcon(highlight.matchType)}
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm text-gray-900">{highlight.section}</h4>
                                <p className="text-xs text-gray-600 mt-0.5">"{highlight.text}"</p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed mb-2">
                              {highlight.explanation}
                            </p>
                            <p className="text-xs text-gray-500 italic">
                              {highlight.contractReference}
                            </p>
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Highlights Legend (Right - 1 column) */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Highlights Legend</CardTitle>
                <CardDescription>
                  Click on highlights to view details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockHighlights.map((highlight) => (
                  <div
                    key={highlight.id}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedHighlight === highlight.id
                        ? 'border-brand-orange bg-brand-orange/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedHighlight(selectedHighlight === highlight.id ? null : highlight.id)}
                    onMouseEnter={() => setHoveredHighlight(highlight.id)}
                    onMouseLeave={() => setHoveredHighlight(null)}
                  >
                    <div className="flex items-start gap-2">
                      {getHighlightIcon(highlight.matchType)}
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-gray-900">{highlight.section}</h4>
                        <p className="text-xs text-gray-600 mt-0.5">"{highlight.text}"</p>
                        {selectedHighlight === highlight.id && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="text-xs text-gray-700 leading-relaxed mb-1">
                              {highlight.explanation}
                            </p>
                            <p className="text-xs text-gray-500 italic">
                              {highlight.contractReference}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Legend Key */}
                <div className="pt-4 border-t space-y-2">
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Legend</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-xs text-gray-600">Exact Match</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-500" />
                    <span className="text-xs text-gray-600">Compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-error" />
                    <span className="text-xs text-gray-600">Discrepancy</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
