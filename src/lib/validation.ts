import { format, isValid, parse } from 'date-fns'

export interface ValidationResult {
  isValid: boolean
  formatted?: string
  error?: string
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

// Date validation utility
export function validateDate(dateStr: string, isRequired: boolean = false): ValidationResult {
  if (!dateStr.trim()) {
    return isRequired 
      ? { isValid: false, error: 'Date is required' }
      : { isValid: true }
  }

  // Try parsing various date formats
  const formats = [
    'yyyy-MM-dd',
    'MM/dd/yyyy',
    'dd/MM/yyyy',
    'yyyy/MM/dd',
    'MMM dd, yyyy',
    'MM-dd-yyyy',
    'yyyy.MM.dd'
  ]
  
  for (const formatStr of formats) {
    try {
      const parsed = parse(dateStr, formatStr, new Date())
      if (isValid(parsed)) {
        // Check if date is reasonable (not too far in past/future)
        const now = new Date()
        const minDate = new Date(1990, 0, 1)
        const maxDate = new Date(now.getFullYear() + 50, 11, 31)
        
        if (parsed < minDate) {
          return { isValid: false, error: `Date cannot be before ${minDate.getFullYear()}` }
        }
        
        if (parsed > maxDate) {
          return { isValid: false, error: `Date cannot be after ${maxDate.getFullYear()}` }
        }
        
        return { isValid: true, formatted: format(parsed, 'yyyy-MM-dd') }
      }
    } catch {
      continue
    }
  }

  return { 
    isValid: false, 
    error: 'Please enter a valid date (MM/DD/YYYY, YYYY-MM-DD, or similar format)' 
  }
}

// Vendor name validation
export function validateVendorName(name: string, isRequired: boolean = true): ValidationResult {
  if (!name.trim()) {
    return isRequired
      ? { isValid: false, error: 'Vendor name is required' }
      : { isValid: true }
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: 'Vendor name must be at least 2 characters long' }
  }

  if (name.trim().length > 255) {
    return { isValid: false, error: 'Vendor name cannot exceed 255 characters' }
  }

  // Check for invalid characters (basic validation)
  const invalidChars = /[<>{}]/
  if (invalidChars.test(name)) {
    return { isValid: false, error: 'Vendor name contains invalid characters' }
  }

  return { isValid: true, formatted: name.trim() }
}

// File validation for uploads
export interface FileValidationOptions {
  allowedTypes?: string[]
  maxSizeBytes?: number
  minSizeBytes?: number
}

export function validateFile(
  file: File, 
  options: FileValidationOptions = {}
): ValidationResult {
  const {
    allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg'
    ],
    maxSizeBytes = 10 * 1024 * 1024, // 10MB default
    minSizeBytes = 1024 // 1KB minimum
  } = options

  if (!file) {
    return { isValid: false, error: 'Please select a file' }
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    const allowedExtensions = allowedTypes
      .map(type => {
        switch (type) {
          case 'application/pdf': return '.pdf'
          case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': return '.docx'
          case 'image/png': return '.png'
          case 'image/jpeg': return '.jpg/.jpeg'
          default: return type
        }
      })
      .join(', ')
    
    return { 
      isValid: false, 
      error: `File type not supported. Please upload: ${allowedExtensions}` 
    }
  }

  // Check file size
  if (file.size > maxSizeBytes) {
    const maxMB = Math.round(maxSizeBytes / (1024 * 1024))
    return { 
      isValid: false, 
      error: `File is too large. Maximum size is ${maxMB}MB` 
    }
  }

  if (file.size < minSizeBytes) {
    return { 
      isValid: false, 
      error: 'File appears to be corrupted or empty' 
    }
  }

  return { isValid: true }
}

// Email validation (basic)
export function validateEmail(email: string, isRequired: boolean = false): ValidationResult {
  if (!email.trim()) {
    return isRequired 
      ? { isValid: false, error: 'Email is required' }
      : { isValid: true }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address' }
  }

  return { isValid: true, formatted: email.trim().toLowerCase() }
}

// Phone number validation (basic US format)
export function validatePhone(phone: string, isRequired: boolean = false): ValidationResult {
  if (!phone.trim()) {
    return isRequired 
      ? { isValid: false, error: 'Phone number is required' }
      : { isValid: true }
  }

  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '')
  
  if (digitsOnly.length !== 10) {
    return { isValid: false, error: 'Please enter a valid 10-digit phone number' }
  }

  // Format as (xxx) xxx-xxxx
  const formatted = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`
  
  return { isValid: true, formatted }
}

// Generic text field validation
export function validateTextField(
  value: string,
  fieldName: string,
  options: {
    required?: boolean
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    patternMessage?: string
  } = {}
): ValidationResult {
  const { required = false, minLength = 0, maxLength = Infinity, pattern, patternMessage } = options

  if (!value.trim()) {
    return required 
      ? { isValid: false, error: `${fieldName} is required` }
      : { isValid: true }
  }

  if (value.trim().length < minLength) {
    return { 
      isValid: false, 
      error: `${fieldName} must be at least ${minLength} characters long` 
    }
  }

  if (value.trim().length > maxLength) {
    return { 
      isValid: false, 
      error: `${fieldName} cannot exceed ${maxLength} characters` 
    }
  }

  if (pattern && !pattern.test(value.trim())) {
    return { 
      isValid: false, 
      error: patternMessage || `${fieldName} format is invalid` 
    }
  }

  return { isValid: true, formatted: value.trim() }
}

// Batch validation utility
export function validateFields(validations: Record<string, ValidationResult>): {
  isValid: boolean
  errors: Record<string, string>
} {
  const errors: Record<string, string> = {}
  
  for (const [field, result] of Object.entries(validations)) {
    if (!result.isValid && result.error) {
      errors[field] = result.error
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}