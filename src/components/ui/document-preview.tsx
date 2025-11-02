'use client'

import { useState, useEffect } from 'react'
import { FileText, Image, X, Eye, Download, RotateCw, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from './button'
import { Card } from './card'
import { Badge } from './badge'

interface DocumentPreviewProps {
  file: File
  onRemove?: () => void
  showControls?: boolean
  className?: string
}

export function DocumentPreview({ 
  file, 
  onRemove, 
  showControls = false,
  className = "" 
}: DocumentPreviewProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    if (!file) return

    const generatePreview = async () => {
      setIsLoading(true)
      setError(null)

      try {
        if (file.type.startsWith('image/')) {
          // For images, create object URL
          const url = URL.createObjectURL(file)
          setPreview(url)
        } else if (file.type === 'application/pdf') {
          // For PDFs, we'll show first page (would need PDF.js in real implementation)
          // For now, show a placeholder
          setPreview(null)
        } else {
          // For other document types
          setPreview(null)
        }
      } catch (err) {
        setError('Failed to generate preview')
      } finally {
        setIsLoading(false)
      }
    }

    generatePreview()

    // Cleanup
    return () => {
      if (preview && file.type.startsWith('image/')) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [file])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = () => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />
    }
    return <FileText className="h-4 w-4" />
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5))
  const handleRotate = () => setRotation(prev => (prev + 90) % 360)

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {getFileIcon()}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(file.size)} • {file.type.split('/')[1]?.toUpperCase() || 'Document'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {file.type.startsWith('image/') && (
            <Badge variant="secondary" className="text-xs">
              Image
            </Badge>
          )}
          {file.type === 'application/pdf' && (
            <Badge variant="secondary" className="text-xs">
              PDF
            </Badge>
          )}
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="relative bg-muted/10">
        {isLoading ? (
          <div className="flex items-center justify-center h-48 p-4">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              <p className="text-sm text-muted-foreground">Generating preview...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-48 p-4">
            <div className="flex flex-col items-center gap-2 text-center">
              {getFileIcon()}
              <p className="text-sm text-muted-foreground">Preview not available</p>
              <p className="text-xs text-muted-foreground">{error}</p>
            </div>
          </div>
        ) : preview && file.type.startsWith('image/') ? (
          <div className="relative overflow-hidden">
            <div className="flex items-center justify-center p-4 min-h-48">
              <img
                src={preview}
                alt={file.name}
                className="max-w-full max-h-64 object-contain transition-all duration-200"
                style={{ 
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                }}
              />
            </div>
            
            {/* Image Controls */}
            {showControls && (
              <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-md p-1 shadow-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                  className="h-7 w-7 p-0"
                >
                  <ZoomOut className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                  className="h-7 w-7 p-0"
                >
                  <ZoomIn className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRotate}
                  className="h-7 w-7 p-0"
                >
                  <RotateCw className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 p-4">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="p-3 rounded-full bg-muted">
                {getFileIcon()}
              </div>
              <div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {file.type === 'application/pdf' ? 'PDF ready for processing' : 'Document ready for upload'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {showControls && (
        <div className="flex items-center justify-between p-3 border-t bg-muted/30">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const url = URL.createObjectURL(file)
              const a = document.createElement('a')
              a.href = url
              a.download = file.name
              a.click()
              URL.revokeObjectURL(url)
            }}
            className="flex items-center gap-2"
          >
            <Download className="h-3 w-3" />
            Download
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Would implement full-screen preview
            }}
            className="flex items-center gap-2"
          >
            <Eye className="h-3 w-3" />
            Full View
          </Button>
        </div>
      )}
    </Card>
  )
}