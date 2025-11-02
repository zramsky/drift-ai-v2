'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

// Performance monitoring hook
export function usePerformanceMonitor() {
  const startTime = useRef<number>(0)
  const metricsRef = useRef<{
    renderCount: number
    lastRenderTime: number
    averageRenderTime: number
    slowRenders: number
  }>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    slowRenders: 0
  })

  useEffect(() => {
    startTime.current = performance.now()
    
    return () => {
      if (startTime.current) {
        const renderTime = performance.now() - startTime.current
        const metrics = metricsRef.current
        
        metrics.renderCount++
        metrics.lastRenderTime = renderTime
        metrics.averageRenderTime = (metrics.averageRenderTime + renderTime) / metrics.renderCount
        
        if (renderTime > 16.67) { // Slower than 60fps
          metrics.slowRenders++
        }

        // Log performance warnings in development
        if (process.env.NODE_ENV === 'development' && renderTime > 100) {
          console.warn(`Slow render detected: ${renderTime.toFixed(2)}ms`)
        }
      }
    }
  })

  return metricsRef.current
}

// Image optimization hook
export function useImageOptimization() {
  const loadImage = useCallback((src: string, options?: {
    quality?: number
    width?: number
    height?: number
    format?: 'webp' | 'jpeg' | 'png'
  }) => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      
      // Add loading optimization
      img.loading = 'lazy'
      img.decoding = 'async'
      
      img.onload = () => resolve(img)
      img.onerror = reject
      
      // Apply optimizations if supported
      if ('createImageBitmap' in window && options?.width && options?.height) {
        fetch(src)
          .then(response => response.blob())
          .then(blob => createImageBitmap(blob, {
            resizeWidth: options.width,
            resizeHeight: options.height,
            resizeQuality: 'high'
          }))
          .then(bitmap => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            if (ctx) {
              canvas.width = bitmap.width
              canvas.height = bitmap.height
              ctx.drawImage(bitmap, 0, 0)
              img.src = canvas.toDataURL(
                `image/${options.format || 'jpeg'}`,
                (options.quality || 85) / 100
              )
            } else {
              img.src = src
            }
            bitmap.close()
          })
          .catch(() => {
            img.src = src // Fallback
          })
      } else {
        img.src = src
      }
    })
  }, [])

  const compressImage = useCallback((file: File, options?: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    format?: string
  }): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      img.onload = () => {
        const { maxWidth = 1920, maxHeight = 1080, quality = 0.85, format = 'image/jpeg' } = options || {}
        
        // Calculate new dimensions
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        canvas.width = width
        canvas.height = height

        // Apply image smoothing
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => blob ? resolve(blob) : reject(new Error('Failed to compress image')),
          format,
          quality
        )
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }, [])

  return { loadImage, compressImage }
}

// Bundle size monitoring
export function useBundleAnalytics() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && 'performance' in window) {
      // Monitor loading performance
      window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        
        const metrics = {
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
        }

        console.log('Performance Metrics:', metrics)
        
        // Warn about slow loading
        if (metrics.domContentLoaded > 2000) {
          console.warn('Slow DOM loading detected:', metrics.domContentLoaded + 'ms')
        }
      })
    }
  }, [])
}

// Memory usage monitoring
export function useMemoryMonitor() {
  const checkMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory
      return {
        used: Math.round(memInfo.usedJSHeapSize / 1048576), // MB
        total: Math.round(memInfo.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memInfo.jsHeapSizeLimit / 1048576) // MB
      }
    }
    return null
  }, [])

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(() => {
        const memUsage = checkMemoryUsage()
        if (memUsage && memUsage.used > 100) { // Warn if using more than 100MB
          console.warn('High memory usage detected:', memUsage)
        }
      }, 30000) // Check every 30 seconds

      return () => clearInterval(interval)
    }
  }, [checkMemoryUsage])

  return checkMemoryUsage
}

// Lazy loading hook for heavy components
export function useLazyComponent<T = any>(
  importFn: () => Promise<{ default: T }>,
  options?: {
    fallback?: React.ComponentType
    delay?: number
  }
) {
  const [component, setComponent] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadComponent = useCallback(async () => {
    if (component || loading) return

    setLoading(true)
    setError(null)

    try {
      // Add artificial delay if specified (useful for testing)
      if (options?.delay) {
        await new Promise(resolve => setTimeout(resolve, options.delay))
      }

      const module = await importFn()
      setComponent(module.default)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [component, loading, importFn, options?.delay])

  return { component, loading, error, loadComponent }
}

// Debounced processing hook for expensive operations
export function useDebounced<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay, ...deps]
  )
}

// Network status hook for upload optimization
export function useNetworkStatus() {
  const [online, setOnline] = useState(true)
  const [connection, setConnection] = useState<{
    effectiveType?: string
    downlink?: number
    rtt?: number
    saveData?: boolean
  }>({})

  useEffect(() => {
    const updateOnlineStatus = () => setOnline(navigator.onLine)
    const updateConnection = () => {
      const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
      if (conn) {
        setConnection({
          effectiveType: conn.effectiveType,
          downlink: conn.downlink,
          rtt: conn.rtt,
          saveData: conn.saveData
        })
      }
    }

    updateOnlineStatus()
    updateConnection()

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    const conn = (navigator as any).connection
    if (conn) {
      conn.addEventListener('change', updateConnection)
      return () => {
        window.removeEventListener('online', updateOnlineStatus)
        window.removeEventListener('offline', updateOnlineStatus)
        conn.removeEventListener('change', updateConnection)
      }
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  return { online, connection }
}