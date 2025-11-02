'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Receipt, 
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Eye
} from 'lucide-react'
import { PdfDocumentViewer } from './pdf-document-viewer'
import { EvidenceAnchors } from './evidence-anchors'
import { InvoiceReportHeader } from './invoice-report-header'
import { SummaryCard } from './summary-card'
import type { Invoice, Contract, ReconciliationReport, EvidenceAnchor, Finding } from '@/lib/api'

interface EvidenceViewerProps {
  invoice: Invoice
  contract: Contract
  reconciliationReport?: ReconciliationReport
  // PRD-specific props
  showFullDocuments?: boolean
  onClose?: () => void
  onRefreshEvidence?: () => Promise<void>
  isRefreshing?: boolean
}

export function EvidenceViewer({ 
  invoice, 
  contract, 
  reconciliationReport,
  showFullDocuments = true,
  onClose,
  onRefreshEvidence,
  isRefreshing = false
}: EvidenceViewerProps) {
  const [activeAnchor, setActiveAnchor] = useState<EvidenceAnchor | undefined>(undefined)
  const [contractPage, setContractPage] = useState<number>(1)
  const [invoicePage, setInvoicePage] = useState<number>(1)

  // Extract evidence anchors and findings from reconciliation report
  const evidenceAnchors: EvidenceAnchor[] = reconciliationReport?.summary?.evidence_anchors || []
  const findings: Finding[] = reconciliationReport?.findings || []
  
  // Mock data for development - replace with real data from reconciliationReport
  const mockFindings: Finding[] = [
    {
      id: 'f1',
      type: 'high',
      description: 'Invoice rate exceeds contracted rate by 25%',
      evidence_anchor: {
        doc: 'invoice',
        page: 1,
        bbox: { x: 150, y: 200, width: 200, height: 20 },
        quoted_text: 'Unit Rate: $31.25/hour'
      },
      amount: 1250
    },
    {
      id: 'f2',
      type: 'medium',
      description: 'Emergency service charge not pre-approved',
      evidence_anchor: {
        doc: 'invoice',
        page: 1,
        bbox: { x: 150, y: 300, width: 180, height: 20 },
        quoted_text: 'Emergency Service Charge'
      },
      amount: 500
    },
    {
      id: 'f3',
      type: 'low',
      description: 'Payment terms match contract requirements',
      evidence_anchor: {
        doc: 'contract',
        page: 2,
        bbox: { x: 100, y: 150, width: 150, height: 18 },
        quoted_text: 'Payment Terms: Net 30'
      }
    }
  ]

  const currentFindings = findings.length > 0 ? findings : mockFindings
  const currentAnchors = evidenceAnchors.length > 0 ? evidenceAnchors : currentFindings.map(f => f.evidence_anchor)

  // Handle evidence anchor navigation
  const handleAnchorClick = (anchor: EvidenceAnchor) => {
    setActiveAnchor(anchor)
    // Navigate to the appropriate document and page
    if (anchor.doc === 'contract') {
      setContractPage(anchor.page)
    } else {
      setInvoicePage(anchor.page)
    }
  }

  // Get highest priority for header display
  const getHighestPriority = (): 'high' | 'medium' | 'low' => {
    if (currentFindings.some(f => f.type === 'high')) return 'high'
    if (currentFindings.some(f => f.type === 'medium')) return 'medium'
    return 'low'
  }

  // Calculate total variance
  const getTotalVariance = (): number => {
    return currentFindings.reduce((total, finding) => total + (finding.amount || 0), 0)
  }

  // Handle page changes
  const handleContractPageChange = (page: number) => {
    setContractPage(page)
  }

  const handleInvoicePageChange = (page: number) => {
    setInvoicePage(page)
  }

  if (!showFullDocuments) {
    // Compact view - show only summary and findings
    return (
      <div className="space-y-6">
        <InvoiceReportHeader
          invoice={invoice}
          highestPriority={getHighestPriority()}
          totalVariance={getTotalVariance()}
          reviewed={reconciliationReport?.summary?.reviewed || false}
          onViewFullDocuments={() => window.location.href = `/evidence/${invoice.id}`}
        />
        
        <SummaryCard
          narrative={reconciliationReport?.summary?.narrative || 'Analysis summary not available'}
          evidenceAnchors={currentAnchors}
          onAnchorClick={handleAnchorClick}
        />
        
        <EvidenceAnchors
          findings={currentFindings}
          onAnchorClick={handleAnchorClick}
          activeAnchor={activeAnchor}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onClose && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
              <div>
                <CardTitle className="text-lg">Evidence Viewer</CardTitle>
                <CardDescription>
                  Side-by-side contract and invoice comparison with AI-highlighted findings
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onRefreshEvidence && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefreshEvidence}
                  disabled={isRefreshing}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh Evidence
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Side-by-side Document Viewers - PRD Layout */}
      {/* On mobile: Stack vertically, on desktop: Side-by-side */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Contract Viewer - Left Side */}
        <PdfDocumentViewer
          fileUrl={contract.fileUrl}
          pdfBlob={contract.pdfBlob}
          title={contract.fileName}
          documentType="contract"
          highlights={currentAnchors.filter(anchor => anchor.doc === 'contract')}
          activeHighlight={activeAnchor}
          onHighlightClick={handleAnchorClick}
          onPageChange={handleContractPageChange}
        />

        {/* Invoice Viewer - Right Side */}
        <PdfDocumentViewer
          fileUrl={invoice.fileUrl}
          pdfBlob={invoice.pdfBlob}
          title={invoice.fileName}
          documentType="invoice"
          highlights={currentAnchors.filter(anchor => anchor.doc === 'invoice')}
          activeHighlight={activeAnchor}
          onHighlightClick={handleAnchorClick}
          onPageChange={handleInvoicePageChange}
        />
      </div>

      {/* Evidence Anchors - Findings Panel */}
      <EvidenceAnchors
        findings={currentFindings}
        onAnchorClick={handleAnchorClick}
        onRefreshAnchors={onRefreshEvidence}
        activeAnchor={activeAnchor}
        isRefreshing={isRefreshing}
      />
    </div>
  )
}