'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { EvidenceViewer } from '@/components/evidence/evidence-viewer'
import { apiClient } from '@/lib/api'
import { mockInvoices, mockContracts, mockReconciliationReports } from '@/lib/mock-data'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertTriangle, FileText } from 'lucide-react'

interface EvidencePageProps {
  params: {
    id: string
  }
}

export default function EvidencePage({ params }: EvidencePageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // URL parameters for deep linking
  const contractPage = searchParams.get('contractPage') ? parseInt(searchParams.get('contractPage')!, 10) : 1
  const invoicePage = searchParams.get('invoicePage') ? parseInt(searchParams.get('invoicePage')!, 10) : 1
  const highlightId = searchParams.get('highlight')
  const anchorDoc = searchParams.get('anchorDoc') as 'contract' | 'invoice' | null
  const anchorPage = searchParams.get('anchorPage') ? parseInt(searchParams.get('anchorPage')!, 10) : null
  const anchorText = searchParams.get('anchorText')

  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch invoice data
  const { data: invoice, isLoading: invoiceLoading, error: invoiceError } = useQuery({
    queryKey: ['invoice', params.id],
    queryFn: async () => {
      const response = await apiClient.getInvoice(params.id)
      if (response.error) throw new Error(response.error)
      return response.data!
    },
    // Use mock data fallback
    placeholderData: mockInvoices.find(inv => inv.id === params.id)
  })

  // Fetch related contract
  const { data: contract, isLoading: contractLoading, error: contractError } = useQuery({
    queryKey: ['contract', invoice?.vendorId],
    queryFn: async () => {
      if (!invoice?.vendorId) return null
      const response = await apiClient.getContracts(invoice.vendorId)
      if (response.error) throw new Error(response.error)
      return response.data?.[0] || null
    },
    enabled: !!invoice?.vendorId,
    // Use mock data fallback
    placeholderData: invoice ? mockContracts.find(contract => contract.vendorId === invoice.vendorId) : undefined
  })

  // Fetch reconciliation report
  const { data: reconciliationReport, isLoading: reportLoading, error: reportError, refetch: refetchReport } = useQuery({
    queryKey: ['reconciliation-report', params.id],
    queryFn: async () => {
      const response = await apiClient.getReconciliationReport(params.id)
      if (response.error) throw new Error(response.error)
      return response.data!
    },
    // Use mock data fallback
    placeholderData: mockReconciliationReports.find(report => report.invoiceId === params.id)
  })

  // Handle refresh evidence functionality
  const handleRefreshEvidence = async () => {
    setIsRefreshing(true)
    try {
      // Call the refresh evidence API
      const response = await apiClient.refreshEvidenceAnchors(params.id)
      if (response.error) {
        throw new Error(response.error)
      }
      
      // Refetch the reconciliation report to get updated data
      await refetchReport()
      
      console.log('Evidence anchors refreshed successfully', response.data)
    } catch (error) {
      console.error('Failed to refresh evidence:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Handle closing the evidence viewer
  const handleClose = () => {
    router.push(`/invoices/${params.id}`)
  }

  // Update URL when navigating to evidence anchors
  const updateUrlWithAnchor = (anchorDoc: 'contract' | 'invoice', page: number, text?: string) => {
    const currentParams = new URLSearchParams(searchParams.toString())
    currentParams.set('anchorDoc', anchorDoc)
    currentParams.set('anchorPage', page.toString())
    if (text) {
      currentParams.set('anchorText', text)
    }
    
    if (anchorDoc === 'contract') {
      currentParams.set('contractPage', page.toString())
    } else {
      currentParams.set('invoicePage', page.toString())
    }
    
    router.replace(`/evidence/${params.id}?${currentParams.toString()}`, { scroll: false })
  }

  const isLoading = invoiceLoading || contractLoading || reportLoading
  const hasError = invoiceError || contractError || reportError

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-96" />
                </div>
              </CardContent>
            </Card>
            
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-96 w-full" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-96 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (hasError || !invoice) {
    return (
      <div className="min-h-screen">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-error">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Error Loading Evidence</h3>
                  <p className="text-sm mb-4">
                    {invoiceError?.message || contractError?.message || reportError?.message || 'Invoice not found'}
                  </p>
                  <button
                    onClick={() => router.push('/invoices')}
                    className="text-brand-steel hover:underline"
                  >
                    Back to Invoices
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="min-h-screen">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Contract Found</h3>
                  <p className="text-sm mb-4">
                    No related contract found for evidence comparison.
                  </p>
                  <button
                    onClick={() => router.push(`/invoices/${params.id}`)}
                    className="text-brand-steel hover:underline"
                  >
                    Back to Invoice Details
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <EvidenceViewer
            invoice={invoice}
            contract={contract}
            reconciliationReport={reconciliationReport}
            showFullDocuments={true}
            onClose={handleClose}
            onRefreshEvidence={handleRefreshEvidence}
            isRefreshing={isRefreshing}
          />
        </div>
      </div>
    </div>
  )
}