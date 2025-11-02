'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SettingSetting, SettingOption } from '@/types/settings'
import { Check, X, AlertCircle, Crown, RefreshCw, Upload } from 'lucide-react'

interface SettingsControlProps {
  setting: SettingSetting
  value: any
  onChange: (value: any) => void
  error?: string
  className?: string
}

export function SettingsToggle({ setting, value, onChange, error, className }: SettingsControlProps) {
  return (
    <div className={cn("flex items-center justify-between py-4", className)}>
      <div className="flex-1 min-w-0 mr-4">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium text-gray-900 dark:text-gray-100" style={{color: '#111827'}}>
            {setting.label}
          </Label>
          {setting.isPremium && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
              <Crown className="w-3 h-3 mr-1" />
              Pro
            </Badge>
          )}
          {setting.requiresRestart && (
            <Badge variant="outline" className="text-xs border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600">
              Restart required
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-800 dark:text-gray-200 mt-1" style={{color: '#374151'}}>{setting.description}</p>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}
      </div>
      <button
        onClick={() => onChange(!value)}
        disabled={setting.disabled}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200",
          "focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:ring-offset-2",
          value ? "bg-[#FF6B35]" : "bg-gray-200",
          setting.disabled && "opacity-50 cursor-not-allowed"
        )}
        role="switch"
        aria-checked={value}
        aria-labelledby={`toggle-${setting.id}`}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200",
            value ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </div>
  )
}

