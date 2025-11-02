'use client'

import { useState } from 'react'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const toggleSidebarCollapse = () => setSidebarCollapsed(!sidebarCollapsed)

  return (
    <div className="flex h-screen bg-background">
      {/* Minimal Sidebar for testing */}
      <div className={`lg:flex lg:flex-col lg:fixed lg:inset-y-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-[280px]'}`}>
        <div className="relative flex h-full flex-col bg-white border-r border-gray-200 w-[280px] lg:translate-x-0 fixed lg:relative">
          {/* Header Section */}
          <div className={`flex h-16 items-center border-b border-gray-100 transition-all duration-300 ${sidebarCollapsed ? 'lg:justify-center lg:px-3' : 'justify-between px-6'}`}>
            <div className={`flex items-center transition-all duration-300 ${sidebarCollapsed ? 'lg:space-x-0' : 'space-x-3'}`}>
              {/* Brand Logo */}
              <div className="flex h-10 w-10 items-center justify-center bg-[#FF6B35] rounded-lg flex-shrink-0 shadow-lg">
                <span className="text-lg font-bold text-white">D</span>
              </div>
              {!sidebarCollapsed && (
                <div className="flex items-center transition-all duration-300">
                  <h1 className="text-xl font-semibold text-gray-900 whitespace-nowrap">DRIFT.AI</h1>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Section */}
          <nav className={`flex-1 py-6 transition-all duration-300 ${sidebarCollapsed ? 'lg:px-2' : 'px-4'}`}>
            <div className="space-y-2">
              <a
                href="/"
                className={`flex items-center rounded-xl transition-all duration-300 text-sm font-medium min-h-[48px] relative overflow-hidden ${sidebarCollapsed ? 'lg:justify-center lg:px-3 lg:py-3 px-4 py-3 gap-3' : 'gap-3 px-4 py-3'} bg-[#FF6B35] text-white shadow-md`}
              >
                <span className="flex-shrink-0 transition-all duration-300 h-5 w-5">📊</span>
                {!sidebarCollapsed && (
                  <span className="transition-all duration-300 whitespace-nowrap font-medium">Dashboard</span>
                )}
              </a>
              <a
                href="/vendors"
                className={`flex items-center rounded-xl transition-all duration-300 text-sm font-medium min-h-[48px] relative overflow-hidden ${sidebarCollapsed ? 'lg:justify-center lg:px-3 lg:py-3 px-4 py-3 gap-3' : 'gap-3 px-4 py-3'} text-gray-700 hover:bg-gray-50 hover:text-gray-900`}
              >
                <span className="flex-shrink-0 transition-all duration-300 h-5 w-5 text-gray-500">👥</span>
                {!sidebarCollapsed && (
                  <span className="transition-all duration-300 whitespace-nowrap font-medium">Vendors</span>
                )}
              </a>
              <a
                href="/reports"
                className={`flex items-center rounded-xl transition-all duration-300 text-sm font-medium min-h-[48px] relative overflow-hidden ${sidebarCollapsed ? 'lg:justify-center lg:px-3 lg:py-3 px-4 py-3 gap-3' : 'gap-3 px-4 py-3'} text-gray-700 hover:bg-gray-50 hover:text-gray-900`}
              >
                <span className="flex-shrink-0 transition-all duration-300 h-5 w-5 text-gray-500">📈</span>
                {!sidebarCollapsed && (
                  <span className="transition-all duration-300 whitespace-nowrap font-medium">Reports</span>
                )}
              </a>
              <a
                href="/settings"
                className={`flex items-center rounded-xl transition-all duration-300 text-sm font-medium min-h-[48px] relative overflow-hidden ${sidebarCollapsed ? 'lg:justify-center lg:px-3 lg:py-3 px-4 py-3 gap-3' : 'gap-3 px-4 py-3'} text-gray-700 hover:bg-gray-50 hover:text-gray-900`}
              >
                <span className="flex-shrink-0 transition-all duration-300 h-5 w-5 text-gray-500">⚙️</span>
                {!sidebarCollapsed && (
                  <span className="transition-all duration-300 whitespace-nowrap font-medium">Settings</span>
                )}
              </a>
            </div>
          </nav>

          {/* Toggle Button */}
          <button
            onClick={toggleSidebarCollapse}
            className="absolute top-1/3 -translate-y-1/2 -right-6 z-20 flex h-16 w-6 items-center justify-center bg-white border border-gray-200 shadow-lg hover:bg-[#FF6B35] hover:border-[#FF6B35] hover:text-white transition-all duration-300 text-gray-500 hover:text-white hidden lg:flex border-l-0 rounded-r-lg group"
          >
            {sidebarCollapsed ? '▶' : '◀'}
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className={`flex flex-1 flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-[280px]'}`}>
        {/* Simple Header */}
        <header className="flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold text-foreground">DRIFT.AI Dashboard</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
              🔔
            </button>
            <button className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
              👤
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="min-h-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}