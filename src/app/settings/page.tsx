'use client'

import { useState, useEffect } from 'react'
import { SettingsLayout } from '@/components/settings/settings-layout'
import { SettingsSection } from '@/components/settings/settings-section'
import { SETTINGS_CATEGORIES } from '@/lib/settings-config'
import { UserSettingsData, SettingsValidationResult } from '@/types/settings'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Save, AlertCircle, CheckCircle2, Settings as SettingsIcon } from 'lucide-react'

// Mock initial settings data - in real app this would come from API
const INITIAL_SETTINGS: UserSettingsData = {
  profile: {
    fullName: 'John Smith',
    email: 'john.smith@company.com',
    organization: 'Healthcare Partners LLC',
    role: 'manager',
    phone: '+1 (555) 123-4567',
    timezone: 'America/New_York'
  },
  notifications: {
    emailNotifications: true,
    realTimeAlerts: false,
    weeklyDigest: true,
    contractExpirationDays: 30,
    discrepancyThreshold: 100,
    reportDelivery: ['weekly-summary']
  },
  workflow: {
    autoApprovalEnabled: false,
    autoApprovalThreshold: 500,
    aiConfidenceThreshold: 0.85,
    requireDualApproval: true,
    defaultApprovalChain: ['manager'],
    contractRenewalReminder: 90,
    bulkProcessingEnabled: true
  },
  display: {
    theme: 'light',
    compactMode: false,
    defaultDashboardView: 'overview',
    tableRowsPerPage: 25,
    dateFormat: 'MM/DD/YYYY',
    currencyFormat: 'USD',
    showTooltips: true
  },
  security: {
    twoFactorEnabled: false,
    sessionTimeout: 480,
    apiAccessEnabled: false,
    loginNotifications: true,
    ipWhitelist: [],
    downloadRestrictions: true
  },
  integrations: {
    exportFormats: ['xlsx', 'csv', 'pdf'],
    defaultExportFormat: 'xlsx',
    erpIntegration: {
      enabled: false,
      system: '',
      syncFrequency: 'daily'
    },
    emailProvider: {
      enabled: true,
      service: 'sendgrid'
    },
    storageProvider: {
      enabled: true,
      service: 'aws-s3'
    }
  },
  compliance: {
    dataRetentionPeriod: 24,
    auditLogEnabled: true,
    automaticBackups: true,
    backupFrequency: 'daily',
    complianceReporting: true,
    gdprCompliance: false
  }
}

