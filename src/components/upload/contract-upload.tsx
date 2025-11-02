'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload, FileText, CheckCircle, AlertCircle, AlertTriangle, Brain } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { EnhancedDropzone, type DropzoneFile } from '@/components/ui/enhanced-dropzone'
import { AIProcessingProgress, CONTRACT_PROCESSING_STEPS, type ProcessingStep } from '@/components/ui/ai-processing-progress'
import { DocumentPreview } from '@/components/ui/document-preview'
import { ConfidenceIndicator, MultiFieldConfidence } from '@/components/ui/confidence-indicator'

interface ContractUploadProps {
  onUploadComplete: (result: {
    vendorName: string
    contractId: string
    fileName: string
    extractedData?: any
    confidence?: number
  }) => void
}

export function ContractUpload({ onUploadComplete }: ContractUploadProps) {
  const [files, setFiles] = useState<DropzoneFile[]>([])
  const [vendorName, setVendorName] = useState('')
  const [businessDescription, setBusinessDescription] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>(CONTRACT_PROCESSING_STEPS)
  const [currentStep, setCurrentStep] = useState<string | null>(null)
  const [overallProgress, setOverallProgress] = useState(0)
  const [extractedData, setExtractedData] = useState<any>(null)
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null)

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
      setOverallProgress(prev => Math.min(prev + 2, 100))
    }, duration / 50)
    
    await new Promise(resolve => setTimeout(resolve, duration))
    clearInterval(progressInterval)
    
    // Complete the step with confidence score
    const confidence = Math.floor(Math.random() * 15) + 85 // 85-100%
    setProcessingSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status: 'completed' as const, confidence }
        : step
    ))
  }

  const handleUpload = async () => {
    if (!vendorName.trim() || files.length === 0 || files.some(f => f.error)) return

    setIsUploading(true)
    setUploadStatus('processing')
    setOverallProgress(0)
    setEstimatedTimeRemaining(32000) // Total estimated time

    try {
      // Process each step sequentially
      for (const step of CONTRACT_PROCESSING_STEPS) {
        await simulateProcessingStep(step.id, step.estimatedDuration)
        
        // Update time remaining
        const remainingSteps = CONTRACT_PROCESSING_STEPS.slice(
          CONTRACT_PROCESSING_STEPS.findIndex(s => s.id === step.id) + 1
        )
        const timeRemaining = remainingSteps.reduce((sum, s) => sum + s.estimatedDuration, 0)
        setEstimatedTimeRemaining(timeRemaining)
      }

      // Generate mock extracted data
      const mockData = {
        vendorInfo: {
          name: vendorName,
          businessDescription,
          contactEmail: 'contact@vendor.com',
          address: '123 Business St, City, State 12345'
        },
        contractTerms: {
          startDate: '2024-01-15',
          endDate: '2025-01-14',
          value: '$125,000',
          paymentTerms: 'Net 30',
          renewalClause: 'Auto-renewal with 60-day notice'
        },
        pricing: {
          hourlyRate: '$95/hour',
          bulkDiscount: '10% for orders over $10,000',
          additionalFees: 'None specified'
        }
      }

      const contractId = `CON-${Date.now().toString().slice(-6)}`
      const overallConfidence = 92

      setExtractedData(mockData)
      setOverallProgress(100)
      setUploadStatus('success')
      setCurrentStep(null)
      
      setTimeout(() => {
        onUploadComplete({
          vendorName,
          contractId,
          fileName: files[0].name,
          extractedData: mockData,
          confidence: overallConfidence
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
    setProcessingSteps(CONTRACT_PROCESSING_STEPS.map(step => ({
      ...step,
      status: 'pending' as const,
      confidence: undefined
    })))
    setOverallProgress(0)
    setCurrentStep(null)
    setUploadStatus('idle')
    setExtractedData(null)
    handleUpload()
  }

  const validFiles = files.filter(f => !f.error)
  const hasValidFiles = validFiles.length > 0
  const canUpload = vendorName.trim() && hasValidFiles && !isUploading

  return (
    <div className="w-full max-w-4xl space-y-6">
      {/* Main Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Contract Processing
          </CardTitle>
          <CardDescription>
            Upload contract documents for intelligent analysis and vendor profile creation.
            Our AI will extract key terms, pricing, and contract details automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Vendor Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendor-name">Vendor Name *</Label>
              <Input
                id="vendor-name"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="e.g., TechSupply Solutions Inc."
                disabled={isUploading}
                className="transition-all duration-200"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="business-desc">Business Description</Label>
              <Textarea
                id="business-desc"
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                placeholder="e.g., IT equipment and software licensing"
                disabled={isUploading}
                rows={1}
                className="resize-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Enhanced File Upload */}
          <div className="space-y-4">
            <Label>Contract Documents *</Label>
            <EnhancedDropzone
              onFilesChange={onFilesChange}
              acceptedFileTypes={{
                'application/pdf': ['.pdf'],
                'application/msword': ['.doc'],
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                'text/plain': ['.txt']
              }}
              maxFiles={3}
              multiple={true}
              disabled={isUploading}
              showPreview={true}
            />
          </div>

          {/* Document Preview for first uploaded file */}
          {hasValidFiles && (
            <div className="space-y-4">
              <Label>Document Preview</Label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <DocumentPreview
                  file={validFiles[0]}
                  showControls={!isUploading}
                  className="h-64"
                />
                {validFiles.length > 1 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Additional Documents ({validFiles.length - 1})</p>
                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {validFiles.slice(1).map((file, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm truncate">{file.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Processing Status */}
          {uploadStatus === 'processing' && (
            <AIProcessingProgress
              steps={processingSteps}
              currentStep={currentStep}
              overallProgress={overallProgress}
              estimatedTimeRemaining={estimatedTimeRemaining || undefined}
              onRetry={handleRetry}
              showConfidence={true}
            />
          )}

          {/* Success State with Extracted Data */}
          {uploadStatus === 'success' && extractedData && (
            <div className="space-y-4 p-4 bg-success/5 border border-success/20 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <h4 className="font-medium text-success">Contract Processing Complete!</h4>
                <ConfidenceIndicator score={92} variant="compact" />
              </div>
              
              <MultiFieldConfidence
                fields={[
                  { name: 'Vendor Name', confidence: 98, value: extractedData.vendorInfo.name, required: true },
                  { name: 'Contract Value', confidence: 94, value: extractedData.contractTerms.value, required: true },
                  { name: 'Payment Terms', confidence: 89, value: extractedData.contractTerms.paymentTerms, required: true },
                  { name: 'Hourly Rate', confidence: 91, value: extractedData.pricing.hourlyRate },
                  { name: 'Contract Period', confidence: 96, value: `${extractedData.contractTerms.startDate} to ${extractedData.contractTerms.endDate}` },
                ]}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Vendor Information</h5>
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <div>Email: {extractedData.vendorInfo.contactEmail}</div>
                    <div>Address: {extractedData.vendorInfo.address}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Key Terms</h5>
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <div>Duration: {extractedData.contractTerms.startDate} - {extractedData.contractTerms.endDate}</div>
                    <div>Renewal: {extractedData.contractTerms.renewalClause}</div>
                  </div>
                </div>
              </div>
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
                Processing with AI Vision...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Process Contract with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}