'use client'

import { useState, useEffect } from 'react'
import { Card } from './card'
import { Button } from './button'
import { Badge } from './badge'
import { EnhancedDropzone, type DropzoneFile } from './enhanced-dropzone'
import { DocumentPreview } from './document-preview'
import { AIProcessingProgress, type ProcessingStep } from './ai-processing-progress'
import { ConfidenceIndicator } from './confidence-indicator'
import { 
  Brain, 
  ChevronDown, 
  ChevronUp, 
  Smartphone, 
  Monitor,
  Camera,
  Upload
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileOptimizedUploadProps {
  title: string
  description: string
  children: React.ReactNode
  onFilesChange: (files: DropzoneFile[]) => void
  files: DropzoneFile[]
  isProcessing?: boolean
  processingSteps?: ProcessingStep[]
  currentStep?: string | null
  overallProgress?: number
  estimatedTimeRemaining?: number | null
  acceptedFileTypes?: Record<string, string[]>
  maxFiles?: number
  className?: string
}

export function MobileOptimizedUpload({
  title,
  description,
  children,
  onFilesChange,
  files,
  isProcessing = false,
  processingSteps = [],
  currentStep = null,
  overallProgress = 0,
  estimatedTimeRemaining = null,
  acceptedFileTypes,
  maxFiles = 1,
  className
}: MobileOptimizedUploadProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [showProcessingDetails, setShowProcessingDetails] = useState(true)
  const [expandedSections, setExpandedSections] = useState({
    upload: true,
    preview: false,
    processing: true,
    form: true
  })

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const validFiles = files.filter(f => !f.error)
  const hasValidFiles = validFiles.length > 0

  // Mobile camera/file input helper
  const handleCameraInput = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment' // Use rear camera
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        onFilesChange([file as DropzoneFile])
      }
    }
    input.click()
  }

  if (isMobile) {
    return (
      <div className={cn("space-y-4 pb-20", className)}>
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b p-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold truncate">{title}</h1>
              <p className="text-sm text-muted-foreground truncate">{description}</p>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Smartphone className="h-3 w-3" />
              Mobile
            </Badge>
          </div>
          
          {isProcessing && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{Math.round(overallProgress)}%</span>
                {estimatedTimeRemaining && (
                  <span className="text-xs text-muted-foreground">
                    ~{Math.ceil(estimatedTimeRemaining / 1000)}s
                  </span>
                )}
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Form Section */}
        <Card>
          <div 
            className="flex items-center justify-between p-4 cursor-pointer"
            onClick={() => toggleSection('form')}
          >
            <h3 className="font-medium">Document Details</h3>
            {expandedSections.form ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
          {expandedSections.form && (
            <div className="px-4 pb-4">
              {children}
            </div>
          )}
        </Card>

        {/* Upload Section */}
        <Card>
          <div 
            className="flex items-center justify-between p-4 cursor-pointer"
            onClick={() => toggleSection('upload')}
          >
            <h3 className="font-medium">Upload Document</h3>
            {expandedSections.upload ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
          {expandedSections.upload && (
            <div className="px-4 pb-4 space-y-4">
              <EnhancedDropzone
                onFilesChange={onFilesChange}
                acceptedFileTypes={acceptedFileTypes}
                maxFiles={maxFiles}
                multiple={maxFiles > 1}
                disabled={isProcessing}
                showPreview={false} // Disable built-in preview on mobile
              >
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 rounded-full bg-primary/10">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    
                    <div className="text-center">
                      <p className="font-medium mb-1">Upload or capture document</p>
                      <p className="text-sm text-muted-foreground">
                        Tap to browse files or use camera
                      </p>
                    </div>
                  </div>

                  {/* Mobile-specific action buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={handleCameraInput}
                      className="h-12"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Camera
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.accept = Object.values(acceptedFileTypes || {}).flat().join(',')
                        input.multiple = maxFiles > 1
                        input.onchange = (e) => {
                          const files = Array.from((e.target as HTMLInputElement).files || [])
                          onFilesChange(files as DropzoneFile[])
                        }
                        input.click()
                      }}
                      className="h-12"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Browse
                    </Button>
                  </div>
                </div>
              </EnhancedDropzone>
            </div>
          )}
        </Card>

        {/* Preview Section */}
        {hasValidFiles && (
          <Card>
            <div 
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => toggleSection('preview')}
            >
              <h3 className="font-medium">Document Preview</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {validFiles.length} file{validFiles.length !== 1 ? 's' : ''}
                </Badge>
                {expandedSections.preview ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </div>
            {expandedSections.preview && (
              <div className="px-4 pb-4">
                <DocumentPreview
                  file={validFiles[0]}
                  showControls={false} // Simplified controls for mobile
                  className="h-48"
                />
                {validFiles.length > 1 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium">Additional files:</p>
                    {validFiles.slice(1).map((file, index) => (
                      <div key={index} className="text-sm bg-muted p-2 rounded">
                        {file.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        {/* Processing Section */}
        {isProcessing && processingSteps.length > 0 && (
          <Card>
            <div 
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => setShowProcessingDetails(!showProcessingDetails)}
            >
              <h3 className="font-medium">AI Processing</h3>
              <div className="flex items-center gap-2">
                <ConfidenceIndicator 
                  score={overallProgress} 
                  variant="compact" 
                  size="sm"
                />
                {showProcessingDetails ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </div>
            {showProcessingDetails && (
              <div className="px-4 pb-4">
                {/* Simplified mobile progress view */}
                <div className="space-y-3">
                  {processingSteps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                        step.status === 'completed' ? "bg-green-100 text-green-700" :
                        step.status === 'in_progress' ? "bg-blue-100 text-blue-700" :
                        step.status === 'error' ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-700"
                      )}>
                        {step.status === 'in_progress' ? (
                          <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{step.label}</p>
                        {step.status === 'completed' && step.confidence && (
                          <p className="text-xs text-muted-foreground">
                            {step.confidence}% confidence
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    )
  }

  // Desktop layout (fallback to original design)
  return (
    <div className={cn("max-w-4xl space-y-6", className)}>
      <Card>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <h1 className="text-lg font-semibold">{title}</h1>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Monitor className="h-3 w-3" />
                  Desktop
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">{description}</p>
            </div>
          </div>

          {children}

          <EnhancedDropzone
            onFilesChange={onFilesChange}
            acceptedFileTypes={acceptedFileTypes}
            maxFiles={maxFiles}
            multiple={maxFiles > 1}
            disabled={isProcessing}
            showPreview={true}
          />

          {hasValidFiles && (
            <DocumentPreview
              file={validFiles[0]}
              showControls={!isProcessing}
              className="h-64"
            />
          )}

          {isProcessing && processingSteps.length > 0 && (
            <AIProcessingProgress
              steps={processingSteps}
              currentStep={currentStep}
              overallProgress={overallProgress}
              estimatedTimeRemaining={estimatedTimeRemaining || undefined}
              showConfidence={true}
            />
          )}
        </div>
      </Card>
    </div>
  )
}