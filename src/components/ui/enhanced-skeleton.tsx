'use client'

import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

interface SkeletonProps {
  className?: string
  variant?: 'pulse' | 'wave'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  style?: React.CSSProperties
}

export function EnhancedSkeleton({ 
  className, 
  variant = 'pulse', 
  rounded = 'md',
  style
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-surface-secondary",
        variant === 'pulse' && "animate-pulse",
        variant === 'wave' && "skeleton-wave relative overflow-hidden",
        rounded === 'none' && "rounded-none",
        rounded === 'sm' && "rounded-sm",
        rounded === 'md' && "rounded-md",
        rounded === 'lg' && "rounded-lg",
        rounded === 'full' && "rounded-full",
        className
      )}
      style={style}
    />
  )
}

// Specific skeleton components for common UI patterns
export function KPICardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex-1 min-w-0 space-y-3">
          <EnhancedSkeleton className="h-4 w-3/4" variant="wave" />
          <EnhancedSkeleton className="h-8 w-1/2" variant="wave" />
          <div className="flex items-center gap-2">
            <EnhancedSkeleton className="h-6 w-16 rounded-full" variant="wave" />
            <EnhancedSkeleton className="h-4 w-20" variant="wave" />
          </div>
        </div>
        <EnhancedSkeleton className="h-12 w-12 rounded-lg" variant="pulse" />
      </div>
    </Card>
  )
}

export function DashboardListSkeleton({ 
  itemCount = 4, 
  className 
}: { 
  itemCount?: number
  className?: string 
}) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <EnhancedSkeleton className="h-6 w-1/3" variant="wave" />
          <EnhancedSkeleton className="h-6 w-20 rounded-full" variant="pulse" />
        </div>
        
        {/* List items */}
        <div className="space-y-3">
          {Array.from({ length: itemCount }).map((_, i) => (
            <div key={i} className="p-4 rounded-lg bg-surface-secondary/50 border border-border/50">
              <div className="flex items-start space-x-3">
                <EnhancedSkeleton className="h-8 w-8 rounded-lg" variant="pulse" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <EnhancedSkeleton className="h-4 w-1/2" variant="wave" />
                    <EnhancedSkeleton className="h-4 w-16" variant="wave" />
                  </div>
                  <EnhancedSkeleton className="h-3 w-3/4" variant="wave" />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="pt-4 border-t border-border">
          <EnhancedSkeleton className="h-4 w-32" variant="wave" />
        </div>
      </div>
    </Card>
  )
}

export function TableSkeleton({ 
  rows = 5, 
  columns = 8,
  className 
}: { 
  rows?: number
  columns?: number
  className?: string 
}) {
  return (
    <div className={cn("rounded-md border overflow-hidden", className)}>
      {/* Table Header */}
      <div className="border-b bg-surface-secondary/50">
        <div className="grid grid-cols-8 gap-4 p-4">
          {Array.from({ length: columns }).map((_, i) => (
            <EnhancedSkeleton key={i} className="h-4" variant="pulse" />
          ))}
        </div>
      </div>
      
      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="border-b last:border-b-0">
          <div className="grid grid-cols-8 gap-4 p-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="space-y-1">
                <EnhancedSkeleton 
                  className={cn(
                    "h-4",
                    colIndex === 0 && "w-3/4", // First column (ID/Name)
                    colIndex === 1 && "w-full", // Second column (Vendor)
                    colIndex >= 2 && colIndex <= 4 && "w-16", // Status/Priority/Amount
                    colIndex > 4 && "w-20" // Date/Actions
                  )} 
                  variant="wave" 
                />
                {colIndex === 0 && (
                  <EnhancedSkeleton className="h-3 w-1/2" variant="wave" />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-6">
        {/* Chart Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <EnhancedSkeleton className="h-6 w-48" variant="wave" />
            <EnhancedSkeleton className="h-4 w-64" variant="wave" />
          </div>
          <EnhancedSkeleton className="h-8 w-20 rounded-full" variant="pulse" />
        </div>
        
        {/* Chart Metrics */}
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-3 bg-surface-secondary/50 rounded-lg space-y-2">
              <EnhancedSkeleton className="h-5 w-16" variant="wave" />
              <EnhancedSkeleton className="h-3 w-20" variant="wave" />
            </div>
          ))}
        </div>
        
        {/* Chart Area */}
        <div className="h-80 w-full relative">
          <EnhancedSkeleton className="absolute inset-0" variant="pulse" />
          {/* Simulated chart bars */}
          <div className="absolute bottom-0 left-0 right-0 h-64 flex items-end justify-between px-8">
            {Array.from({ length: 12 }).map((_, i) => (
              <EnhancedSkeleton
                key={i}
                className="w-4"
                style={{ 
                  height: `${Math.random() * 200 + 50}px`,
                  animationDelay: `${i * 100}ms`
                }}
                variant="pulse"
              />
            ))}
          </div>
        </div>
        
        {/* Chart Footer */}
        <div className="pt-4 border-t border-border flex items-center justify-between">
          <EnhancedSkeleton className="h-6 w-24 rounded-full" variant="pulse" />
          <EnhancedSkeleton className="h-4 w-32" variant="wave" />
        </div>
      </div>
    </Card>
  )
}

