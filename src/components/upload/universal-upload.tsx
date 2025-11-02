'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  FileText, 
  Image, 
  Archive,
  X, 
  CheckCircle, 
  AlertCircle, 
  FileIcon,
  Zap,
  Eye
} from 'lucide-react'

interface FileUploadItem {
  file: File
  id: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  preview?: string
  errorMessage?: string
}

interface UniversalUploadProps {
  title: string
  description: string
  acceptedTypes?: string[]
  maxFiles?: number
  maxFileSize?: number // in MB
  allowZip?: boolean
  onUpload: (files: File[]) => Promise<void>
  onComplete?: (results: any[]) => void
}

const DEFAULT_ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'text/csv',
  'application/zip'
]

const FILE_TYPE_EXTENSIONS = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'image/png': '.png',
  'image/jpeg': '.jpg,.jpeg',
  'text/csv': '.csv',
  'application/zip': '.zip'
}

export function UniversalUpload({
  title,
  description,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxFiles = 5,
  maxFileSize = 10,
  allowZip = true,
  onUpload,
  onComplete
}: UniversalUploadProps) {
  const [files, setFiles] = useState<FileUploadItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Create accept object for dropzone
  const acceptObject = acceptedTypes.reduce((acc, type) => {
    acc[type] = FILE_TYPE_EXTENSIONS[type as keyof typeof FILE_TYPE_EXTENSIONS]?.split(',') || []
    return acc
  }, {} as Record<string, string[]>)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    rejectedFiles.forEach(({ file, errors }) => {
      console.warn(`File ${file.name} rejected:`, errors)
    })

    // Process accepted files
    const newFiles: FileUploadItem[] = acceptedFiles.map(file => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      status: 'pending' as const,
      progress: 0,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }))

    setFiles(prev => {
      const combined = [...prev, ...newFiles]
      // Respect max files limit
      return combined.slice(0, maxFiles)
    })
  }, [maxFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptObject,
    multiple: maxFiles > 1,
    maxSize: maxFileSize * 1024 * 1024, // Convert MB to bytes
    disabled: isUploading
  })

  const removeFile = (id: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== id)
      // Revoke object URLs for images to prevent memory leaks
      const fileToRemove = prev.find(f => f.id === id)
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return updated
    })
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-500" />
    } else if (file.type === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-500" />
    } else if (file.type === 'application/zip') {
      return <Archive className="h-5 w-5 text-yellow-500" />
    } else if (file.type.includes('document') || file.type.includes('msword')) {
      return <FileText className="h-5 w-5 text-blue-600" />
    } else {
      return <FileIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusIcon = (status: FileUploadItem['status']) => {
    switch (status) {
      case 'uploading':
        return <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-error" />
      default:
        return null
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setIsUploading(true)

    // Update all files to uploading status
    setFiles(prev => prev.map(f => ({ ...f, status: 'uploading' as const })))

    try {
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        setFiles(prev => prev.map(f => ({ 
          ...f, 
          progress: f.status === 'uploading' ? progress : f.progress 
        })))
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      // Call the upload handler
      const filesToUpload = files.map(f => f.file)
      await onUpload(filesToUpload)

      // Mark all as successful
      setFiles(prev => prev.map(f => ({ ...f, status: 'success' as const, progress: 100 })))

      // Call completion handler if provided
      if (onComplete) {
        onComplete(files.map(f => ({ id: f.id, fileName: f.file.name, success: true })))
      }

      // Auto-clear after success
      setTimeout(() => {
        setFiles([])
      }, 3000)

    } catch (error) {
      // Mark all as error
      setFiles(prev => prev.map(f => ({ 
        ...f, 
        status: 'error' as const, 
        errorMessage: error instanceof Error ? error.message : 'Upload failed'
      })))
    } finally {
      setIsUploading(false)
    }
  }

  const getAcceptedTypesText = () => {
    const extensions = acceptedTypes.map(type => 
      FILE_TYPE_EXTENSIONS[type as keyof typeof FILE_TYPE_EXTENSIONS] || type
    ).join(', ')
    return `${extensions.replace(/\./g, '').toUpperCase()} files`
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
            ${isDragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border hover:border-primary/50'}
            ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="space-y-4">
            <Upload className={`mx-auto h-16 w-16 text-muted-foreground transition-colors
              ${isDragActive ? 'text-primary' : ''}
            `} />
            
            <div>
              <p className="text-lg font-medium mb-2">
                {isDragActive ? 'Drop files here...' : 'Drag & drop files here'}
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                or click to browse from your computer
              </p>
              <p className="text-xs text-muted-foreground">
                {getAcceptedTypesText()} • Max {maxFiles} file{maxFiles > 1 ? 's' : ''} • {maxFileSize}MB each
              </p>
              {allowZip && (
                <p className="text-xs text-primary mt-1">
                  ✨ ZIP files will be automatically extracted
                </p>
              )}
            </div>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">
                Uploaded Files ({files.length}/{maxFiles})
              </h4>
              {files.some(f => f.preview) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? 'Hide' : 'Show'} Previews
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {files.map((fileItem) => (
                <div key={fileItem.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getFileIcon(fileItem.file)}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">
                          {fileItem.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(fileItem.file.size)}
                        </p>
                        {fileItem.errorMessage && (
                          <p className="text-xs text-error mt-1">
                            {fileItem.errorMessage}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusIcon(fileItem.status)}
                      {!isUploading && fileItem.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(fileItem.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {fileItem.status === 'uploading' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Uploading...</span>
                        <span>{fileItem.progress}%</span>
                      </div>
                      <div className="w-full bg-surface-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${fileItem.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Image Preview */}
                  {showPreview && fileItem.preview && (
                    <div className="mt-3">
                      <img
                        src={fileItem.preview}
                        alt={fileItem.file.name}
                        className="max-w-full h-32 object-contain bg-surface-secondary rounded border"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        <div className="flex gap-3">
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
            className="flex-1"
            size="lg"
          >
            {isUploading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                Processing Files...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Upload {files.length} File{files.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>

          {files.length > 0 && !isUploading && (
            <Button
              variant="outline"
              onClick={() => setFiles([])}
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Upload Statistics */}
        {files.length > 0 && (
          <div className="bg-surface-secondary rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Files</p>
                <p className="font-medium">{files.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Size</p>
                <p className="font-medium">
                  {formatFileSize(files.reduce((sum, f) => sum + f.file.size, 0))}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Ready</p>
                <p className="font-medium text-success">
                  {files.filter(f => f.status === 'pending').length}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Completed</p>
                <p className="font-medium text-success">
                  {files.filter(f => f.status === 'success').length}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}