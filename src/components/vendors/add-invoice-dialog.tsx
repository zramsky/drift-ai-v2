'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, FileText, X, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface AddInvoiceDialogProps {
  vendorId: string
  vendorName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface UploadedFile {
  file: File
  url: string
  status: 'pending' | 'uploading' | 'analyzing' | 'complete' | 'error'
  analysis?: any
  error?: string
}

export function AddInvoiceDialog({
  vendorId,
  vendorName,
  open,
  onOpenChange,
  onSuccess
}: AddInvoiceDialogProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [notes, setNotes] = useState('')
  const [dragActive, setDragActive] = useState(false)

  // AI Analysis mutation
  const analyzeInvoiceMutation = useMutation({
    mutationFn: async (file: File) => {
      // Convert file to base64 for GPT-4o
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          // Remove data URL prefix and keep just the base64 data
          const base64Data = result.split(',')[1]
          resolve(base64Data)
        }
        reader.readAsDataURL(file)
      })

      // Call our AI analysis endpoint with base64 image
      const response = await fetch('/api/invoices/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: base64,
          imageType: file.type,
          fileName: file.name,
          contractTerms: {
            paymentTerms: "Net 30 Days",
            pricing: [
              {
                item: "Medical Supplies",
                price: 15.99,
                unit: "box"
              }
            ],
            taxRate: 8.5,
            effectiveDate: "2024-01-01"
          },
          vendorInfo: {
            name: vendorName,
            id: vendorId
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Analysis failed')
      }

      return response.json()
    },
    onSuccess: (analysis, file) => {
      setUploadedFiles(prev => prev.map(f => 
        f.file === file 
          ? { ...f, status: 'complete', analysis }
          : f
      ))
    },
    onError: (error: any, file) => {
      setUploadedFiles(prev => prev.map(f => 
        f.file === file 
          ? { ...f, status: 'error', error: error.message }
          : f
      ))
    }
  })

  // Save invoice mutation
  const saveInvoiceMutation = useMutation({
    mutationFn: async (invoiceData: any) => {
      // In a real app, this would save to your backend
      // For now, we'll simulate the save
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { id: 'INV-' + Date.now(), ...invoiceData }
    },
    onSuccess: (invoice) => {
      // Invalidate queries to refresh the vendor data
      queryClient.invalidateQueries({ queryKey: ['invoices', vendorId] })
      queryClient.invalidateQueries({ queryKey: ['vendor', vendorId] })
      
      // Navigate to the new invoice
      router.push(`/vendors/${vendorId}?invoice=${invoice.id}`)
      
      // Close dialog and notify success
      onOpenChange(false)
      onSuccess?.()
    }
  })

  const handleFileUpload = async (files: File[]) => {
    const newFiles = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      status: 'uploading' as const
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])

    // Process each file
    for (const fileData of newFiles) {
      // Update status to analyzing
      setUploadedFiles(prev => prev.map(f => 
        f.file === fileData.file 
          ? { ...f, status: 'analyzing' }
          : f
      ))

      // Start AI analysis
      analyzeInvoiceMutation.mutate(fileData.file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/') || file.type === 'application/pdf'
    )
    
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }

  const removeFile = (fileToRemove: UploadedFile) => {
    setUploadedFiles(prev => prev.filter(f => f !== fileToRemove))
    URL.revokeObjectURL(fileToRemove.url)
  }

  const handleSave = () => {
    const completedAnalyses = uploadedFiles.filter(f => f.status === 'complete')
    if (completedAnalyses.length === 0) return

    // For demo, we'll use the first analysis result
    const primaryAnalysis = completedAnalyses[0].analysis

    const invoiceData = {
      vendorId,
      invoiceNumber: primaryAnalysis.extractedData.invoiceNumber,
      totalAmount: primaryAnalysis.extractedData.totalAmount,
      invoiceDate: primaryAnalysis.extractedData.date,
      dueDate: primaryAnalysis.extractedData.dueDate,
      lineItems: primaryAnalysis.extractedData.lineItems,
      status: primaryAnalysis.complianceStatus === 'compliant' ? 'reconciled' : 'flagged',
      aiAnalysis: primaryAnalysis,
      notes
    }

    saveInvoiceMutation.mutate(invoiceData)
  }

  const canSave = uploadedFiles.some(f => f.status === 'complete') && !saveInvoiceMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Invoice for {vendorName}</DialogTitle>
          <DialogDescription>
            Upload invoice images or PDFs. Our AI will analyze them against contract terms.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload Area */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              dragActive ? "border-brand-orange bg-brand-orange/5" : "border-border",
              "hover:border-brand-orange/50"
            )}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault()
              setDragActive(true)
            }}
            onDragLeave={() => setDragActive(false)}
          >
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Upload Invoice Files</h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop files here, or click to select
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports: Images (PNG, JPG, JPEG) and PDFs
            </p>
            <Button 
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="hover:bg-brand-orange/10"
            >
              Select Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium">Uploaded Files</h3>
              <div className="space-y-3">
                {uploadedFiles.map((fileData, index) => (
                  <Card key={index} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <CardTitle className="text-sm">{fileData.file.name}</CardTitle>
                            <CardDescription>
                              {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            fileData.status === 'complete' ? 'default' :
                            fileData.status === 'error' ? 'destructive' :
                            'secondary'
                          }>
                            {fileData.status === 'uploading' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                            {fileData.status === 'analyzing' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                            {fileData.status === 'complete' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {fileData.status === 'error' && <AlertTriangle className="w-3 h-3 mr-1" />}
                            {fileData.status === 'pending' ? 'Pending' :
                             fileData.status === 'uploading' ? 'Uploading' :
                             fileData.status === 'analyzing' ? 'Analyzing' :
                             fileData.status === 'complete' ? 'Complete' : 'Error'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(fileData)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    {/* Analysis Results */}
                    {fileData.status === 'complete' && fileData.analysis && (
                      <CardContent className="pt-0">
                        <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-success" />
                            <span className="text-sm font-medium text-success">
                              AI Analysis Complete
                            </span>
                            <Badge variant="outline">
                              {Math.round(fileData.analysis.confidence * 100)}% confidence
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <strong>Invoice #:</strong> {fileData.analysis.extractedData.invoiceNumber}
                            </div>
                            <div>
                              <strong>Total:</strong> ${fileData.analysis.extractedData.totalAmount?.toLocaleString()}
                            </div>
                            <div>
                              <strong>Date:</strong> {fileData.analysis.extractedData.date}
                            </div>
                            <div>
                              <strong>Status:</strong>{' '}
                              <Badge variant={
                                fileData.analysis.complianceStatus === 'compliant' ? 'default' :
                                fileData.analysis.complianceStatus === 'discrepancy' ? 'destructive' :
                                'secondary'
                              }>
                                {fileData.analysis.complianceStatus}
                              </Badge>
                            </div>
                          </div>
                          {fileData.analysis.discrepancies.length > 0 && (
                            <div className="mt-3 p-2 bg-warning/10 border border-warning/20 rounded">
                              <p className="text-sm text-warning font-medium">
                                {fileData.analysis.discrepancies.length} discrepancies found
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    )}

                    {/* Error Display */}
                    {fileData.status === 'error' && (
                      <CardContent className="pt-0">
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            <span className="text-sm font-medium text-destructive">
                              Analysis Failed
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {fileData.error || 'Unknown error occurred'}
                          </p>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about this invoice..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={saveInvoiceMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!canSave}
              className="bg-brand-orange hover:bg-orange-600 text-white"
            >
              {saveInvoiceMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving Invoice...
                </>
              ) : (
                'Save Invoice'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}