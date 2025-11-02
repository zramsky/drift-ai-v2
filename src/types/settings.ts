export interface SettingsCategory {
  id: string
  name: string
  description: string
  icon: string
  sections: SettingsSection[]
  requiresAdmin?: boolean
}

export interface SettingsSection {
  id: string
  title: string
  description: string
  settings: SettingSetting[]
}

export interface SettingSetting {
  id: string
  type: 'toggle' | 'input' | 'select' | 'textarea' | 'slider' | 'multi-select' | 'file-upload'
  label: string
  description: string
  value: any
  options?: SettingOption[]
  validation?: SettingValidation
  placeholder?: string
  disabled?: boolean
  requiresRestart?: boolean
  isPremium?: boolean
  requiresAdmin?: boolean
}

export interface SettingOption {
  value: string | number
  label: string
  description?: string
  disabled?: boolean
}

export interface SettingValidation {
  required?: boolean
  min?: number
  max?: number
  pattern?: string
  custom?: (value: any) => string | null
}

export interface UserSettingsData {
  profile: {
    fullName: string
    email: string
    organization: string
    role: string
    phone?: string
    timezone: string
  }
  notifications: {
    emailNotifications: boolean
    realTimeAlerts: boolean
    weeklyDigest: boolean
    contractExpirationDays: number
    discrepancyThreshold: number
    reportDelivery: string[]
  }
  workflow: {
    autoApprovalEnabled: boolean
    autoApprovalThreshold: number
    aiConfidenceThreshold: number
    requireDualApproval: boolean
    defaultApprovalChain: string[]
    contractRenewalReminder: number
    bulkProcessingEnabled: boolean
  }
  display: {
    theme: 'light' | 'dark' | 'auto'
    compactMode: boolean
    defaultDashboardView: string
    tableRowsPerPage: number
    dateFormat: string
    currencyFormat: string
    showTooltips: boolean
  }
  security: {
    twoFactorEnabled: boolean
    sessionTimeout: number
    apiAccessEnabled: boolean
    loginNotifications: boolean
    ipWhitelist: string[]
    downloadRestrictions: boolean
  }
  integrations: {
    exportFormats: string[]
    defaultExportFormat: string
    erpIntegration: {
      enabled: boolean
      system: string
      syncFrequency: string
    }
    emailProvider: {
      enabled: boolean
      service: string
    }
    storageProvider: {
      enabled: boolean
      service: string
    }
  }
  compliance: {
    dataRetentionPeriod: number
    auditLogEnabled: boolean
    automaticBackups: boolean
    backupFrequency: string
    complianceReporting: boolean
    gdprCompliance: boolean
  }
}

// Settings change tracking
export interface SettingsChange {
  settingId: string
  oldValue: any
  newValue: any
  timestamp: Date
  userId: string
  category: string
}

// Settings validation results
export interface SettingsValidationResult {
  isValid: boolean
  errors: { [key: string]: string }
  warnings: { [key: string]: string }
}