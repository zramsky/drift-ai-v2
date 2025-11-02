'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ArrowRight } from 'lucide-react'

/**
 * VarianceVendorsTable Component
 *
 * Simple table format for top variance vendors
 * Features:
 * - Title: "Top Variance Vendors" (text-xl font-semibold)
 * - Table columns: Vendor | Category | Variance | Status
 * - Max 5-10 rows
 * - Bottom right links: "View Top 10 →" and "View Detailed Analysis →"
 * - Horizontal scroll on mobile
 *
 * Brand compliance: Uses #FF6B35 for links and active states
 */

interface VendorVariance {
  id: string
  vendorName: string
  category: string
  variance: number // Amount in dollars
  variancePercent: number // Percentage
  status: 'high' | 'medium' | 'low'
}

interface VarianceVendorsTableProps {
  vendors?: VendorVariance[]
  isLoading?: boolean
  maxRows?: number
  className?: string
}

export function VarianceVendorsTable({
  vendors = [],
  isLoading = false,
  maxRows = 10,
  className
}: VarianceVendorsTableProps) {
  const displayVendors = vendors.slice(0, maxRows)
  const hasVendors = displayVendors.length > 0

  const getStatusBadge = (status: VendorVariance['status']) => {
    switch (status) {
      case 'high':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">
            High
          </Badge>
        )
      case 'medium':
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">
            Medium
          </Badge>
        )
      case 'low':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
            Low
          </Badge>
        )
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(amount))
  }

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`
  }

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-6 ${className || ''}`}
      role="region"
      aria-label="Top variance vendors"
    >
      {/* Section Title */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Top Variance Vendors
      </h2>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex gap-4">
              <div className="h-4 bg-gray-200 rounded flex-1" />
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-4 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !hasVendors && (
        <div className="py-8 text-center">
          <p className="text-base text-gray-600">
            No variance data available at this time.
          </p>
        </div>
      )}

      {/* Table */}
      {!isLoading && hasVendors && (
        <>
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-sm font-semibold text-gray-700 pb-3">
                    Vendor
                  </th>
                  <th className="text-left text-sm font-semibold text-gray-700 pb-3">
                    Category
                  </th>
                  <th className="text-right text-sm font-semibold text-gray-700 pb-3">
                    Variance
                  </th>
                  <th className="text-center text-sm font-semibold text-gray-700 pb-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayVendors.map((vendor) => (
                  <tr
                    key={vendor.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 text-sm font-medium text-gray-900">
                      {vendor.vendorName}
                    </td>
                    <td className="py-3 text-sm text-gray-600">
                      {vendor.category}
                    </td>
                    <td className="py-3 text-sm text-right">
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(vendor.variance)}
                      </div>
                      <div
                        className={`text-xs ${
                          vendor.variancePercent > 0
                            ? 'text-red-600'
                            : 'text-green-600'
                        }`}
                      >
                        {formatPercent(vendor.variancePercent)}
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      {getStatusBadge(vendor.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Links */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-end mt-6 pt-4 border-t border-gray-200">
            <Link
              href="/analytics?view=top10"
              className="inline-flex items-center gap-1 text-sm font-medium text-[#FF6B35] hover:text-[#FF5722] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:ring-offset-2 rounded px-2 py-1"
            >
              View Top 10
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/analytics?view=detailed"
              className="inline-flex items-center gap-1 text-sm font-medium text-[#FF6B35] hover:text-[#FF5722] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:ring-offset-2 rounded px-2 py-1"
            >
              View Detailed Analysis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
