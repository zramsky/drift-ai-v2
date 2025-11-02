'use client'

import { useState, useEffect } from 'react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle, Loader2, RefreshCw, Activity, Zap, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProgressStep {
  id: string
  label: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  duration?: number
  error?: string
}

interface RealTimeProgressProps {
  title: string
  description?: string
  steps: ProgressStep[]
  isVisible: boolean
  onComplete?: () => void
  onCancel?: () => void
  autoClose?: boolean
  className?: string
}

const getStepIcon = (status: ProgressStep['status']) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-success" />
    case 'processing':
      return <Loader2 className="h-4 w-4 text-info animate-spin" />
    case 'error':
      return <AlertCircle className="h-4 w-4 text-error" />
    default:
      return <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
  }
}

const getStatusColor = (status: ProgressStep['status']) => {
  switch (status) {
    case 'completed':
      return 'text-success'
    case 'processing':
      return 'text-info'
    case 'error':
      return 'text-error'
    default:
      return 'text-muted-foreground'
  }
}

export function RealTimeProgress({
  title,
  description,
  steps,
  isVisible,
  onComplete,
  onCancel,
  autoClose = false,
  className
}: RealTimeProgressProps) {
  const [mounted, setMounted] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    if (isVisible) {
      setMounted(true)
      const interval = setInterval(() => {
        setLastUpdate(new Date())
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isVisible])

  useEffect(() => {
    const allCompleted = steps.length > 0 && steps.every(step => 
      step.status === 'completed' || step.status === 'error'
    )
    
    if (allCompleted && onComplete) {
      const timer = setTimeout(() => {
        onComplete()
        if (autoClose) {
          setMounted(false)
        }
      }, 1500) // Delay to show completion state
      
      return () => clearTimeout(timer)
    }
  }, [steps, onComplete, autoClose])

  const completedSteps = steps.filter(step => step.status === 'completed').length
  const totalSteps = steps.length
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0
  const hasErrors = steps.some(step => step.status === 'error')
  const isProcessing = steps.some(step => step.status === 'processing')

  if (!isVisible || !mounted) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className={cn("w-full max-w-md p-6 animate-in fade-in-0 zoom-in-95", className)}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            {isProcessing ? (
              <Activity className="h-5 w-5 text-info" />
            ) : hasErrors ? (
              <AlertCircle className="h-5 w-5 text-error" />
            ) : (
              <Zap className="h-5 w-5 text-success" />
            )}
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          </div>
          
          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-6 w-6 p-0 hover:bg-error/10 hover:text-error"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {description && (
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
        )}

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              Overall Progress
            </span>
            <span className="text-sm text-muted-foreground">
              {completedSteps} of {totalSteps}
            </span>
          </div>
          
          <Progress 
            value={progressPercentage} 
            className={cn(
              "h-3 transition-all duration-300",
              hasErrors && "progress-error",
              progressPercentage === 100 && "progress-success"
            )}
          />
          
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>{progressPercentage.toFixed(0)}% Complete</span>
            <span>
              {isProcessing ? 'Processing...' : 
               hasErrors ? 'Completed with errors' :
               progressPercentage === 100 ? 'Completed' : 'In progress'}
            </span>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-3 mb-6">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
                step.status === 'processing' && "bg-info/5 border border-info/20",
                step.status === 'completed' && "bg-success/5",
                step.status === 'error' && "bg-error/5"
              )}
            >
              <div className="flex-shrink-0">
                {getStepIcon(step.status)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "text-sm font-medium transition-colors duration-200",
                  getStatusColor(step.status)
                )}>
                  {step.label}
                </div>
                
                {step.error && (
                  <div className="text-xs text-error mt-1">
                    Error: {step.error}
                  </div>
                )}
                
                {step.duration && step.status === 'completed' && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Completed in {step.duration}ms
                  </div>
                )}
              </div>
              
              <div className="flex-shrink-0">
                {step.status === 'processing' && (
                  <Badge variant="secondary" className="bg-info/10 text-info text-xs">
                    Processing
                  </Badge>
                )}
                {step.status === 'completed' && (
                  <Badge variant="secondary" className="bg-success/10 text-success text-xs">
                    Done
                  </Badge>
                )}
                {step.status === 'error' && (
                  <Badge variant="secondary" className="bg-error/10 text-error text-xs">
                    Error
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
          
          {(progressPercentage === 100 || hasErrors) && onComplete && (
            <Button
              size="sm"
              onClick={onComplete}
              variant={hasErrors ? "outline" : "default"}
            >
              {hasErrors ? 'Close' : 'Continue'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}