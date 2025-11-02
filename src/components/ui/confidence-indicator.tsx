'use client'

import { Badge } from './badge'
import { Progress } from './progress'
import { CheckCircle, AlertTriangle, Info, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConfidenceIndicatorProps {
  score: number
  label?: string
  showProgress?: boolean
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'compact' | 'detailed'
  className?: string
  field?: string
}

export function ConfidenceIndicator({
  score,
  label = "AI Confidence",
  showProgress = false,
  showIcon = true,
  size = 'md',
  variant = 'default',
  className,
  field
}: ConfidenceIndicatorProps) {
  const getConfidenceLevel = (score: number) => {
    if (score >= 90) return { level: 'high', color: 'success', icon: CheckCircle }
    if (score >= 70) return { level: 'medium', color: 'warning', icon: Info }
    return { level: 'low', color: 'destructive', icon: AlertTriangle }
  }

  const { level, color, icon: Icon } = getConfidenceLevel(score)

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'success':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200'
      case 'warning':
        return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'destructive':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1'
      case 'lg':
        return 'text-sm px-4 py-2'
      default:
        return 'text-xs px-3 py-1.5'
    }
  }

  const getProgressHeight = (size: string) => {
    switch (size) {
      case 'sm':
        return 'h-1'
      case 'lg':
        return 'h-3'
      default:
        return 'h-2'
    }
  }

  if (variant === 'compact') {
    return (
      <div className={cn("inline-flex items-center gap-1", className)}>
        {showIcon && <Icon className={cn("h-3 w-3", color === 'success' ? 'text-emerald-600' : color === 'warning' ? 'text-amber-600' : 'text-red-600')} />}
        <span className={cn("font-medium", size === 'sm' ? 'text-xs' : 'text-sm')}>
          {score}%
        </span>
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className={cn("p-3 rounded-lg border", getColorClasses(color), className)}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {showIcon && <Brain className="h-4 w-4" />}
            <span className="text-sm font-medium">{label}</span>
            {field && (
              <Badge variant="outline" className="text-xs">
                {field}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Icon className="h-3 w-3" />
            <span className="text-sm font-bold">{score}%</span>
          </div>
        </div>
        
        {showProgress && (
          <div className="space-y-1">
            <Progress 
              value={score} 
              className={cn("w-full", getProgressHeight(size))}
            />
            <div className="flex justify-between text-xs opacity-70">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        )}
        
        <p className="text-xs opacity-80 mt-2">
          {score >= 90 && "Highly confident extraction - minimal review needed"}
          {score >= 70 && score < 90 && "Good confidence - recommend quick review"}
          {score < 70 && "Lower confidence - manual verification recommended"}
        </p>
      </div>
    )
  }

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      {showIcon && <Icon className={cn("h-4 w-4", color === 'success' ? 'text-emerald-600' : color === 'warning' ? 'text-amber-600' : 'text-red-600')} />}
      
      <div className="flex items-center gap-2">
        <span className={cn("font-medium", size === 'sm' ? 'text-xs' : 'text-sm')}>
          {label}:
        </span>
        
        <Badge 
          variant={color === 'success' ? 'default' : color === 'warning' ? 'secondary' : 'destructive'}
          className={cn(getSizeClasses(size))}
        >
          {score}%
        </Badge>
        
        {showProgress && (
          <div className="w-16">
            <Progress 
              value={score} 
              className={cn(getProgressHeight(size))}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Multiple field confidence display
interface MultiFieldConfidenceProps {
  fields: Array<{
    name: string
    confidence: number
    value?: string
    required?: boolean
  }>
  className?: string
}

export function MultiFieldConfidence({ fields, className }: MultiFieldConfidenceProps) {
  const averageConfidence = fields.reduce((sum, field) => sum + field.confidence, 0) / fields.length
  
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Field Extraction Confidence</h4>
        <ConfidenceIndicator 
          score={Math.round(averageConfidence)} 
          label="Overall"
          variant="compact"
        />
      </div>
      
      <div className="grid gap-2">
        {fields.map((field) => (
          <div 
            key={field.name}
            className="flex items-center justify-between p-2 bg-muted/30 rounded-md"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{field.name}</span>
              {field.required && (
                <Badge variant="outline" className="text-xs">
                  Required
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {field.value && (
                <span className="text-xs text-muted-foreground max-w-24 truncate">
                  {field.value}
                </span>
              )}
              <ConfidenceIndicator 
                score={field.confidence}
                variant="compact"
                size="sm"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}