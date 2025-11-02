'use client'

import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Shield, Target, Zap, CheckCircle2, AlertCircle, Activity, Clock, BarChart3, Users } from 'lucide-react'

interface AIPerformanceData {
  totalSaved: number
  thisMonthSaved: number
  accuracyRate: number
  falsePositiveRate: number
  totalAnalyzed: number
  thisMonthAnalyzed: number
  avgProcessingTime: number // in minutes
  uptime: number // percentage
  lastModelUpdate: string
  disputesWon: number
  disputesTotal: number
  userTrustRating: number
  monthlyTrend: number // percentage change
}

export function AIPerformanceIndicators() {
  const { data: performance } = useQuery({
    queryKey: ['ai-performance'],
    queryFn: async () => {
      // Enhanced mock data with trust indicators
      const mockData: AIPerformanceData = {
        totalSaved: 127500,
        thisMonthSaved: 8200,
        accuracyRate: 96.8,
        falsePositiveRate: 1.8,
        totalAnalyzed: 1261,
        thisMonthAnalyzed: 87,
        avgProcessingTime: 2.3,
        uptime: 99.9,
        lastModelUpdate: '3 days ago',
        disputesWon: 89,
        disputesTotal: 94,
        userTrustRating: 4.6,
        monthlyTrend: 12.5
      }
      return mockData
    },
    refetchInterval: 60000, // Refresh every minute
  })

  const primaryMetrics = [
    {
      title: 'Total Saved',
      value: `$${performance?.totalSaved.toLocaleString() || '127,500'}`,
      subtitle: `+$${performance?.thisMonthSaved.toLocaleString() || '8,200'} this month`,
      change: `+${performance?.monthlyTrend || 12.5}%`,
      icon: TrendingUp,
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      trend: 'up'
    },
    {
      title: 'Analysis Accuracy',
      value: `${performance?.accuracyRate || 96.8}%`,
      subtitle: `${performance?.falsePositiveRate || 1.8}% false positive rate`,
      change: 'Excellent',
      icon: Target,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      trend: 'stable'
    },
    {
      title: 'Processing Rate',
      value: `${performance?.thisMonthAnalyzed || 87}`,
      subtitle: `${performance?.totalAnalyzed.toLocaleString() || '1,261'} total analyzed`,
      change: `${performance?.avgProcessingTime || 2.3}min avg`,
      icon: Activity,
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      trend: 'stable'
    }
  ]

  const trustMetrics = [
    {
      label: 'Dispute Success Rate',
      value: performance?.disputesWon && performance?.disputesTotal 
        ? `${Math.round((performance.disputesWon / performance.disputesTotal) * 100)}%`
        : '89%',
      subtitle: `${performance?.disputesWon || 89} of ${performance?.disputesTotal || 94} disputes won`,
      icon: Shield,
      status: 'excellent'
    },
    {
      label: 'System Uptime',
      value: `${performance?.uptime || 99.9}%`,
      subtitle: 'Last 30 days operational',
      icon: Zap,
      status: 'excellent'
    },
    {
      label: 'User Confidence',
      value: `${performance?.userTrustRating || 4.6}/5.0`,
      subtitle: 'Based on validation feedback',
      icon: Users,
      status: 'good'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600'
      case 'good':
        return 'text-blue-600'
      case 'warning':
        return 'text-amber-600'
      default:
        return 'text-gray-600'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-600" />
      case 'down':
        return <TrendingUp className="w-3 h-3 text-red-600 transform rotate-180" />
      default:
        return <BarChart3 className="w-3 h-3 text-gray-600" />
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-xl">
              <Shield className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Performance & Trust Indicators</h2>
              <p className="text-sm text-gray-600">Real-time metrics demonstrating AI reliability and impact</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700">Active & Learning</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Primary Performance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
          {primaryMetrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <div 
                key={index}
                className={`border-2 rounded-xl p-6 transition-all hover:shadow-lg ${metric.borderColor} ${metric.bgColor}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-white`}>
                      <Icon className={`w-5 h-5 ${metric.color}`} />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      {metric.title}
                    </span>
                  </div>
                  {getTrendIcon(metric.trend)}
                </div>
                
                <div className="mb-2">
                  <span className={`text-3xl font-bold ${metric.color}`}>{metric.value}</span>
                </div>
                
                <div className="mb-3">
                  <span className="text-sm text-gray-600">{metric.subtitle}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge className={`${
                    metric.trend === 'up' ? 'bg-green-100 text-green-800 border-green-200' :
                    metric.trend === 'down' ? 'bg-red-100 text-red-800 border-red-200' :
                    'bg-blue-100 text-blue-800 border-blue-200'
                  } text-xs font-medium px-2 py-1`}>
                    {metric.change}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>

        {/* Trust & Reliability Metrics */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trust & Reliability Indicators</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {trustMetrics.map((metric, index) => {
              const Icon = metric.icon
              const statusColor = getStatusColor(metric.status)
              
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-4 h-4 ${statusColor}`} />
                      <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                    </div>
                    <CheckCircle2 className={`w-4 h-4 ${statusColor}`} />
                  </div>
                  
                  <div className="mb-1">
                    <span className={`text-xl font-bold ${statusColor}`}>{metric.value}</span>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {metric.subtitle}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* System Status & Health */}
        <div className="border-t border-gray-200 pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 text-center">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-2">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {performance?.avgProcessingTime || 2.3}min
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                Average Processing Time
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-2">
                <Activity className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {performance?.thisMonthAnalyzed || 87}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                Invoices This Month
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg mx-auto mb-2">
                <BarChart3 className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {performance?.lastModelUpdate || '3 days ago'}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                Last Model Update
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-lg mx-auto mb-2">
                <Shield className="w-4 h-4 text-indigo-600" />
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200 text-xs font-medium mb-1">
                Optimized
              </Badge>
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                Model Status
              </div>
            </div>
          </div>
        </div>

        {/* AI Transparency & Trust Building */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Why You Can Trust DRIFT.AI</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• AI continuously learns from your validated findings to improve accuracy</p>
                <p>• All high-impact financial decisions require human review and approval</p>
                <p>• Evidence is anchored to specific contract and invoice pages for verification</p>
                <p>• {performance?.disputesWon || 89} of {performance?.disputesTotal || 94} AI-identified disputes have been successfully resolved</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}