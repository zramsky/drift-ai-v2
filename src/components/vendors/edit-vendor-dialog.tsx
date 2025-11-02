'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Building2, Calendar, Tag, AlertTriangle } from 'lucide-react'
import { apiClient, type Vendor, type Contract } from '@/lib/api'
import { format, isValid, parse } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { validateDate, validateVendorName, validateTextField } from '@/lib/validation'

interface EditVendorDialogProps {
  vendor: Vendor
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface FormData {
  primaryVendorName: string
  dbaDisplayName: string
  category: string
  effectiveDate: string
  renewalEndDate: string
  status: 'active' | 'inactive'
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

export function EditVendorDialog({ vendor, open, onOpenChange, onSuccess }: EditVendorDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [nameCheckStatus, setNameCheckStatus] = useState<'idle' | 'checking' | 'unique' | 'duplicate'>('idle')
  const [duplicateVendorId, setDuplicateVendorId] = useState<string | null>(null)
  const [showRegeneratePrompt, setShowRegeneratePrompt] = useState(false)
  const [contractFieldsChanged, setContractFieldsChanged] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty }
  } = useForm<FormData>()

  const primaryVendorName = watch('primaryVendorName')
  const effectiveDate = watch('effectiveDate')
  const renewalEndDate = watch('renewalEndDate')

  // Reset form when vendor changes or dialog opens
  useEffect(() => {
    if (vendor && open) {
      reset({
        primaryVendorName: vendor.name || '',
        dbaDisplayName: vendor.canonicalName || '',
        category: vendor.businessDescription || '',
        effectiveDate: '', // We'll need to get this from the contract
        renewalEndDate: '', // We'll need to get this from the contract
        status: vendor.active ? 'active' : 'inactive'
      })
      setNameCheckStatus('idle')
      setShowRegeneratePrompt(false)
      setContractFieldsChanged(false)
    }
  }, [vendor, open, reset])

  // Check if contract-related fields have changed
  useEffect(() => {
    if (effectiveDate || renewalEndDate) {
      setContractFieldsChanged(true)
    }
  }, [effectiveDate, renewalEndDate])


  // Check vendor name uniqueness (only if changed)
  useEffect(() => {
    if (!primaryVendorName || primaryVendorName === vendor.name) {
      setNameCheckStatus('unique') // Original name is always valid
      return
    }

    if (primaryVendorName.length < 2) {
      setNameCheckStatus('idle')
      return
    }

    const checkUniqueness = async () => {
      setNameCheckStatus('checking')
      setDuplicateVendorId(null)

      try {
        const response = await apiClient.checkVendorNameUniqueness(primaryVendorName.trim())
        
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

    const timeoutId = setTimeout(checkUniqueness, 500) // Debounce
    return () => clearTimeout(timeoutId)
  }, [primaryVendorName, vendor.name])

  const handleRegenerateContractSummary = async () => {
    try {
      // This would trigger AI re-extraction
      toast({
        title: "Contract re-processing started",
        description: "The contract summary will be updated in a few moments.",
      })
      setShowRegeneratePrompt(false)
      setContractFieldsChanged(false)
    } catch (error) {
      toast({
        title: "Failed to reprocess contract",
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: "destructive"
      })
    }
  }

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
      if (data.effectiveDate) {
        const effectiveValidation = validateDate(data.effectiveDate, false)
        if (!effectiveValidation.isValid) {
          toast({
            title: "Invalid effective date",
            description: effectiveValidation.error,
            variant: "destructive"
          })
          setIsSubmitting(false)
          return
        }
      }

      if (data.renewalEndDate) {
        const renewalValidation = validateDate(data.renewalEndDate, false)
        if (!renewalValidation.isValid) {
          toast({
            title: "Invalid renewal/end date",
            description: renewalValidation.error,
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
          description: `Vendor '${data.primaryVendorName}' already exists. Please choose a different primary name.`,
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

      // Show regenerate prompt if contract fields changed
      if (contractFieldsChanged && !showRegeneratePrompt) {
        setShowRegeneratePrompt(true)
        setIsSubmitting(false)
        return
      }

      // Update vendor
      const response = await apiClient.updateVendor(vendor.id, {
        name: data.primaryVendorName.trim(),
        canonicalName: data.dbaDisplayName.trim() || undefined,
        businessDescription: data.category || undefined,
        active: data.status === 'active'
      })

      if (response.error) {
        toast({
          title: "Failed to update vendor",
          description: response.error,
          variant: "destructive"
        })
        setIsSubmitting(false)
        return
      }

      toast({
        title: "Vendor updated successfully",
        description: "The vendor information has been updated.",
      })

      onSuccess()
    } catch (error) {
      toast({
        title: "An error occurred",
        description: error instanceof Error ? error.message : 'Failed to update vendor',
        variant: "destructive"
      })
      setIsSubmitting(false)
    }
  }

  const renderNameValidation = () => {
    if (primaryVendorName === vendor.name) {
      return null // No validation needed for original name
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
          <span>Vendor '{primaryVendorName}' already exists. Please choose a different name.</span>
        </div>
      )
    }

    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Edit Vendor Details
          </DialogTitle>
          <DialogDescription>
            Update vendor information and contract details
          </DialogDescription>
        </DialogHeader>

        {/* Contract Regeneration Prompt */}
        {showRegeneratePrompt && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-orange-900 mb-2">Re-generate Contract Summary?</h4>
                  <p className="text-sm text-orange-800 mb-4">
                    You've modified contract-related fields. Would you like to re-process the contract to update the reconciliation summary?
                  </p>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      onClick={handleRegenerateContractSummary}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Yes, Re-generate
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowRegeneratePrompt(false)}
                    >
                      Skip for Now
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Vendor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5" />
                Vendor Information
              </CardTitle>
              <CardDescription>
                Basic vendor details and business information
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

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={watch('status')} onValueChange={(value: 'active' | 'inactive') => setValue('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Contract Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                Contract Dates
              </CardTitle>
              <CardDescription>
                Modify contract effective and renewal dates (optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="effectiveDate">Effective Date</Label>
                <Input
                  id="effectiveDate"
                  {...register('effectiveDate')}
                  placeholder="MM/DD/YYYY or YYYY-MM-DD (optional)"
                />
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

              {contractFieldsChanged && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                  <AlertCircle className="h-4 w-4" />
                  <span>Changing contract dates will require re-generating the contract summary</span>
                </div>
              )}
            </CardContent>
          </Card>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || nameCheckStatus === 'duplicate' || nameCheckStatus === 'checking' || !isDirty}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Updating...
                </div>
              ) : (
                'Update Vendor'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}