'use client'

import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bot, AlertTriangle, CheckCircle, Clock, DollarSign, Activity, TrendingUp, Eye } from 'lucide-react'
import { apiClient } from '@/lib/api'

export interface ActionableInsight {
  id: string
  type: 'overcharge' | 'contract_violation' | 'missing_discount' | 'outside_terms' | 'unauthorized_fee'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  amount: number
  confidence: number
  vendor: string
  invoiceId?: string
  contractId?: string
  evidence: {
    contractPage?: number
    invoicePage?: number
    quotedText?: string
  }
  actions: {
    primary: {
      label: string
      action: 'dispute' | 'contact_vendor' | 'mark_valid' | 'review'
    }
    secondary?: {
      label: string
      action: 'mark_invalid' | 'see_details' | 'defer'
    }
  }
}

interface AIStatus {
  status: 'analyzing' | 'complete' | 'idle' | 'scanning'
  currentlyAnalyzing: number
  lastScanTime: string
  nextScanTime?: string
  totalPotentialSavings: number
  confidenceLevel: 'high' | 'medium' | 'low'
  analysisAccuracy: number
  findingsByPriority: {
    high: { count: number; amount: number }
    medium: { count: number; amount: number }
    low: { count: number; amount: number }
  }
}

const priorityConfig = {
  high: {
    color: 'bg-red-50 border-red-200 text-red-900',
    icon: AlertTriangle,
    iconColor: 'text-red-600',
    badge: 'bg-red-100 text-red-800 border-red-200',
    label: 'HIGH PRIORITY'
  },
  medium: {
    color: 'bg-amber-50 border-amber-200 text-amber-900',
    icon: DollarSign,
    iconColor: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    label: 'MEDIUM PRIORITY'
  },
  low: {
    color: 'bg-blue-50 border-blue-200 text-blue-900',
    icon: CheckCircle,
    iconColor: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    label: 'NEEDS REVIEW'
  }
}

