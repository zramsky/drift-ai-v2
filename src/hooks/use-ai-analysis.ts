/**
 * React Query hooks for AI-powered invoice analysis
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  type InvoiceAnalysisRequest, 
  type InvoiceAnalysisResult 
} from '@/lib/ai/openai-service';

/**
 * Hook to analyze an invoice with AI
 */
export function useAnalyzeInvoice() {
  return useMutation({
    mutationFn: async (request: InvoiceAnalysisRequest): Promise<InvoiceAnalysisResult> => {
      const response = await fetch('/api/invoices/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Analysis failed');
      }

      return response.json();
    },
    meta: {
      successMessage: 'Invoice analysis completed successfully',
      errorMessage: 'Failed to analyze invoice'
    }
  });
}

/**
 * Hook to get AI service status
 */
export function useAIServiceStatus() {
  return useQuery({
    queryKey: ['ai-service-status'],
    queryFn: async () => {
      const response = await fetch('/api/invoices/analyze');
      if (!response.ok) {
        throw new Error('Failed to get service status');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
}

/**
 * Mock data for testing (used when not connected to real backend)
 */
export function useMockAnalysisData() {
  return {
    sampleRequests: [
      {
        imageUrl: "https://example.com/sample-invoice.jpg",
        contractTerms: {
          paymentTerms: "Net 30 Days",
          pricing: [
            { item: "Fresh Vegetables", price: 42.00, unit: "case" },
            { item: "Ground Beef", price: 125.75, unit: "case" }
          ],
          taxRate: 8.5,
          effectiveDate: "2024-01-01"
        },
        vendorInfo: {
          name: "Sysco Food Services",
          id: "VENDOR-001"
        }
      }
    ],
    sampleResults: [
      {
        success: true,
        confidence: 0.95,
        extractedData: {
          invoiceNumber: "INV-2024-001234",
          date: "2024-11-09",
          dueDate: "2024-12-09",
          totalAmount: 2847.50,
          subtotal: 2625.00,
          taxAmount: 222.50,
          taxRate: 8.5,
          vendorName: "Sysco Food Services",
          lineItems: [
            {
              description: "Fresh Vegetables - Mixed Cases",
              quantity: 15,
              unitPrice: 45.50,
              totalPrice: 682.50,
              unit: "case"
            }
          ],
          paymentTerms: "Net 30 Days"
        },
        discrepancies: [
          {
            type: 'price' as const,
            severity: 'medium' as const,
            field: 'lineItems[0].unitPrice',
            expected: 42.00,
            actual: 45.50,
            difference: 3.50,
            description: 'Unit price exceeds contracted rate',
            recommendation: 'Contact vendor for price correction'
          }
        ],
        complianceStatus: 'discrepancy' as const,
        aiReasoning: "Analysis reveals pricing discrepancies requiring attention.",
        processingTime: 2500
      }
    ]
  };
}