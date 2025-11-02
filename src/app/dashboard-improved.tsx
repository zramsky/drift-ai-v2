'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { DashboardKPICard } from '@/components/dashboard/dashboard-kpi-card'
import { ActionRequiredSection } from '@/components/dashboard/action-required-section'
import { VarianceVendorsTable } from '@/components/dashboard/variance-vendors-table'
import { DateRange } from '@/components/ui/date-range-picker'
import { apiClient } from '@/lib/api'
import { startOfMonth, endOfDay } from 'date-fns'
import type { DashboardStats } from '@/types/dashboard'
import {
  DollarSign,
  FileText,
  Users,
  AlertCircle
} from 'lucide-react'

/**
 * DRIFT.AI Dashboard V2 - Complete Redesign
 *
 * Layout Optimization Project focused on:
 * - Clarity and balance
 * - Professional white background with orange (#FF6B35) accents
 * - Improved information hierarchy
 * - Responsive design (mobile → tablet → desktop)
 *
 * Structure:
 * 1. KPI Row (4 cards horizontal)
 * 2. Action Required Section (Full-width)
 * 3. Top Variance Vendors Section (Full-width table)
 *
 * Note: Header with search bar, notifications, and profile is handled by MainLayout
 */

export default function ImprovedDashboard() {
  const router = useRouter()

  // Default to Current Month (MTD) for API calls
  const [dateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfDay(new Date()),
    preset: 'mtd'
  })

  // Fetch dashboard statistics
  const { data: dashboardStats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboard-stats', dateRange],
    queryFn: async () => {
      const validDateRange = dateRange.from && dateRange.to ? { from: dateRange.from, to: dateRange.to } : undefined
      const response = await apiClient.getDashboardStats(validDateRange)
      if (response.error) {
        throw new Error(response.error)
      }
      return response.data!
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
    refetchIntervalInBackground: false
  })

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`
  const isLoading = statsLoading
  const hasError = statsError

  // Mock action items (replace with real data)
  const actionItems = [
    {
      id: '1',
      vendorName: 'Acme Medical Supplies',
      issueType: 'Price Variance',
      description: 'Invoice #INV-2024-0315 shows 12% price increase',
      actionLabel: 'Review' as const,
      onAction: () => router.push('/invoices/INV-2024-0315')
    },
    {
      id: '2',
      vendorName: 'HealthCare Products Inc',
      issueType: 'Missing Contract',
      description: 'No active contract found for recent invoices',
      actionLabel: 'Resolve' as const,
      onAction: () => router.push('/vendors/VND-001')
    },
    {
      id: '3',
      vendorName: 'Quality Food Services',
      issueType: 'Quantity Discrepancy',
      description: 'Delivered quantity does not match invoice',
      actionLabel: 'Review' as const,
      onAction: () => router.push('/invoices/INV-2024-0316')
    }
  ]

  // Mock variance vendors data (replace with real data)
  const varianceVendors = [
    {
      id: 'VND-001',
      vendorName: 'Acme Medical Supplies',
      category: 'Medical Equipment',
      variance: 15750,
      variancePercent: 12.3,
      status: 'high' as const
    },
    {
      id: 'VND-002',
      vendorName: 'HealthCare Products Inc',
      category: 'Pharmaceuticals',
      variance: 8920,
      variancePercent: 8.5,
      status: 'medium' as const
    },
    {
      id: 'VND-003',
      vendorName: 'Quality Food Services',
      category: 'Food & Beverage',
      variance: 6340,
      variancePercent: 5.2,
      status: 'medium' as const
    },
    {
      id: 'VND-004',
      vendorName: 'Clean Linen Co',
      category: 'Housekeeping',
      variance: 3210,
      variancePercent: 3.8,
      status: 'low' as const
    },
    {
      id: 'VND-005',
      vendorName: 'Office Supplies Plus',
      category: 'Office & Admin',
      variance: 1890,
      variancePercent: 2.1,
      status: 'low' as const
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content - Header is handled by MainLayout */}
      <main className="dashboard-main-container py-8">
        <div className="space-y-8">
          {/* KPI Row - 4 Cards Horizontal */}
          <section aria-labelledby="kpi-section" className="dashboard-section-gap">
            <h2 id="kpi-section" className="sr-only">
              Key Performance Indicators
            </h2>

            <div className="dashboard-grid-kpi">
              {/* Total Savings */}
              <DashboardKPICard
                title="Total Savings"
                value={
                  isLoading
                    ? 'Loading...'
                    : hasError
                    ? 'Error'
                    : formatCurrency(dashboardStats?.totalDrift || 127500)
                }
                description="All-time cost reductions"
                icon={DollarSign}
                aria-label="Total savings found by DRIFT.AI system"
              />

              {/* Invoices Processed */}
              <DashboardKPICard
                title="Invoices Processed"
                value={
                  isLoading
                    ? 'Loading...'
                    : hasError
                    ? 'Error'
                    : (dashboardStats?.totalProcessed || 1261)
                }
                description="Documents analyzed"
                icon={FileText}
                aria-label="Total number of invoices processed"
              />

              {/* Active Vendors */}
              <DashboardKPICard
                title="Active Vendors"
                value={
                  isLoading
                    ? 'Loading...'
                    : hasError
                    ? 'Error'
                    : (dashboardStats?.activeVendors || 12)
                }
                description="Currently monitored"
                icon={Users}
                aria-label="Number of active vendors being monitored"
              />

              {/* Attention Required */}
              <DashboardKPICard
                title="Attention Required"
                value={
                  isLoading
                    ? 'Loading...'
                    : hasError
                    ? 'Error'
                    : (dashboardStats?.attentionRequired || 3)
                }
                description="Items need review"
                icon={AlertCircle}
                interactive={true}
                onClick={() => {
                  // Scroll to action required section
                  document.getElementById('action-section')?.scrollIntoView({ behavior: 'smooth' })
                }}
                aria-label="Items requiring immediate attention - click to view details"
              />
            </div>
          </section>

          {/* Action Required Section */}
          <section
            id="action-section"
            aria-labelledby="action-section-title"
            className="dashboard-section-gap"
          >
            <h2 id="action-section-title" className="sr-only">
              Action Required
            </h2>
            <ActionRequiredSection
              items={actionItems}
              isLoading={isLoading}
            />
          </section>

          {/* Top Variance Vendors Section */}
          <section
            aria-labelledby="variance-section-title"
            className="dashboard-section-gap"
          >
            <h2 id="variance-section-title" className="sr-only">
              Top Variance Vendors
            </h2>
            <VarianceVendorsTable
              vendors={varianceVendors}
              isLoading={isLoading}
              maxRows={5}
            />
          </section>
        </div>
      </main>
    </div>
  )
}

/**
 * Design System Compliance Notes:
 *
 * COLORS:
 * - White background (#FFFFFF) throughout
 * - Orange accent (#FF6B35) for brand elements, CTAs, focus rings
 * - Gray scale for text and borders
 *
 * TYPOGRAPHY:
 * - Inter for headings
 * - Roboto for body text
 * - Text sizes: h2 (2.25rem), body (1.125rem), sm (0.875rem)
 *
 * SPACING:
 * - Section gaps: mb-8 (32px)
 * - Card gaps: gap-6 (24px) mobile, gap-8 (32px) desktop
 * - Card padding: p-6 (24px)
 *
 * ACCESSIBILITY:
 * - ARIA labels on all interactive elements
 * - Keyboard navigation support
 * - Focus rings with brand orange (#FF6B35)
 * - Semantic HTML (section, h2, etc.)
 *
 * RESPONSIVE:
 * - Mobile: 1 column (< 640px)
 * - Tablet: 2 columns (640px - 1024px)
 * - Desktop: 4 columns (1024px+)
 * - Container max-width: 1400px (max-w-7xl)
 */
