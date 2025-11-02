import { 
  User, 
  Bell, 
  Workflow, 
  Monitor, 
  Shield, 
  Share2, 
  FileCheck,
  Settings as SettingsIcon
} from 'lucide-react'
import { SettingsCategory } from '@/types/settings'

export const SETTINGS_CATEGORIES: SettingsCategory[] = [
  {
    id: 'profile',
    name: 'Profile & Account',
    description: 'Personal information and account preferences',
    icon: 'User',
    sections: [
      {
        id: 'personal-info',
        title: 'Personal Information',
        description: 'Update your personal details and contact information',
        settings: [
          {
            id: 'fullName',
            type: 'input',
            label: 'Full Name',
            description: 'Your full name as it appears in reports and communications',
            value: '',
            validation: { required: true }
          },
          {
            id: 'email',
            type: 'input',
            label: 'Email Address',
            description: 'Primary email for notifications and system communications',
            value: '',
            validation: { required: true, pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' }
          },
          {
            id: 'organization',
            type: 'input',
            label: 'Organization',
            description: 'Company or organization name',
            value: ''
          },
          {
            id: 'role',
            type: 'select',
            label: 'Role',
            description: 'Your role within the organization',
            value: '',
            options: [
              { value: 'admin', label: 'Administrator' },
              { value: 'manager', label: 'Manager' },
              { value: 'analyst', label: 'Contract Analyst' },
              { value: 'reviewer', label: 'Reviewer' },
              { value: 'viewer', label: 'Viewer' }
            ]
          },
          {
            id: 'phone',
            type: 'input',
            label: 'Phone Number',
            description: 'Optional phone number for urgent notifications',
            value: '',
            placeholder: '+1 (555) 123-4567'
          },
          {
            id: 'timezone',
            type: 'select',
            label: 'Timezone',
            description: 'Used for scheduling reports and notifications',
            value: 'America/New_York',
            options: [
              { value: 'America/New_York', label: 'Eastern Time (ET)' },
              { value: 'America/Chicago', label: 'Central Time (CT)' },
              { value: 'America/Denver', label: 'Mountain Time (MT)' },
              { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
              { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
              { value: 'Europe/Paris', label: 'Central European Time (CET)' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'notifications',
    name: 'Notifications',
    description: 'Configure alerts, emails, and notification preferences',
    icon: 'Bell',
    sections: [
      {
        id: 'email-notifications',
        title: 'Email Notifications',
        description: 'Control when and how you receive email alerts',
        settings: [
          {
            id: 'emailNotifications',
            type: 'toggle',
            label: 'Email Notifications',
            description: 'Receive email alerts for flagged invoices and discrepancies',
            value: true
          },
          {
            id: 'contractExpirationDays',
            type: 'slider',
            label: 'Contract Expiration Alert',
            description: 'Days before contract expiration to receive notifications',
            value: 30,
            validation: { min: 1, max: 365 }
          },
          {
            id: 'discrepancyThreshold',
            type: 'input',
            label: 'Discrepancy Threshold (USD)',
            description: 'Minimum amount difference to trigger email alerts',
            value: 100,
            validation: { min: 0 }
          },
          {
            id: 'reportDelivery',
            type: 'multi-select',
            label: 'Report Delivery',
            description: 'Which reports to receive via email',
            value: ['weekly-summary'],
            options: [
              { value: 'weekly-summary', label: 'Weekly Summary' },
              { value: 'monthly-report', label: 'Monthly Report' },
              { value: 'compliance-alerts', label: 'Compliance Alerts' },
              { value: 'vendor-updates', label: 'Vendor Updates' }
            ]
          }
        ]
      },
      {
        id: 'system-alerts',
        title: 'System Alerts',
        description: 'Real-time notifications and system messages',
        settings: [
          {
            id: 'realTimeAlerts',
            type: 'toggle',
            label: 'Browser Notifications',
            description: 'Show browser notifications for urgent issues',
            value: false
          },
          {
            id: 'weeklyDigest',
            type: 'toggle',
            label: 'Weekly Digest',
            description: 'Receive weekly summary of reconciliation activity',
            value: true
          }
        ]
      }
    ]
  },
  {
    id: 'workflow',
    name: 'Workflow Preferences',
    description: 'Approval processes, automation rules, and workflow settings',
    icon: 'Workflow',
    sections: [
      {
        id: 'approval-settings',
        title: 'Approval Workflows',
        description: 'Configure approval chains and automated processing rules',
        settings: [
          {
            id: 'autoApprovalEnabled',
            type: 'toggle',
            label: 'Auto-Approval',
            description: 'Automatically approve invoices with no discrepancies',
            value: false
          },
          {
            id: 'autoApprovalThreshold',
            type: 'input',
            label: 'Auto-Approval Threshold (USD)',
            description: 'Maximum amount for automatic approval',
            value: 500,
            validation: { min: 0 }
          },
          {
            id: 'requireDualApproval',
            type: 'toggle',
            label: 'Dual Approval Required',
            description: 'Require two approvers for high-value contracts',
            value: true
          },
          {
            id: 'defaultApprovalChain',
            type: 'multi-select',
            label: 'Default Approval Chain',
            description: 'Standard approval workflow for contracts',
            value: ['manager'],
            options: [
              { value: 'analyst', label: 'Contract Analyst' },
              { value: 'manager', label: 'Manager' },
              { value: 'director', label: 'Director' },
              { value: 'cfo', label: 'CFO' }
            ]
          }
        ]
      },
      {
        id: 'ai-processing',
        title: 'AI Processing',
        description: 'Configure AI behavior and confidence thresholds',
        settings: [
          {
            id: 'aiConfidenceThreshold',
            type: 'slider',
            label: 'AI Confidence Threshold',
            description: 'Minimum confidence level for automated processing',
            value: 0.85,
            validation: { min: 0.5, max: 1.0 }
          },
          {
            id: 'bulkProcessingEnabled',
            type: 'toggle',
            label: 'Bulk Processing',
            description: 'Enable batch processing of multiple documents',
            value: true
          }
        ]
      },
      {
        id: 'contract-management',
        title: 'Contract Management',
        description: 'Settings for contract lifecycle and renewal management',
        settings: [
          {
            id: 'contractRenewalReminder',
            type: 'slider',
            label: 'Renewal Reminder (Days)',
            description: 'Days before contract renewal to start reminders',
            value: 90,
            validation: { min: 30, max: 365 }
          }
        ]
      }
    ]
  },
  {
    id: 'display',
    name: 'Display & Interface',
    description: 'Customize the appearance and layout of your dashboard',
    icon: 'Monitor',
    sections: [
      {
        id: 'theme-settings',
        title: 'Theme & Appearance',
        description: 'Control the visual appearance of the platform',
        settings: [
          {
            id: 'theme',
            type: 'select',
            label: 'Theme',
            description: 'Choose your preferred color theme',
            value: 'light',
            options: [
              { value: 'light', label: 'Light Theme' },
              { value: 'dark', label: 'Dark Theme' },
              { value: 'auto', label: 'Auto (System)' }
            ]
          },
          {
            id: 'compactMode',
            type: 'toggle',
            label: 'Compact Mode',
            description: 'Show more information in less space',
            value: false
          },
          {
            id: 'showTooltips',
            type: 'toggle',
            label: 'Show Tooltips',
            description: 'Display helpful tooltips throughout the interface',
            value: true
          }
        ]
      },
      {
        id: 'dashboard-settings',
        title: 'Dashboard Preferences',
        description: 'Customize your dashboard layout and default views',
        settings: [
          {
            id: 'defaultDashboardView',
            type: 'select',
            label: 'Default Dashboard View',
            description: 'The view to show when opening the dashboard',
            value: 'overview',
            options: [
              { value: 'overview', label: 'Overview' },
              { value: 'contracts', label: 'Contracts' },
              { value: 'vendors', label: 'Vendors' },
              { value: 'reports', label: 'Reports' }
            ]
          },
          {
            id: 'tableRowsPerPage',
            type: 'select',
            label: 'Table Rows Per Page',
            description: 'Default number of rows to show in data tables',
            value: 25,
            options: [
              { value: 10, label: '10 rows' },
              { value: 25, label: '25 rows' },
              { value: 50, label: '50 rows' },
              { value: 100, label: '100 rows' }
            ]
          }
        ]
      },
      {
        id: 'formatting',
        title: 'Data Formatting',
        description: 'How dates, numbers, and currency are displayed',
        settings: [
          {
            id: 'dateFormat',
            type: 'select',
            label: 'Date Format',
            description: 'How dates are displayed throughout the platform',
            value: 'MM/DD/YYYY',
            options: [
              { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
              { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
              { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
            ]
          },
          {
            id: 'currencyFormat',
            type: 'select',
            label: 'Currency Format',
            description: 'How monetary amounts are displayed',
            value: 'USD',
            options: [
              { value: 'USD', label: 'US Dollar ($)' },
              { value: 'EUR', label: 'Euro (€)' },
              { value: 'GBP', label: 'British Pound (£)' },
              { value: 'CAD', label: 'Canadian Dollar (C$)' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'security',
    name: 'Security',
    description: 'Password settings, session management, and access controls',
    icon: 'Shield',
    sections: [
      {
        id: 'authentication',
        title: 'Authentication',
        description: 'Secure your account with additional protection',
        settings: [
          {
            id: 'twoFactorEnabled',
            type: 'toggle',
            label: 'Two-Factor Authentication',
            description: 'Add an extra layer of security to your account',
            value: false
          },
          {
            id: 'loginNotifications',
            type: 'toggle',
            label: 'Login Notifications',
            description: 'Receive notifications when your account is accessed',
            value: true
          }
        ]
      },
      {
        id: 'session-management',
        title: 'Session Management',
        description: 'Control how long you stay logged in',
        settings: [
          {
            id: 'sessionTimeout',
            type: 'select',
            label: 'Session Timeout',
            description: 'Automatically log out after inactivity',
            value: 480,
            options: [
              { value: 60, label: '1 hour' },
              { value: 240, label: '4 hours' },
              { value: 480, label: '8 hours' },
              { value: 1440, label: '24 hours' }
            ]
          }
        ]
      },
      {
        id: 'access-control',
        title: 'Access Control',
        description: 'Manage API access and download restrictions',
        settings: [
          {
            id: 'apiAccessEnabled',
            type: 'toggle',
            label: 'API Access',
            description: 'Allow programmatic access to your data',
            value: false,
            requiresAdmin: true
          },
          {
            id: 'downloadRestrictions',
            type: 'toggle',
            label: 'Download Restrictions',
            description: 'Limit ability to download sensitive documents',
            value: true
          },
          {
            id: 'ipWhitelist',
            type: 'textarea',
            label: 'IP Whitelist',
            description: 'Comma-separated list of allowed IP addresses (leave empty for all)',
            value: '',
            placeholder: '192.168.1.1, 10.0.0.1',
            requiresAdmin: true
          }
        ]
      }
    ]
  },
  {
    id: 'integrations',
    name: 'Integrations',
    description: 'Connect with external systems and configure data sync',
    icon: 'Share2',
    sections: [
      {
        id: 'export-settings',
        title: 'Export & Reporting',
        description: 'Configure export formats and automated reporting',
        settings: [
          {
            id: 'defaultExportFormat',
            type: 'select',
            label: 'Default Export Format',
            description: 'Preferred format for data exports',
            value: 'xlsx',
            options: [
              { value: 'xlsx', label: 'Excel (XLSX)' },
              { value: 'csv', label: 'CSV' },
              { value: 'pdf', label: 'PDF Report' },
              { value: 'json', label: 'JSON Data' }
            ]
          },
          {
            id: 'exportFormats',
            type: 'multi-select',
            label: 'Available Export Formats',
            description: 'Export formats available to users',
            value: ['xlsx', 'csv', 'pdf'],
            options: [
              { value: 'xlsx', label: 'Excel (XLSX)' },
              { value: 'csv', label: 'CSV' },
              { value: 'pdf', label: 'PDF Report' },
              { value: 'json', label: 'JSON Data' }
            ]
          }
        ]
      },
      {
        id: 'external-systems',
        title: 'External System Connections',
        description: 'Connect to ERP systems and other business applications',
        settings: [
          {
            id: 'erpIntegration.enabled',
            type: 'toggle',
            label: 'ERP Integration',
            description: 'Enable integration with your ERP system',
            value: false,
            requiresAdmin: true
          },
          {
            id: 'erpIntegration.system',
            type: 'select',
            label: 'ERP System',
            description: 'Select your ERP system',
            value: '',
            options: [
              { value: 'sap', label: 'SAP' },
              { value: 'oracle', label: 'Oracle ERP' },
              { value: 'netsuite', label: 'NetSuite' },
              { value: 'quickbooks', label: 'QuickBooks' },
              { value: 'dynamics', label: 'Microsoft Dynamics' }
            ],
            disabled: true // Enabled when ERP integration is on
          },
          {
            id: 'erpIntegration.syncFrequency',
            type: 'select',
            label: 'Sync Frequency',
            description: 'How often to sync data with ERP system',
            value: 'daily',
            options: [
              { value: 'hourly', label: 'Every Hour' },
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'manual', label: 'Manual Only' }
            ],
            disabled: true // Enabled when ERP integration is on
          }
        ]
      }
    ]
  },
  {
    id: 'compliance',
    name: 'Compliance & Audit',
    description: 'Data retention, audit trails, and compliance settings',
    icon: 'FileCheck',
    sections: [
      {
        id: 'data-retention',
        title: 'Data Retention',
        description: 'Control how long data is kept and backed up',
        settings: [
          {
            id: 'dataRetentionPeriod',
            type: 'select',
            label: 'Data Retention Period',
            description: 'How long to keep processed invoices and reports',
            value: 24,
            options: [
              { value: 12, label: '1 year' },
              { value: 24, label: '2 years' },
              { value: 60, label: '5 years' },
              { value: 84, label: '7 years' },
              { value: -1, label: 'Indefinite' }
            ],
            requiresAdmin: true
          },
          {
            id: 'automaticBackups',
            type: 'toggle',
            label: 'Automatic Backups',
            description: 'Enable automated system backups',
            value: true,
            requiresAdmin: true
          },
          {
            id: 'backupFrequency',
            type: 'select',
            label: 'Backup Frequency',
            description: 'How often to perform automatic backups',
            value: 'daily',
            options: [
              { value: 'hourly', label: 'Hourly' },
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' }
            ],
            requiresAdmin: true
          }
        ]
      },
      {
        id: 'audit-compliance',
        title: 'Audit & Compliance',
        description: 'Audit trail settings and compliance reporting',
        settings: [
          {
            id: 'auditLogEnabled',
            type: 'toggle',
            label: 'Audit Logging',
            description: 'Track all user actions for compliance',
            value: true,
            requiresAdmin: true
          },
          {
            id: 'complianceReporting',
            type: 'toggle',
            label: 'Compliance Reporting',
            description: 'Generate automated compliance reports',
            value: true,
            requiresAdmin: true
          },
          {
            id: 'gdprCompliance',
            type: 'toggle',
            label: 'GDPR Compliance Mode',
            description: 'Enable additional privacy protections for GDPR',
            value: false,
            requiresAdmin: true
          }
        ]
      }
    ]
  }
]

export const SETTINGS_ICONS = {
  User,
  Bell,
  Workflow,
  Monitor,
  Shield,
  Share2,
  FileCheck,
  Settings: SettingsIcon
}