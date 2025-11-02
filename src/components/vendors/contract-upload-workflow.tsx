'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { apiClient, type ProcessingJob, type ContractExtractionData } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { ContractReviewForm } from './contract-review-form'
import { validateFile } from '@/lib/validation'

interface ContractUploadWorkflowProps {
  onComplete?: (data: { vendorId: string; contractId: string }) => void
  onCancel?: () => void
  trigger?: React.ReactNode
}

export function ContractUploadWorkflow({ onComplete, onCancel, trigger }: ContractUploadWorkflowProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<'upload' | 'processing' | 'review'>('upload')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState<ContractExtractionData | null>(null)
  const [processingStartTime, setProcessingStartTime] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
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
      
      const response = await apiClient.uploadContractForVendorCreation(file)
      
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
  }, [])

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
    setIsOpen(false)
    setStep('upload')
    setUploadedFile(null)
    setJobId(null)
    setExtractedData(null)
    setProcessingStartTime(null)
    setError(null)
    onCancel?.()
  }

  const handleReviewComplete = (data: { vendorId: string; contractId: string }) => {
    setIsOpen(false)
    onComplete?.(data)
    
    toast({
      title: "Vendor created successfully",
      description: "Your vendor has been created and the contract has been processed.",
    })

    // Navigate to the new vendor profile
    router.push(`/vendors/${data.vendorId}`)
  }

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Upload Contract Document</h3>
        <p className="text-sm text-muted-foreground">
          Upload a contract file to automatically create a new vendor profile. Supported formats: PDF, DOCX, PNG, JPG (max 10MB).
        </p>
      </div>

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
            <p className="text-lg font-medium mb-1">Drop contract file here</p>
            <p className="text-sm text-gray-500">or click to browse</p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {uploadedFile && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
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
  )

  const renderProcessingStep = () => {
    const progress = calculateProgress()
    const elapsed = processingStartTime ? Math.floor((Date.now() - processingStartTime) / 1000) : 0
    
    return (
      <div className="space-y-6 text-center">
        <div>
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Processing Contract</h3>
          <p className="text-sm text-muted-foreground">
            Our AI is analyzing your contract document to extract vendor information and terms.
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
        fileName={uploadedFile?.name || 'Contract'}
        onComplete={handleReviewComplete}
        onCancel={() => setStep('upload')}
      />
    )
  }

  const defaultTrigger = (
    <Button>
      <Upload className="mr-2 h-4 w-4" />
      Upload Contract
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <>{trigger || defaultTrigger}</>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle>
              {step === 'upload' && 'Create Vendor from Contract'}
              {step === 'processing' && 'Processing Contract'}
              {step === 'review' && 'Review Contract Details'}
            </DialogTitle>
            <DialogDescription>
              {step === 'upload' && 'Upload a contract document to automatically extract vendor information'}
              {step === 'processing' && 'Please wait while we analyze your contract document'}
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

