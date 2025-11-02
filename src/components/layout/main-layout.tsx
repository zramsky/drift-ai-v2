'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Sidebar } from './sidebar'
import { Header } from './header'
// import { QueryProvider } from '@/lib/query-client'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)
  const toggleSidebarCollapse = () => setSidebarCollapsed(!sidebarCollapsed)

  return (
      <div className="flex h-screen bg-background">
        {/* Sidebar - responsive with modern widths */}
        <div className={cn(
          "lg:flex lg:flex-col lg:fixed lg:inset-y-0",
          "transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)",
          sidebarCollapsed ? 'lg:w-16' : 'lg:w-[280px]'
        )}>
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={closeSidebar}
            isCollapsed={sidebarCollapsed}
            onCollapseToggle={toggleSidebarCollapse}
          />
        </div>
        
        {/* Main content area */}
        <div className={cn(
          "flex flex-1 flex-col",
          "transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)",
          sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-[280px]'
        )}>
          {/* Header with hamburger menu */}
          <Header 
            onMenuClick={toggleSidebar} 
          />
          
          {/* Main content with responsive padding */}
          <main className="flex-1 overflow-auto">
            <div className="min-h-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
  )
}