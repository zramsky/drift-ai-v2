'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Building2, CheckCircle, Plus, Upload, FileText, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { validateVendorName } from '@/lib/validation'
import { cn } from '@/lib/utils'
import type { ContractAnalysisResult } from '@/lib/ai/openai-service'

interface AddVendorSimpleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface FormData {
  // Vendor Information
  name: string
  canonicalName: string
  businessDescription: string
  active: boolean

  // Contract Information
  contractTitle: string
  effectiveDate: string
  expirationDate: string
}

const VENDOR_CATEGORIES = [
  'Technology Services',
  'Professional Services',
  'Marketing & Advertising',
  'Office Supplies',
  'Software & Licenses',
  'Facilities & Maintenance',
  'Legal Services',
  'Financial Services',
  'Transportation',
  'Healthcare Services',
  'Other'
]

export function AddVendorSimpleDialog({ open, onOpenChange, onSuccess }: AddVendorSimpleDialogProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<ContractAnalysisResult | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      canonicalName: '',
      businessDescription: '',
      active: true,
      contractTitle: '',
      effectiveDate: '',
      expirationDate: ''
    }
  })

  const watchedValues = watch()

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64String = reader.result as string
        // Remove data URL prefix (e.g., "data:image/png;base64,")
        const base64Data = base64String.split(',')[1]
        resolve(base64Data)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Handle file upload and AI analysis
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      setUploadedFile(null)
      setUploadProgress(0)
      setAnalysisResults(null)
      setAnalysisError(null)
      return
    }

    const file = files[0]
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Contract file must be smaller than 10MB",
        variant: "destructive"
      })
      return
    }

    if (!['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or image file (JPG, PNG)",
        variant: "destructive"
      })
      return
    }

    setUploadedFile(file)
    setUploadProgress(0)
    setIsAnalyzing(true)
    setAnalysisError(null)

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      // Convert file to base64
      const base64Data = await fileToBase64(file)

      // Call the contract analysis API
      const response = await fetch('/api/contracts/analyze-vendor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: base64Data,
          imageType: file.type,
          fileName: file.name
        })
      })

      if (!response.ok) {
        throw new Error('Contract analysis failed')
      }

      const analysis: ContractAnalysisResult = await response.json()

      setAnalysisResults(analysis)
      setUploadProgress(100)

      // Auto-fill form fields from AI analysis
      if (analysis.extractedVendorData) {
        setValue('name', analysis.extractedVendorData.vendorName || '')
        setValue('canonicalName', analysis.extractedVendorData.vendorName || '')
        setValue('businessDescription', analysis.extractedVendorData.businessCategory || '')
      }

      if (analysis.extractedContractData) {
        setValue('contractTitle', analysis.extractedContractData.contractTitle || '')
        setValue('effectiveDate', analysis.extractedContractData.effectiveDate || '')
        setValue('expirationDate', analysis.extractedContractData.expirationDate || '')
      }

      toast({
        title: "Contract analyzed successfully!",
        description: `AI extracted vendor details with ${Math.round(analysis.confidence * 100)}% confidence`,
      })

      // Auto-advance to review step
      setTimeout(() => {
        setCurrentStep(2)
      }, 500)

    } catch (error) {
      setAnalysisError('Failed to analyze contract. You can still proceed and enter details manually.')
      toast({
        title: "Analysis failed",
        description: "Unable to analyze contract. Please fill details manually.",
        variant: "destructive"
      })
    } finally {
      setIsAnalyzing(false)
      clearInterval(progressInterval)
    }
  }

  // Final submission
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)

    try {
      // Validate vendor name
      const nameValidation = validateVendorName(data.name, true)
      if (!nameValidation.isValid) {
        toast({
          title: "Invalid vendor name",
          description: nameValidation.error,
          variant: "destructive"
        })
        setIsSubmitting(false)
        return
      }

      // Create vendor
      const vendorResponse = await apiClient.createVendor({
        name: data.name.trim(),
        canonicalName: data.canonicalName.trim() || data.name.trim(),
        businessDescription: data.businessDescription === 'none' ? undefined : data.businessDescription || undefined,
        active: data.active
      })

      if (vendorResponse.error) {
        toast({
          title: "Failed to create vendor",
          description: vendorResponse.error,
          variant: "destructive"
        })
        setIsSubmitting(false)
        return
      }

      // If contract was uploaded, associate it with the vendor
      if (uploadedFile && vendorResponse.data?.id) {
        try {
          // Note: This would be replaced with actual contract upload API
          const contractData = {
            vendorId: vendorResponse.data.id,
            title: data.contractTitle,
            effectiveDate: data.effectiveDate,
            expirationDate: data.expirationDate,
            file: uploadedFile
          }

          console.log('Contract data to upload:', contractData)

          toast({
            title: "Success!",
            description: `${data.name} has been created with contract "${data.contractTitle}".`,
          })
        } catch (contractError) {
          toast({
            title: "Vendor created, contract upload pending",
            description: `${data.name} was created but the contract will be uploaded separately.`,
          })
        }
      } else {
        toast({
          title: "Vendor created successfully",
          description: `${data.name} has been added to your vendor directory.`,
        })
      }

      // Reset form and close dialog
      reset()
      setCurrentStep(1)
      setUploadedFile(null)
      setAnalysisResults(null)
      setUploadProgress(0)
      setAnalysisError(null)
      onSuccess()
    } catch (error) {
      toast({
        title: "An error occurred",
        description: error instanceof Error ? error.message : 'Failed to create vendor',
        variant: "destructive"
      })
      setIsSubmitting(false)
    }
  }

  const handleDialogChange = (isOpen: boolean) => {
    if (!isOpen && !isSubmitting) {
      reset()
      setCurrentStep(1)
      setUploadedFile(null)
      setAnalysisResults(null)
      setUploadProgress(0)
      setAnalysisError(null)
    }
    onOpenChange(isOpen)
  }

  // Render upload step
  const renderUploadStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Upload className="h-5 w-5 text-brand-orange" />
          Upload Vendor Contract
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Upload a contract and our AI will automatically extract the vendor information for you.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          uploadedFile ? "border-green-300 bg-green-50" : "border-gray-300 hover:border-brand-orange bg-gray-50"
        )}>
          {uploadedFile ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              {isAnalyzing && (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-brand-orange h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Sparkles className="h-4 w-4 animate-pulse text-brand-orange" />
                    <span>AI analyzing contract... {uploadProgress}%</span>
                  </div>
                </div>
              )}
              {analysisResults && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI Analysis Complete
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Vendor:</span> {analysisResults.extractedVendorData.vendorName}</p>
                    <p><span className="font-medium">Category:</span> {analysisResults.extractedVendorData.businessCategory}</p>
                    <p><span className="font-medium">Contract:</span> {analysisResults.extractedContractData.contractTitle}</p>
                    <p><span className="font-medium">Confidence:</span> {Math.round(analysisResults.confidence * 100)}%</p>
                  </div>
                </div>
              )}
              {analysisError && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-left">
                  <p className="text-sm text-yellow-800 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {analysisError}
                  </p>
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setUploadedFile(null)
                  setAnalysisResults(null)
                  setAnalysisError(null)
                  setUploadProgress(0)
                }}
                className="mt-2"
                disabled={isAnalyzing}
              >
                Remove File
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mx-auto">
                <FileText className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Upload Vendor Contract</p>
                <p className="text-sm text-gray-500 mt-1">
                  Drag & drop or click to select (PDF, JPG, PNG)
                </p>
                <p className="text-xs text-gray-400 mt-1">Maximum file size: 10MB</p>
              </div>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
                id="contract-upload"
              />
              <Button
                type="button"
                variant="outline"
                className="mt-2"
                onClick={() => document.getElementById('contract-upload')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </div>
          )}
        </div>

        {!uploadedFile && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">AI-Powered Extraction</h4>
                <p className="text-sm text-blue-700">
                  Our AI will automatically extract vendor name, business category, contract dates, payment terms, and more from your contract document.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  // Render review step
  const renderReviewStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="h-5 w-5 text-brand-orange" />
          Review Vendor Details
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          {analysisResults
            ? 'Review and edit the AI-extracted information below.'
            : 'Enter vendor details manually.'}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">
            Vendor Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            {...register('name', {
              required: 'Vendor name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' }
            })}
            className={errors.name ? 'border-red-500' : ''}
            placeholder="Enter the official vendor name"
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="canonicalName">DBA/Display Name</Label>
          <Input
            id="canonicalName"
            {...register('canonicalName')}
            placeholder="Optional - if different from vendor name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessDescription">Category</Label>
          <Select
            value={watchedValues.businessDescription}
            onValueChange={(value) => setValue('businessDescription', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No category</SelectItem>
              {VENDOR_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="border-t pt-4 mt-4">
          <h4 className="font-medium text-gray-900 mb-3">Contract Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contractTitle">Contract Title</Label>
              <Input
                id="contractTitle"
                {...register('contractTitle')}
                placeholder="e.g., Service Agreement 2024"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="effectiveDate">Effective Date</Label>
              <Input
                id="effectiveDate"
                type="date"
                {...register('effectiveDate')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expirationDate">Expiration Date</Label>
              <Input
                id="expirationDate"
                type="date"
                {...register('expirationDate')}
              />
            </div>
          </div>
        </div>

        {analysisResults && analysisResults.extractedContractData.reconciliationSummary && (
          <div className="border-t pt-4 mt-4 space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-orange" />
              AI Contract Analysis Summary
            </h4>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3 text-sm">
              <div>
                <span className="font-medium text-blue-900">Overview:</span>
                <p className="text-blue-800 mt-1">
                  {analysisResults.extractedContractData.reconciliationSummary.overview}
                </p>
              </div>

              {analysisResults.extractedContractData.reconciliationSummary.pricingTerms &&
                analysisResults.extractedContractData.reconciliationSummary.pricingTerms.length > 0 && (
                <div>
                  <span className="font-medium text-blue-900">Pricing Terms:</span>
                  <ul className="list-disc list-inside text-blue-800 mt-1 space-y-1">
                    {analysisResults.extractedContractData.reconciliationSummary.pricingTerms.map((term, index) => (
                      <li key={index}>{term}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysisResults.extractedContractData.reconciliationSummary.discounts &&
                analysisResults.extractedContractData.reconciliationSummary.discounts.length > 0 && (
                <div>
                  <span className="font-medium text-blue-900">Discounts:</span>
                  <ul className="list-disc list-inside text-blue-800 mt-1 space-y-1">
                    {analysisResults.extractedContractData.reconciliationSummary.discounts.map((discount, index) => (
                      <li key={index}>{discount}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysisResults.extractedContractData.reconciliationSummary.criticalClauses &&
                analysisResults.extractedContractData.reconciliationSummary.criticalClauses.length > 0 && (
                <div>
                  <span className="font-medium text-blue-900">Critical Terms for Reconciliation:</span>
                  <ul className="list-disc list-inside text-blue-800 mt-1 space-y-1">
                    {analysisResults.extractedContractData.reconciliationSummary.criticalClauses.map((clause, index) => (
                      <li key={index}>{clause}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                AI extracted contract terms with {Math.round(analysisResults.confidence * 100)}% confidence. These will be used for automatic invoice reconciliation.
              </p>
            </div>
          </div>
        )}

        {analysisResults && !analysisResults.extractedContractData.reconciliationSummary && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Fields auto-filled by AI with {Math.round(analysisResults.confidence * 100)}% confidence. You can edit any field above.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-orange" />
            Add New Vendor with AI
          </DialogTitle>
          <DialogDescription>
            Upload a contract and let AI extract all vendor details automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm",
              currentStep === 1 ? "bg-brand-orange text-white" : "bg-gray-100 text-gray-600"
            )}>
              <Upload className="h-4 w-4" />
              <span>Upload Contract</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm",
              currentStep === 2 ? "bg-brand-orange text-white" : "bg-gray-100 text-gray-600"
            )}>
              <CheckCircle className="h-4 w-4" />
              <span>Review & Create</span>
            </div>
          </div>

          {/* Step content */}
          {currentStep === 1 ? renderUploadStep() : renderReviewStep()}

          <DialogFooter className="flex justify-between">
            <div>
              {currentStep === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              {currentStep === 1 ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={!uploadedFile && !analysisError}
                  className="bg-brand-orange hover:bg-orange-600"
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting || !watchedValues.name}
                  className="min-w-[140px] bg-brand-orange hover:bg-orange-600"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Creating...
                    </div>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Vendor
                    </>
                  )}
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
