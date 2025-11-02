'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Image, X, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Badge } from './badge'

export interface DropzoneFile extends File {
  preview?: string
  error?: string
}

interface EnhancedDropzoneProps {
  onFilesChange: (files: DropzoneFile[]) => void
  acceptedFileTypes?: Record<string, string[]>
  maxFiles?: number
  maxFileSize?: number // in bytes
  multiple?: boolean
  disabled?: boolean
  className?: string
  children?: React.ReactNode
  showPreview?: boolean
  dragOverlay?: boolean
}

export function EnhancedDropzone({
  onFilesChange,
  acceptedFileTypes = {
    'application/pdf': ['.pdf'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  },
  maxFiles = 1,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  multiple = false,
  disabled = false,
  className,
  children,
  showPreview = true,
  dragOverlay = true
}: EnhancedDropzoneProps) {
  const [files, setFiles] = useState<DropzoneFile[]>([])
  const [dragDepth, setDragDepth] = useState(0)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    const newFiles: DropzoneFile[] = acceptedFiles.map(file => {
      const dropzoneFile = file as DropzoneFile
      
      // Generate preview for images
      if (file.type.startsWith('image/')) {
        dropzoneFile.preview = URL.createObjectURL(file)
      }
      
      return dropzoneFile
    })

    // Handle rejected files
    const rejectedWithErrors: DropzoneFile[] = rejectedFiles.map(({ file, errors }) => {
      const dropzoneFile = file as DropzoneFile
      dropzoneFile.error = errors.map((e: any) => e.message).join(', ')
      return dropzoneFile
    })

    const allFiles = multiple 
      ? [...files, ...newFiles, ...rejectedWithErrors].slice(0, maxFiles)
      : [...newFiles, ...rejectedWithErrors].slice(0, 1)

    setFiles(allFiles)
    onFilesChange(allFiles)
  }, [files, multiple, maxFiles, onFilesChange])

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxFiles,
    maxSize: maxFileSize,
    multiple,
    disabled,
    onDragEnter: () => setDragDepth(prev => prev + 1),
    onDragLeave: () => setDragDepth(prev => prev - 1),
  } as any)

  const removeFile = useCallback((index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    
    // Revoke preview URLs to prevent memory leaks
    const fileToRemove = files[index]
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview)
    }
    
    setFiles(newFiles)
    onFilesChange(newFiles)
  }, [files, onFilesChange])

  const getDropzoneClasses = () => {
    return cn(
      "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer group",
      {
        "border-primary bg-primary/5 shadow-lg scale-[1.02]": isDragActive && isDragAccept,
        "border-destructive bg-destructive/5": isDragReject,
        "border-border hover:border-primary/50 hover:bg-primary/2": !isDragActive && !disabled,
        "opacity-50 cursor-not-allowed": disabled,
        "border-muted bg-muted/20": disabled,
      },
      className
    )
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />
    }
    return <FileText className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        className={getDropzoneClasses()}
      >
        <input {...getInputProps()} />
        
        {/* Drag Overlay */}
        {dragOverlay && isDragActive && (
          <div className="absolute inset-0 bg-primary/10 rounded-xl flex items-center justify-center z-10">
            <div className="text-center p-4">
              <Upload className="mx-auto h-12 w-12 text-primary mb-4 animate-bounce" />
              <p className="text-lg font-medium text-primary">
                {isDragAccept ? 'Drop files here!' : 'File type not supported'}
              </p>
            </div>
          </div>
        )}

        {children || (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <div className={cn(
                "p-4 rounded-full transition-colors",
                isDragActive && isDragAccept ? "bg-primary/20" : "bg-muted group-hover:bg-primary/10"
              )}>
                <Upload className={cn(
                  "h-8 w-8 transition-colors",
                  isDragActive && isDragAccept ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                )} />
              </div>
              
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {isDragActive
                    ? isDragAccept
                      ? 'Drop your files here'
                      : 'File type not supported'
                    : 'Click to upload or drag & drop'
                  }
                </p>
                
                <p className="text-sm text-muted-foreground">
                  {Object.values(acceptedFileTypes).flat().join(', ').toUpperCase()} files up to {formatFileSize(maxFileSize)}
                </p>
                
                {maxFiles > 1 && (
                  <p className="text-xs text-muted-foreground">
                    You can upload up to {maxFiles} files
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="outline" className="text-xs">
                PDF Documents
              </Badge>
              <Badge variant="outline" className="text-xs">
                Images (JPG, PNG)
              </Badge>
              <Badge variant="outline" className="text-xs">
                Word Documents
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && showPreview && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">
            {files.length === 1 ? 'Uploaded File' : `Uploaded Files (${files.length})`}
          </h4>
          
          <div className="grid gap-3">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                  file.error 
                    ? "bg-destructive/5 border-destructive/20" 
                    : "bg-muted/30 border-border hover:border-border/60"
                )}
              >
                {/* File Preview/Icon */}
                <div className="flex-shrink-0">
                  {file.preview ? (
                    <div className="relative">
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-10 h-10 object-cover rounded"
                        onLoad={() => URL.revokeObjectURL(file.preview!)}
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                      {getFileIcon(file)}
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    {file.error ? (
                      <Badge variant="destructive" className="text-xs">
                        Error
                      </Badge>
                    ) : (
                      <Badge variant="success" className="text-xs">
                        Ready
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span>{file.type.split('/')[1]?.toUpperCase() || 'Unknown'}</span>
                  </div>
                  
                  {file.error && (
                    <p className="text-xs text-destructive mt-1">{file.error}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {file.error ? (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-success" />
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(index)
                    }}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}