'use client'

import { useUserState } from '@/hooks/use-user-state'
import { NewUserOnboarding } from './new-user-onboarding'
import { AIInsightsSection } from './ai-insights-section'
import { AIPerformanceIndicators } from './ai-performance-indicators'
import { QuickActions } from './quick-actions'
import { DashboardHeader } from './dashboard-header'

export function NewDashboard() {
  const { 
    userState, 
    isLoading, 
    isNewUser, 
    isSetupComplete, 
    dashboardType, 
    nextSetupStep,
    showOnboarding,
    showOperationalDashboard 
  } = useUserState()

  // Handle onboarding actions
  const handleUploadContract = () => {
    console.log('Navigate to contract upload')
    // In a real app, this would navigate to the upload page or open a modal
  }

  const handleUploadInvoices = () => {
    console.log('Navigate to invoice upload')
    // In a real app, this would navigate to the upload page or open a modal
  }

  const handleCompleteSetup = () => {
    console.log('Complete setup and start analysis')
    // In a real app, this would trigger the initial AI analysis
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="border-b border-border bg-background">
          <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="max-w-7xl mx-auto">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-300 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-96 bg-white rounded-xl border" />
            <div className="h-64 bg-white rounded-xl border" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="h-32 bg-white rounded-xl border" />
              <div className="h-32 bg-white rounded-xl border" />
              <div className="h-32 bg-white rounded-xl border" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render dashboard based on user state
  const renderDashboard = () => {
    switch (dashboardType) {
      case 'new_user_welcome':
      case 'setup_in_progress':
        return (
          <div className="space-y-8">
            <NewUserOnboarding
              userState={userState!}
              nextStep={nextSetupStep || undefined}
              onUploadContract={handleUploadContract}
              onUploadInvoices={handleUploadInvoices}
              onCompleteSetup={handleCompleteSetup}
            />
          </div>
        )
      
      case 'first_time_operational':
        return (
          <div className="space-y-8">
            {/* Congratulations banner */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 p-8">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">🎉 Setup Complete!</h1>
                  <p className="text-lg text-gray-700 mb-1">
                    Your DRIFT.AI system is now active and analyzing your contracts.
                  </p>
                  <p className="text-sm text-green-700 font-medium">
                    Here are your first AI-generated insights:
                  </p>
                </div>
              </div>
            </div>

            {/* Show operational dashboard with first-time context */}
            <AIInsightsSection />
            <AIPerformanceIndicators />
            <QuickActions />
          </div>
        )
      
      case 'operational':
      default:
        return (
          <div className="space-y-8">
            {/* Section 1: AI Insights & Actions (Primary Focus) */}
            <AIInsightsSection />

            {/* Section 2: AI Performance & Trust Indicators (Secondary) */}
            <AIPerformanceIndicators />

            {/* Section 3: Quick Actions (Tertiary) */}
            <QuickActions />
          </div>
        )
    }
  }

  const getDashboardTitle = () => {
    switch (dashboardType) {
      case 'new_user_welcome':
        return { title: "Welcome to DRIFT.AI", description: "Let's get you started with AI-powered contract reconciliation" }
      case 'setup_in_progress':
        return { title: "DRIFT.AI Setup", description: `${nextSetupStep?.title || 'Complete your setup'} to unlock AI insights` }
      case 'first_time_operational':
        return { title: "DRIFT.AI Dashboard", description: "Your AI-powered insights are ready to review" }
      default:
        return { title: "DRIFT.AI", description: "AI-powered contract reconciliation command center" }
    }
  }

  const { title, description } = getDashboardTitle()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <DashboardHeader
        title={title}
        description={description}
      />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {renderDashboard()}
      </div>
    </div>
  )
}