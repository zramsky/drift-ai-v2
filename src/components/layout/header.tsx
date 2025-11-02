'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
// import { Button } from '@/components/ui/button'
import { Bell, Search, User, Menu, X } from 'lucide-react'

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to a unified search page with query
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
      <div className="flex items-center space-x-4">
        {/* Mobile hamburger menu */}
        <button
          onClick={onMenuClick}
          className="lg:hidden min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        {/* Enhanced Search with functionality */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vendors, contracts, invoices..."
            className="h-9 w-48 sm:w-64 md:w-80 lg:w-96 rounded-md border border-input bg-background pl-10 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 h-7 w-7 p-0 -translate-y-1/2 hover:bg-gray-100 inline-flex items-center justify-center rounded-md"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </form>
      </div>
      
      <div className="flex items-center space-x-2 sm:space-x-4">
        <button
          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>
        <button
          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
          aria-label="User profile"
        >
          <User className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}