'use client'

import { useState, useEffect, useCallback } from 'react'
import { UserSettingsData, SettingsValidationResult, SettingsChange } from '@/types/settings'
import { SETTINGS_CATEGORIES } from '@/lib/settings-config'

// Mock API functions - replace with actual API calls
const settingsApi = {
  get: async (): Promise<UserSettingsData> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Return mock data or from localStorage
    const stored = localStorage.getItem('drift-settings')
    if (stored) {
      return JSON.parse(stored)
    }
    
    return {
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
  },

  save: async (settings: UserSettingsData): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    localStorage.setItem('drift-settings', JSON.stringify(settings))
  },

  savePartial: async (categoryId: string, categoryData: any): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 800))
    const existing = await settingsApi.get()
    const updated = { ...existing, [categoryId]: categoryData }
    localStorage.setItem('drift-settings', JSON.stringify(updated))
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<UserSettingsData | null>(null)
  const [originalSettings, setOriginalSettings] = useState<UserSettingsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [validationResults, setValidationResults] = useState<Record<string, SettingsValidationResult>>({})
  const [changeHistory, setChangeHistory] = useState<SettingsChange[]>([])

  // Load settings on mount
  useEffect(() => {
    let mounted = true

    const loadSettings = async () => {
      try {
        const data = await settingsApi.get()
        if (mounted) {
          setSettings(data)
          setOriginalSettings(JSON.parse(JSON.stringify(data))) // Deep clone
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    loadSettings()

    return () => {
      mounted = false
    }
  }, [])

  // Utility functions
  const getNestedValue = useCallback((obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }, [])

  const setNestedValue = useCallback((obj: any, path: string, value: any) => {
    const keys = path.split('.')
    const lastKey = keys.pop()!
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {}
      return current[key]
    }, obj)
    target[lastKey] = value
  }, [])

  // Check if there are unsaved changes
  const hasChanges = useCallback((): boolean => {
    if (!settings || !originalSettings) return false
    return JSON.stringify(settings) !== JSON.stringify(originalSettings)
  }, [settings, originalSettings])

  // Get changes for a specific category
  const getCategoryChanges = useCallback((categoryId: string): boolean => {
    if (!settings || !originalSettings) return false
    const current = settings[categoryId as keyof UserSettingsData]
    const original = originalSettings[categoryId as keyof UserSettingsData]
    return JSON.stringify(current) !== JSON.stringify(original)
  }, [settings, originalSettings])

  // Update a specific setting
  const updateSetting = useCallback((categoryId: string, settingId: string, value: any) => {
    if (!settings) return

    setSettings(prev => {
      if (!prev) return prev
      
      const newSettings = { ...prev }
      if (settingId.includes('.')) {
        setNestedValue(newSettings, settingId, value)
      } else {
        const category = newSettings[categoryId as keyof UserSettingsData] as any
        if (category) {
          category[settingId] = value
        }
      }

      // Track change
      const change: SettingsChange = {
        settingId: `${categoryId}.${settingId}`,
        oldValue: settingId.includes('.') 
          ? getNestedValue(prev, settingId)
          : getNestedValue(prev, `${categoryId}.${settingId}`),
        newValue: value,
        timestamp: new Date(),
        userId: 'current-user', // Replace with actual user ID
        category: categoryId
      }

      setChangeHistory(prevHistory => [change, ...prevHistory.slice(0, 49)]) // Keep last 50 changes

      return newSettings
    })
  }, [settings, getNestedValue, setNestedValue])

  // Validate settings for a category
  const validateCategory = useCallback((categoryId: string): SettingsValidationResult => {
    const errors: Record<string, string> = {}
    const warnings: Record<string, string> = {}
    
    if (!settings) return { isValid: true, errors, warnings }

    const category = SETTINGS_CATEGORIES.find(c => c.id === categoryId)
    if (!category) return { isValid: true, errors, warnings }

    // Validate each setting in the category
    for (const section of category.sections) {
      for (const setting of section.settings) {
        const value = getNestedValue(settings, setting.id.includes('.') ? setting.id : `${categoryId}.${setting.id}`)
        
        if (setting.validation) {
          const validation = setting.validation
          
          // Required validation
          if (validation.required && (value === undefined || value === null || value === '')) {
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
          if (validation.pattern && typeof value === 'string' && value.length > 0) {
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
        if (setting.id === 'autoApprovalThreshold' && typeof value === 'number' && value > 1000) {
          warnings[setting.id] = 'High auto-approval threshold may increase risk'
        }
        if (setting.id === 'sessionTimeout' && typeof value === 'number' && value > 1440) {
          warnings[setting.id] = 'Long session timeout may pose security risks'
        }
        if (setting.id === 'aiConfidenceThreshold' && typeof value === 'number' && value < 0.7) {
          warnings[setting.id] = 'Low confidence threshold may result in processing errors'
        }
      }
    }

    const result = {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    }

    setValidationResults(prev => ({ ...prev, [categoryId]: result }))
    return result
  }, [settings, getNestedValue])

  // Save specific category
  const saveCategory = useCallback(async (categoryId: string): Promise<boolean> => {
    if (!settings) return false

    setIsSaving(true)
    try {
      // Validate before saving
      const validation = validateCategory(categoryId)
      if (!validation.isValid) {
        return false
      }

      const categoryData = settings[categoryId as keyof UserSettingsData]
      await settingsApi.savePartial(categoryId, categoryData)
      
      // Update original settings to reflect saved state
      setOriginalSettings(prev => prev ? { ...prev, [categoryId]: categoryData } : null)
      
      return true
    } catch (error) {
      console.error('Failed to save category:', error)
      return false
    } finally {
      setIsSaving(false)
    }
  }, [settings, validateCategory])

  // Save all settings
  const saveAll = useCallback(async (): Promise<boolean> => {
    if (!settings) return false

    setIsSaving(true)
    try {
      // Validate all categories
      const allValid = SETTINGS_CATEGORIES.every(category => {
        const validation = validateCategory(category.id)
        return validation.isValid
      })

      if (!allValid) return false

      await settingsApi.save(settings)
      setOriginalSettings(JSON.parse(JSON.stringify(settings))) // Deep clone
      
      return true
    } catch (error) {
      console.error('Failed to save all settings:', error)
      return false
    } finally {
      setIsSaving(false)
    }
  }, [settings, validateCategory])

  // Reset category to original values
  const resetCategory = useCallback((categoryId: string) => {
    if (!originalSettings) return

    setSettings(prev => prev ? {
      ...prev,
      [categoryId]: JSON.parse(JSON.stringify(originalSettings[categoryId as keyof UserSettingsData]))
    } : null)

    // Clear validation results for this category
    setValidationResults(prev => {
      const updated = { ...prev }
      delete updated[categoryId]
      return updated
    })
  }, [originalSettings])

  // Reset all settings
  const resetAll = useCallback(() => {
    if (!originalSettings) return

    setSettings(JSON.parse(JSON.stringify(originalSettings)))
    setValidationResults({})
  }, [originalSettings])

  // Get setting value with dot notation support
  const getSetting = useCallback((path: string): any => {
    if (!settings) return undefined
    return getNestedValue(settings, path)
  }, [settings, getNestedValue])

  return {
    // State
    settings,
    originalSettings,
    isLoading,
    isSaving,
    validationResults,
    changeHistory,

    // Computed
    hasChanges: hasChanges(),
    getCategoryChanges,

    // Actions
    updateSetting,
    validateCategory,
    saveCategory,
    saveAll,
    resetCategory,
    resetAll,
    getSetting
  }
}