'use client'

import { useState } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Upload, Search, Receipt, CheckCircle, XCircle, AlertTriangle, Clock, Plus, Zap } from 'lucide-react'
import { apiClient, type Invoice } from '@/lib/api'
import { InvoiceDetailModal } from '@/components/invoices/invoice-detail-modal'
import { InvoiceUpload } from '@/components/upload/invoice-upload'
import { useToast } from '@/hooks/use-toast'

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false)
  const [actionInvoiceId, setActionInvoiceId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const response = await apiClient.getInvoices()
      if (response.error) {
        throw new Error(response.error)
      }
      return response.data || []
    },
  })

  // Approval mutation
  const approveInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const response = await apiClient.approveInvoice(invoiceId)
      if (response.error) {
        throw new Error(response.error)
      }
      return response.data
    },
    onSuccess: (updatedInvoice) => {
      toast({
        title: "Invoice Approved",
        description: `Invoice ${updatedInvoice?.invoiceNumber} has been approved successfully.`,
      })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error) => {
      toast({
        title: "Approval Failed",
        description: error instanceof Error ? error.message : 'Failed to approve invoice',
        variant: "destructive"
      })
    }
  })

  // Rejection mutation
  const rejectInvoiceMutation = useMutation({
    mutationFn: async ({ invoiceId, reason }: { invoiceId: string; reason: string }) => {
      const response = await apiClient.rejectInvoice(invoiceId, reason)
      if (response.error) {
        throw new Error(response.error)
      }
      return response.data
    },
    onSuccess: (updatedInvoice) => {
      toast({
        title: "Invoice Rejected",
        description: `Invoice ${updatedInvoice?.invoiceNumber} has been rejected.`,
      })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setRejectionReason('')
    },
    onError: (error) => {
      toast({
        title: "Rejection Failed",
        description: error instanceof Error ? error.message : 'Failed to reject invoice',
        variant: "destructive"
      })
    }
  })

  const filteredInvoices = invoices?.filter(invoice =>
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.vendor?.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'flagged':
        return <Badge variant="warning">Flagged</Badge>
      case 'reconciled':
        return <Badge variant="secondary">Reconciled</Badge>
      case 'pending':
        return <Badge variant="outline">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleViewInvoice = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedInvoiceId(null)
  }

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'flagged':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'reconciled':
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-600" />
      default:
        return <Receipt className="h-4 w-4 text-gray-600" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const handleUploadComplete = (result: {
    invoiceId: string
    vendorId: string
    fileName: string
    reconciliationStatus: 'processing' | 'completed' | 'flagged'
  }) => {
    // Refresh invoices data
    queryClient.invalidateQueries({ queryKey: ['invoices'] })
    queryClient.invalidateQueries({ queryKey: ['vendors'] })
    setIsUploadOpen(false)
    
    // Show success notification (could add toast here)
    console.log('Invoice uploaded successfully:', result)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Invoice action handlers
  const handleApproveClick = (invoiceId: string) => {
    setActionInvoiceId(invoiceId)
    setApprovalDialogOpen(true)
  }

  const handleRejectClick = (invoiceId: string) => {
    setActionInvoiceId(invoiceId)
    setRejectionDialogOpen(true)
  }

  const handleConfirmApproval = () => {
    if (actionInvoiceId) {
      approveInvoiceMutation.mutate(actionInvoiceId)
      setApprovalDialogOpen(false)
      setActionInvoiceId(null)
    }
  }

  const handleConfirmRejection = () => {
    if (actionInvoiceId && rejectionReason.trim()) {
      rejectInvoiceMutation.mutate({ 
        invoiceId: actionInvoiceId, 
        reason: rejectionReason.trim() 
      })
      setRejectionDialogOpen(false)
      setActionInvoiceId(null)
    }
  }

  const selectedInvoiceForAction = actionInvoiceId 
    ? invoices?.find(inv => inv.id === actionInvoiceId)
    : null

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <Button onClick={() => setIsUploadOpen(true)}>
            <Zap className="mr-2 h-4 w-4" />
            Upload Invoice
          </Button>
        </div>
        <div className="text-center py-12">Loading invoices...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <Button onClick={() => setIsUploadOpen(true)}>
            <Zap className="mr-2 h-4 w-4" />
            Upload Invoice
          </Button>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-red-600">
              Error loading invoices. Please check your backend connection.
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Process and reconcile vendor invoices against contracts
          </p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Invoice
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices?.filter(i => i.status === 'pending').length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices?.filter(i => i.status === 'flagged').length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices?.filter(i => i.status === 'approved').length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(invoices?.reduce((sum, i) => sum + i.totalAmount, 0) || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Processing</CardTitle>
          <CardDescription>Review and reconcile vendor invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Invoice Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {invoices?.length === 0 ? 'No invoices found. Upload your first invoice to get started.' : 'No invoices match your search criteria.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(invoice.status)}
                        <div>
                          <div className="font-medium">{invoice.invoiceNumber}</div>
                          <div className="text-sm text-muted-foreground">{invoice.fileName}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{invoice.vendor?.name || 'Unknown'}</div>
                        <div className="text-sm text-muted-foreground">
                          {invoice.vendor?.businessDescription || 'No description'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(invoice.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(invoice.invoiceDate)}
                        {invoice.dueDate && (
                          <div className="text-muted-foreground">
                            Due: {formatDate(invoice.dueDate)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {formatCurrency(invoice.totalAmount)}
                      </div>
                      {invoice.taxAmount && (
                        <div className="text-xs text-muted-foreground">
                          Tax: {formatCurrency(invoice.taxAmount)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewInvoice(invoice.id)}
                        >
                          View
                        </Button>
                        {invoice.status === 'flagged' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleApproveClick(invoice.id)}
                              disabled={approveInvoiceMutation.isPending}
                              className="text-green-600 border-green-300 hover:bg-green-50"
                            >
                              {approveInvoiceMutation.isPending && actionInvoiceId === invoice.id ? (
                                <div className="flex items-center gap-2">
                                  <div className="animate-spin h-3 w-3 border border-green-500 border-t-transparent rounded-full" />
                                  Approving...
                                </div>
                              ) : (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approve
                                </>
                              )}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRejectClick(invoice.id)}
                              disabled={rejectInvoiceMutation.isPending}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              {rejectInvoiceMutation.isPending && actionInvoiceId === invoice.id ? (
                                <div className="flex items-center gap-2">
                                  <div className="animate-spin h-3 w-3 border border-red-500 border-t-transparent rounded-full" />
                                  Rejecting...
                                </div>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Reject
                                </>
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        invoiceId={selectedInvoiceId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload & Reconcile Invoice</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-6">
            <InvoiceUpload onUploadComplete={handleUploadComplete} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Approval Confirmation Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Approve Invoice
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this invoice? This action will mark it as approved and ready for payment processing.
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoiceForAction && (
            <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
              <div><strong>Invoice:</strong> {selectedInvoiceForAction.invoiceNumber}</div>
              <div><strong>Vendor:</strong> {selectedInvoiceForAction.vendor?.name}</div>
              <div><strong>Amount:</strong> {formatCurrency(selectedInvoiceForAction.totalAmount)}</div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApprovalDialogOpen(false)}
              disabled={approveInvoiceMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmApproval}
              disabled={approveInvoiceMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {approveInvoiceMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Approving...
                </div>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Approval
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Confirmation Dialog */}
      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Reject Invoice
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this invoice. This information will be logged and may be used for vendor communications.
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoiceForAction && (
            <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
              <div><strong>Invoice:</strong> {selectedInvoiceForAction.invoiceNumber}</div>
              <div><strong>Vendor:</strong> {selectedInvoiceForAction.vendor?.name}</div>
              <div><strong>Amount:</strong> {formatCurrency(selectedInvoiceForAction.totalAmount)}</div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="rejection-reason" className="text-sm font-medium">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please explain why this invoice is being rejected..."
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Common reasons: pricing discrepancy, missing documentation, unauthorized charges, duplicate invoice, etc.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectionDialogOpen(false)
                setRejectionReason('')
              }}
              disabled={rejectInvoiceMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRejection}
              disabled={rejectInvoiceMutation.isPending || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {rejectInvoiceMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Rejecting...
                </div>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Confirm Rejection
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}