'use client'

import React, { ErrorInfo, ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  RefreshCw, 
  Copy, 
  Bug, 
  Home,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string
  showDetails: boolean
}

interface EnhancedErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showRetry?: boolean
  showDetails?: boolean
  context?: string
  className?: string
}

export class EnhancedErrorBoundary extends React.Component<
  EnhancedErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: EnhancedErrorBoundaryProps) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      showDetails: false
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate unique error ID
    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    return {
      hasError: true,
      error,
      errorId,
      showDetails: false
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })
    
    // Log error details
    console.error('Error caught by boundary:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      context: this.props.context
    })
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
    
    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error reporting service
      // reportError(error, errorInfo, this.state.errorId)
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      showDetails: false
    })
  }

  handleCopyError = async () => {
    const errorText = [
      `Error ID: ${this.state.errorId}`,
      `Context: ${this.props.context || 'Unknown'}`,
      `Message: ${this.state.error?.message}`,
      `Stack: ${this.state.error?.stack}`,
      `Component Stack: ${this.state.errorInfo?.componentStack}`,
      `Timestamp: ${new Date().toISOString()}`
    ].join('\n\n')

    try {
      await navigator.clipboard.writeText(errorText)
      // Could show a toast notification here
    } catch (err) {
      console.error('Failed to copy error details:', err)
    }
  }

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }))
  }

  render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className={cn("flex items-center justify-center min-h-[400px] p-4", this.props.className)}>
          <Card className="max-w-lg w-full p-6 text-center">
            <div className="space-y-4">
              {/* Error Icon and Title */}
              <div className="flex flex-col items-center space-y-2">
                <div className="p-3 bg-destructive/10 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="text-xl font-semibold text-destructive">
                  Something went wrong
                </h2>
                <p className="text-muted-foreground">
                  {this.props.context 
                    ? `An error occurred in ${this.props.context}` 
                    : 'An unexpected error occurred'
                  }
                </p>
              </div>

              {/* Error ID */}
              <div className="flex items-center justify-center gap-2">
                <Badge variant="outline" className="font-mono text-xs">
                  {this.state.errorId}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={this.handleCopyError}
                  className="h-6 px-2"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>

              {/* Error Message */}
              <div className="p-3 bg-destructive/5 rounded-lg">
                <p className="text-sm text-destructive font-medium">
                  {this.state.error?.message || 'Unknown error occurred'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                {this.props.showRetry !== false && (
                  <Button onClick={this.handleRetry} className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              </div>

              {/* Debug Details Toggle */}
              {(this.props.showDetails !== false && process.env.NODE_ENV === 'development') && (
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={this.toggleDetails}
                    className="flex items-center gap-2"
                  >
                    <Bug className="h-3 w-3" />
                    {this.state.showDetails ? 'Hide' : 'Show'} Error Details
                    {this.state.showDetails ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </Button>

                  {this.state.showDetails && (
                    <div className="text-left">
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="space-y-2">
                          <div>
                            <h4 className="text-xs font-semibold text-muted-foreground mb-1">
                              Error Stack:
                            </h4>
                            <pre className="text-xs font-mono text-wrap break-all">
                              {this.state.error?.stack}
                            </pre>
                          </div>
                          
                          {this.state.errorInfo?.componentStack && (
                            <div>
                              <h4 className="text-xs font-semibold text-muted-foreground mb-1">
                                Component Stack:
                              </h4>
                              <pre className="text-xs font-mono text-wrap break-all">
                                {this.state.errorInfo.componentStack}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Help Text */}
              <p className="text-xs text-muted-foreground">
                If this problem persists, please contact support with the error ID above.
              </p>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Specialized error boundaries for different contexts
export function DocumentProcessingErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <EnhancedErrorBoundary
      context="Document Processing"
      onError={(error, errorInfo) => {
        // Could send to analytics or error reporting
        console.warn('Document processing error:', error.message)
      }}
    >
      {children}
    </EnhancedErrorBoundary>
  )
}

export function UploadErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <EnhancedErrorBoundary
      context="File Upload"
      fallback={
        <Card className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Upload Failed</h3>
          <p className="text-muted-foreground mb-4">
            There was an issue processing your upload. Please try again.
          </p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>
        </Card>
      }
    >
      {children}
    </EnhancedErrorBoundary>
  )
}

export function ReconciliationErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <EnhancedErrorBoundary
      context="Reconciliation Process"
      onError={(error, errorInfo) => {
        // Could track reconciliation-specific errors
        console.warn('Reconciliation error:', error.message)
      }}
    >
      {children}
    </EnhancedErrorBoundary>
  )
}

// Hook for programmatic error handling
export function useErrorHandler() {
  return (error: Error, context?: string) => {
    // Log the error
    console.error(`Error in ${context || 'unknown context'}:`, error)
    
    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // reportError(error, context)
    }
    
    // Could also dispatch to global error state
    // Example: dispatch({ type: 'ERROR_OCCURRED', payload: { error, context } })
  }
}