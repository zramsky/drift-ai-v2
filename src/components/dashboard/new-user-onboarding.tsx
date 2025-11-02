'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Upload, Zap, CheckCircle, ArrowRight, Bot, Target, DollarSign, Clock, Shield } from 'lucide-react'
import { UserState, SetupStep } from '@/hooks/use-user-state'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: typeof FileText
  completed: boolean
  current: boolean
  action: string
  actionHandler: () => void
  expectedOutcome: string
}

interface NewUserOnboardingProps {
  userState: UserState
  nextStep?: SetupStep
  onUploadContract: () => void
  onUploadInvoices: () => void
  onCompleteSetup: () => void
}

export function NewUserOnboarding({ 
  userState, 
  nextStep,
  onUploadContract, 
  onUploadInvoices, 
  onCompleteSetup 
}: NewUserOnboardingProps) {
  const steps: OnboardingStep[] = [
    {
      id: 'contracts',
      title: 'Upload Your First Contract',
      description: 'Start by uploading a vendor contract. Our AI will analyze pricing terms, renewal dates, and service levels to establish your baseline.',
      icon: FileText,
      completed: userState.onboardingProgress?.contractsUploaded || false,
      current: nextStep?.step === 'contracts',
      action: 'Upload Contract',
      actionHandler: onUploadContract,
      expectedOutcome: 'AI extracts key terms and pricing structure'
    },
    {
      id: 'invoices',
      title: 'Add Invoices to Analyze',
      description: 'Upload invoices from the same vendor. AI will compare them against your contract terms to identify discrepancies and overcharges.',
      icon: Upload,
      completed: userState.onboardingProgress?.invoicesUploaded || false,
      current: nextStep?.step === 'invoices',
      action: 'Upload Invoices',
      actionHandler: onUploadInvoices,
      expectedOutcome: 'Immediate analysis and potential savings identified'
    },
    {
      id: 'analysis',
      title: 'Review AI Findings',
      description: 'See your first AI-generated findings. Review identified issues to help train the system and validate accuracy for future analysis.',
      icon: Target,
      completed: userState.onboardingProgress?.firstAnalysisComplete || false,
      current: nextStep?.step === 'analysis',
      action: 'View Analysis',
      actionHandler: onCompleteSetup,
      expectedOutcome: 'Understand AI confidence levels and evidence'
    },
    {
      id: 'validation',
      title: 'Validate First Finding',
      description: 'Review and validate your first AI finding to improve future accuracy. This helps the AI learn your business preferences.',
      icon: Shield,
      completed: userState.onboardingProgress?.firstFindingReviewed || false,
      current: nextStep?.step === 'findings',
      action: 'Review Findings',
      actionHandler: onCompleteSetup,
      expectedOutcome: 'AI learns from your feedback for better results'
    }
  ]

  const currentStepIndex = steps.findIndex(step => step.current)
  const currentStep = steps[currentStepIndex] || steps[0]
  const completedSteps = steps.filter(step => step.completed).length

  const valueProps = [
    {
      icon: DollarSign,
      title: 'Average Savings',
      value: '12-18%',
      description: 'of contract spend through AI analysis'
    },
    {
      icon: Clock,
      title: 'Setup Time',
      value: '<10 min',
      description: 'to get your first AI insights'
    },
    {
      icon: Target,
      title: 'Accuracy Rate',
      value: '96.8%',
      description: 'AI confidence on high-priority findings'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl border-2 border-blue-200 overflow-hidden">
        <div className="bg-white/90 backdrop-blur-sm border-b border-blue-200 p-4 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 bg-blue-100 rounded-2xl flex-shrink-0">
                <Bot className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1 lg:mb-2">Welcome to DRIFT.AI</h1>
                <p className="text-base lg:text-lg text-blue-700 font-medium">AI-powered contract reconciliation</p>
                <p className="text-sm text-gray-600 mt-1">Get started in minutes and see immediate results</p>
              </div>
            </div>
            
            <div className="text-center lg:text-right">
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-semibold text-base px-3 py-1 mb-2">
                Step {completedSteps + 1} of {steps.length}
              </Badge>
              <div className="text-sm text-gray-600">
                {Math.round(((completedSteps) / steps.length) * 100)}% complete
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-8">
            <div className="flex items-center space-x-3">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step.completed ? 'bg-green-500 text-white shadow-lg' :
                    step.current ? 'bg-blue-500 text-white shadow-lg ring-4 ring-blue-200' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {step.completed ? <CheckCircle className="w-5 h-5" /> : index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-20 h-2 mx-3 rounded-full transition-all duration-500 ${
                      steps[index + 1].completed || step.completed ? 'bg-green-300' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4 grid grid-cols-4 gap-4 text-xs text-center">
              {steps.map((step, index) => (
                <div key={step.id} className={`font-medium ${
                  step.completed ? 'text-green-700' :
                  step.current ? 'text-blue-700' :
                  'text-gray-500'
                }`}>
                  {step.title.split(' ')[0]} {step.title.split(' ')[1]}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Value Proposition Cards */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {valueProps.map((prop, index) => {
              const Icon = prop.icon
              return (
                <div key={index} className="bg-white rounded-xl border border-blue-200 p-6 text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mx-auto mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{prop.value}</div>
                  <div className="text-sm font-medium text-gray-700 mb-1">{prop.title}</div>
                  <div className="text-xs text-gray-500">{prop.description}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Current Step Focus */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start space-y-4 lg:space-y-0 lg:space-x-6">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl flex-shrink-0 mx-auto lg:mx-0">
            <currentStep.icon className="w-8 h-8 text-blue-600" />
          </div>
          
          <div className="flex-1 text-center lg:text-left">
            <div className="mb-4">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">{currentStep.title}</h2>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-medium">
                Next Step
              </Badge>
            </div>
            
            <p className="text-gray-700 mb-6 text-base lg:text-lg leading-relaxed">
              {currentStep.description}
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center lg:justify-start space-x-2 text-blue-800">
                <Zap className="w-4 h-4" />
                <span className="font-medium text-sm">Expected outcome: {currentStep.expectedOutcome}</span>
              </div>
            </div>
            
            <Button 
              onClick={currentStep.actionHandler} 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-base lg:text-lg px-6 lg:px-8 py-4 lg:py-6 w-full lg:w-auto"
            >
              {currentStep.action}
              <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* All Steps Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Complete Setup Process</h3>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div 
                key={step.id}
                className={`flex items-center space-x-4 p-4 rounded-xl transition-all ${
                  step.completed ? 'bg-green-50 border-2 border-green-200' :
                  step.current ? 'bg-blue-50 border-2 border-blue-200' :
                  'bg-gray-50 border-2 border-gray-200'
                }`}
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${
                  step.completed ? 'bg-green-100 text-green-600' :
                  step.current ? 'bg-blue-100 text-blue-600' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {step.completed ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <h4 className={`font-semibold ${
                      step.completed ? 'text-green-900' :
                      step.current ? 'text-blue-900' :
                      'text-gray-500'
                    }`}>
                      {step.title}
                    </h4>
                    <span className="text-xs text-gray-500">Step {index + 1}</span>
                  </div>
                  <p className="text-sm text-gray-600">{step.expectedOutcome}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  {step.completed && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Complete
                    </Badge>
                  )}
                  
                  {step.current && !step.completed && (
                    <Button 
                      size="sm" 
                      onClick={step.actionHandler}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {step.action}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Why DRIFT.AI */}
        <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
          <h4 className="text-lg font-semibold text-indigo-900 mb-3">Why Choose DRIFT.AI?</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-indigo-800">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-indigo-600" />
              <span>Automatically detects overcharges and contract violations</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-indigo-600" />
              <span>Links evidence to specific contract and invoice pages</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-indigo-600" />
              <span>Learns from your feedback to improve accuracy</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-indigo-600" />
              <span>Provides draft dispute letters for easy resolution</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}