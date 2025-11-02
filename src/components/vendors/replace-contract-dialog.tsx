'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileText, AlertCircle, CheckCircle, X, Clock, AlertTriangle } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { apiClient, type ProcessingJob, type ContractExtractionData, type Vendor, type Contract } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { ContractReviewForm } from './contract-review-form'
import { validateFile } from '@/lib/validation'

interface ReplaceContractDialogProps {
  vendor: Vendor
  currentContract?: Contract
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ReplaceContractDialog({ 
  vendor, 
  currentContract, 
  open, 
  onOpenChange, 
  onSuccess 
}: ReplaceContractDialogProps) {
  const [step, setStep] = useState<'upload' | 'processing' | 'review'>('upload')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState<ContractExtractionData | null>(null)
  const [processingStartTime, setProcessingStartTime] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const { toast } = useToast()

  // Poll processing job status
  const { data: jobStatus } = useQuery({
    queryKey: ['processing-job', jobId],
    queryFn: async () => {
      if (!jobId) return null
      const response = await apiClient.getProcessingJobStatus(jobId)
      if (response.error) {
        throw new Error(response.error)
      }
      return response.data
    },
    enabled: !!jobId && step === 'processing',
    refetchInterval: 2000, // Poll every 2 seconds
  })

  // Handle job status updates
  useEffect(() => {
    if (!jobStatus || !processingStartTime) return

    const elapsed = Date.now() - processingStartTime

    if (jobStatus.status === 'completed' && jobStatus.result) {
      setExtractedData(jobStatus.result)
      setStep('review')
      setJobId(null)
    } else if (jobStatus.status === 'failed') {
      setError(jobStatus.error || 'Processing failed')
      setStep('upload')
      setJobId(null)
    } else if (jobStatus.status === 'timeout' || elapsed > 60000) {
      setError('Processing timeout. Please try uploading a clearer document or contact support.')
      setStep('upload')
      setJobId(null)
    }
  }, [jobStatus, processingStartTime])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Use comprehensive file validation
    const fileValidation = validateFile(file)
    if (!fileValidation.isValid) {
      setError(fileValidation.error || 'Invalid file')
      return
    }

    setUploadedFile(file)
    setError(null)

    // Start upload and processing
    try {
      setStep('processing')
      setProcessingStartTime(Date.now())
      
      const response = await apiClient.replaceVendorContract(vendor.id, file)
      
      if (response.error) {
        setError(response.error)
        setStep('upload')
        return
      }

      if (response.data?.jobId) {
        setJobId(response.data.jobId)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed')
      setStep('upload')
    }
  }, [vendor.id])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg']
    },
    multiple: false
  })

  const calculateProgress = () => {
    if (!processingStartTime) return 0
    
    const elapsed = Date.now() - processingStartTime
    const minimumTime = 8000 // 8 seconds minimum
    const timeoutTime = 60000 // 1 minute timeout
    
    if (elapsed < minimumTime) {
      return (elapsed / minimumTime) * 80 // Up to 80% in first 8 seconds
    } else if (elapsed < timeoutTime) {
      const remainingTime = timeoutTime - minimumTime
      const remainingElapsed = elapsed - minimumTime
      return 80 + (remainingElapsed / remainingTime) * 15 // 80-95% for remaining time
    } else {
      return 95 // Cap at 95% before timeout
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset state
    setStep('upload')
    setUploadedFile(null)
    setJobId(null)
    setExtractedData(null)
    setProcessingStartTime(null)
    setError(null)
  }

  const handleReviewComplete = () => {
    handleClose()
    onSuccess()
    
    toast({
      title: "Contract replaced successfully",
      description: "The new contract has been processed and is now active.",
    })
  }

  const renderUploadStep = () => (
    <div className="space-y-6">
      {/* Current Contract Info */}
      {currentContract && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Current Contract
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">File:</span>
                <span className="text-sm">{currentContract.fileName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Effective:</span>
                <span className="text-sm">{new Date(currentContract.effectiveDate).toLocaleDateString()}</span>
              </div>
              {currentContract.renewalDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Renewal:</span>
                  <span className="text-sm">{new Date(currentContract.renewalDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warning */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-900 mb-2">Important Notice</h4>
              <div className="text-sm text-orange-800 space-y-1">
                <p>• Replacing the contract will affect future invoice reconciliations</p>
                <p>• Past invoices and their reconciliation results will remain unchanged</p>
                <p>• The new contract will be processed and become the active version</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-semibold mb-2">Upload New Contract Document</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload a new contract file to replace the current one. Supported formats: PDF, DOCX, PNG, JPG (max 10MB).
        </p>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : error
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-blue-600">Drop the contract file here...</p>
          ) : (
            <div>
              <p className="text-lg font-medium mb-1">Drop new contract file here</p>
              <p className="text-sm text-gray-500">or click to browse</p>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mt-4">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {uploadedFile && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mt-4">
            <FileText className="h-5 w-5 text-gray-500" />
            <div className="flex-1">
              <p className="text-sm font-medium">{uploadedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderProcessingStep = () => {
    const progress = calculateProgress()
    const elapsed = processingStartTime ? Math.floor((Date.now() - processingStartTime) / 1000) : 0
    
    return (
      <div className="space-y-6 text-center">
        <div>
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Processing New Contract</h3>
          <p className="text-sm text-muted-foreground">
            Our AI is analyzing your new contract document to extract updated vendor information and terms.
          </p>
        </div>

        <div className="space-y-3">
          <Progress value={progress} className="w-full" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Analyzing document...</span>
            <span>{elapsed}s elapsed</span>
          </div>
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <p>This typically takes 8-30 seconds.</p>
          <p>Processing will timeout after 1 minute if the document is unclear.</p>
        </div>

        {uploadedFile && (
          <div className="flex items-center justify-center gap-3 p-3 bg-gray-50 rounded-lg">
            <FileText className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium">{uploadedFile.name}</span>
          </div>
        )}
      </div>
    )
  }

  const renderReviewStep = () => {
    if (!extractedData) return null

    return (
      <ContractReviewForm
        extractedData={extractedData}
        jobId={jobId}
        fileName={uploadedFile?.name || 'New Contract'}
        onComplete={handleReviewComplete}
        onCancel={() => setStep('upload')}
        isReplacement={true}
        vendorId={vendor.id}
      />
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle>
              {step === 'upload' && 'Replace Contract'}
              {step === 'processing' && 'Processing New Contract'}
              {step === 'review' && 'Review New Contract Details'}
            </DialogTitle>
            <DialogDescription>
              {step === 'upload' && `Replace the contract for ${vendor.name}`}
              {step === 'processing' && 'Please wait while we analyze your new contract document'}
              {step === 'review' && 'Review and confirm the extracted contract information'}
            </DialogDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="mt-6">
          {step === 'upload' && renderUploadStep()}
          {step === 'processing' && renderProcessingStep()}
          {step === 'review' && renderReviewStep()}
        </div>
      </DialogContent>
    </Dialog>
  )
}