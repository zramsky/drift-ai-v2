'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Building2, CheckCircle, Plus, Upload, FileText, ArrowRight, ArrowLeft } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { validateVendorName } from '@/lib/validation'
import { cn } from '@/lib/utils'

interface AddVendorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface FormData {
  // Step 1: Vendor Information
  name: string
  canonicalName: string
  businessDescription: string
  active: boolean

  // Step 2: Contract Information
  contractTitle: string
  effectiveDate: string
  expirationDate: string
  contractFile?: FileList
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

const WORKFLOW_STEPS = [
  { id: 1, title: 'Vendor Information', description: 'Basic vendor details and contact info' },
  { id: 2, title: 'Contract Upload', description: 'Upload and configure contract details' },
  { id: 3, title: 'Review & Confirm', description: 'Review all information before creating' }
]

export function AddVendorDialog({ open, onOpenChange, onSuccess }: AddVendorDialogProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [nameCheckStatus, setNameCheckStatus] = useState<'idle' | 'checking' | 'unique' | 'duplicate'>('idle')
  const [duplicateVendorId, setDuplicateVendorId] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
    trigger
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

  // Check vendor name uniqueness
  const checkNameUniqueness = async (name: string) => {
    if (!name || name.length < 2) {
      setNameCheckStatus('idle')
      return
    }

    setNameCheckStatus('checking')
    setDuplicateVendorId(null)

    try {
      const response = await apiClient.checkVendorNameUniqueness(name.trim())
      
      if (response.error) {
        setNameCheckStatus('idle')
        return
      }

      if (response.data?.isUnique) {
        setNameCheckStatus('unique')
      } else {
        setNameCheckStatus('duplicate')
        setDuplicateVendorId(response.data?.existingVendorId || null)
      }
    } catch (error) {
      setNameCheckStatus('idle')
    }
  }

  // Handle name change with debounce
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setValue('name', name)
    
    setNameCheckStatus('idle')
    setDuplicateVendorId(null)
    
    const timeoutId = setTimeout(() => {
      checkNameUniqueness(name)
    }, 500)

    return () => clearTimeout(timeoutId)
  }

  // Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      setUploadedFile(null)
      setUploadProgress(0)
      setAnalysisResults(null)
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
      // Mock contract analysis (since we have working mock analysis from AddContractDialog)
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate processing time

      const mockAnalysis = {
        contractTitle: file.name.replace(/\.[^/.]+$/, ''),
        effectiveDate: '2024-01-01',
        expirationDate: '2024-12-31',
        paymentTerms: 'Net 30 Days',
        keyTerms: ['Payment terms: Net 30 days', 'Volume discount available', 'Quality guarantee included'],
        confidence: 0.92
      }

      setAnalysisResults(mockAnalysis)
      setUploadProgress(100)
      
      // Auto-fill form fields from analysis
      setValue('contractTitle', mockAnalysis.contractTitle)
      setValue('effectiveDate', mockAnalysis.effectiveDate)
      setValue('expirationDate', mockAnalysis.expirationDate)

