'use client'

import { cn } from '@/lib/utils'
import { SETTINGS_CATEGORIES, SETTINGS_ICONS } from '@/lib/settings-config'
import { Search, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import React, { useState } from 'react'

interface SettingsSidebarProps {
  activeCategory: string
  activeSection?: string
  onCategoryChange: (categoryId: string) => void
  onSectionChange?: (categoryId: string, sectionId: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  className?: string
  isMobile?: boolean
  isOpen?: boolean
  onClose?: () => void
}

export function SettingsSidebar({
  activeCategory,
  activeSection,
  onCategoryChange,
  onSectionChange,
  searchQuery,
  onSearchChange,
  className,
  isMobile = false,
  isOpen = false,
  onClose
}: SettingsSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([activeCategory])

  // Ensure active category is always expanded
  React.useEffect(() => {
    if (activeCategory && !expandedCategories.includes(activeCategory)) {
      setExpandedCategories(prev => [...prev, activeCategory])
    }
  }, [activeCategory])

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const filteredCategories = SETTINGS_CATEGORIES.filter(category =>
    searchQuery === '' ||
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.sections.some(section =>
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.settings.some(setting =>
        setting.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
  )

  const handleCategoryClick = (categoryId: string) => {
    // Ensure category is expanded when clicked (use functional update to prevent race conditions)
    setExpandedCategories(prev => 
      prev.includes(categoryId) ? prev : [...prev, categoryId]
    )
    onCategoryChange(categoryId)
    if (isMobile && onClose) {
      onClose()
    }
  }

  // Utility function for smooth scrolling to sections
  const scrollToSection = (sectionId: string, delay: number = 100) => {
    setTimeout(() => {
      const element = document.getElementById(`section-${sectionId}`)
      const scrollContainer = document.querySelector('.settings-scroll-area')
      
      if (element && scrollContainer) {
        const containerRect = scrollContainer.getBoundingClientRect()
        const elementRect = element.getBoundingClientRect()
        const scrollTop = scrollContainer.scrollTop
        
        // Calculate target scroll position with 24px offset
        const targetScrollTop = scrollTop + elementRect.top - containerRect.top - 24
        
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        
        scrollContainer.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        })
      }
    }, delay)
  }

  const handleSectionClick = (categoryId: string, sectionId: string) => {
    // Ensure category is expanded when section is clicked
    setExpandedCategories(prev => 
      prev.includes(categoryId) ? prev : [...prev, categoryId]
    )
    
    const isSameCategory = activeCategory === categoryId
    const delay = isSameCategory ? 100 : 300 // Longer delay for category changes
    
    // Set both the category and section as active
    onCategoryChange(categoryId)
    if (onSectionChange) {
      onSectionChange(categoryId, sectionId)
    }
    
    // Scroll to the section with appropriate timing
    scrollToSection(sectionId, delay)
    
    if (isMobile && onClose) {
      // Close mobile sidebar after a slight delay for better UX
      setTimeout(() => onClose(), 150)
    }
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
        isMobile 
          ? cn(
              "fixed z-50 w-80 lg:hidden h-full",
              isOpen ? "translate-x-0" : "-translate-x-full"
            )
          : "w-80 relative h-[calc(100vh-4rem)]",
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100" style={{color: '#111827'}}>Settings</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400" style={{color: '#4B5563'}}>Configure your preferences</p>
          </div>
          {isMobile && onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close settings menu"
            >
              <ChevronDown className="h-5 w-5 text-gray-500 rotate-90" />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search settings..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-9 text-sm"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 settings-scroll-area">
          <div className="space-y-1 px-3">
            {filteredCategories.map((category) => {
              const IconComponent = SETTINGS_ICONS[category.icon as keyof typeof SETTINGS_ICONS]
              const isActive = activeCategory === category.id
              const isExpanded = expandedCategories.includes(category.id)

              return (
                <div key={category.id} className="space-y-1">
                  <button
                    onClick={() => handleCategoryClick(category.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                      "hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:ring-offset-2",
                      isActive
                        ? "bg-[#FF6B35] text-white shadow-sm"
                        : "text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                    )}
                  >
                    <IconComponent className="h-5 w-5 flex-shrink-0" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{category.name}</div>
                      <div className={cn(
                        "text-xs opacity-75 mt-0.5 line-clamp-1",
                        isActive ? "text-white/90" : "text-gray-600 dark:text-gray-300"
                      )}>
                        {category.description}
                      </div>
                    </div>
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform duration-300 ease-in-out",
                      (isExpanded || isActive) && "rotate-180"
                    )} />
                  </button>

                  {/* Section expansion - only show when searching or category is active/expanded */}
                  {(searchQuery !== '' || isExpanded || isActive) && (
                    <div className="ml-8 space-y-1">
                      {category.sections.map((section) => {
                        const isSectionActive = activeSection === section.id && isActive
                        return (
                          <button
                            key={section.id}
                            className={cn(
                              "w-full text-left px-3 py-2 text-xs rounded transition-all duration-200",
                              "hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer",
                              "focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:ring-offset-1",
                              isSectionActive
                                ? "bg-orange-50 border-l-3 border-l-[#FF6B35] text-[#FF6B35] font-medium pl-4"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            )}
                            onClick={() => handleSectionClick(category.id, section.id)}
                          >
                            {section.title}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* No results */}
          {searchQuery !== '' && filteredCategories.length === 0 && (
            <div className="px-6 py-8 text-center">
              <div className="text-gray-400 mb-2">
                <Search className="h-8 w-8 mx-auto" />
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300" style={{color: '#374151'}}>No settings found</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1" style={{color: '#4B5563'}}>Try a different search term</p>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span style={{color: '#4B5563'}}>All settings saved automatically</span>
          </div>
        </div>
      </div>
    </>
  )
}