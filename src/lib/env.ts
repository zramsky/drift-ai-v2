/**
 * Environment Variable Validation
 * 
 * Type-safe environment configuration with validation
 */

import { z } from 'zod';

const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // OpenAI Configuration
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4-vision-preview'),
  OPENAI_MAX_TOKENS: z.string().transform(Number).default(2000),
  OPENAI_TEMPERATURE: z.string().transform(Number).default(0.1),
  
  // Feature Flags
  NEXT_PUBLIC_AI_FEATURES_ENABLED: z.enum(['true', 'false']).default('true'),
  NEXT_PUBLIC_MOCK_MODE: z.enum(['true', 'false']).default('true'),
  NEXT_PUBLIC_INVOICE_UPLOAD_ENABLED: z.enum(['true', 'false']).default('true'),
  NEXT_PUBLIC_CONTRACT_UPLOAD_ENABLED: z.enum(['true', 'false']).default('false'),
  NEXT_PUBLIC_REAL_TIME_ANALYSIS: z.enum(['true', 'false']).default('false'),
  NEXT_PUBLIC_DEBUG_MODE: z.enum(['true', 'false']).default('true'),
  
  // API Configuration
  API_RATE_LIMIT_REQUESTS: z.string().transform(Number).default(10),
  API_RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default(60000),
  
  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Environment validation failed:');
    if (error instanceof z.ZodError) {
      error.issues.forEach((err: z.ZodIssue) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    throw new Error('Invalid environment configuration');
  }
}

export const env = validateEnv();

export function isProduction() {
  return env.NODE_ENV === 'production';
}

export function isDevelopment() {
  return env.NODE_ENV === 'development';
}

export function isAIEnabled() {
  return env.NEXT_PUBLIC_AI_FEATURES_ENABLED === 'true';
}

export function isMockMode() {
  return env.NEXT_PUBLIC_MOCK_MODE === 'true';
}