/**
 * Structured Logging System
 * 
 * Production-ready logging with different levels and contexts
 */

import { env } from './env';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  userId?: string;
  requestId?: string;
  apiEndpoint?: string;
  duration?: number;
  error?: Error;
  metadata?: Record<string, any>;
}

class Logger {
  private logLevel: LogLevel;

  constructor() {
    this.logLevel = env.LOG_LEVEL;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level] >= levels[this.logLevel];
  }

  private formatLog(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context,
    };

    return JSON.stringify(logEntry);
  }

  debug(message: string, context?: LogContext) {
    if (this.shouldLog('debug')) {
      console.debug(this.formatLog('debug', message, context));
    }
  }

  info(message: string, context?: LogContext) {
    if (this.shouldLog('info')) {
      console.info(this.formatLog('info', message, context));
    }
  }

  warn(message: string, context?: LogContext) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatLog('warn', message, context));
    }
  }

  error(message: string, context?: LogContext) {
    if (this.shouldLog('error')) {
      console.error(this.formatLog('error', message, context));
    }
  }

  // Convenience methods for common scenarios
  apiRequest(endpoint: string, method: string, duration: number, status: number) {
    this.info('API Request', {
      apiEndpoint: `${method} ${endpoint}`,
      duration,
      metadata: { status }
    });
  }

  aiAnalysis(invoiceId: string, duration: number, success: boolean, cost?: number) {
    this.info('AI Analysis', {
      metadata: {
        invoiceId,
        duration,
        success,
        cost: cost || 0
      }
    });
  }

  securityEvent(event: string, context?: LogContext) {
    this.warn('Security Event', {
      ...context,
      metadata: { event, ...context?.metadata }
    });
  }
}

export const logger = new Logger();