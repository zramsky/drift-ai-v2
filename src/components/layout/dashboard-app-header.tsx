'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Search, User, X } from 'lucide-react'

/**
 * DashboardAppHeader Component
 *
 * Full-featured application header for the dashboard with:
 * - Left: DRIFT.AI logo (text with orange circle "D")
 * - Center: Global search bar with clear functionality
 * - Right: Notification bell + User profile icon
 * - Bottom border divider (border-b border-gray-200)
 *
 * Fully responsive with mobile optimization
 */

interface DashboardAppHeaderProps {
  className?: string
}

export function DashboardAppHeader({ className }: DashboardAppHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  return (
    <header className={`bg-white border-b border-gray-200 ${className || ''}`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Left: DRIFT.AI Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-sm">
                <span className="text-white font-bold text-base">D</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:inline">
                DRIFT.AI
              </span>
            </div>

            {/* Center: Global Search Bar */}
            <form
              onSubmit={handleSearch}
              className="flex-1 max-w-2xl"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search vendors, contracts, invoices..."
                  className="w-full h-10 rounded-lg border border-gray-300 bg-white pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  aria-label="Global search"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 h-6 w-6 p-0 -translate-y-1/2 hover:bg-gray-100 inline-flex items-center justify-center rounded-md transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-3 w-3 text-gray-500" />
                  </button>
                )}
              </div>
            </form>

            {/* Right: Notification Bell + User Profile */}
            <div className="flex items-center gap-2">
              <button
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5 text-gray-600" />
              </button>
              <button
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                aria-label="User profile"
              >
                <User className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
