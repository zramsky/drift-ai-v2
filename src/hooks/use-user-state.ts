'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

export interface UserState {
  isNewUser: boolean
  hasContracts: boolean
  hasInvoices: boolean
  hasCompletedOnboarding: boolean
  contractCount: number
  invoiceCount: number
  lastActivity?: string
  setupStage: 'contracts' | 'invoices' | 'analysis' | 'complete'
  // Enhanced fields for better user experience
  hasActiveAnalysis: boolean
  firstContractUploadDate?: string
  firstInvoiceUploadDate?: string
  totalFindings: number
  hasResolvedFindings: boolean
  userType: 'first_time' | 'returning' | 'power_user'
  onboardingProgress: {
    contractsUploaded: boolean
    invoicesUploaded: boolean
    firstAnalysisComplete: boolean
    firstFindingReviewed: boolean
    setupComplete: boolean
  }
}

export interface SetupStep {
  step: 'contracts' | 'invoices' | 'analysis' | 'findings' | 'complete'
  title: string
  description: string
  action: string
}

export type DashboardType = 'loading' | 'new_user_welcome' | 'setup_in_progress' | 'first_time_operational' | 'operational'

export function useUserState() {
  const { data: userState, isLoading, error } = useQuery({
    queryKey: ['user-state'],
    queryFn: async () => {
      try {
        const response = await apiClient.getUserState()
        if (response.error) {
          throw new Error(response.error)
        }
        return response.data!
      } catch (error) {
        // Enhanced mock data for different user states - in production this would come from API
        const mockUserState: UserState = {
          // Toggle these values to test different user states:
          isNewUser: false, // Set to true to see new user experience
          hasContracts: true, // Set to false to see contracts needed state
          hasInvoices: true, // Set to false to see invoices needed state
          hasCompletedOnboarding: true, // Set to false to see onboarding flow
          contractCount: 5,
          invoiceCount: 23,
          setupStage: 'complete',
          lastActivity: '2 hours ago',
          // Enhanced fields
          hasActiveAnalysis: true,
          firstContractUploadDate: '2024-01-15',
          firstInvoiceUploadDate: '2024-01-16',
          totalFindings: 12,
          hasResolvedFindings: true,
          userType: 'power_user', // 'first_time' | 'returning' | 'power_user'
          onboardingProgress: {
            contractsUploaded: true,
            invoicesUploaded: true,
            firstAnalysisComplete: true,
            firstFindingReviewed: true,
            setupComplete: true
          }
        }
        
        // Uncomment below to test new user experience:
        /*
        const mockUserState: UserState = {
          isNewUser: true,
          hasContracts: false,
          hasInvoices: false,
          hasCompletedOnboarding: false,
          contractCount: 0,
          invoiceCount: 0,
          setupStage: 'contracts',
          lastActivity: undefined,
          hasActiveAnalysis: false,
          totalFindings: 0,
          hasResolvedFindings: false,
          userType: 'first_time',
          onboardingProgress: {
            contractsUploaded: false,
            invoicesUploaded: false,
            firstAnalysisComplete: false,
            firstFindingReviewed: false,
            setupComplete: false
          }
        }
        */
        
        return mockUserState
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Check every 30 seconds for setup progress
  })

  const isSetupComplete = userState && userState.hasContracts && userState.hasInvoices && userState.hasCompletedOnboarding
  
  const getNextSetupStep = (): SetupStep | null => {
    if (!userState || !userState.onboardingProgress) return null
    
    if (!userState.onboardingProgress.contractsUploaded) {
      return {
        step: 'contracts',
        title: 'Upload Your First Contract',
        description: 'Upload a contract to get started with AI-powered analysis',
        action: 'Upload Contract'
      }
    }
    
    if (!userState.onboardingProgress.invoicesUploaded) {
      return {
        step: 'invoices',
        title: 'Upload Invoices to Analyze',
        description: 'Upload invoices from your vendors to identify savings opportunities',
        action: 'Upload Invoices'
      }
    }
    
    if (!userState.onboardingProgress.firstAnalysisComplete) {
      return {
        step: 'analysis',
        title: 'AI Analysis in Progress',
        description: 'Our AI is analyzing your documents for discrepancies',
        action: 'View Progress'
      }
    }
    
    if (!userState.onboardingProgress.firstFindingReviewed && userState.totalFindings > 0) {
      return {
        step: 'findings',
        title: 'Review Your First Findings',
        description: `${userState.totalFindings} potential issues found. Review them to validate AI accuracy`,
        action: 'Review Findings'
      }
    }
    
    if (!userState.onboardingProgress.setupComplete) {
      return {
        step: 'complete',
        title: 'Complete Setup',
        description: 'Finish your onboarding to access all DRIFT.AI features',
        action: 'Complete Setup'
      }
    }
    
    return null
  }
  
  const nextSetupStep = getNextSetupStep()
  
  const getDashboardType = (): DashboardType => {
    if (!userState || !userState.onboardingProgress) return 'loading'
    
    // New user who hasn't uploaded anything yet
    if (userState.isNewUser && !userState.onboardingProgress.contractsUploaded) {
      return 'new_user_welcome'
    }
    
    // User in setup process
    if (!isSetupComplete) {
      return 'setup_in_progress'
    }
    
    // Setup complete but first-time user seeing results
    if (userState.isNewUser && isSetupComplete) {
      return 'first_time_operational'
    }
    
    // Experienced user with full dashboard
    return 'operational'
  }

  return {
    userState,
    isLoading,
    error,
    isNewUser: userState?.isNewUser || false,
    isSetupComplete,
    nextSetupStep,
    dashboardType: getDashboardType(),
    // Helper flags for conditional rendering
    showOnboarding: !isSetupComplete && userState?.isNewUser,
    showOperationalDashboard: isSetupComplete,
    showSetupProgress: !isSetupComplete && userState && (userState.contractCount > 0 || userState.invoiceCount > 0),
    // Progress tracking
    setupProgress: userState && userState.onboardingProgress ? {
      totalSteps: 5,
      completedSteps: Object.values(userState.onboardingProgress).filter(Boolean).length,
      progressPercentage: (Object.values(userState.onboardingProgress).filter(Boolean).length / 5) * 100
    } : null
  }
}