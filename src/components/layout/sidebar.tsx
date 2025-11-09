'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  Users,
  FileText,
  Settings,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useEffect } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Vendors', href: '/vendors', icon: Users },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
]

interface SidebarProps {
  className?: string
  isOpen?: boolean
  onClose?: () => void
  isCollapsed?: boolean
  onCollapseToggle?: () => void
}

export function Sidebar({ className, isOpen, onClose, isCollapsed, onCollapseToggle }: SidebarProps) {
  const pathname = usePathname()

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    if (onClose && isOpen) {
      onClose()
    }
  }, [pathname, onClose, isOpen])

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
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
  }, [isOpen, onClose])

  return (
    <>
      {/* Mobile backdrop - improved z-index management */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
          style={{ zIndex: 1000 }}
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar Container */}
      <div className={cn(
        "relative flex h-full flex-col bg-white border-r border-gray-200",
        "transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)",
        // Modern width standards: 280px expanded, 64px collapsed
        isCollapsed ? "lg:w-16" : "lg:w-[280px]",
        // Mobile: slide-out drawer
        "w-[280px] lg:translate-x-0",
        "fixed lg:relative",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        className
      )}
      style={{ zIndex: isOpen ? 1001 : 'auto' }}>
        
        {/* Header Section */}
        <div className={cn(
          "flex h-16 items-center border-b border-gray-100",
          "transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)",
          isCollapsed ? "lg:justify-center lg:px-3" : "justify-between px-6"
        )}>
          <div className={cn(
            "flex items-center transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)",
            isCollapsed ? "lg:space-x-0" : "space-x-3"
          )}>
            {/* Brand Logo */}
            <div className="flex h-10 w-10 items-center justify-center bg-[#FF6B35] rounded-lg flex-shrink-0 shadow-lg">
              <span className="text-lg font-bold text-white">D</span>
            </div>
            
            {/* DRIFT.AI Text */}
            {!isCollapsed && (
              <div className="flex items-center transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)">
                <h1 className="text-xl font-semibold text-gray-900 whitespace-nowrap">DRIFT.AI</h1>
              </div>
            )}
          </div>
          
          {/* Close button for mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:ring-offset-2"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          )}
        </div>
        

        {/* Navigation Section */}
        <nav 
          className={cn(
            "flex-1 py-6 transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)",
            isCollapsed ? "lg:px-2" : "px-4"
          )}
          aria-label="Main navigation"
        >
          <div className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href as any}
                  className={cn(
                    "flex items-center rounded-xl transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) text-sm font-medium",
                    "min-h-[48px] relative overflow-hidden",
                    // Collapsed state adjustments
                    isCollapsed 
                      ? "lg:justify-center lg:px-3 lg:py-3 px-4 py-3 gap-3" 
                      : "gap-3 px-4 py-3",
                    // Active/inactive states
                    isActive
                      ? "bg-[#FF6B35] text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:ring-offset-2"
                  )}
                >
                  <item.icon className={cn(
                    "flex-shrink-0 transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)",
                    "h-5 w-5",
                    isActive ? "text-white" : "text-gray-500"
                  )} />
                  {!isCollapsed && (
                    <span className="transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) whitespace-nowrap font-medium">
                      {item.name}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Sidebar Toggle Tab - positioned on right edge, top third */}
        {onCollapseToggle && (
          <button
            onClick={onCollapseToggle}
            className={cn(
              "absolute top-1/3 -translate-y-1/2 -right-6 z-20",
              "flex h-16 w-6 items-center justify-center",
              "bg-white border border-gray-200 shadow-lg",
              "hover:bg-[#FF6B35] hover:border-[#FF6B35] hover:text-white",
              "focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:ring-offset-2",
              "transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)",
              "text-gray-500 hover:text-white",
              "hidden lg:flex",
              // Create tab-like appearance
              "border-l-0 rounded-r-lg",
              // Ensure proper layering
              "group"
            )}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 transition-transform duration-300" />
            ) : (
              <ChevronLeft className="h-5 w-5 transition-transform duration-300" />
            )}
          </button>
        )}
      </div>
    </>
  )
}