      toast({
        title: "Contract analyzed successfully",
        description: `Analysis complete with ${Math.round(mockAnalysis.confidence * 100)}% confidence`,
      })
    } catch (error) {
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

  // Navigation between steps
  const goToNextStep = async () => {
    if (currentStep === 1) {
      // Validate step 1
      const isValid = await trigger(['name', 'businessDescription'])
      if (!isValid || nameCheckStatus === 'duplicate' || nameCheckStatus === 'checking') {
        return
      }
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Final submission
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)

    try {
      // Validate vendor name one more time
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

      if (nameCheckStatus === 'duplicate') {
        toast({
          title: "Duplicate vendor name",
          description: `Vendor '${data.name}' already exists. Please choose a different name.`,
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

          // Mock contract creation - in real implementation this would upload the file
          console.log('Contract data to upload:', contractData)

          toast({
            title: "Vendor and contract created successfully",
            description: `${data.name} has been added with contract "${data.contractTitle}".`,
          })
        } catch (contractError) {
          // Vendor was created but contract failed - still show success
          toast({
            title: "Vendor created, contract upload failed",
            description: `${data.name} was created but the contract could not be uploaded. You can add it later.`,
            variant: "destructive"
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
      setNameCheckStatus('idle')
      setUploadedFile(null)
      setAnalysisResults(null)
      setUploadProgress(0)
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

  // Render step progress indicator
  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {WORKFLOW_STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex items-center">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                currentStep >= step.id
                  ? "bg-brand-orange text-white"
                  : "bg-gray-200 text-gray-600"
              )}>
                {currentStep > step.id ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  step.id
                )}
              </div>
              <div className="ml-3 hidden sm:block">
                <div className={cn(
                  "text-sm font-medium",
                  currentStep >= step.id ? "text-gray-900" : "text-gray-500"
                )}>
                  {step.title}
                </div>
                <div className="text-xs text-gray-500">
                  {step.description}
                </div>
              </div>
            </div>
            {index < WORKFLOW_STEPS.length - 1 && (
              <div className={cn(
                "mx-4 h-0.5 flex-1",
                currentStep > step.id ? "bg-brand-orange" : "bg-gray-200"
              )} />
            )}
          </div>
        ))}
      </div>
    </div>
  )

  // Render name validation
  const renderNameValidation = () => {
    if (!watchedValues.name || watchedValues.name.length < 2) {
      return null
    }

    if (nameCheckStatus === 'checking') {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full" />
          <span>Checking availability...</span>
        </div>
      )
    }

    if (nameCheckStatus === 'unique') {
      return (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span>Name is available</span>
        </div>
      )
    }

    if (nameCheckStatus === 'duplicate') {
      return (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>This vendor name already exists. Please choose a different name.</span>
        </div>
      )
    }

    return null
  }

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5" />
                Vendor Information
              </CardTitle>
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
                    minLength: { value: 2, message: 'Name must be at least 2 characters' },
                    onChange: handleNameChange
                  })}
                  className={errors.name || nameCheckStatus === 'duplicate' ? 'border-red-500' : ''}
                  placeholder="Enter the official vendor name"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
                {renderNameValidation()}
              </div>

              <div className="space-y-2">
                <Label htmlFor="canonicalName">DBA/Display Name</Label>
                <Input
                  id="canonicalName"
                  {...register('canonicalName')}
                  placeholder="Optional - if different from vendor name"
                />
                <p className="text-xs text-gray-500">
                  The name commonly used in invoices or business communications
                </p>
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

              <div className="space-y-2">
                <Label htmlFor="active">Status</Label>
                <Select 
                  value={watchedValues.active ? 'active' : 'inactive'} 
                  onValueChange={(value) => setValue('active', value === 'active')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Active vendors can receive new invoices and contracts
                </p>
              </div>
            </CardContent>
          </Card>
        )

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Contract Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Contract Document (Optional)</Label>
                <div className={cn(
                  "border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors",
                  uploadedFile ? "border-green-300 bg-green-50" : "hover:border-brand-orange"
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
                          <p className="text-sm text-gray-600">
                            Analyzing contract... {uploadProgress}%
                          </p>
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setUploadedFile(null)}
                        className="mt-2"
                      >
                        Remove File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mx-auto">
                        <Upload className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Upload Contract</p>
                        <p className="text-sm text-gray-500">
                          Drag & drop or click to select (PDF, JPG, PNG)
                        </p>
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                        id="contract-upload"
                      />
                      <label htmlFor="contract-upload">
                        <Button type="button" asChild variant="outline">
                          <span className="cursor-pointer">Choose File</span>
                        </Button>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {analysisResults && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">AI Analysis Results</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Confidence:</span> {Math.round(analysisResults.confidence * 100)}%</p>
                    <p><span className="font-medium">Payment Terms:</span> {analysisResults.paymentTerms}</p>
                  </div>
                  <div className="mt-2">
                    <p className="font-medium text-blue-900 mb-1">Key Terms Found:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {analysisResults.keyTerms.map((term: string, index: number) => (
                        <li key={index}>{term}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

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
            </CardContent>
          </Card>
        )

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="h-5 w-5" />
                Review & Confirm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Vendor Information</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vendor Name:</span>
                    <span className="font-medium">{watchedValues.name}</span>
                  </div>
                  {watchedValues.canonicalName && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">DBA Name:</span>
                      <span className="font-medium">{watchedValues.canonicalName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">
                      {watchedValues.businessDescription === 'none' || !watchedValues.businessDescription ? 'Not specified' : watchedValues.businessDescription}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      watchedValues.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                    )}>
                      {watchedValues.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {uploadedFile && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Contract Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">File:</span>
                      <span className="font-medium">{uploadedFile.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Title:</span>
                      <span className="font-medium">{watchedValues.contractTitle || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Effective Date:</span>
                      <span className="font-medium">{watchedValues.effectiveDate || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expiration Date:</span>
                      <span className="font-medium">{watchedValues.expirationDate || 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  {uploadedFile 
                    ? `Creating vendor "${watchedValues.name}" with contract "${watchedValues.contractTitle || uploadedFile.name}"`
                    : `Creating vendor "${watchedValues.name}" without a contract`
                  }
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  You can add or modify contracts later from the vendor detail page.
                </p>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  const handleDialogChange = (isOpen: boolean) => {
    if (!isOpen && !isSubmitting) {
      reset()
      setCurrentStep(1)
      setNameCheckStatus('idle')
      setDuplicateVendorId(null)
      setUploadedFile(null)
      setAnalysisResults(null)
      setUploadProgress(0)
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Add New Vendor
          </DialogTitle>
          <DialogDescription>
            Create a new vendor and optionally upload their contract. This streamlined process will set up everything you need to start processing invoices.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {renderStepIndicator()}
          {renderStepContent()}

          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={goToPreviousStep}
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
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
              
              {currentStep < 3 ? (
                <Button 
                  type="button" 
                  onClick={goToNextStep}
                  disabled={
                    (currentStep === 1 && (
                      nameCheckStatus === 'duplicate' || 
                      nameCheckStatus === 'checking' || 
                      !watchedValues.name?.trim()
                    )) ||
                    isSubmitting
                  }
                  className="bg-brand-orange hover:bg-orange-600"
                >
                  Next Step
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
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