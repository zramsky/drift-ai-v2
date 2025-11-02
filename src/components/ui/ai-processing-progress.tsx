'use client'

import { useEffect, useState } from 'react'
import { Progress } from './progress'
import { Badge } from './badge'
import { Card } from './card'
import { CheckCircle, AlertTriangle, Clock, Zap, Brain, Eye, FileSearch } from 'lucide-react'

export interface ProcessingStep {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  estimatedDuration: number // in milliseconds
  status: 'pending' | 'in_progress' | 'completed' | 'error'
  confidence?: number
}

interface AIProcessingProgressProps {
  steps: ProcessingStep[]
  currentStep: string | null
  overallProgress: number
  estimatedTimeRemaining?: number
  error?: string | null
  onRetry?: () => void
  showConfidence?: boolean
}

export function AIProcessingProgress({
  steps,
  currentStep,
  overallProgress,
  estimatedTimeRemaining,
  error,
  onRetry,
  showConfidence = true
}: AIProcessingProgressProps) {
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m ${seconds % 60}s`
  }

  const getStepIcon = (step: ProcessingStep) => {
    if (step.status === 'completed') {
      return <CheckCircle className="h-4 w-4 text-success" />
    } else if (step.status === 'error') {
      return <AlertTriangle className="h-4 w-4 text-destructive" />
    } else if (step.status === 'in_progress') {
      return (
        <div className="relative">
          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )
    }
    return <div className="h-4 w-4 rounded-full bg-muted" />
  }

  const getStepStatus = (step: ProcessingStep) => {
    switch (step.status) {
      case 'completed':
        return 'success'
      case 'error':
        return 'destructive'
      case 'in_progress':
        return 'default'
      default:
        return 'secondary'
    }
  }

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Processing Pipeline
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Advanced document analysis and extraction in progress
          </p>
        </div>
        
        <div className="text-right text-sm">
          <div className="font-medium">{Math.round(overallProgress)}% Complete</div>
          {estimatedTimeRemaining && (
            <div className="text-muted-foreground">
              ~{formatTime(estimatedTimeRemaining)} remaining
            </div>
          )}
          <div className="text-muted-foreground">
            Elapsed: {formatTime(elapsedTime)}
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="space-y-2">
        <Progress value={overallProgress} className="h-2" />
        {error && (
          <div className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Processing Error</span>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-sm text-destructive hover:underline"
              >
                Retry
              </button>
            )}
          </div>
        )}
      </div>

      {/* Processing Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
              step.status === 'in_progress' 
                ? 'bg-primary/5 border-primary/20 shadow-sm' 
                : step.status === 'completed'
                ? 'bg-success/5 border-success/20'
                : step.status === 'error'
                ? 'bg-destructive/5 border-destructive/20'
                : 'bg-muted/30 border-border'
            }`}
          >
            {/* Step Icon */}
            <div className="flex-shrink-0">
              {getStepIcon(step)}
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-medium">{step.label}</h4>
                <Badge variant={getStepStatus(step)} className="text-xs">
                  {step.status.replace('_', ' ')}
                </Badge>
                {step.status === 'completed' && showConfidence && step.confidence && (
                  <Badge variant="outline" className="text-xs">
                    {step.confidence}% confidence
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{step.description}</p>
              
              {/* Step Progress */}
              {step.status === 'in_progress' && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300 animate-pulse"
                        style={{ width: '60%' }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ~{formatTime(step.estimatedDuration)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Step Number */}
            <div className="flex-shrink-0">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                step.status === 'completed' 
                  ? 'bg-success text-success-foreground'
                  : step.status === 'in_progress'
                  ? 'bg-primary text-primary-foreground'
                  : step.status === 'error'
                  ? 'bg-destructive text-destructive-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {index + 1}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Processing Insights */}
      {currentStep && (
        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="flex items-start gap-3">
            <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Current Processing Stage</h4>
              <p className="text-xs text-muted-foreground">
                Our AI is currently analyzing your document using advanced computer vision and natural language processing.
                This includes OCR text extraction, layout analysis, and intelligent field recognition.
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

// Predefined processing steps for different document types
export const CONTRACT_PROCESSING_STEPS: ProcessingStep[] = [
  {
    id: 'upload',
    label: 'Document Upload',
    description: 'Securely uploading and validating document format',
    icon: <FileSearch className="h-4 w-4" />,
    estimatedDuration: 2000,
    status: 'pending'
  },
  {
    id: 'ocr',
    label: 'OCR Text Extraction',
    description: 'Extracting text content using advanced optical character recognition',
    icon: <Eye className="h-4 w-4" />,
    estimatedDuration: 8000,
    status: 'pending'
  },
  {
    id: 'analysis',
    label: 'AI Document Analysis',
    description: 'Analyzing contract structure and identifying key clauses',
    icon: <Brain className="h-4 w-4" />,
    estimatedDuration: 12000,
    status: 'pending'
  },
  {
    id: 'extraction',
    label: 'Data Extraction',
    description: 'Extracting vendor details, terms, and pricing information',
    icon: <Zap className="h-4 w-4" />,
    estimatedDuration: 6000,
    status: 'pending'
  },
  {
    id: 'validation',
    label: 'Quality Validation',
    description: 'Validating extracted data and calculating confidence scores',
    icon: <CheckCircle className="h-4 w-4" />,
    estimatedDuration: 4000,
    status: 'pending'
  }
]

export const INVOICE_PROCESSING_STEPS: ProcessingStep[] = [
  {
    id: 'upload',
    label: 'Invoice Upload',
    description: 'Processing uploaded invoice file and format validation',
    icon: <FileSearch className="h-4 w-4" />,
    estimatedDuration: 2000,
    status: 'pending'
  },
  {
    id: 'ocr',
    label: 'OCR & Layout Analysis',
    description: 'Extracting text and analyzing invoice layout structure',
    icon: <Eye className="h-4 w-4" />,
    estimatedDuration: 6000,
    status: 'pending'
  },
  {
    id: 'field_extraction',
    label: 'Field Extraction',
    description: 'Identifying and extracting invoice fields (amounts, dates, line items)',
    icon: <Brain className="h-4 w-4" />,
    estimatedDuration: 8000,
    status: 'pending'
  },
  {
    id: 'reconciliation',
    label: 'Contract Reconciliation',
    description: 'Comparing invoice data against vendor contract terms',
    icon: <Zap className="h-4 w-4" />,
    estimatedDuration: 10000,
    status: 'pending'
  },
  {
    id: 'validation',
    label: 'Discrepancy Analysis',
    description: 'Analyzing differences and generating reconciliation report',
    icon: <CheckCircle className="h-4 w-4" />,
    estimatedDuration: 5000,
    status: 'pending'
  }
]