'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState, useEffect } from 'react'

let browserQueryClient: QueryClient | undefined = undefined

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes default - good for dashboard data
        gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
        refetchOnWindowFocus: false, // Prevent excessive refetches in development
        refetchOnMount: 'always', // Always fetch fresh data on component mount
        retry: (failureCount, error) => {
          // Don't retry 4xx client errors (bad request, unauthorized, etc.)
          if (error && typeof error === 'object' && 'status' in error) {
            const status = (error as any).status
            if (status >= 400 && status < 500) return false
          }
          // Retry network errors and 5xx server errors up to 3 times
          return failureCount < 3
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff, max 30s
      },
      mutations: {
        retry: 1, // Retry mutations once on failure
        onError: (error) => {
          console.error('Mutation error:', error)
          // In production, you might want to send this to an error reporting service
        },
        onSuccess: (data, variables, context) => {
          // Global success handler for mutations
          console.log('Mutation succeeded')
        },
      },
    },
  })
}

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient()
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient()

  // Temporarily skip hydration check to debug interface loading
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}