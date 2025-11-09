'use client'

import { useState, useRef } from 'react'
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

interface AddContractDialogProps {
  vendorId: string
  vendorName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface UploadedContract {
  file: File
  url: string
  status: 'pending' | 'uploading' | 'analyzing' | 'complete' | 'error'
  analysis?: any
  error?: string
}

export function AddContractDialog({
  vendorId,
  vendorName,
  open,
  onOpenChange,
  onSuccess
}: AddContractDialogProps) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [uploadedContracts, setUploadedContracts] = useState<UploadedContract[]>([])
  const [contractTitle, setContractTitle] = useState('')
  const [effectiveDate, setEffectiveDate] = useState('')
  const [expirationDate, setExpirationDate] = useState('')
  const [notes, setNotes] = useState('')
  const [dragActive, setDragActive] = useState(false)

  // AI Analysis mutation for contracts
  const analyzeContractMutation = useMutation({
    mutationFn: async (file: File) => {
      // Convert file to base64 for AI analysis
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          const base64Data = result.split(',')[1]
          resolve(base64Data)
        }
        reader.readAsDataURL(file)
      })

      // Simulate contract analysis (in real app, this would call your contract analysis API)
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))

      // Mock contract analysis response
      return {
        success: true,
        confidence: 0.92,
        extractedData: {
          contractType: 'Service Agreement',
          vendor: vendorName,
          effectiveDate: '2024-01-01',
          expirationDate: '2024-12-31',
          paymentTerms: 'Net 30 Days',
          pricing: [
            {
              item: 'Medical Supplies',
              price: 15.99,
              unit: 'box',
              minimumOrder: 10
            }
          ],
          discounts: [
            {
              type: 'Volume Discount',
              amount: 10,
              conditions: 'Orders over 100 units'
            }
          ],
          taxRate: 8.5,
          renewalTerms: 'Auto-renewal for 1 year'
        },
        keyTerms: [
          'Payment within 30 days',
          'Volume discounts available',
          'Quality guarantee included',
          'Force majeure clause present'
        ],
        processingTime: 2.1
      }
    },
    onSuccess: (analysis, file) => {
      setUploadedContracts(prev => prev.map(f => 
        f.file === file 
          ? { ...f, status: 'complete', analysis }
          : f
      ))
    },
    onError: (error: any, file) => {
      setUploadedContracts(prev => prev.map(f => 
        f.file === file 
          ? { ...f, status: 'error', error: error.message }
          : f
      ))
    }
  })

  // Save contract mutation
  const saveContractMutation = useMutation({
    mutationFn: async (contractData: any) => {
      // In a real app, this would save to your backend
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { id: 'CON-' + Date.now(), ...contractData }
    },
    onSuccess: () => {
      // Invalidate queries to refresh the vendor data
      queryClient.invalidateQueries({ queryKey: ['contracts', vendorId] })
      queryClient.invalidateQueries({ queryKey: ['vendor', vendorId] })
      
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

    setUploadedContracts(prev => [...prev, ...newFiles])

    // Process each file
    for (const fileData of newFiles) {
      // Update status to analyzing
      setUploadedContracts(prev => prev.map(f => 
        f.file === fileData.file 
          ? { ...f, status: 'analyzing' }
          : f
      ))

      // Start AI analysis
      analyzeContractMutation.mutate(fileData.file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type === 'application/pdf' || file.type.startsWith('image/')
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

  const removeFile = (fileToRemove: UploadedContract) => {
    setUploadedContracts(prev => prev.filter(f => f !== fileToRemove))
    URL.revokeObjectURL(fileToRemove.url)
  }

  const handleSave = () => {
    const completedAnalyses = uploadedContracts.filter(f => f.status === 'complete')
    if (completedAnalyses.length === 0) return

    // For demo, we'll use the first analysis result
    const primaryAnalysis = completedAnalyses[0].analysis

    const contractData = {
      vendorId,
      title: contractTitle || `${vendorName} Contract`,
      effectiveDate: effectiveDate || primaryAnalysis.extractedData.effectiveDate,
      expirationDate: expirationDate || primaryAnalysis.extractedData.expirationDate,
      status: 'active',
      type: primaryAnalysis.extractedData.contractType,
      paymentTerms: primaryAnalysis.extractedData.paymentTerms,
      pricing: primaryAnalysis.extractedData.pricing,
      discounts: primaryAnalysis.extractedData.discounts,
      taxRate: primaryAnalysis.extractedData.taxRate,
      notes,
      aiAnalysis: primaryAnalysis
    }

    saveContractMutation.mutate(contractData)
  }

  const canSave = uploadedContracts.some(f => f.status === 'complete') && 
                  contractTitle.trim() !== '' &&
                  !saveContractMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Contract for {vendorName}</DialogTitle>
          <DialogDescription>
            Upload contract documents. Our AI will extract key terms and pricing information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contract Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contractTitle">Contract Title *</Label>
              <Input
                id="contractTitle"
                placeholder="e.g., Medical Supplies Agreement 2024"
                value={contractTitle}
                onChange={(e) => setContractTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="effectiveDate">Effective Date</Label>
              <Input
                id="effectiveDate"
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expirationDate">Expiration Date</Label>
              <Input
                id="expirationDate"
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
              />
            </div>
          </div>

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
            <h3 className="text-lg font-medium mb-2">Upload Contract Files</h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop contract documents here, or click to select
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports: PDFs and Images (PNG, JPG, JPEG)
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
              accept=".pdf,image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Uploaded Contracts */}
          {uploadedContracts.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium">Uploaded Contracts</h3>
              <div className="space-y-3">
                {uploadedContracts.map((contractData, index) => (
                  <Card key={index} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <CardTitle className="text-sm">{contractData.file.name}</CardTitle>
                            <CardDescription>
                              {(contractData.file.size / 1024 / 1024).toFixed(2)} MB
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            contractData.status === 'complete' ? 'default' :
                            contractData.status === 'error' ? 'destructive' :
                            'secondary'
                          }>
                            {contractData.status === 'uploading' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                            {contractData.status === 'analyzing' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                            {contractData.status === 'complete' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {contractData.status === 'error' && <AlertTriangle className="w-3 h-3 mr-1" />}
                            {contractData.status === 'pending' ? 'Pending' :
                             contractData.status === 'uploading' ? 'Uploading' :
                             contractData.status === 'analyzing' ? 'Analyzing' :
                             contractData.status === 'complete' ? 'Complete' : 'Error'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(contractData)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    {/* Analysis Results */}
                    {contractData.status === 'complete' && contractData.analysis && (
                      <CardContent className="pt-0">
                        <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle className="h-4 w-4 text-success" />
                            <span className="text-sm font-medium text-success">
                              Contract Analysis Complete
                            </span>
                            <Badge variant="outline">
                              {Math.round(contractData.analysis.confidence * 100)}% confidence
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                            <div>
                              <strong>Type:</strong> {contractData.analysis.extractedData.contractType}
                            </div>
                            <div>
                              <strong>Payment Terms:</strong> {contractData.analysis.extractedData.paymentTerms}
                            </div>
                            <div>
                              <strong>Effective:</strong> {contractData.analysis.extractedData.effectiveDate}
                            </div>
                            <div>
                              <strong>Expires:</strong> {contractData.analysis.extractedData.expirationDate}
                            </div>
                          </div>
                          <div className="text-sm">
                            <strong>Key Terms:</strong>
                            <ul className="list-disc list-inside mt-1 text-muted-foreground">
                              {contractData.analysis.keyTerms.map((term: string, i: number) => (
                                <li key={i}>{term}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    )}

                    {/* Error Display */}
                    {contractData.status === 'error' && (
                      <CardContent className="pt-0">
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            <span className="text-sm font-medium text-destructive">
                              Analysis Failed
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {contractData.error || 'Unknown error occurred'}
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
            <Label htmlFor="contractNotes">Notes (Optional)</Label>
            <Textarea
              id="contractNotes"
              placeholder="Add any additional notes about this contract..."
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
              disabled={saveContractMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!canSave}
              className="bg-brand-orange hover:bg-orange-600 text-white"
            >
              {saveContractMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving Contract...
                </>
              ) : (
                'Save Contract'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}