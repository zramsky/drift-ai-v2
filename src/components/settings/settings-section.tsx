'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SettingsControl } from './settings-controls'
import { SettingsSection as SettingsSectionType, SettingsValidationResult } from '@/types/settings'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Save, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react'

interface SettingsSectionProps {
  section: SettingsSectionType
  values: Record<string, any>
  onChange: (settingId: string, value: any) => void
  onSave?: () => void
  onReset?: () => void
  validationResult?: SettingsValidationResult
  isLoading?: boolean
  hasChanges?: boolean
  className?: string
}

export function SettingsSection({
  section,
  values,
  onChange,
  onSave,
  onReset,
  validationResult,
  isLoading = false,
  hasChanges = false,
  className
}: SettingsSectionProps) {
  const hasErrors = validationResult && Object.keys(validationResult.errors).length > 0
  const hasWarnings = validationResult && Object.keys(validationResult.warnings).length > 0

  return (
    <Card id={`section-${section.id}`} className={cn("mb-6", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2" style={{color: '#111827'}}>
              {section.title}
              {hasErrors && (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              {!hasErrors && hasWarnings && (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              )}
              {!hasErrors && !hasWarnings && hasChanges && (
                <div className="h-2 w-2 bg-[#FF6B35] rounded-full" />
              )}
            </CardTitle>
            <CardDescription className="text-gray-800 dark:text-gray-200 mt-1" style={{color: '#374151'}}>
              {section.description}
            </CardDescription>
          </div>

          {/* Action buttons for sections with save/reset functionality */}
          {(onSave || onReset) && (
            <div className="flex items-center gap-2">
              {hasChanges && onReset && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReset}
                  disabled={isLoading}
                  className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              )}
              {onSave && (
                <Button
                  size="sm"
                  onClick={onSave}
                  disabled={isLoading || !hasChanges || hasErrors}
                  className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white"
                >
                  {isLoading ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-1" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  Save
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Validation status */}
        {validationResult && (
          <div className="mt-3">
            {hasErrors && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Please fix the errors below before saving</span>
              </div>
            )}
            {!hasErrors && hasWarnings && (
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Please review the warnings below</span>
              </div>
            )}
            {!hasErrors && !hasWarnings && hasChanges && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                <span>Settings are valid and ready to save</span>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-4">
        <div className="space-y-6">
          {section.settings.map((setting, index) => (
            <div key={setting.id}>
              <SettingsControl
                setting={setting}
                value={values[setting.id]}
                onChange={(value) => onChange(setting.id, value)}
                error={validationResult?.errors[setting.id]}
              />
              {/* Divider between settings (except for the last one) */}
              {index < section.settings.length - 1 && (
                <div className="border-t border-gray-200 my-2" />
              )}
            </div>
          ))}
        </div>

        {/* Section-level warnings */}
        {hasWarnings && validationResult && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">Warnings</h4>
                <ul className="space-y-1 text-sm text-amber-900 dark:text-amber-200">
                  {Object.entries(validationResult.warnings).map(([key, warning]) => (
                    <li key={key}>{warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}