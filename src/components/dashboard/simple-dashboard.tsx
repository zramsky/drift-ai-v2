'use client'

import { useEffect, useState } from 'react'

export function SimpleDashboard() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading DRIFT.AI...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <h1 className="text-3xl font-bold text-gray-900">DRIFT.AI Dashboard</h1>
            <p className="mt-2 text-gray-600">AI-powered contract reconciliation platform</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard title="Total Drift" value="$127,500" description="Potential savings identified" />
          <KPICard title="Invoices Processed" value="1,261" description="Documents analyzed" />
          <KPICard title="Active Vendors" value="12" description="Vendors monitored" />
          <KPICard title="High Priority" value="8" description="Items need attention" />
        </div>

        {/* Action Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ActionCard 
            title="Recent Findings"
            items={[
              { text: "CleanCorp overcharge detected", amount: "$847", priority: "high" },
              { text: "Office Supplies discount missing", amount: "$234", priority: "medium" },
              { text: "Legal Services rate variance", amount: "$567", priority: "high" },
            ]}
          />
          
          <ActionCard 
            title="Upcoming Renewals"
            items={[
              { text: "Acme Corp contract renewal", date: "Feb 15", priority: "medium" },
              { text: "Office Supplies agreement", date: "Jan 30", priority: "high" },
              { text: "Legal Services retainer", date: "Mar 20", priority: "low" },
            ]}
          />
        </div>
      </div>
    </div>
  )
}

interface KPICardProps {
  title: string
  value: string
  description: string
}

function KPICard({ title, value, description }: KPICardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</h3>
      <div className="mt-2 text-3xl font-bold text-gray-900">{value}</div>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
    </div>
  )
}

interface ActionCardProps {
  title: string
  items: Array<{
    text: string
    amount?: string
    date?: string
    priority: 'high' | 'medium' | 'low'
  }>
}

function ActionCard({ title, items }: ActionCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{item.text}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                  item.priority === 'high' ? 'bg-red-100 text-red-800' :
                  item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {item.priority}
                </span>
                {item.amount && (
                  <span className="text-sm font-semibold text-orange-600">{item.amount}</span>
                )}
                {item.date && (
                  <span className="text-sm text-gray-500">{item.date}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}