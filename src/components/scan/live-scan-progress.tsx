'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Zap, 
  FileText, 
  Receipt, 
  Brain, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Loader2,
  Eye
} from 'lucide-react'

interface ScanStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  duration: number // in seconds
  status: 'pending' | 'processing' | 'completed' | 'error'
  details?: string[]
}

interface LiveScanProgressProps {
  documentType: 'contract' | 'invoice'
  fileName: string
  onComplete: (results: any) => void
  onError: (error: string) => void
}

const CONTRACT_SCAN_STEPS: Omit<ScanStep, 'status'>[] = [
  {
    id: 'ocr',
    title: 'Document Analysis',
    description: 'Extracting text and structure from PDF',
    icon: <FileText className="h-5 w-5" />,
    duration: 3,
    details: ['Reading document pages', 'OCR text extraction', 'Layout analysis']
  },
  {
    id: 'ai-analysis',
    title: 'AI Processing',
    description: 'Analyzing contract terms and conditions',
    icon: <Brain className="h-5 w-5" />,
    duration: 5,
    details: ['Identifying contract clauses', 'Extracting payment terms', 'Finding pricing information', 'Detecting key dates']
  },
  {
    id: 'validation',
    title: 'Validation',
    description: 'Verifying extracted information',
    icon: <CheckCircle className="h-5 w-5" />,
    duration: 2,
    details: ['Cross-referencing data', 'Confidence scoring', 'Quality checks']
  }
]

const INVOICE_SCAN_STEPS: Omit<ScanStep, 'status'>[] = [
  {
    id: 'ocr',
    title: 'Document Processing',
    description: 'Reading invoice data and line items',
    icon: <Receipt className="h-5 w-5" />,
    duration: 2,
    details: ['OCR processing', 'Table extraction', 'Amount parsing']
  },
  {
    id: 'data-extraction',
    title: 'Data Extraction',
    description: 'Identifying invoice components',
    icon: <Brain className="h-5 w-5" />,
    duration: 3,
    details: ['Vendor identification', 'Line item parsing', 'Tax calculation', 'Total validation']
  },
  {
    id: 'reconciliation',
    title: 'Contract Reconciliation',
    description: 'Comparing against contract terms',
    icon: <Zap className="h-5 w-5" />,
    duration: 2,
    details: ['Finding matching contract', 'Rate comparison', 'Terms verification', 'Discrepancy detection']
  }
]

