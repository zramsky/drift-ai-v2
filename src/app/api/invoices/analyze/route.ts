/**
 * Invoice Analysis API Endpoint
 * 
 * POST /api/invoices/analyze
 * 
 * Analyzes an invoice image using OpenAI GPT-4 Vision
 * Supports both real AI and mock mode for development
 */

import { NextRequest, NextResponse } from 'next/server';
import { openAIService, type InvoiceAnalysisRequest } from '@/lib/ai/openai-service';
import { z } from 'zod';

// Request validation schema
const AnalyzeRequestSchema = z.object({
  imageUrl: z.string().url('Invalid image URL'),
  contractTerms: z.object({
    paymentTerms: z.string(),
    pricing: z.array(z.object({
      item: z.string(),
      price: z.number().positive(),
      unit: z.string(),
      conditions: z.string().optional()
    })),
    discounts: z.array(z.object({
      type: z.string(),
      amount: z.number(),
      conditions: z.string()
    })).optional(),
    taxRate: z.number().min(0).max(100).optional(),
    effectiveDate: z.string(),
    expirationDate: z.string().optional()
  }).optional(),
  vendorInfo: z.object({
    name: z.string(),
    id: z.string(),
    contactEmail: z.string().email().optional()
  }).optional()
});

// Rate limiting (simple in-memory implementation)
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_REQUESTS = parseInt(process.env.API_RATE_LIMIT_REQUESTS || '10');
const RATE_LIMIT_WINDOW = parseInt(process.env.API_RATE_LIMIT_WINDOW_MS || '60000');

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimit.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_REQUESTS) {
    return false;
  }

  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'localhost';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = AnalyzeRequestSchema.parse(body);

    // Check if AI features are enabled
    if (process.env.NEXT_PUBLIC_AI_FEATURES_ENABLED !== 'true') {
      return NextResponse.json(
        { error: 'AI features are currently disabled' },
        { status: 503 }
      );
    }

    // Log analysis request (for monitoring/debugging)
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('Invoice analysis request:', {
        imageUrl: validatedData.imageUrl,
        hasContractTerms: !!validatedData.contractTerms,
        vendorId: validatedData.vendorInfo?.id,
        timestamp: new Date().toISOString()
      });
    }

    // Perform the analysis
    const analysisRequest: InvoiceAnalysisRequest = {
      imageUrl: validatedData.imageUrl,
      contractTerms: validatedData.contractTerms,
      vendorInfo: validatedData.vendorInfo
    };

    const result = await openAIService.analyzeInvoice(analysisRequest);

    // Log successful analysis (for monitoring)
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('Analysis completed:', {
        success: result.success,
        confidence: result.confidence,
        discrepancyCount: result.discrepancies.length,
        complianceStatus: result.complianceStatus,
        processingTime: result.processingTime
      });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Invoice analysis API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('rate limit')) {
      return NextResponse.json(
        { error: 'OpenAI API rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : 'Something went wrong'
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  const status = openAIService.getStatus();
  
  return NextResponse.json({
    service: 'invoice-analysis',
    status: 'healthy',
    mockMode: status.mockMode,
    configured: status.configured,
    version: status.version,
    timestamp: new Date().toISOString()
  });
}