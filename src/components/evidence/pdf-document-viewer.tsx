'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Document, Page } from 'react-pdf'
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Search,
  Download,
  Maximize,
  Minimize,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { pdfjs } from '@/lib/pdf-config'
import type { EvidenceAnchor } from '@/lib/api'

interface PdfDocumentViewerProps {
  fileUrl?: string
  pdfBlob?: Blob
  title: string
  documentType: 'contract' | 'invoice'
  highlights?: EvidenceAnchor[]
  activeHighlight?: EvidenceAnchor
  onHighlightClick?: (anchor: EvidenceAnchor) => void
  onPageChange?: (page: number) => void
  className?: string
}

interface Highlight {
  anchor: EvidenceAnchor
  isActive: boolean
}

export function PdfDocumentViewer({
  fileUrl,
  pdfBlob,
  title,
  documentType,
  highlights = [],
  activeHighlight,
  onHighlightClick,
  onPageChange,
  className = ''
}: PdfDocumentViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [zoom, setZoom] = useState<number>(1.0)
  const [searchText, setSearchText] = useState<string>('')
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState<number>(0)
  const [showFallback, setShowFallback] = useState<boolean>(false)

  const documentRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)

  // Navigate to specific page (used by evidence anchors)
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= numPages) {
      setPageNumber(page)
      onPageChange?.(page)
    }
  }, [numPages, onPageChange])

  // Navigate to evidence anchor
  const navigateToAnchor = useCallback((anchor: EvidenceAnchor) => {
    if (anchor.doc === documentType) {
      goToPage(anchor.page)
      onHighlightClick?.(anchor)
    }
  }, [documentType, goToPage, onHighlightClick])

  // Effect to handle active highlight navigation
  useEffect(() => {
    if (activeHighlight && activeHighlight.doc === documentType) {
      goToPage(activeHighlight.page)
    }
  }, [activeHighlight, documentType, goToPage])

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
  }, []);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setLoading(false)
    setError(null)
    setRetryCount(0)
    setShowFallback(false)
  }

  const handleDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error)
    
    // Check if it's a network error or missing file
    const isNetworkError = error.message.includes('network') || 
                          error.message.includes('fetch') || 
                          error.message.includes('404') ||
                          error.message.includes('not found')
    
    if (isNetworkError && retryCount < 3) {
      // Auto-retry for network errors
      setTimeout(() => {
        setRetryCount(prev => prev + 1)
        setError(null)
        setLoading(true)
      }, 1000 * (retryCount + 1)) // Exponential backoff
    } else {
      setError(`Failed to load document: ${error.message}`)
      setLoading(false)
      
      // Show fallback after 3 failed attempts
      if (retryCount >= 3) {
        setShowFallback(true)
      }
    }
  }

  // Manual retry function
  const handleRetry = () => {
    setError(null)
    setLoading(true)
    setRetryCount(0)
    setShowFallback(false)
  }

  // Check if document source is valid
  const isValidDocumentSource = () => {
    if (!documentSource) return false
    if (typeof documentSource === 'string' && documentSource.trim() === '') return false
    if (documentSource instanceof Blob && documentSource.size === 0) return false
    return true
  }

  const handlePreviousPage = () => {
    if (pageNumber > 1) {
      const newPage = pageNumber - 1
      setPageNumber(newPage)
      onPageChange?.(newPage)
    }
  }

  const handleNextPage = () => {
    if (pageNumber < numPages) {
      const newPage = pageNumber + 1
      setPageNumber(newPage)
      onPageChange?.(newPage)
    }
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3.0))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.25))
  const handleResetZoom = () => setZoom(1.0)

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value, 10)
    if (!isNaN(page) && page >= 1 && page <= numPages) {
      setPageNumber(page)
      onPageChange?.(page)
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Filter highlights for current page
  const currentPageHighlights = highlights.filter(
    (anchor) => anchor.doc === documentType && anchor.page === pageNumber
  )

  // Render highlight overlay for bounding box
  const renderHighlight = (anchor: EvidenceAnchor, index: number) => {
    if (!anchor.bbox) return null

    const { x, y, width, height } = anchor.bbox
    const isActive = activeHighlight === anchor

    return (
      <div
        key={`highlight-${index}`}
        className={`absolute border-2 cursor-pointer transition-all duration-200 ${
          isActive 
            ? 'border-brand-steel bg-brand-steel/20 shadow-lg z-10' 
            : anchor.doc === 'contract'
            ? 'border-blue-500 bg-blue-500/10 hover:bg-blue-500/20'
            : 'border-green-500 bg-green-500/10 hover:bg-green-500/20'
        }`}
        style={{
          left: `${x * zoom}px`,
          top: `${y * zoom}px`,
          width: `${width * zoom}px`,
          height: `${height * zoom}px`,
        }}
        onClick={() => navigateToAnchor(anchor)}
        title={anchor.quoted_text}
      />
    )
  }

  const documentSource = pdfBlob || fileUrl

  // Enhanced validation and fallback handling
  if (!documentSource || !isValidDocumentSource()) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-muted-foreground">{title}</CardTitle>
            <Badge variant="outline" className="text-red-600 border-red-300">
              Document Unavailable
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <div className="h-12 w-12 mx-auto mb-4 opacity-50 bg-red-50 rounded-lg flex items-center justify-center">
              <span className="text-lg text-red-500">📄</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Document Not Available</h3>
            <p className="text-sm mb-4">
              {!documentSource ? 'No document URL or blob provided' : 'Document source is empty or invalid'}
            </p>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="mr-2"
              >
                Refresh Page
              </Button>
              {fileUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(fileUrl, '_blank')}
                >
                  Try Direct Link
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{title}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant="outline" 
                className={documentType === 'contract' ? 'border-blue-500 text-blue-600' : 'border-green-500 text-green-600'}
              >
                {documentType}
              </Badge>
              {highlights.length > 0 && (
                <Badge variant="outline">
                  {highlights.filter(h => h.doc === documentType).length} highlights
                </Badge>
              )}
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <div className="flex items-center gap-1 border rounded-md px-2 py-1">
              <Search className="h-3 w-3 text-muted-foreground" />
              <Input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search..."
                className="h-6 border-0 p-0 text-xs w-20 focus-visible:ring-0"
              />
            </div>
            
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 border rounded-md p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 0.25}
                className="h-6 w-6 p-0"
              >
                <ZoomOut className="h-3 w-3" />
              </Button>
              <span className="px-2 text-xs font-medium min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 3.0}
                className="h-6 w-6 p-0"
              >
                <ZoomIn className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetZoom}
                className="h-6 w-6 p-0"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            </div>

            {/* Page Navigation */}
            {numPages > 0 && (
              <div className="flex items-center gap-1 border rounded-md p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={pageNumber <= 1}
                  className="h-6 w-6 p-0"
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <Input
                  value={pageNumber}
                  onChange={handlePageInputChange}
                  className="h-6 w-12 text-xs text-center border-0 p-1 focus-visible:ring-0"
                  min={1}
                  max={numPages}
                  type="number"
                />
                <span className="text-xs text-muted-foreground">/ {numPages}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={pageNumber >= numPages}
                  className="h-6 w-6 p-0"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Fullscreen & Download */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="h-8 w-8 p-0"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => window.open(fileUrl, '_blank')}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div 
          ref={documentRef}
          className="relative bg-gray-50 overflow-auto"
          style={{ height: isFullscreen ? 'calc(100vh - 80px)' : '600px' }}
        >
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="space-y-4 w-full max-w-md">
                <Skeleton className="h-4 w-3/4 mx-auto" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md mx-auto p-6">
                <div className="h-12 w-12 mx-auto mb-4 bg-red-50 rounded-lg flex items-center justify-center">
                  <span className="text-lg text-red-500">⚠️</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-red-700">Document Load Error</h3>
                <p className="text-sm text-red-600 mb-4">{error}</p>
                
                {retryCount > 0 && (
                  <p className="text-xs text-muted-foreground mb-4">
                    Retry attempt {retryCount}/3
                  </p>
                )}
                
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    className="min-w-[100px]"
                  >
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Retry
                  </Button>
                  
                  {fileUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(fileUrl, '_blank')}
                      className="min-w-[100px]"
                    >
                      <Download className="h-3 w-3 mr-2" />
                      Direct Link
                    </Button>
                  )}
                  
                  {showFallback && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFallback(false)}
                      className="min-w-[100px]"
                    >
                      Hide Details
                    </Button>
                  )}
                </div>
                
                {showFallback && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md text-left">
                    <h4 className="font-medium text-sm mb-2">Troubleshooting:</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Check your internet connection</li>
                      <li>• The document may have been moved or deleted</li>
                      <li>• Try refreshing the page</li>
                      <li>• Contact support if the issue persists</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-2">
                      Document path: <code className="bg-gray-200 px-1 rounded text-xs">{typeof documentSource === 'string' ? documentSource : 'blob'}</code>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {!loading && !error && (
            <div className="flex justify-center p-4">
              <div ref={pageRef} className="relative">
                <Document
                  file={documentSource}
                  onLoadSuccess={handleDocumentLoadSuccess}
                  onLoadError={handleDocumentLoadError}
                  loading={<Skeleton className="h-96 w-72" />}
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={zoom}
                    loading={<Skeleton className="h-96 w-72" />}
                    className="shadow-lg"
                  />
                </Document>
                
                {/* Highlight Overlays */}
                {currentPageHighlights.map((anchor, index) => 
                  renderHighlight(anchor, index)
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Mobile swipe instructions */}
        {isMobile && numPages > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
            Swipe left/right for pages • Pinch to zoom
          </div>
        )}
      </CardContent>
    </Card>
  )
}