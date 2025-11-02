'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  DollarSign,
  Clock,
  CheckCircle,
  X,
  Zap,
  FileText
} from 'lucide-react'

interface RelevanceToggleProps {
  findingId: string
  currentRelevance: 'high' | 'medium' | 'low'
  amount?: number
  description: string
  confidence: number
  onRelevanceChange: (findingId: string, relevance: 'high' | 'medium' | 'low', reason?: string) => void
  disabled?: boolean
}

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason?: string) => void
  type: 'mark_high' | 'mark_low' | 'dismiss'
  finding: {
    id: string
    description: string
    amount?: number
    confidence: number
  }
}

function ConfirmationModal({ isOpen, onClose, onConfirm, type, finding }: ConfirmationModalProps) {
  const [reason, setReason] = useState('')
  const [isConfirming, setIsConfirming] = useState(false)

  const handleConfirm = async () => {
    setIsConfirming(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    onConfirm(reason.trim() || undefined)
    setIsConfirming(false)
    setReason('')
    onClose()
  }

  const getModalConfig = () => {
    switch (type) {
      case 'mark_high':
        return {
          title: 'Mark as High Relevance',
          description: 'This finding will be prioritized for immediate attention and may trigger automated escalation workflows.',
          icon: <AlertTriangle className="h-6 w-6 text-error" />,
          buttonText: 'Mark as High Priority',
          buttonVariant: 'destructive' as const,
          requiresReason: true,
          warning: 'High relevance findings may require executive approval for resolution.'
        }
      case 'mark_low':
        return {
          title: 'Mark as Low Relevance',
          description: 'This finding will be deprioritized and may be resolved automatically in future similar cases.',
          icon: <Eye className="h-6 w-6 text-info" />,
          buttonText: 'Mark as Low Priority',
          buttonVariant: 'outline' as const,
          requiresReason: false,
          warning: null
        }
      case 'dismiss':
        return {
          title: 'Dismiss Finding',
          description: 'This finding will be marked as not relevant and removed from active review.',
          icon: <EyeOff className="h-6 w-6 text-muted-foreground" />,
          buttonText: 'Dismiss Finding',
          buttonVariant: 'outline' as const,
          requiresReason: true,
          warning: 'Dismissed findings will not appear in future reports unless manually restored.'
        }
    }
  }

  const config = getModalConfig()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {config.icon}
            {config.title}
          </DialogTitle>
          <DialogDescription className="text-left">
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Finding Summary */}
          <div className="bg-surface-secondary rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-sm mb-1">Finding Details</h4>
                <p className="text-sm text-muted-foreground">
                  {finding.description}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Confidence Score</p>
                <p className="font-medium">{finding.confidence}%</p>
              </div>
              {finding.amount && (
                <div>
                  <p className="text-muted-foreground">Financial Impact</p>
                  <p className="font-medium text-error">
                    ${finding.amount.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Warning */}
          {config.warning && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                <p className="text-sm text-warning">{config.warning}</p>
              </div>
            </div>
          )}

          {/* Reason Input */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason {config.requiresReason && <span className="text-error">*</span>}
            </Label>
            <Textarea
              id="reason"
              placeholder={
                type === 'mark_high' 
                  ? "Explain why this finding requires high priority attention..."
                  : type === 'dismiss'
                  ? "Explain why this finding is not relevant..."
                  : "Optional: Add notes about this decision..."
              }
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
            {config.requiresReason && (
              <p className="text-xs text-muted-foreground">
                A reason is required for {type === 'mark_high' ? 'high priority' : 'dismissed'} findings for audit purposes.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isConfirming}
          >
            Cancel
          </Button>
          <Button
            variant={config.buttonVariant}
            onClick={handleConfirm}
            disabled={isConfirming || (config.requiresReason && !reason.trim())}
          >
            {isConfirming ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                {config.buttonText}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function RelevanceToggle({
  findingId,
  currentRelevance,
  amount,
  description,
  confidence,
  onRelevanceChange,
  disabled = false
}: RelevanceToggleProps) {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<'mark_high' | 'mark_low' | 'dismiss' | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleRelevanceClick = (newRelevance: 'high' | 'medium' | 'low') => {
    if (disabled || newRelevance === currentRelevance) return

    // High relevance changes require confirmation
    if (newRelevance === 'high' && currentRelevance !== 'high') {
      setPendingAction('mark_high')
      setShowConfirmationModal(true)
      return
    }

    // Low relevance changes from high require confirmation
    if (newRelevance === 'low' && currentRelevance === 'high') {
      setPendingAction('mark_low')
      setShowConfirmationModal(true)
      return
    }

    // Medium relevance changes happen immediately
    onRelevanceChange(findingId, newRelevance)
  }

  const handleDismiss = () => {
    setPendingAction('dismiss')
    setShowConfirmationModal(true)
  }

  const handleConfirmAction = async (reason?: string) => {
    if (!pendingAction) return

    setIsProcessing(true)

    try {
      if (pendingAction === 'dismiss') {
        // Handle dismiss action - this would typically call a different API
        onRelevanceChange(findingId, 'low', reason) // For now, treat dismiss as low relevance
      } else {
        const targetRelevance = pendingAction === 'mark_high' ? 'high' : 'low'
        onRelevanceChange(findingId, targetRelevance, reason)
      }
    } finally {
      setIsProcessing(false)
      setPendingAction(null)
    }
  }

  const getRelevanceColor = (relevance: 'high' | 'medium' | 'low') => {
    switch (relevance) {
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'info'
    }
  }

  const getRelevanceIcon = (relevance: 'high' | 'medium' | 'low') => {
    switch (relevance) {
      case 'high': return <AlertTriangle className="h-3 w-3" />
      case 'medium': return <Clock className="h-3 w-3" />
      case 'low': return <Eye className="h-3 w-3" />
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Relevance:</span>
        
        <div className="flex items-center border rounded-lg overflow-hidden">
          {(['high', 'medium', 'low'] as const).map((relevance) => (
            <Button
              key={relevance}
              variant={currentRelevance === relevance ? 'default' : 'ghost'}
              size="sm"
              className={`px-3 py-1 rounded-none border-0 text-xs ${
                currentRelevance === relevance 
                  ? relevance === 'high' 
                    ? 'bg-error text-error-foreground hover:bg-error/90' 
                    : relevance === 'medium'
                    ? 'bg-warning text-warning-foreground hover:bg-warning/90'
                    : 'bg-info text-info-foreground hover:bg-info/90'
                  : 'hover:bg-surface-secondary'
              }`}
              onClick={() => handleRelevanceClick(relevance)}
              disabled={disabled || isProcessing}
            >
              {getRelevanceIcon(relevance)}
              <span className="ml-1 capitalize">{relevance}</span>
            </Button>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {amount && (
            <Badge variant="outline" className="text-xs">
              <DollarSign className="h-3 w-3 mr-1" />
              ${amount.toLocaleString()}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            {confidence}%
          </Badge>
        </div>

        {/* Dismiss Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          disabled={disabled || isProcessing}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          <EyeOff className="h-3 w-3 mr-1" />
          Dismiss
        </Button>
      </div>

      {/* Confirmation Modal */}
      {pendingAction && (
        <ConfirmationModal
          isOpen={showConfirmationModal}
          onClose={() => {
            setShowConfirmationModal(false)
            setPendingAction(null)
          }}
          onConfirm={handleConfirmAction}
          type={pendingAction}
          finding={{
            id: findingId,
            description,
            amount,
            confidence
          }}
        />
      )}
    </>
  )
}