export function AIInsightsSection() {
  const { data: aiStatus } = useQuery({
    queryKey: ['ai-status'],
    queryFn: async () => {
      // Enhanced mock data matching new structure
      const mockStatus: AIStatus = {
        status: 'analyzing',
        currentlyAnalyzing: 3,
        lastScanTime: '2 minutes ago',
        nextScanTime: '15 minutes',
        totalPotentialSavings: 3648,
        confidenceLevel: 'high',
        analysisAccuracy: 96.8,
        findingsByPriority: {
          high: { count: 3, amount: 2847 },
          medium: { count: 2, amount: 567 },
          low: { count: 1, amount: 234 }
        }
      }
      return mockStatus
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const { data: insights } = useQuery({
    queryKey: ['actionable-insights'],
    queryFn: async () => {
      // Enhanced mock data with actionable insights
      const mockInsights: ActionableInsight[] = [
        {
          id: '1',
          type: 'overcharge',
          priority: 'high',
          title: 'CleanCorp Invoice #1234 - $847 Overcharge',
          description: 'Contract: $50/hr, Charged: $67/hr (+34% overcharge)',
          amount: 847,
          confidence: 95,
          vendor: 'CleanCorp',
          evidence: {
            contractPage: 2,
            invoicePage: 1,
            quotedText: 'Hourly rate: $50.00'
          },
          actions: {
            primary: {
              label: 'Dispute Invoice',
              action: 'dispute'
            },
            secondary: {
              label: 'See Details',
              action: 'see_details'
            }
          }
        },
        {
          id: '2',
          type: 'unauthorized_fee',
          priority: 'high',
          title: 'TechVendor Service Fee - $1,200 Not Authorized',
          description: 'Implementation fee not covered in contract terms',
          amount: 1200,
          confidence: 89,
          vendor: 'TechVendor',
          evidence: {
            contractPage: 3,
            invoicePage: 2,
            quotedText: 'Excluded: Implementation fees'
          },
          actions: {
            primary: {
              label: 'Dispute Invoice',
              action: 'dispute'
            },
            secondary: {
              label: 'See Details',
              action: 'see_details'
            }
          }
        },
        {
          id: '3',
          type: 'missing_discount',
          priority: 'high',
          title: 'OfficeSupplies Bulk Discount - $800 Missing',
          description: 'Volume discount (15%) not applied to order >$5K',
          amount: 800,
          confidence: 92,
          vendor: 'OfficeSupplies',
          evidence: {
            contractPage: 1,
            invoicePage: 1,
            quotedText: '15% discount on orders >$5,000'
          },
          actions: {
            primary: {
              label: 'Dispute Invoice',
              action: 'dispute'
            },
            secondary: {
              label: 'See Details',
              action: 'see_details'
            }
          }
        },
        {
          id: '4',
          type: 'contract_violation',
          priority: 'medium',
          title: 'LegalFirm Hourly Rate - $367 Above Contract',
          description: 'Senior partner rate: Contract $275/hr, Charged $342/hr',
          amount: 367,
          confidence: 78,
          vendor: 'LegalFirm',
          evidence: {
            contractPage: 4,
            invoicePage: 2
          },
          actions: {
            primary: {
              label: 'Contact Vendor',
              action: 'contact_vendor'
            },
            secondary: {
              label: 'See Details',
              action: 'see_details'
            }
          }
        },
        {
          id: '5',
          type: 'outside_terms',
          priority: 'medium',
          title: 'DataCorp Usage - $200 Outside Contract Period',
          description: 'Services provided after contract expiry date',
          amount: 200,
          confidence: 85,
          vendor: 'DataCorp',
          evidence: {
            contractPage: 1,
            invoicePage: 1
          },
          actions: {
            primary: {
              label: 'Contact Vendor',
              action: 'contact_vendor'
            },
            secondary: {
              label: 'See Details',
              action: 'see_details'
            }
          }
        },
        {
          id: '6',
          type: 'overcharge',
          priority: 'low',
          title: 'CloudServices Usage - $234 Potential Optimization',
          description: 'Usage within contract but could be optimized',
          amount: 234,
          confidence: 65,
          vendor: 'CloudServices',
          evidence: {
            contractPage: 2,
            invoicePage: 3
          },
          actions: {
            primary: {
              label: 'Review Usage',
              action: 'review'
            },
            secondary: {
              label: 'See Details',
              action: 'see_details'
            }
          }
        }
      ]
      return mockInsights
    },
    refetchInterval: 30000,
  })

  const handleAction = (insight: ActionableInsight, actionType: 'primary' | 'secondary') => {
    const action = actionType === 'primary' ? insight.actions.primary : insight.actions.secondary
    if (!action) return
    
    console.log(`Executing ${action.action} for insight ${insight.id}:`, {
      vendor: insight.vendor,
      amount: insight.amount,
      action: action.action
    })
    
    // In production, this would trigger appropriate workflows:
    // - dispute: Create dispute workflow
    // - contact_vendor: Open communication channel
    // - mark_valid: Update finding status
    // - review: Navigate to detailed view
    // - see_details: Open evidence viewer
  }

  return (
    <div className="space-y-8">
      {/* Section 1: AI Status Indicator */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
                <Bot className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Analysis Status</h1>
                <div className="flex items-center space-x-3 mt-2">
                  {aiStatus?.status === 'analyzing' ? (
                    <>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-green-700">
                          Currently analyzing {aiStatus.currentlyAnalyzing} new invoices
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-600">
                        Analysis complete • Last scan: {aiStatus?.lastScanTime || '5 minutes ago'}
                      </span>
                    </>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Activity className="w-4 h-4" />
                    <span>Confidence: High ({aiStatus?.analysisAccuracy || 96.8}% accuracy)</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Next scan in</div>
              <div className="text-lg font-semibold text-gray-900">{aiStatus?.nextScanTime || '15 min'}</div>
            </div>
          </div>
        </div>

        {/* Potential Savings Cards */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Actionable Findings</h2>
            <div className="flex items-center space-x-3">
              <Badge className="bg-green-100 text-green-800 border-green-200 font-medium text-base px-3 py-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                ${aiStatus?.totalPotentialSavings.toLocaleString() || '3,648'} potential savings
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {Object.entries(priorityConfig).map(([priority, config]) => {
              const Icon = config.icon
              const priorityData = aiStatus?.findingsByPriority[priority as keyof typeof aiStatus.findingsByPriority]
              return (
                <div 
                  key={priority}
                  className={`p-4 lg:p-6 rounded-xl border-2 transition-all hover:shadow-lg cursor-pointer ${config.color}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${
                        priority === 'high' ? 'bg-red-100' :
                        priority === 'medium' ? 'bg-amber-100' :
                        'bg-blue-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${config.iconColor}`} />
                      </div>
                      <Badge className={`${config.badge} font-semibold text-xs px-2 py-1`}>
                        {config.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-2">
                    ${priorityData?.amount.toLocaleString() || '0'}
                  </div>
                  <div className="text-sm opacity-75 mb-4">
                    {priorityData?.count || 0} findings requiring action
                  </div>
                  <Button 
                    size="sm" 
                    className={`w-full text-sm font-medium ${
                      priority === 'high' ? 'bg-red-600 hover:bg-red-700' :
                      priority === 'medium' ? 'bg-amber-600 hover:bg-amber-700' :
                      'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Review {priorityData?.count || 0} Items
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Section 2: Recent Actionable Findings */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Findings Requiring Action</h2>
            <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
              {insights?.length || 0} items need your attention
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {insights?.slice(0, 6).map((insight) => {
              const priorityStyles = priorityConfig[insight.priority]
              const Icon = priorityStyles.icon
              
              return (
                <div 
                  key={insight.id}
                  className={`border-2 rounded-xl p-4 lg:p-6 hover:shadow-md transition-all ${
                    insight.priority === 'high' ? 'border-red-200 bg-red-50' :
                    insight.priority === 'medium' ? 'border-amber-200 bg-amber-50' :
                    'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-4 lg:space-y-0">
                    {/* Main content */}
                    <div className="flex space-x-3 lg:space-x-4 flex-1">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0 ${
                        insight.priority === 'high' ? 'bg-red-100' :
                        insight.priority === 'medium' ? 'bg-amber-100' :
                        'bg-blue-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${priorityStyles.iconColor}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                          <Badge className={`${priorityStyles.badge} font-semibold text-xs px-2 py-1 w-fit`}>
                            {priorityStyles.label}
                          </Badge>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <span>{insight.confidence}% confidence</span>
                          </div>
                        </div>
                        
                        <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2 break-words">{insight.title}</h3>
                        <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs text-gray-600 mb-4">
                          <span className="font-medium">Vendor: {insight.vendor}</span>
                          <div className="flex items-center space-x-2">
                            {insight.evidence.contractPage && (
                              <span>Contract Page {insight.evidence.contractPage}</span>
                            )}
                            {insight.evidence.invoicePage && (
                              <span>Invoice Page {insight.evidence.invoicePage}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                          <Button 
                            size="sm" 
                            className={`text-sm font-medium w-full sm:w-auto ${
                              insight.priority === 'high' ? 'bg-red-600 hover:bg-red-700' :
                              insight.priority === 'medium' ? 'bg-amber-600 hover:bg-amber-700' :
                              'bg-blue-600 hover:bg-blue-700'
                            }`}
                            onClick={() => handleAction(insight, 'primary')}
                          >
                            {insight.actions.primary.label}
                          </Button>
                          {insight.actions.secondary && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-sm border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
                              onClick={() => handleAction(insight, 'secondary')}
                            >
                              {insight.actions.secondary.label}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Amount - moves to top on mobile */}
                    <div className="text-center lg:text-right lg:ml-6 order-first lg:order-last">
                      <div className={`text-xl lg:text-2xl font-bold mb-1 ${
                        insight.priority === 'high' ? 'text-red-900' :
                        insight.priority === 'medium' ? 'text-amber-900' :
                        'text-blue-900'
                      }`}>
                        ${insight.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">potential savings</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {(!insights || insights.length === 0) && (
            <div className="text-center py-16 text-gray-500">
              <CheckCircle className="w-20 h-20 mx-auto mb-6 text-gray-300" />
              <h3 className="text-xl font-medium text-gray-900 mb-3">All Clear!</h3>
              <p className="text-sm text-gray-600 max-w-sm mx-auto">
                No actionable findings detected in recent analysis. Your contracts and invoices are aligned.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}