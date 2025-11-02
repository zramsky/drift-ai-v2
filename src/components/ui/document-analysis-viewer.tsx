'use client'

import { useState } from 'react'
import { Card } from './card'
import { Badge } from './badge'
import { Button } from './button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'
import { ConfidenceIndicator } from './confidence-indicator'
import { 
  FileText, 
  Eye, 
  Edit3, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download,
  Maximize2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Input } from './input'
import { Textarea } from './textarea'
import { cn } from '@/lib/utils'

interface ExtractedField {
  id: string
  label: string
  value: string
  confidence: number
  coordinates?: { x: number; y: number; width: number; height: number }
  editable?: boolean
  required?: boolean
}

interface DocumentAnalysisViewerProps {
  document: File
  extractedFields: ExtractedField[]
  onFieldUpdate?: (fieldId: string, newValue: string) => void
  onSave?: (updatedFields: ExtractedField[]) => void
  className?: string
}

export function DocumentAnalysisViewer({
  document,
  extractedFields,
  onFieldUpdate,
  onSave,
  className
}: DocumentAnalysisViewerProps) {
  const [activeView, setActiveView] = useState<'split' | 'document' | 'data'>('split')
  const [selectedField, setSelectedField] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(
    extractedFields.reduce((acc, field) => ({ ...acc, [field.id]: field.value }), {})
  )

  const handleFieldEdit = (fieldId: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [fieldId]: value }))
    onFieldUpdate?.(fieldId, value)
  }

  const handleFieldSave = (fieldId: string) => {
    setEditingField(null)
    // In a real implementation, this would save to the backend
  }

  const handleSaveAll = () => {
    const updatedFields = extractedFields.map(field => ({
      ...field,
      value: fieldValues[field.id] || field.value
    }))
    onSave?.(updatedFields)
  }

  const getHighConfidenceFields = () => extractedFields.filter(f => f.confidence >= 90)
  const getMediumConfidenceFields = () => extractedFields.filter(f => f.confidence >= 70 && f.confidence < 90)
  const getLowConfidenceFields = () => extractedFields.filter(f => f.confidence < 70)

  const renderFieldHighlight = (field: ExtractedField) => {
    if (!field.coordinates) return null

    const isSelected = selectedField === field.id
    const isEditing = editingField === field.id

    return (
      <div
        key={field.id}
        className={cn(
          "absolute border-2 transition-all duration-200 cursor-pointer",
          isSelected 
            ? "border-blue-500 bg-blue-500/20 z-20" 
            : isEditing
            ? "border-orange-500 bg-orange-500/20 z-10"
            : "border-green-500/60 bg-green-500/10 hover:bg-green-500/20"
        )}
        style={{
          left: `${field.coordinates.x * zoom}px`,
          top: `${field.coordinates.y * zoom}px`,
          width: `${field.coordinates.width * zoom}px`,
          height: `${field.coordinates.height * zoom}px`,
          transform: `rotate(${rotation}deg)`,
        }}
        onClick={() => setSelectedField(field.id)}
        title={`${field.label}: ${field.value} (${field.confidence}% confidence)`}
      >
        {isSelected && (
          <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-1 py-0.5 rounded text-nowrap">
            {field.label}
          </div>
        )}
      </div>
    )
  }

  const renderDocumentView = () => {
    const isImage = document.type.startsWith('image/')
    const documentUrl = URL.createObjectURL(document)

    return (
      <div className="relative flex-1 bg-gray-50 rounded-lg overflow-hidden">
        {/* Document Controls */}
        <div className="absolute top-2 right-2 z-30 flex gap-1 bg-background/80 backdrop-blur-sm rounded-md p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.5))}
            disabled={zoom <= 0.5}
            className="h-7 w-7 p-0"
          >
            <ZoomOut className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(prev => Math.min(prev + 0.2, 3))}
            disabled={zoom >= 3}
            className="h-7 w-7 p-0"
          >
            <ZoomIn className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRotation(prev => (prev + 90) % 360)}
            className="h-7 w-7 p-0"
          >
            <RotateCw className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveView('document')}
            className="h-7 w-7 p-0"
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
        </div>

        {/* Document Display */}
        <div className="relative w-full h-full overflow-auto p-4">
          <div className="relative inline-block">
            {isImage ? (
              <img
                src={documentUrl}
                alt={document.name}
                className="max-w-none transition-all duration-200"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: 'top left'
                }}
                onLoad={() => URL.revokeObjectURL(documentUrl)}
              />
            ) : (
              <div className="flex items-center justify-center h-96 bg-muted rounded border-2 border-dashed">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    PDF preview not available
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {document.name}
                  </p>
                </div>
              </div>
            )}

            {/* Field Highlights Overlay */}
            {isImage && extractedFields.map(renderFieldHighlight)}
          </div>
        </div>
      </div>
    )
  }

  const renderDataView = () => {
    return (
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Extracted Data</h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {extractedFields.length} fields extracted
            </Badge>
            <Button onClick={handleSaveAll} size="sm">
              Save All Changes
            </Button>
          </div>
        </div>

        {/* Field Groups */}
        <Tabs defaultValue="high" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="high" className="flex items-center gap-2">
              High Confidence
              <Badge variant="secondary" className="text-xs">
                {getHighConfidenceFields().length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="medium" className="flex items-center gap-2">
              Medium Confidence
              <Badge variant="secondary" className="text-xs">
                {getMediumConfidenceFields().length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="low" className="flex items-center gap-2">
              Needs Review
              <Badge variant="destructive" className="text-xs">
                {getLowConfidenceFields().length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="high" className="space-y-3">
            {getHighConfidenceFields().map(renderFieldEditor)}
          </TabsContent>

          <TabsContent value="medium" className="space-y-3">
            {getMediumConfidenceFields().map(renderFieldEditor)}
          </TabsContent>

          <TabsContent value="low" className="space-y-3">
            {getLowConfidenceFields().map(renderFieldEditor)}
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  const renderFieldEditor = (field: ExtractedField) => {
    const isEditing = editingField === field.id
    const currentValue = fieldValues[field.id] || field.value

    return (
      <Card 
        key={field.id} 
        className={cn(
          "p-4 transition-all duration-200 cursor-pointer",
          selectedField === field.id && "ring-2 ring-blue-500"
        )}
        onClick={() => setSelectedField(field.id)}
      >
        <div className="space-y-3">
          {/* Field Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium">{field.label}</h4>
              {field.required && (
                <Badge variant="outline" className="text-xs">Required</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <ConfidenceIndicator 
                score={field.confidence} 
                variant="compact" 
                size="sm"
              />
              {field.editable !== false && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingField(isEditing ? null : field.id)
                  }}
                  className="h-7 w-7 p-0"
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Field Value */}
          {isEditing ? (
            <div className="space-y-2">
              {currentValue.length > 50 ? (
                <Textarea
                  value={currentValue}
                  onChange={(e) => handleFieldEdit(field.id, e.target.value)}
                  className="text-sm"
                  rows={3}
                />
              ) : (
                <Input
                  value={currentValue}
                  onChange={(e) => handleFieldEdit(field.id, e.target.value)}
                  className="text-sm"
                />
              )}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingField(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleFieldSave(field.id)}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm bg-muted/30 rounded p-2 font-mono">
              {currentValue || <span className="text-muted-foreground">No value detected</span>}
            </div>
          )}

          {/* Field Metadata */}
          {field.coordinates && (
            <div className="text-xs text-muted-foreground">
              Position: ({field.coordinates.x}, {field.coordinates.y}) 
              Size: {field.coordinates.width}×{field.coordinates.height}
            </div>
          )}
        </div>
      </Card>
    )
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* View Controls */}
      <div className="flex items-center justify-between p-4 border-b">
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)} className="w-auto">
          <TabsList>
            <TabsTrigger value="split" className="flex items-center gap-2">
              <div className="grid grid-cols-2 gap-0.5 w-3 h-3">
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
              </div>
              Split View
            </TabsTrigger>
            <TabsTrigger value="document" className="flex items-center gap-2">
              <Eye className="h-3 w-3" />
              Document
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <FileText className="h-3 w-3" />
              Extracted Data
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {document.name}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const url = URL.createObjectURL(document)
              const a = window.document.createElement('a')
              a.href = url
              a.download = document.name
              a.click()
              URL.revokeObjectURL(url)
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {activeView === 'split' && (
          <>
            <div className="flex-1 border-r">{renderDocumentView()}</div>
            <div className="flex-1">{renderDataView()}</div>
          </>
        )}
        {activeView === 'document' && renderDocumentView()}
        {activeView === 'data' && renderDataView()}
      </div>

      {/* Selected Field Info */}
      {selectedField && (
        <div className="border-t bg-muted/30 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                Selected: {extractedFields.find(f => f.id === selectedField)?.label}
              </span>
              <ConfidenceIndicator 
                score={extractedFields.find(f => f.id === selectedField)?.confidence || 0}
                variant="compact" 
                size="sm"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedField(null)}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}