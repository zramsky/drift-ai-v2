'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, FileText, Calendar, Building2, Tag, Lock } from 'lucide-react'
import { apiClient, type ContractExtractionData } from '@/lib/api'
import { format, isValid, parse, startOfDay } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { validateDate, validateVendorName, ValidationError, ValidationResult } from '@/lib/validation'

interface ContractReviewFormProps {
  extractedData: ContractExtractionData
  jobId: string | null
  fileName: string
  onComplete: (data: { vendorId: string; contractId: string }) => void
  onCancel: () => void
  isReplacement?: boolean
  vendorId?: string
}

interface FormData {
  primaryVendorName: string
  dbaDisplayName: string
  effectiveDate: string
  renewalEndDate: string
  category: string
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

export function ContractReviewForm({ 
  extractedData, 
  jobId, 
  fileName, 
  onComplete, 
  onCancel,
  isReplacement = false,
  vendorId
}: ContractReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [nameCheckStatus, setNameCheckStatus] = useState<'idle' | 'checking' | 'unique' | 'duplicate'>('idle')
  const [duplicateVendorId, setDuplicateVendorId] = useState<string | null>(null)
  const [nameCheckError, setNameCheckError] = useState<string | null>(null)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid: formIsValid }
  } = useForm<FormData>({
    defaultValues: {
      primaryVendorName: extractedData.primaryVendorName || '',
      dbaDisplayName: extractedData.dbaDisplayName || '',
      effectiveDate: extractedData.effectiveDate || '',
      renewalEndDate: extractedData.renewalEndDate || '',
      category: extractedData.category || ''
    }
  })

  const primaryVendorName = watch('primaryVendorName')


  // Check vendor name uniqueness
  useEffect(() => {
    if (!primaryVendorName || primaryVendorName.length < 2) {
      setNameCheckStatus('idle')
      return
    }

    const checkUniqueness = async () => {
      setNameCheckStatus('checking')
      setNameCheckError(null)
      setDuplicateVendorId(null)

      try {
        const response = await apiClient.checkVendorNameUniqueness(primaryVendorName.trim())
        
        if (response.error) {
          setNameCheckError(response.error)
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
        setNameCheckError(error instanceof Error ? error.message : 'Failed to check name uniqueness')
        setNameCheckStatus('idle')
      }
    }

    const timeoutId = setTimeout(checkUniqueness, 500) // Debounce
    return () => clearTimeout(timeoutId)
  }, [primaryVendorName])

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)

    try {
      // Validate vendor name
      const nameValidation = validateVendorName(data.primaryVendorName, true)
      if (!nameValidation.isValid) {
        toast({
          title: "Invalid vendor name",
          description: nameValidation.error,
          variant: "destructive"
        })
        setIsSubmitting(false)
        return
      }

      // Validate dates
      const effectiveValidation = validateDate(data.effectiveDate, true)
      if (!effectiveValidation.isValid) {
        toast({
          title: "Invalid effective date",
          description: effectiveValidation.error,
          variant: "destructive"
        })
        setIsSubmitting(false)
        return
      }

      let renewalValidation: ValidationResult = { isValid: true, formatted: '' }
      if (data.renewalEndDate.trim()) {
        renewalValidation = validateDate(data.renewalEndDate, false)
        if (!renewalValidation.isValid) {
          toast({
            title: "Invalid renewal/end date",
            description: renewalValidation.error || "Invalid date format",
            variant: "destructive"
          })
          setIsSubmitting(false)
          return
        }
      }

      // Check for duplicate vendor name
      if (nameCheckStatus === 'duplicate') {
        toast({
          title: "Duplicate vendor name",
          description: `Vendor '${data.primaryVendorName}' already exists. Please choose a different primary name or update the existing vendor's contract.`,
          variant: "destructive"
        })
        setIsSubmitting(false)
        return
      }

      if (nameCheckStatus === 'checking') {
        toast({
          title: "Please wait",
          description: "Still checking vendor name uniqueness...",
          variant: "destructive"
        })
        setIsSubmitting(false)
        return
      }

      if (isReplacement && vendorId) {
        // Update existing vendor with new contract data
        const updateResponse = await apiClient.updateVendor(vendorId, {
          name: data.primaryVendorName.trim(),
          canonicalName: data.dbaDisplayName.trim() || undefined,
          businessDescription: data.category || undefined
        })

        if (updateResponse.error) {
          toast({
            title: "Failed to update vendor",
            description: updateResponse.error,
            variant: "destructive"
          })
          setIsSubmitting(false)
          return
        }

        // Complete the replacement  
        onComplete({ 
          vendorId: vendorId!, 
          contractId: 'updated-contract-id' // Contract ID would come from the replacement response
        })
      } else {
        // Create new vendor
        const response = await apiClient.createVendorFromContract({
          primaryVendorName: data.primaryVendorName.trim(),
          dbaDisplayName: data.dbaDisplayName.trim() || undefined,
          effectiveDate: effectiveValidation.formatted || data.effectiveDate,
          renewalEndDate: renewalValidation.formatted || undefined,
          category: data.category || undefined,
          jobId: jobId || ''
        })

        if (response.error) {
          toast({
            title: "Failed to create vendor",
            description: response.error,
            variant: "destructive"
          })
          setIsSubmitting(false)
          return
        }

        if (response.data) {
          onComplete(response.data)
        }
      }
    } catch (error) {
      toast({
        title: "An error occurred",
        description: error instanceof Error ? error.message : 'Failed to create vendor',
        variant: "destructive"
      })
      setIsSubmitting(false)
    }
  }

  const renderNameValidation = () => {
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
          <span className="h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </span>
          <span>Name is available</span>
        </div>
      )
    }

    if (nameCheckStatus === 'duplicate') {
      return (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>Vendor '{primaryVendorName}' already exists. Please choose a different primary name.</span>
        </div>
      )
    }

    if (nameCheckError) {
      return (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>{nameCheckError}</span>
        </div>
      )
    }

    return null
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* File info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-gray-500" />
            <div>
              <p className="font-medium">{fileName}</p>
              <p className="text-sm text-gray-500">Contract document processed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vendor Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Vendor Information
          </CardTitle>
          <CardDescription>
            Review and edit the vendor details extracted from your contract
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primaryVendorName">
              Primary Vendor Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="primaryVendorName"
              {...register('primaryVendorName', { 
                required: 'Primary vendor name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' }
              })}
              className={errors.primaryVendorName || nameCheckStatus === 'duplicate' ? 'border-red-500' : ''}
            />
            {errors.primaryVendorName && (
              <p className="text-sm text-red-600">{errors.primaryVendorName.message}</p>
            )}
            {renderNameValidation()}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dbaDisplayName">DBA/Display Name</Label>
            <Input
              id="dbaDisplayName"
              {...register('dbaDisplayName')}
              placeholder="Optional - if different from primary name"
            />
            <p className="text-xs text-gray-500">
              The name commonly used in invoices or business communications
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">
              <Tag className="h-4 w-4 inline mr-1" />
              Category
            </Label>
            <Select value={watch('category')} onValueChange={(value) => setValue('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {VENDOR_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contract Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Contract Dates
          </CardTitle>
          <CardDescription>
            Verify the contract effective and renewal/end dates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="effectiveDate">
              Effective Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="effectiveDate"
              {...register('effectiveDate', { required: 'Effective date is required' })}
              placeholder="MM/DD/YYYY or YYYY-MM-DD"
              className={errors.effectiveDate ? 'border-red-500' : ''}
            />
            {errors.effectiveDate && (
              <p className="text-sm text-red-600">{errors.effectiveDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="renewalEndDate">Renewal/End Date</Label>
            <Input
              id="renewalEndDate"
              {...register('renewalEndDate')}
              placeholder="MM/DD/YYYY or YYYY-MM-DD (optional)"
            />
            <p className="text-xs text-gray-500">
              Leave empty if contract has no specific end or renewal date
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contract Summary - Read Only */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Contract Reconciliation Summary
          </CardTitle>
          <CardDescription>
            AI-generated summary of key contract terms and conditions (read-only)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gray-50 rounded-lg border">
            <Textarea
              value={extractedData.contractReconciliationSummary || 'No summary available'}
              readOnly
              className="min-h-32 resize-none bg-transparent border-none p-0 focus:ring-0"
            />
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <Lock className="h-3 w-3" />
            <span>This summary cannot be edited and will be used for future invoice reconciliation</span>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        
        <Button 
          type="submit" 
          disabled={isSubmitting || nameCheckStatus !== 'unique' || !formIsValid}
          className="min-w-[160px]"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Creating...
            </div>
          ) : (
            isReplacement ? 'Confirm & Replace Contract' : 'Confirm & Create Vendor'
          )}
        </Button>
      </div>
    </form>
  )
}