export function FiltersSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      <div className="relative sm:col-span-2 lg:col-span-1">
        <EnhancedSkeleton className="h-10 w-full rounded-md" variant="pulse" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <EnhancedSkeleton key={i} className="h-10 rounded-md" variant="pulse" />
      ))}
    </div>
  )
}

// Document processing specific skeletons
export function DocumentUploadSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <EnhancedSkeleton className="h-6 w-48" variant="wave" />
          <EnhancedSkeleton className="h-4 w-80" variant="wave" />
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <EnhancedSkeleton className="h-4 w-24" variant="wave" />
            <EnhancedSkeleton className="h-10 w-full" variant="pulse" />
          </div>
          <div className="space-y-2">
            <EnhancedSkeleton className="h-4 w-32" variant="wave" />
            <EnhancedSkeleton className="h-10 w-full" variant="pulse" />
          </div>
        </div>

        {/* Upload area */}
        <div className="space-y-4">
          <EnhancedSkeleton className="h-4 w-32" variant="wave" />
          <div className="border-2 border-dashed border-border rounded-lg p-8">
            <div className="flex flex-col items-center space-y-4">
              <EnhancedSkeleton className="h-12 w-12 rounded-lg" variant="pulse" />
              <EnhancedSkeleton className="h-5 w-48" variant="wave" />
              <EnhancedSkeleton className="h-4 w-64" variant="wave" />
            </div>
          </div>
        </div>

        {/* Button */}
        <EnhancedSkeleton className="h-12 w-full" variant="pulse" />
      </div>
    </Card>
  )
}

export function AIProcessingProgressSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <EnhancedSkeleton className="h-5 w-48" variant="wave" />
            <EnhancedSkeleton className="h-4 w-64" variant="wave" />
          </div>
          <div className="space-y-1 text-right">
            <EnhancedSkeleton className="h-4 w-16" variant="wave" />
            <EnhancedSkeleton className="h-4 w-24" variant="wave" />
          </div>
        </div>

        {/* Progress bar */}
        <EnhancedSkeleton className="h-2 w-full" variant="wave" />

        {/* Steps */}
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
              <EnhancedSkeleton className="h-4 w-4" variant="pulse" rounded="full" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <EnhancedSkeleton className="h-4 w-32" variant="wave" />
                  <EnhancedSkeleton className="h-5 w-16" variant="pulse" rounded="full" />
                </div>
                <EnhancedSkeleton className="h-3 w-48" variant="wave" />
              </div>
              <EnhancedSkeleton className="h-6 w-6" variant="pulse" rounded="full" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

