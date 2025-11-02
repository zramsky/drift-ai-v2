'use client'

import { useState, useEffect } from 'react'
import { SettingsSidebar } from './settings-sidebar'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'

interface SettingsLayoutProps {
  children: React.ReactNode
  activeCategory: string
  activeSection?: string
  onCategoryChange: (categoryId: string) => void
  onSectionChange?: (categoryId: string, sectionId: string) => void
  className?: string
}

export function SettingsLayout({
  children,
  activeCategory,
  activeSection,
  onCategoryChange,
  onSectionChange,
  className
}: SettingsLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Close mobile sidebar when category changes
  useEffect(() => {
    setIsMobileSidebarOpen(false)
  }, [activeCategory])

  // Handle escape key to close mobile sidebar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileSidebarOpen) {
        setIsMobileSidebarOpen(false)
      }
    }

    if (isMobileSidebarOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when sidebar is open on mobile
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isMobileSidebarOpen])

  return (
    <div className={cn("flex h-[calc(100vh-4rem)] bg-gray-50 settings-container", className)}>
      {/* Desktop Sidebar - Sticky */}
      <div className="hidden lg:block lg:sticky lg:top-0 lg:h-full">
        <SettingsSidebar
          activeCategory={activeCategory}
          activeSection={activeSection}
          onCategoryChange={onCategoryChange}
          onSectionChange={onSectionChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Mobile Sidebar */}
      <SettingsSidebar
        activeCategory={activeCategory}
        activeSection={activeSection}
        onCategoryChange={onCategoryChange}
        onSectionChange={onSectionChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isMobile={true}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-10">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open settings menu"
          >
            <Menu className="h-5 w-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100" style={{color: '#111827'}}>Settings</h1>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>

        {/* Content Area - Independent Scrolling */}
        <div className="flex-1 overflow-y-auto settings-scroll-area">
          <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}