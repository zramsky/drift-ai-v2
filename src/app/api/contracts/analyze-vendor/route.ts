/**
 * Contract Analysis API Endpoint for Vendor Extraction
 *
 * POST /api/contracts/analyze-vendor
 *
 * Analyzes a contract document using OpenAI GPT-4 Vision to extract vendor information
 * Supports both real AI and mock mode for development
 */

import { NextRequest, NextResponse } from 'next/server';
import { openAIService, type ContractAnalysisRequest } from '@/lib/ai/openai-service';
import { logger } from '@/lib/logger';
import { env } from '@/lib/env';
import { z } from 'zod';
import { convertPDFToSingleImage } from '@/lib/pdf-converter';

// Request validation schema
const AnalyzeContractRequestSchema = z.object({
  imageUrl: z.string().url('Invalid image URL').refine(
    (url) => url.startsWith('https://') || url.startsWith('http://localhost') || url.startsWith('data:'),
    'Image URL must use HTTPS in production or be a data URL'
  ).optional(),
  imageData: z.string().optional(),
  imageType: z.string().optional(),
  fileName: z.string().optional()
});

// Rate limiting (simple in-memory implementation)
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_REQUESTS = env.API_RATE_LIMIT_REQUESTS;
const RATE_LIMIT_WINDOW = env.API_RATE_LIMIT_WINDOW_MS;

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
    const validatedData = AnalyzeContractRequestSchema.parse(body);

    // Check if AI features are enabled
    if (!env.NEXT_PUBLIC_AI_FEATURES_ENABLED) {
      logger.securityEvent('AI features disabled request', {
        metadata: { ip, timestamp: new Date().toISOString() }
      });
      return NextResponse.json(
        { error: 'AI features are currently disabled' },
        { status: 503 }
      );
    }

    // Prepare image URL - either from URL or base64 data
    let imageUrl: string;
    let imageData = validatedData.imageData;

    if (imageData) {
      const mimeType = validatedData.imageType || 'image/jpeg';

      // Check if this is a PDF
      if (mimeType === 'application/pdf' || validatedData.fileName?.endsWith('.pdf')) {
        // Convert PDF to image
        console.log('Detected PDF file, converting to image...');

        const pdfBuffer = Buffer.from(imageData, 'base64');
        const conversionResult = await convertPDFToSingleImage(pdfBuffer);

        if (!conversionResult.success || !conversionResult.image) {
          return NextResponse.json(
            { error: 'Failed to convert PDF to image: ' + (conversionResult.error || 'Unknown error') },
            { status: 400 }
          );
        }

        console.log('PDF converted successfully to image');
        imageData = conversionResult.image;
        imageUrl = `data:image/png;base64,${imageData}`;
      } else {
        // Use image data directly
        imageUrl = `data:${mimeType};base64,${imageData}`;
      }
    } else if (validatedData.imageUrl) {
      imageUrl = validatedData.imageUrl;
    } else {
      return NextResponse.json(
        { error: 'Either imageUrl or imageData must be provided' },
        { status: 400 }
      );
    }

    // Log analysis request (for monitoring/debugging)
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('Contract analysis request:', {
        imageSource: validatedData.imageData ? 'base64' : 'url',
        fileName: validatedData.fileName || 'unknown',
        timestamp: new Date().toISOString()
      });
    }

    // Perform the analysis
    const analysisRequest: ContractAnalysisRequest = {
      imageUrl,
      fileName: validatedData.fileName
    };

    const result = await openAIService.analyzeContractForVendor(analysisRequest);

    // Log successful analysis (for monitoring)
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('Contract analysis completed:', {
        success: result.success,
        confidence: result.confidence,
        vendorName: result.extractedVendorData.vendorName,
        contractTitle: result.extractedContractData.contractTitle,
        processingTime: result.processingTime
      });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Contract analysis API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: error.issues
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
    service: 'contract-vendor-analysis',
    status: 'healthy',
    mockMode: status.mockMode,
    configured: status.configured,
    version: status.version,
    timestamp: new Date().toISOString()
  });
}