export function LiveScanProgress({ 
  documentType, 
  fileName, 
  onComplete, 
  onError 
}: LiveScanProgressProps) {
  const [steps, setSteps] = useState<ScanStep[]>(() => {
    const baseSteps = documentType === 'contract' ? CONTRACT_SCAN_STEPS : INVOICE_SCAN_STEPS
    return baseSteps.map(step => ({ ...step, status: 'pending' as const }))
  })
  
  const [currentStepIndex, setCurrentStepIndex] = useState(-1)
  const [currentStepProgress, setCurrentStepProgress] = useState(0)
  const [startTime] = useState(Date.now())
  const [showDetails, setShowDetails] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    if (currentStepIndex >= steps.length) {
      // All steps completed
      setIsCompleted(true)
      
      // Generate mock results based on document type
      const results = documentType === 'contract' ? {
        extractedTerms: {
          paymentTerms: 'Net 30',
          rate: '$125/hour',
          minimumOrder: 1000,
          discountPercent: 5
        },
        confidence: 0.94,
        pagesProcessed: 12,
        keyClausesFound: 23
      } : {
        totalAmount: 2850.00,
        lineItems: 4,
        discrepancies: Math.random() > 0.7 ? [
          {
            type: 'Rate Mismatch',
            description: 'Invoice rate exceeds contract rate',
            amount: 150.00
          }
        ] : [],
        confidence: 0.91,
        reconciliationStatus: Math.random() > 0.7 ? 'flagged' : 'clean'
      }
      
      setTimeout(() => onComplete(results), 1000)
      return
    }

    if (currentStepIndex === -1) {
      // Start first step
      setCurrentStepIndex(0)
      setSteps(prev => prev.map((step, idx) => 
        idx === 0 ? { ...step, status: 'processing' } : step
      ))
      return
    }

    const currentStep = steps[currentStepIndex]
    const stepDuration = currentStep.duration * 1000 // Convert to milliseconds
    const startTime = Date.now()
    
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min((elapsed / stepDuration) * 100, 100)
      setCurrentStepProgress(progress)
      
      if (progress >= 100) {
        // Step completed
        clearInterval(progressInterval)
        setCurrentStepProgress(0)
        
        setSteps(prev => prev.map((step, idx) => 
          idx === currentStepIndex ? { ...step, status: 'completed' } : step
        ))
        
        // Move to next step after a brief pause
        setTimeout(() => {
          const nextIndex = currentStepIndex + 1
          setCurrentStepIndex(nextIndex)
          
          if (nextIndex < steps.length) {
            setSteps(prev => prev.map((step, idx) => 
              idx === nextIndex ? { ...step, status: 'processing' } : step
            ))
          }
        }, 500)
      }
    }, 100)

    return () => clearInterval(progressInterval)
  }, [currentStepIndex, steps.length, onComplete, documentType])

  const getStepIcon = (step: ScanStep) => {
    switch (step.status) {
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success" />
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-error" />
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
    }
  }

  const getTotalElapsedTime = () => {
    const elapsed = (Date.now() - startTime) / 1000
    return elapsed.toFixed(1)
  }

  const getEstimatedTimeRemaining = () => {
    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0)
    const completedDuration = steps
      .slice(0, currentStepIndex)
      .reduce((sum, step) => sum + step.duration, 0)
    const currentStepCompleted = (currentStepProgress / 100) * (steps[currentStepIndex]?.duration || 0)
    
    const remaining = totalDuration - completedDuration - currentStepCompleted
    return Math.max(remaining, 0).toFixed(0)
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Live Scan Progress
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Processing: {fileName}
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {isCompleted ? 'Completed' : `${getTotalElapsedTime()}s`}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">
              Step {Math.max(currentStepIndex + 1, 1)} of {steps.length}
            </span>
            {!isCompleted && (
              <span className="text-muted-foreground">
                ~{getEstimatedTimeRemaining()}s remaining
              </span>
            )}
          </div>
          <div className="w-full bg-surface-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${((currentStepIndex + (currentStepProgress / 100)) / steps.length) * 100}%` 
              }}
            />
          </div>
        </div>

        {/* Step Details */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`border rounded-lg p-4 transition-all
                ${step.status === 'processing' ? 'border-primary bg-primary/5' : 
                  step.status === 'completed' ? 'border-success/30 bg-success/5' : 
                  'border-border'}
              `}
            >
              <div className="flex items-center gap-3">
                {getStepIcon(step)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{step.title}</h4>
                    <Badge 
                      variant={
                        step.status === 'completed' ? 'success' :
                        step.status === 'processing' ? 'default' :
                        'secondary'
                      }
                      className="text-xs"
                    >
                      {step.status === 'processing' ? 'Running' :
                       step.status === 'completed' ? 'Done' :
                       'Pending'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {step.description}
                  </p>
                  
                  {/* Current step progress */}
                  {step.status === 'processing' && currentStepProgress > 0 && (
                    <div className="mt-3">
                      <div className="w-full bg-surface-secondary rounded-full h-1">
                        <div
                          className="bg-primary h-1 rounded-full transition-all duration-200"
                          style={{ width: `${currentStepProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Step details */}
                  {showDetails && step.details && (
                    <div className="mt-3 space-y-1">
                      {step.details.map((detail, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className={`w-1.5 h-1.5 rounded-full
                            ${step.status === 'completed' ? 'bg-success' :
                              step.status === 'processing' && idx <= (currentStepProgress / 100) * step.details!.length ? 'bg-primary' :
                              'bg-surface-secondary'}
                          `} />
                          {detail}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {showDetails ? 'Hide' : 'Show'} Details
          </Button>
          
          <div className="text-sm text-muted-foreground">
            {isCompleted ? (
              <span className="text-success font-medium">✓ Processing complete</span>
            ) : (
              <span>AI processing in progress...</span>
            )}
          </div>
        </div>

        {/* Performance Stats */}
        {isCompleted && (
          <div className="bg-surface-secondary rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-sm">Processing Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Time</p>
                <p className="font-medium">{getTotalElapsedTime()}s</p>
              </div>
              <div>
                <p className="text-muted-foreground">Document Type</p>
                <p className="font-medium capitalize">{documentType}</p>
              </div>
              <div>
                <p className="text-muted-foreground">AI Model</p>
                <p className="font-medium">Claude 3.5 Sonnet</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium text-success">Success</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}