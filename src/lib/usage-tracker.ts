/**
 * Usage Tracking & Cost Management
 * 
 * Track OpenAI API usage and costs to prevent overruns
 */

import { logger } from './logger';

export interface UsageRecord {
  timestamp: Date;
  userId?: string;
  operation: 'invoice_analysis' | 'contract_parsing';
  tokensUsed: number;
  estimatedCost: number;
  model: string;
  success: boolean;
  processingTime: number;
}

export interface DailyUsage {
  date: string;
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  successRate: number;
  averageProcessingTime: number;
}

class UsageTracker {
  private usage: UsageRecord[] = [];

  // OpenAI pricing (as of November 2025)
  private pricing = {
    'gpt-4o': {
      input: 0.0025,   // per 1K tokens
      output: 0.01     // per 1K tokens
    },
    'gpt-4-vision-preview': {
      input: 0.01,   // per 1K tokens (deprecated)
      output: 0.03   // per 1K tokens (deprecated)
    }
  };

  /**
   * Record API usage
   */
  recordUsage(record: Omit<UsageRecord, 'timestamp' | 'estimatedCost'>) {
    const estimatedCost = this.calculateCost(record.model, record.tokensUsed);
    
    const usage: UsageRecord = {
      ...record,
      timestamp: new Date(),
      estimatedCost
    };

    this.usage.push(usage);

    // Log for monitoring
    logger.aiAnalysis(
      record.userId || 'anonymous',
      record.processingTime,
      record.success,
      estimatedCost
    );

    // Check daily limits
    this.checkDailyLimits();
  }

  /**
   * Calculate estimated cost based on tokens and model
   */
  private calculateCost(model: string, tokens: number): number {
    const modelPricing = this.pricing[model as keyof typeof this.pricing];
    if (!modelPricing) {
      logger.warn('Unknown model pricing', { metadata: { model } });
      return 0;
    }

    // Estimate input/output token split (roughly 80/20 for analysis)
    const inputTokens = Math.floor(tokens * 0.8);
    const outputTokens = Math.floor(tokens * 0.2);

    const inputCost = (inputTokens / 1000) * modelPricing.input;
    const outputCost = (outputTokens / 1000) * modelPricing.output;

    return inputCost + outputCost;
  }

  /**
   * Get daily usage statistics
   */
  getDailyUsage(date?: string): DailyUsage {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const dayUsage = this.usage.filter(record => 
      record.timestamp.toISOString().startsWith(targetDate)
    );

    if (dayUsage.length === 0) {
      return {
        date: targetDate,
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        successRate: 0,
        averageProcessingTime: 0
      };
    }

    const totalRequests = dayUsage.length;
    const totalTokens = dayUsage.reduce((sum, record) => sum + record.tokensUsed, 0);
    const totalCost = dayUsage.reduce((sum, record) => sum + record.estimatedCost, 0);
    const successfulRequests = dayUsage.filter(record => record.success).length;
    const successRate = (successfulRequests / totalRequests) * 100;
    const averageProcessingTime = dayUsage.reduce((sum, record) => sum + record.processingTime, 0) / totalRequests;

    return {
      date: targetDate,
      totalRequests,
      totalTokens,
      totalCost,
      successRate,
      averageProcessingTime
    };
  }

  /**
   * Check if daily limits are exceeded
   */
  private checkDailyLimits() {
    const dailyUsage = this.getDailyUsage();
    
    // Alert thresholds
    const MAX_DAILY_COST = 100; // $100 per day
    const MAX_DAILY_REQUESTS = 1000; // 1000 requests per day

    if (dailyUsage.totalCost > MAX_DAILY_COST) {
      logger.error('Daily cost limit exceeded', {
        metadata: {
          dailyCost: dailyUsage.totalCost,
          limit: MAX_DAILY_COST
        }
      });
    }

    if (dailyUsage.totalRequests > MAX_DAILY_REQUESTS) {
      logger.warn('Daily request limit exceeded', {
        metadata: {
          dailyRequests: dailyUsage.totalRequests,
          limit: MAX_DAILY_REQUESTS
        }
      });
    }
  }

  /**
   * Get usage summary for monitoring
   */
  getUsageSummary() {
    const today = this.getDailyUsage();
    const last7Days = this.getLast7DaysUsage();

    return {
      today,
      last7Days,
      currentMonth: this.getMonthlyUsage()
    };
  }

  private getLast7DaysUsage(): DailyUsage[] {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      days.push(this.getDailyUsage(dateStr));
    }
    return days;
  }

  private getMonthlyUsage(): Omit<DailyUsage, 'date'> {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthUsage = this.usage.filter(record => {
      const recordDate = new Date(record.timestamp);
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    });

    if (monthUsage.length === 0) {
      return {
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        successRate: 0,
        averageProcessingTime: 0
      };
    }

    const totalRequests = monthUsage.length;
    const totalTokens = monthUsage.reduce((sum, record) => sum + record.tokensUsed, 0);
    const totalCost = monthUsage.reduce((sum, record) => sum + record.estimatedCost, 0);
    const successfulRequests = monthUsage.filter(record => record.success).length;
    const successRate = (successfulRequests / totalRequests) * 100;
    const averageProcessingTime = monthUsage.reduce((sum, record) => sum + record.processingTime, 0) / totalRequests;

    return {
      totalRequests,
      totalTokens,
      totalCost,
      successRate,
      averageProcessingTime
    };
  }
}

export const usageTracker = new UsageTracker();