'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// Screen reader announcements hook
export function useScreenReader() {
  const announcerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Create hidden announcer element
    const announcer = document.createElement('div')
    announcer.setAttribute('aria-live', 'polite')
    announcer.setAttribute('aria-atomic', 'true')
    announcer.className = 'sr-only'
    announcer.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `
    
    document.body.appendChild(announcer)
    announcerRef.current = announcer

    return () => {
      if (announcerRef.current) {
        document.body.removeChild(announcerRef.current)
      }
    }
  }, [])

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcerRef.current) {
      announcerRef.current.setAttribute('aria-live', priority)
      announcerRef.current.textContent = message
      
      // Clear after announcement to allow repeat announcements
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = ''
        }
      }, 1000)
    }
  }, [])

  return announce
}

// Keyboard navigation hook
export function useKeyboardNavigation() {
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const itemsRef = useRef<(HTMLElement | null)[]>([])

  const registerItem = useCallback((element: HTMLElement | null, index: number) => {
    itemsRef.current[index] = element
  }, [])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const items = itemsRef.current.filter(Boolean)
    if (items.length === 0) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setFocusedIndex(prev => {
          const nextIndex = prev + 1 >= items.length ? 0 : prev + 1
          items[nextIndex]?.focus()
          return nextIndex
        })
        break
        
      case 'ArrowUp':
        event.preventDefault()
        setFocusedIndex(prev => {
          const nextIndex = prev - 1 < 0 ? items.length - 1 : prev - 1
          items[nextIndex]?.focus()
          return nextIndex
        })
        break
        
      case 'Home':
        event.preventDefault()
        setFocusedIndex(0)
        items[0]?.focus()
        break
        
      case 'End':
        event.preventDefault()
        const lastIndex = items.length - 1
        setFocusedIndex(lastIndex)
        items[lastIndex]?.focus()
        break
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return { focusedIndex, registerItem, setFocusedIndex }
}

// Focus management hook
export function useFocusManagement() {
  const previousFocus = useRef<HTMLElement | null>(null)

  const saveFocus = useCallback(() => {
    previousFocus.current = document.activeElement as HTMLElement
  }, [])

  const restoreFocus = useCallback(() => {
    if (previousFocus.current && previousFocus.current.focus) {
      previousFocus.current.focus()
    }
  }, [])

  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    
    // Focus first element initially
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }, [])

  return { saveFocus, restoreFocus, trapFocus }
}

// Reduced motion preference hook
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [])

  return prefersReducedMotion
}

// High contrast preference hook
export function useHighContrast() {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    setPrefersHighContrast(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersHighContrast(event.matches)
    }

    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [])

  return prefersHighContrast
}

// Color scheme preference hook
export function useColorSchemePreference() {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark' | 'no-preference'>('no-preference')

  useEffect(() => {
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const lightQuery = window.matchMedia('(prefers-color-scheme: light)')

    const updateColorScheme = () => {
      if (darkQuery.matches) {
        setColorScheme('dark')
      } else if (lightQuery.matches) {
        setColorScheme('light')
      } else {
        setColorScheme('no-preference')
      }
    }

    updateColorScheme()

    darkQuery.addListener(updateColorScheme)
    lightQuery.addListener(updateColorScheme)

    return () => {
      darkQuery.removeListener(updateColorScheme)
      lightQuery.removeListener(updateColorScheme)
    }
  }, [])

  return colorScheme
}

// ARIA live region hook for dynamic content updates
export function useAriaLiveRegion() {
  const liveRegionRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const liveRegion = document.createElement('div')
    liveRegion.setAttribute('aria-live', 'polite')
    liveRegion.setAttribute('aria-atomic', 'false')
    liveRegion.className = 'sr-only'
    liveRegion.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `

    document.body.appendChild(liveRegion)
    liveRegionRef.current = liveRegion

    return () => {
      if (liveRegionRef.current) {
        document.body.removeChild(liveRegionRef.current)
      }
    }
  }, [])

  const updateLiveRegion = useCallback((content: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (liveRegionRef.current) {
      liveRegionRef.current.setAttribute('aria-live', priority)
      liveRegionRef.current.textContent = content
    }
  }, [])

  return updateLiveRegion
}

// Skip link hook for keyboard navigation
export function useSkipLinks() {
  const skipLinksRef = useRef<HTMLDivElement | null>(null)

  const addSkipLink = useCallback((href: string, label: string) => {
    if (!skipLinksRef.current) {
      const skipLinksContainer = document.createElement('div')
      skipLinksContainer.className = 'skip-links'
      skipLinksContainer.style.cssText = `
        position: fixed;
        top: -100px;
        left: 0;
        z-index: 1000;
        background: #000;
        color: #fff;
        padding: 8px 16px;
        text-decoration: none;
        transition: top 0.3s;
      `
      document.body.insertBefore(skipLinksContainer, document.body.firstChild)
      skipLinksRef.current = skipLinksContainer
    }

    const skipLink = document.createElement('a')
    skipLink.href = href
    skipLink.textContent = label
    skipLink.style.cssText = `
      color: #fff;
      text-decoration: none;
      display: block;
      padding: 4px 0;
    `
    
    skipLink.addEventListener('focus', () => {
      if (skipLinksRef.current) {
        skipLinksRef.current.style.top = '0'
      }
    })
    
    skipLink.addEventListener('blur', () => {
      if (skipLinksRef.current) {
        skipLinksRef.current.style.top = '-100px'
      }
    })

    skipLinksRef.current.appendChild(skipLink)
  }, [])

  return addSkipLink
}

// Document title management for screen readers
export function useDocumentTitle() {
  const announce = useScreenReader()

  const updateTitle = useCallback((title: string, shouldAnnounce?: boolean) => {
    document.title = title
    if (shouldAnnounce && announce) {
      announce(`Page title changed to: ${title}`)
    }
  }, [announce])

  return updateTitle
}