/**
 * Feature Flags for DRIFT.AI
 * 
 * Centralized feature flag management to control which features
 * are enabled in different environments and development phases.
 */

import React from 'react';

export interface FeatureFlags {
  aiFeatures: boolean;
  mockMode: boolean;
  invoiceUpload: boolean;
  contractUpload: boolean;
  realTimeAnalysis: boolean;
  debugMode: boolean;
}

/**
 * Get current feature flags from environment variables
 */
export function getFeatureFlags(): FeatureFlags {
  return {
    aiFeatures: process.env.NEXT_PUBLIC_AI_FEATURES_ENABLED === 'true',
    mockMode: process.env.NEXT_PUBLIC_MOCK_MODE === 'true',
    invoiceUpload: process.env.NEXT_PUBLIC_INVOICE_UPLOAD_ENABLED === 'true',
    contractUpload: process.env.NEXT_PUBLIC_CONTRACT_UPLOAD_ENABLED === 'true',
    realTimeAnalysis: process.env.NEXT_PUBLIC_REAL_TIME_ANALYSIS === 'true',
    debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true'
  };
}

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[feature];
}

/**
 * Component wrapper for feature-gated content
 */
interface FeatureGateProps {
  feature: keyof FeatureFlags;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({ feature, children, fallback = null }: FeatureGateProps) {
  const enabled = isFeatureEnabled(feature);
  
  if (enabled) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

/**
 * Debug information component (only shows in debug mode)
 */
export function DebugInfo({ label, data }: { label: string; data: any }) {
  if (!isFeatureEnabled('debugMode')) {
    return null;
  }

  return (
    <div className="mt-4 p-3 bg-gray-100 rounded text-xs font-mono">
      <strong>{label}:</strong>
      <pre className="mt-1 whitespace-pre-wrap">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

/**
 * Mode indicator badge (shows current mode in development)
 */
export function ModeIndicator() {
  if (!isFeatureEnabled('debugMode')) {
    return null;
  }

  const flags = getFeatureFlags();
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-black/80 text-white px-3 py-2 rounded-lg text-xs space-y-1">
        <div className="font-semibold">DRIFT.AI Mode</div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${flags.mockMode ? 'bg-yellow-400' : 'bg-green-400'}`}></span>
          {flags.mockMode ? 'Mock Mode' : 'Live AI'}
        </div>
        {flags.aiFeatures && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            AI Features
          </div>
        )}
        {flags.invoiceUpload && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            Upload
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Hook to get current feature flags
 */
export function useFeatureFlags(): FeatureFlags {
  return getFeatureFlags();
}