export default function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState('profile')
  const [activeSection, setActiveSection] = useState<string>()
  const [settings, setSettings] = useState<UserSettingsData>(INITIAL_SETTINGS)
  const [originalSettings, setOriginalSettings] = useState<UserSettingsData>(INITIAL_SETTINGS)
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [validationResults, setValidationResults] = useState<Record<string, SettingsValidationResult>>({})

  // Check for changes whenever settings update
  useEffect(() => {
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings)
    setHasChanges(hasChanges)
  }, [settings, originalSettings])

  // Set default active section when category changes
  useEffect(() => {
    const currentCategory = SETTINGS_CATEGORIES.find(c => c.id === activeCategory)
    if (currentCategory && currentCategory.sections.length > 0) {
      // Always set the first section as active when changing categories
      setActiveSection(currentCategory.sections[0].id)
    }
  }, [activeCategory])

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

  const handleSectionChange = (categoryId: string, sectionId: string) => {
    const isSameCategory = categoryId === activeCategory
    
    if (categoryId !== activeCategory) {
      setActiveCategory(categoryId)
    }
    setActiveSection(sectionId)
    
    // Coordinate scrolling with proper timing
    // Use longer delay for category changes to allow content to load/update
    const scrollDelay = isSameCategory ? 100 : 300
    scrollToSection(sectionId, scrollDelay)
  }

  // Get nested value from settings object using dot notation
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  // Set nested value in settings object using dot notation
  const setNestedValue = (obj: any, path: string, value: any) => {
    const keys = path.split('.')
    const lastKey = keys.pop()!
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {}
      return current[key]
    }, obj)
    target[lastKey] = value
  }

  const handleSettingChange = (categoryId: string, settingId: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev }
      if (settingId.includes('.')) {
        setNestedValue(newSettings, settingId, value)
      } else {
        const category = newSettings[categoryId as keyof UserSettingsData] as any
        if (category) {
          category[settingId] = value
        }
      }
      return newSettings
    })
  }

  const validateSettings = (categoryId: string): SettingsValidationResult => {
    const errors: Record<string, string> = {}
    const warnings: Record<string, string> = {}
    
    const category = SETTINGS_CATEGORIES.find(c => c.id === categoryId)
    if (!category) return { isValid: true, errors, warnings }

    // Validate each setting in the category
    for (const section of category.sections) {
      for (const setting of section.settings) {
        const value = getNestedValue(settings, setting.id.includes('.') ? setting.id : `${categoryId}.${setting.id}`)
        
        if (setting.validation) {
          const validation = setting.validation
          
          // Required validation
          if (validation.required && (!value || value === '')) {
            errors[setting.id] = `${setting.label} is required`
          }
          
          // Min/Max validation for numbers
          if (typeof value === 'number') {
            if (validation.min !== undefined && value < validation.min) {
              errors[setting.id] = `${setting.label} must be at least ${validation.min}`
            }
            if (validation.max !== undefined && value > validation.max) {
              errors[setting.id] = `${setting.label} must not exceed ${validation.max}`
            }
          }
          
          // Pattern validation
          if (validation.pattern && typeof value === 'string') {
            const regex = new RegExp(validation.pattern)
            if (!regex.test(value)) {
              errors[setting.id] = `${setting.label} format is invalid`
            }
          }
          
          // Custom validation
          if (validation.custom) {
            const customError = validation.custom(value)
            if (customError) {
              errors[setting.id] = customError
            }
          }
        }

        // Add warnings for specific conditions
        if (setting.id === 'autoApprovalThreshold' && value > 1000) {
          warnings[setting.id] = 'High auto-approval threshold may increase risk'
        }
        if (setting.id === 'sessionTimeout' && value > 1440) {
          warnings[setting.id] = 'Long session timeout may pose security risks'
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    }
  }

  const handleSaveCategory = async (categoryId: string) => {
    setIsLoading(true)
    try {
      // Validate before saving
      const validation = validateSettings(categoryId)
      if (!validation.isValid) {
        setValidationResults(prev => ({ ...prev, [categoryId]: validation }))
        return
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update original settings to reflect saved state
      setOriginalSettings({ ...settings })
      setValidationResults(prev => ({ ...prev, [categoryId]: validation }))
      
      // Show success message (in real app, use toast notification)
      console.log(`${categoryId} settings saved successfully`)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetCategory = (categoryId: string) => {
    setSettings(prev => ({
      ...prev,
      [categoryId]: originalSettings[categoryId as keyof UserSettingsData]
    }))
    setValidationResults(prev => {
      const updated = { ...prev }
      delete updated[categoryId]
      return updated
    })
  }

  const currentCategory = SETTINGS_CATEGORIES.find(c => c.id === activeCategory)
  
  return (
    <SettingsLayout
      activeCategory={activeCategory}
      activeSection={activeSection}
      onCategoryChange={setActiveCategory}
      onSectionChange={handleSectionChange}
    >
      <div className="p-6 lg:p-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center bg-[#FF6B35] rounded-lg">
              <SettingsIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100" style={{color: '#111827'}}>
                {currentCategory?.name || 'Settings'}
              </h1>
              <p className="text-gray-700 dark:text-gray-300 mt-1" style={{color: '#374151'}}>
                {currentCategory?.description || 'Configure your platform preferences'}
              </p>
            </div>
          </div>

          {/* Global status indicator */}
          {hasChanges && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <span className="text-sm text-amber-900 dark:text-amber-100" style={{color: '#92400e'}}>
                You have unsaved changes. Remember to save your settings.
              </span>
            </div>
          )}
        </div>

        {/* Settings Sections */}
        {currentCategory && (
          <div className="space-y-6">
            {currentCategory.sections.map((section) => {
              const categorySettings = settings[activeCategory as keyof UserSettingsData] as any
              const sectionValues: Record<string, any> = {}
              
              // Build values object for this section
              section.settings.forEach(setting => {
                if (setting.id.includes('.')) {
                  sectionValues[setting.id] = getNestedValue(settings, setting.id)
                } else {
                  sectionValues[setting.id] = categorySettings?.[setting.id]
                }
              })

              const sectionHasChanges = section.settings.some(setting => {
                const currentValue = sectionValues[setting.id]
                const originalValue = setting.id.includes('.') 
                  ? getNestedValue(originalSettings, setting.id)
                  : getNestedValue(originalSettings, `${activeCategory}.${setting.id}`)
                return JSON.stringify(currentValue) !== JSON.stringify(originalValue)
              })

              return (
                <SettingsSection
                  key={section.id}
                  section={section}
                  values={sectionValues}
                  onChange={(settingId, value) => handleSettingChange(activeCategory, settingId, value)}
                  onSave={() => handleSaveCategory(activeCategory)}
                  onReset={() => handleResetCategory(activeCategory)}
                  validationResult={validationResults[activeCategory]}
                  isLoading={isLoading}
                  hasChanges={sectionHasChanges}
                />
              )
            })}
          </div>
        )}

        {/* Category not found */}
        {!currentCategory && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <SettingsIcon className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2" style={{color: '#111827'}}>Category not found</h3>
            <p className="text-gray-700 dark:text-gray-300" style={{color: '#374151'}}>Please select a valid settings category from the sidebar.</p>
          </div>
        )}
      </div>
    </SettingsLayout>
  )
}