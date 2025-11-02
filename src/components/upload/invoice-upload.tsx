'use client'

import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Receipt, CheckCircle, AlertTriangle, Zap, Brain, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { apiClient, type Vendor } from '@/lib/api'
import { EnhancedDropzone, type DropzoneFile } from '@/components/ui/enhanced-dropzone'
import { AIProcessingProgress, INVOICE_PROCESSING_STEPS, type ProcessingStep } from '@/components/ui/ai-processing-progress'
import { DocumentPreview } from '@/components/ui/document-preview'
import { ConfidenceIndicator, MultiFieldConfidence } from '@/components/ui/confidence-indicator'

interface InvoiceUploadProps {
  onUploadComplete: (result: {
    invoiceId: string
    vendorId: string
    fileName: string
    reconciliationStatus: 'processing' | 'completed' | 'flagged'
    extractedData?: any
    confidence?: number
    discrepancies?: any[]
  }) => void
}

export function InvoiceUpload({ onUploadComplete }: InvoiceUploadProps) {
  const [files, setFiles] = useState<DropzoneFile[]>([])
  const [selectedVendorId, setSelectedVendorId] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'reconciling' | 'success' | 'error'>('idle')
  const [reconciliationResults, setReconciliationResults] = useState<any>(null)
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>(INVOICE_PROCESSING_STEPS)
  const [currentStep, setCurrentStep] = useState<string | null>(null)
  const [overallProgress, setOverallProgress] = useState(0)
  const [extractedData, setExtractedData] = useState<any>(null)
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null)

  // Fetch available vendors
  const { data: vendors = [], isLoading: vendorsLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const response = await apiClient.getVendors()
      return response.data || []
    }
  })

  const onFilesChange = useCallback((newFiles: DropzoneFile[]) => {
    setFiles(newFiles)
  }, [])

  const simulateProcessingStep = async (stepId: string, duration: number) => {
    // Update step to in_progress
    setProcessingSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status: 'in_progress' as const }
        : step
    ))
    setCurrentStep(stepId)
    
    // Simulate processing time with progress updates
    const progressInterval = setInterval(() => {
      setOverallProgress(prev => Math.min(prev + 1.5, 100))
    }, duration / 60)
    
    await new Promise(resolve => setTimeout(resolve, duration))
    clearInterval(progressInterval)
    
    // Complete the step with confidence score
    const confidence = Math.floor(Math.random() * 20) + 80 // 80-100%
    setProcessingSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status: 'completed' as const, confidence }
        : step
    ))
  }

  const handleUpload = async () => {
    if (!selectedVendorId || files.length === 0 || files.some(f => f.error)) return

    setIsUploading(true)
    setUploadStatus('processing')
    setOverallProgress(0)
    setEstimatedTimeRemaining(31000) // Total estimated time

    try {
      // Process each step sequentially
      for (const step of INVOICE_PROCESSING_STEPS) {
        await simulateProcessingStep(step.id, step.estimatedDuration)
        
        // Update status for reconciliation step
        if (step.id === 'reconciliation') {
          setUploadStatus('reconciling')
        }
        
        // Update time remaining
        const remainingSteps = INVOICE_PROCESSING_STEPS.slice(
          INVOICE_PROCESSING_STEPS.findIndex(s => s.id === step.id) + 1
        )
        const timeRemaining = remainingSteps.reduce((sum, s) => sum + s.estimatedDuration, 0)
        setEstimatedTimeRemaining(timeRemaining)
      }

      // Generate mock extracted data and reconciliation
      const hasDiscrepancies = Math.random() > 0.6
      const selectedVendor = vendors.find(v => v.id === selectedVendorId)
      
      const mockExtractedData = {
        invoiceNumber: invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
        vendor: selectedVendor?.name || 'Unknown Vendor',
        date: '2024-08-15',
        dueDate: '2024-09-14',
        totalAmount: 2850.00,
        lineItems: [
          { description: 'Consulting Services - August 2024', quantity: 30, rate: 125.00, amount: 3750.00 },
          { description: 'Project Management', quantity: 1, rate: 1500.00, amount: 1500.00 },
          { description: 'Bulk Discount Applied', quantity: 1, rate: -2400.00, amount: -2400.00 }
        ],
        taxAmount: 285.00,
        subtotal: 2850.00
      }

      const discrepancies = hasDiscrepancies ? [
        {
          type: 'Rate Variance',
          description: 'Invoice hourly rate $125 exceeds contracted rate $95/hr',
          field: 'hourlyRate',
          expectedValue: '$95/hr',
          actualValue: '$125/hr',
          impact: 900.00,
          priority: 'high' as const,
          confidence: 94
        },
        {
          type: 'Payment Terms',
          description: 'Invoice shows Net 30, contract specifies Net 45',
          field: 'paymentTerms',
          expectedValue: 'Net 45',
          actualValue: 'Net 30',
          impact: 0,
          priority: 'medium' as const,
          confidence: 89
        }
      ] : []

      const results = {
        invoiceId: mockExtractedData.invoiceNumber,
        extractedData: mockExtractedData,
        totalAmount: mockExtractedData.totalAmount,
        discrepancies,
        confidence: hasDiscrepancies ? 87 : 96,
        status: hasDiscrepancies ? 'flagged' as const : 'completed' as const,
        processingTime: 31000,
        reconciliationScore: hasDiscrepancies ? 75 : 98
      }
      
      setReconciliationResults(results)
      setExtractedData(mockExtractedData)
      setOverallProgress(100)
      setUploadStatus('success')
      setCurrentStep(null)
      
      setTimeout(() => {
        onUploadComplete({
          invoiceId: results.invoiceId,
          vendorId: selectedVendorId,
          fileName: files[0].name,
          reconciliationStatus: results.status,
          extractedData: mockExtractedData,
          confidence: results.confidence,
          discrepancies: results.discrepancies
        })
      }, 2000)
      
    } catch (error) {
      setUploadStatus('error')
      setProcessingSteps(prev => prev.map(step => 
        step.status === 'in_progress' 
          ? { ...step, status: 'error' as const }
          : step
      ))
    } finally {
      setIsUploading(false)
    }
  }

  const handleRetry = () => {
    setProcessingSteps(INVOICE_PROCESSING_STEPS.map(step => ({
      ...step,
      status: 'pending' as const,
      confidence: undefined
    })))
    setOverallProgress(0)
    setCurrentStep(null)
    setUploadStatus('idle')
    setReconciliationResults(null)
    setExtractedData(null)
    handleUpload()
  }

  const validFiles = files.filter(f => !f.error)
  const hasValidFiles = validFiles.length > 0
  const canUpload = selectedVendorId && hasValidFiles && !isUploading

  return (
    <div className="w-full max-w-4xl space-y-6">
      {/* Main Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Invoice Reconciliation
          </CardTitle>
          <CardDescription>
            Upload invoice documents for intelligent OCR extraction and automated reconciliation against vendor contracts.
            Our AI will identify discrepancies and flag potential issues.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Vendor Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendor-select">Select Vendor *</Label>
              <Select value={selectedVendorId} onValueChange={setSelectedVendorId} disabled={isUploading || vendorsLoading}>
                <SelectTrigger className="transition-all duration-200">
                  <SelectValue placeholder={vendorsLoading ? "Loading vendors..." : "Choose a vendor"} />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor: Vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{vendor.name}</span>
                        {vendor.businessDescription && (
                          <span className="text-xs text-muted-foreground">
                            {vendor.businessDescription}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice-number">Invoice Number</Label>
              <Input
                id="invoice-number"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="e.g., INV-2024-001 (auto-detected if empty)"
                disabled={isUploading}
                className="transition-all duration-200"
              />
            </div>
          </div>

          {/* Enhanced File Upload */}
          <div className="space-y-4">
            <Label>Invoice Document *</Label>
            <EnhancedDropzone
              onFilesChange={onFilesChange}
              acceptedFileTypes={{
                'application/pdf': ['.pdf'],
                'image/jpeg': ['.jpeg', '.jpg'],
                'image/png': ['.png'],
                'text/csv': ['.csv'],
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
              }}
              maxFiles={1}
              multiple={false}
              disabled={isUploading}
              showPreview={true}
            />
          </div>

          {/* Document Preview */}
          {hasValidFiles && (
            <div className="space-y-4">
              <Label>Document Preview</Label>
              <DocumentPreview
                file={validFiles[0]}
                showControls={!isUploading}
                className="h-64"
              />
            </div>
          )}

          {/* Processing Status */}
          {(uploadStatus === 'processing' || uploadStatus === 'reconciling') && (
            <AIProcessingProgress
              steps={processingSteps}
              currentStep={currentStep}
              overallProgress={overallProgress}
              estimatedTimeRemaining={estimatedTimeRemaining || undefined}
              onRetry={handleRetry}
              showConfidence={true}
            />
          )}

          {/* Success State with Reconciliation Results */}
          {uploadStatus === 'success' && reconciliationResults && (
            <div className="space-y-4">
              {/* Main Results Header */}
              <div className={`p-4 rounded-lg border ${
                reconciliationResults.status === 'flagged' 
                  ? 'bg-amber-50 border-amber-200' 
                  : 'bg-success/5 border-success/20'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {reconciliationResults.status === 'flagged' ? (
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-success" />
                    )}
                    <h4 className="font-medium">
                      {reconciliationResults.status === 'flagged' 
                        ? 'Discrepancies Detected' 
                        : 'Reconciliation Complete'}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <ConfidenceIndicator 
                      score={reconciliationResults.confidence} 
                      variant="compact" 
                    />
                    <Badge variant={reconciliationResults.status === 'flagged' ? 'destructive' : 'default'}>
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {reconciliationResults.reconciliationScore}% Match
                    </Badge>
                  </div>
                </div>
                
                {/* Extracted Data Confidence */}
                <MultiFieldConfidence
                  fields={[
                    { name: 'Invoice Number', confidence: 96, value: extractedData?.invoiceNumber, required: true },
                    { name: 'Total Amount', confidence: 94, value: `$${extractedData?.totalAmount?.toFixed(2)}`, required: true },
                    { name: 'Invoice Date', confidence: 92, value: extractedData?.date, required: true },
                    { name: 'Line Items', confidence: 89, value: `${extractedData?.lineItems?.length} items` },
                    { name: 'Vendor Match', confidence: 98, value: extractedData?.vendor },
                  ]}
                />
              </div>

              {/* Discrepancies Details */}
              {reconciliationResults.discrepancies && reconciliationResults.discrepancies.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h5 className="font-medium text-amber-800 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Contract Discrepancies Found ({reconciliationResults.discrepancies.length})
                  </h5>
                  <div className="space-y-3">
                    {reconciliationResults.discrepancies.map((disc: any, index: number) => (
                      <div key={index} className="p-3 bg-white rounded border-l-4 border-amber-400">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={disc.priority === 'high' ? 'destructive' : 'secondary'}>
                                {disc.priority} priority
                              </Badge>
                              <span className="text-sm font-medium">{disc.type}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{disc.description}</p>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="font-medium">Expected:</span> {disc.expectedValue}
                              </div>
                              <div>
                                <span className="font-medium">Found:</span> {disc.actualValue}
                              </div>
                            </div>
                            {disc.impact > 0 && (
                              <div className="mt-2 text-sm">
                                <span className="font-medium text-red-600">
                                  Financial Impact: ${disc.impact.toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>
                          <ConfidenceIndicator 
                            score={disc.confidence} 
                            variant="compact" 
                            size="sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary Information */}
              {extractedData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <h6 className="text-sm font-medium mb-2">Invoice Summary</h6>
                    <div className="text-xs space-y-1">
                      <div>Invoice: {extractedData.invoiceNumber}</div>
                      <div>Date: {extractedData.date}</div>
                      <div>Due: {extractedData.dueDate}</div>
                      <div>Subtotal: ${extractedData.subtotal?.toFixed(2)}</div>
                      <div>Tax: ${extractedData.taxAmount?.toFixed(2)}</div>
                      <div className="font-medium">Total: ${extractedData.totalAmount?.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <h6 className="text-sm font-medium mb-2">Processing Details</h6>
                    <div className="text-xs space-y-1">
                      <div>Confidence: {reconciliationResults.confidence}%</div>
                      <div>Processing Time: {(reconciliationResults.processingTime / 1000).toFixed(1)}s</div>
                      <div>Line Items: {extractedData.lineItems?.length || 0}</div>
                      <div>Status: {reconciliationResults.status}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error State */}
          {uploadStatus === 'error' && (
            <div className="flex items-center justify-between p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Processing failed</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="border-destructive/20 text-destructive hover:bg-destructive/10"
              >
                Retry Processing
              </Button>
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!canUpload}
            className="w-full"
            size="lg"
          >
            {isUploading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                {uploadStatus === 'reconciling' ? 'Running AI Reconciliation...' : 'Processing with AI Vision...'}
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Process & Reconcile Invoice
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}