export function DocumentPreviewSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <EnhancedSkeleton className="h-4 w-4" variant="pulse" rounded="full" />
          <div className="space-y-1">
            <EnhancedSkeleton className="h-4 w-32" variant="wave" />
            <EnhancedSkeleton className="h-3 w-24" variant="wave" />
          </div>
        </div>
        <EnhancedSkeleton className="h-8 w-8" variant="pulse" rounded="full" />
      </div>

      {/* Preview area */}
      <div className="relative">
        <EnhancedSkeleton className="h-64 w-full" variant="wave" rounded="none" />
        {/* Overlay elements to simulate document content */}
        <div className="absolute inset-4 space-y-2">
          <EnhancedSkeleton className="h-4 w-3/4" variant="pulse" />
          <EnhancedSkeleton className="h-4 w-full" variant="pulse" />
          <EnhancedSkeleton className="h-4 w-5/6" variant="pulse" />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-3 border-t">
        <EnhancedSkeleton className="h-8 w-20" variant="pulse" />
        <EnhancedSkeleton className="h-8 w-20" variant="pulse" />
      </div>
    </Card>
  )
}

export function ConfidenceIndicatorSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <EnhancedSkeleton className="h-4 w-4" variant="pulse" rounded="full" />
      <EnhancedSkeleton className="h-4 w-12" variant="wave" />
    </div>
  )
}

export function ReconciliationResultsSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2">
          <EnhancedSkeleton className="h-5 w-5" variant="pulse" rounded="full" />
          <EnhancedSkeleton className="h-5 w-48" variant="wave" />
        </div>
        <div className="flex items-center gap-2">
          <ConfidenceIndicatorSkeleton />
          <EnhancedSkeleton className="h-6 w-20" variant="pulse" rounded="full" />
        </div>
      </div>

      {/* Confidence indicators grid */}
      <div className="space-y-2">
        <EnhancedSkeleton className="h-4 w-40" variant="wave" />
        <div className="grid gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-muted/20 rounded-md">
              <div className="flex items-center gap-2">
                <EnhancedSkeleton className="h-4 w-24" variant="wave" />
                <EnhancedSkeleton className="h-5 w-14" variant="pulse" rounded="full" />
              </div>
              <ConfidenceIndicatorSkeleton />
            </div>
          ))}
        </div>
      </div>

      {/* Summary sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3 bg-muted/30 rounded-lg space-y-2">
          <EnhancedSkeleton className="h-4 w-32" variant="wave" />
          <div className="space-y-1">
            <EnhancedSkeleton className="h-3 w-full" variant="wave" />
            <EnhancedSkeleton className="h-3 w-3/4" variant="wave" />
            <EnhancedSkeleton className="h-3 w-5/6" variant="wave" />
          </div>
        </div>
        <div className="p-3 bg-muted/30 rounded-lg space-y-2">
          <EnhancedSkeleton className="h-4 w-28" variant="wave" />
          <div className="space-y-1">
            <EnhancedSkeleton className="h-3 w-full" variant="wave" />
            <EnhancedSkeleton className="h-3 w-2/3" variant="wave" />
            <EnhancedSkeleton className="h-3 w-4/5" variant="wave" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function DocumentAnalysisSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-6 h-full", className)}>
      {/* Document side */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <EnhancedSkeleton className="h-5 w-32" variant="wave" />
          <div className="flex gap-1">
            <EnhancedSkeleton className="h-7 w-7" variant="pulse" rounded="full" />
            <EnhancedSkeleton className="h-7 w-7" variant="pulse" rounded="full" />
            <EnhancedSkeleton className="h-7 w-7" variant="pulse" rounded="full" />
          </div>
        </div>
        <DocumentPreviewSkeleton />
      </div>

      {/* Data side */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <EnhancedSkeleton className="h-5 w-40" variant="wave" />
          <EnhancedSkeleton className="h-8 w-24" variant="pulse" />
        </div>
        
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <EnhancedSkeleton className="h-4 w-24" variant="wave" />
                <div className="flex items-center gap-2">
                  <ConfidenceIndicatorSkeleton />
                  <EnhancedSkeleton className="h-7 w-7" variant="pulse" rounded="full" />
                </div>
              </div>
              <EnhancedSkeleton className="h-8 w-full" variant="pulse" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}