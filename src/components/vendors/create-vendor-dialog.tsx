'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Building2, CheckCircle, Plus } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { validateVendorName, validateTextField } from '@/lib/validation'

interface CreateVendorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface FormData {
  name: string
  canonicalName: string
  businessDescription: string
  active: boolean
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

export function CreateVendorDialog({ open, onOpenChange, onSuccess }: CreateVendorDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [nameCheckStatus, setNameCheckStatus] = useState<'idle' | 'checking' | 'unique' | 'duplicate'>('idle')
  const [duplicateVendorId, setDuplicateVendorId] = useState<string | null>(null)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty }
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      canonicalName: '',
      businessDescription: '',
      active: true
    }
  })

  const primaryVendorName = watch('name')

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

  // Debounced name check
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setValue('name', name)
    
    // Clear previous check status
    setNameCheckStatus('idle')
    setDuplicateVendorId(null)
    
    // Debounce the uniqueness check
    const timeoutId = setTimeout(() => {
      checkNameUniqueness(name)
    }, 500)

    return () => clearTimeout(timeoutId)
  }

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

      // Check for duplicate vendor name
      if (nameCheckStatus === 'duplicate') {
        toast({
          title: "Duplicate vendor name",
          description: `Vendor '${data.name}' already exists. Please choose a different name.`,
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

      // Create vendor
      const response = await apiClient.createVendor({
        name: data.name.trim(),
        canonicalName: data.canonicalName.trim() || data.name.trim(),
        businessDescription: data.businessDescription === 'none' ? undefined : data.businessDescription || undefined,
        active: data.active
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

      toast({
        title: "Vendor created successfully",
        description: `${data.name} has been added to your vendor directory.`,
      })

      // Reset form and close dialog
      reset()
      setNameCheckStatus('idle')
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

  const renderNameValidation = () => {
    if (!primaryVendorName || primaryVendorName.length < 2) {
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

  const handleDialogChange = (isOpen: boolean) => {
    if (!isOpen && !isSubmitting) {
      reset()
      setNameCheckStatus('idle')
      setDuplicateVendorId(null)
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Create New Vendor
          </DialogTitle>
          <DialogDescription>
            Add a new vendor to your directory. You can upload contracts for this vendor later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                  value={watch('businessDescription')} 
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
                  value={watch('active') ? 'active' : 'inactive'} 
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

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleDialogChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={
                isSubmitting || 
                nameCheckStatus === 'duplicate' || 
                nameCheckStatus === 'checking' || 
                !isDirty ||
                !primaryVendorName?.trim()
              }
              className="min-w-[120px]"
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}