'use client'

import { Button } from '@/components/ui/button'
import { Upload, FileText, BarChart3, Settings, Plus, Scan } from 'lucide-react'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: typeof Upload
  primary?: boolean
  action: () => void
}

export function QuickActions() {
  const quickActions: QuickAction[] = [
    {
      id: 'upload-contract',
      title: 'Upload New Contract',
      description: 'Add a vendor contract for AI analysis',
      icon: Plus,
      primary: true,
      action: () => {
        // Handle contract upload
        console.log('Upload contract clicked')
      }
    },
    {
      id: 'upload-invoices',
      title: 'Upload Invoices',
      description: 'Process invoices against existing contracts',
      icon: Upload,
      action: () => {
        // Handle invoice upload
        console.log('Upload invoices clicked')
      }
    },
    {
      id: 'view-reports',
      title: 'View Reports',
      description: 'Detailed analytics and export options',
      icon: BarChart3,
      action: () => {
        // Navigate to reports
        console.log('View reports clicked')
      }
    },
    {
      id: 'run-analysis',
      title: 'Run Manual Scan',
      description: 'Force AI analysis on pending items',
      icon: Scan,
      action: () => {
        // Trigger manual analysis
        console.log('Run analysis clicked')
      }
    }
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h3>
        <p className="text-sm text-gray-500">Common tasks to manage your contracts and invoices</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.id}
              onClick={action.action}
              className={`group relative p-4 text-left border rounded-lg transition-all hover:border-gray-300 hover:shadow-sm ${
                action.primary 
                  ? 'border-blue-200 bg-blue-50 hover:bg-blue-100' 
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                  action.primary 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium mb-1 ${
                    action.primary ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {action.title}
                  </h4>
                  <p className={`text-sm ${
                    action.primary ? 'text-blue-700' : 'text-gray-500'
                  }`}>
                    {action.description}
                  </p>
                </div>
              </div>

              {action.primary && (
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Start Here
                  </span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Additional Action Buttons */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="text-sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          
          <Button variant="ghost" size="sm" className="text-sm text-gray-600">
            View All Vendors →
          </Button>
          
          <Button variant="ghost" size="sm" className="text-sm text-gray-600">
            Export Data →
          </Button>
        </div>
      </div>
    </div>
  )
}