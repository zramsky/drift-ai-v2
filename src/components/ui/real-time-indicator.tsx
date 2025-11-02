'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Clock, 
  Zap,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'

interface RealTimeIndicatorProps {
  isConnected?: boolean
  lastUpdate?: Date
  updateInterval?: number
  onRefresh?: () => void
  showDetails?: boolean
  className?: string
}

export function RealTimeIndicator({
  isConnected = true,
  lastUpdate,
  updateInterval = 30,
  onRefresh,
  showDetails = true,
  className
}: RealTimeIndicatorProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  const timeSinceUpdate = lastUpdate 
    ? Math.floor((currentTime.getTime() - lastUpdate.getTime()) / 1000)
    : null
    
  const getConnectionStatus = () => {
    if (!isConnected) return 'disconnected'
    if (timeSinceUpdate && timeSinceUpdate > updateInterval * 2) return 'stale'
    if (timeSinceUpdate && timeSinceUpdate > updateInterval * 1.5) return 'warning'
    return 'connected'
  }
  
  const connectionStatus = getConnectionStatus()
  
  const handleRefresh = async () => {
    if (isRefreshing) return
    
    setIsRefreshing(true)
    
    try {
      await queryClient.invalidateQueries()
      
      if (onRefresh) {
        await onRefresh()
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Refresh failed:', error)
    } finally {
      setIsRefreshing(false)
    }
  }
  
  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Zap className="h-3 w-3" />
      case 'warning':
        return <Clock className="h-3 w-3" />
      case 'stale':
        return <AlertTriangle className="h-3 w-3" />
      case 'disconnected':
        return <WifiOff className="h-3 w-3" />
    }
  }
  
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'stale':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'disconnected':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
    }
  }
  
  const getStatusLabel = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Live'
      case 'warning':
        return 'Slow'
      case 'stale':
        return 'Stale'
      case 'disconnected':
        return 'Offline'
    }
  }
  
  const formatTimeSince = (seconds: number) => {
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
  }
  
  if (!showDetails) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Badge 
          variant="secondary"
          className={cn("text-xs", getStatusColor())}
        >
          {getStatusIcon()}
          {getStatusLabel()}
        </Badge>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-6 w-6 p-0"
        >
          <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
        </Button>
      </div>
    )
  }
  
  return (
    <div className={cn("flex items-center gap-3 text-sm", className)}>
      <div className="flex items-center gap-2">
        <Badge 
          variant="secondary"
          className={cn("text-xs", getStatusColor())}
        >
          {getStatusIcon()}
          {getStatusLabel()}
        </Badge>
        
        {timeSinceUpdate !== null && (
          <span className="text-xs text-muted-foreground">
            Updated {formatTimeSince(timeSinceUpdate)}
          </span>
        )}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="h-7 text-xs"
      >
        <RefreshCw className={cn("h-3 w-3 mr-1", isRefreshing && "animate-spin")} />
        {isRefreshing ? 'Refreshing...' : 'Refresh'}
      </Button>
      
      {connectionStatus === 'connected' && timeSinceUpdate !== null && (
        <span className="text-xs text-muted-foreground">
          Next: {Math.max(0, updateInterval - timeSinceUpdate)}s
        </span>
      )}
    </div>
  )
}

export function useRealTimeConnection() {
  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  
  useEffect(() => {
    const handleOnline = () => {
      setIsConnected(true)
      setLastUpdate(new Date())
    }
    
    const handleOffline = () => {
      setIsConnected(false)
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    setIsConnected(navigator.onLine)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  const updateLastUpdate = () => {
    setLastUpdate(new Date())
  }
  
  return {
    isConnected,
    lastUpdate,
    updateLastUpdate
  }
}