export function SettingsInput({ setting, value, onChange, error, className }: SettingsControlProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className={cn("py-4", className)}>
      <div className="flex items-center gap-2 mb-2">
        <Label htmlFor={setting.id} className="text-sm font-medium text-gray-900 dark:text-gray-100" style={{color: '#111827'}}>
          {setting.label}
        </Label>
        {setting.isPremium && (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
            <Crown className="w-3 h-3 mr-1" />
            Pro
          </Badge>
        )}
        {setting.requiresRestart && (
          <Badge variant="outline" className="text-xs border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600">
            Restart required
          </Badge>
        )}
      </div>
      <p className="text-sm text-gray-800 dark:text-gray-200 mb-3" style={{color: '#374151'}}>{setting.description}</p>
      <div className="relative">
        <Input
          id={setting.id}
          type={setting.type === 'input' ? 'text' : 'number'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={setting.placeholder}
          disabled={setting.disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "transition-all duration-200",
            error && "border-red-300 focus:ring-red-500",
            isFocused && !error && "ring-2 ring-[#FF6B35] ring-opacity-50"
          )}
        />
        {setting.validation?.required && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">*</span>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  )
}

export function SettingsSelect({ setting, value, onChange, error, className }: SettingsControlProps) {
  return (
    <div className={cn("py-4", className)}>
      <div className="flex items-center gap-2 mb-2">
        <Label htmlFor={setting.id} className="text-sm font-medium text-gray-900 dark:text-gray-100" style={{color: '#111827'}}>
          {setting.label}
        </Label>
        {setting.isPremium && (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
            <Crown className="w-3 h-3 mr-1" />
            Pro
          </Badge>
        )}
      </div>
      <p className="text-sm text-gray-800 dark:text-gray-200 mb-3" style={{color: '#374151'}}>{setting.description}</p>
      <Select value={value} onValueChange={onChange} disabled={setting.disabled}>
        <SelectTrigger className={cn(error && "border-red-300")}>
          <SelectValue placeholder="Select an option..." />
        </SelectTrigger>
        <SelectContent>
          {setting.options?.map((option) => (
            <SelectItem key={option.value} value={String(option.value)} disabled={option.disabled}>
              <div className="flex items-center justify-between w-full">
                <span>{option.label}</span>
                {option.description && (
                  <span className="text-xs text-gray-600 dark:text-gray-300 ml-2">{option.description}</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  )
}

export function SettingsTextarea({ setting, value, onChange, error, className }: SettingsControlProps) {
  return (
    <div className={cn("py-4", className)}>
      <div className="flex items-center gap-2 mb-2">
        <Label htmlFor={setting.id} className="text-sm font-medium text-gray-900 dark:text-gray-100" style={{color: '#111827'}}>
          {setting.label}
        </Label>
        {setting.isPremium && (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
            <Crown className="w-3 h-3 mr-1" />
            Pro
          </Badge>
        )}
      </div>
      <p className="text-sm text-gray-800 dark:text-gray-200 mb-3" style={{color: '#374151'}}>{setting.description}</p>
      <Textarea
        id={setting.id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={setting.placeholder}
        disabled={setting.disabled}
        rows={3}
        className={cn(error && "border-red-300")}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  )
}

export function SettingsSlider({ setting, value, onChange, error, className }: SettingsControlProps) {
  const min = setting.validation?.min ?? 0
  const max = setting.validation?.max ?? 100
  
  return (
    <div className={cn("py-4", className)}>
      <div className="flex items-center gap-2 mb-2">
        <Label htmlFor={setting.id} className="text-sm font-medium text-gray-900 dark:text-gray-100" style={{color: '#111827'}}>
          {setting.label}
        </Label>
        {setting.isPremium && (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
            <Crown className="w-3 h-3 mr-1" />
            Pro
          </Badge>
        )}
      </div>
      <p className="text-sm text-gray-800 dark:text-gray-200 mb-3" style={{color: '#374151'}}>{setting.description}</p>
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <input
            id={setting.id}
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            disabled={setting.disabled}
            className={cn(
              "flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer",
              "slider:appearance-none slider:bg-[#FF6B35] slider:h-2 slider:rounded-lg",
              setting.disabled && "opacity-50 cursor-not-allowed"
            )}
          />
          <div className="min-w-[60px] text-right">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {typeof value === 'number' ? value.toFixed(setting.id.includes('threshold') && value < 1 ? 2 : 0) : value}
              {setting.id.includes('Days') && ' days'}
              {setting.id.includes('USD') && ' USD'}
              {setting.id.includes('threshold') && value < 1 && ''}
            </span>
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  )
}

export function SettingsMultiSelect({ setting, value, onChange, error, className }: SettingsControlProps) {
  const selectedOptions = Array.isArray(value) ? value : []

  const toggleOption = (optionValue: string) => {
    const newValue = selectedOptions.includes(optionValue)
      ? selectedOptions.filter(v => v !== optionValue)
      : [...selectedOptions, optionValue]
    onChange(newValue)
  }

  return (
    <div className={cn("py-4", className)}>
      <div className="flex items-center gap-2 mb-2">
        <Label className="text-sm font-medium text-gray-900 dark:text-gray-100" style={{color: '#111827'}}>
          {setting.label}
        </Label>
        {setting.isPremium && (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
            <Crown className="w-3 h-3 mr-1" />
            Pro
          </Badge>
        )}
      </div>
      <p className="text-sm text-gray-800 dark:text-gray-200 mb-3" style={{color: '#374151'}}>{setting.description}</p>
      <div className="space-y-2">
        {setting.options?.map((option) => (
          <div
            key={option.value}
            className={cn(
              "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors",
              selectedOptions.includes(option.value)
                ? "bg-[#FF6B35]/5 border-[#FF6B35]"
                : "bg-white border-gray-200 hover:bg-gray-50",
              option.disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => !option.disabled && toggleOption(String(option.value))}
          >
            <div className={cn(
              "flex items-center justify-center w-4 h-4 border rounded",
              selectedOptions.includes(option.value)
                ? "bg-[#FF6B35] border-[#FF6B35] text-white"
                : "border-gray-300"
            )}>
              {selectedOptions.includes(option.value) && (
                <Check className="w-3 h-3" />
              )}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100" style={{color: '#111827'}}>{option.label}</div>
              {option.description && (
                <div className="text-xs text-gray-800 dark:text-gray-200" style={{color: '#4B5563'}}>{option.description}</div>
              )}
            </div>
          </div>
        ))}
      </div>
      {selectedOptions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {selectedOptions.map((value) => {
            const option = setting.options?.find(o => o.value === value)
            return option ? (
              <Badge key={value} variant="secondary" className="text-xs">
                {option.label}
                <button
                  onClick={() => toggleOption(value)}
                  className="ml-1 hover:text-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ) : null
          })}
        </div>
      )}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  )
}

export function SettingsFileUpload({ setting, value, onChange, error, className }: SettingsControlProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0]
      onChange(file)
    }
  }

  return (
    <div className={cn("py-4", className)}>
      <div className="flex items-center gap-2 mb-2">
        <Label className="text-sm font-medium text-gray-900 dark:text-gray-100" style={{color: '#111827'}}>
          {setting.label}
        </Label>
        {setting.isPremium && (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
            <Crown className="w-3 h-3 mr-1" />
            Pro
          </Badge>
        )}
      </div>
      <p className="text-sm text-gray-800 dark:text-gray-200 mb-3" style={{color: '#374151'}}>{setting.description}</p>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          isDragOver ? "border-[#FF6B35] bg-[#FF6B35]/5" : "border-gray-300",
          error && "border-red-300"
        )}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragOver(false)
          handleFileChange(e.dataTransfer.files)
        }}
      >
        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
        <p className="text-sm text-gray-800 dark:text-gray-200 mb-2" style={{color: '#374151'}}>
          Drag and drop a file here, or
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const input = document.createElement('input')
            input.type = 'file'
            input.onchange = (e) => handleFileChange((e.target as HTMLInputElement).files)
            input.click()
          }}
        >
          Choose File
        </Button>
        {value && (
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
            Selected: {value.name || value}
          </p>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  )
}

// Main component that renders the appropriate control type
export function SettingsControl(props: SettingsControlProps) {
  switch (props.setting.type) {
    case 'toggle':
      return <SettingsToggle {...props} />
    case 'input':
      return <SettingsInput {...props} />
    case 'select':
      return <SettingsSelect {...props} />
    case 'textarea':
      return <SettingsTextarea {...props} />
    case 'slider':
      return <SettingsSlider {...props} />
    case 'multi-select':
      return <SettingsMultiSelect {...props} />
    case 'file-upload':
      return <SettingsFileUpload {...props} />
    default:
      return <div>Unsupported control type: {props.setting.type}</div>
  }
}