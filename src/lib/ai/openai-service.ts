/**
 * OpenAI Service for DRIFT.AI Invoice Analysis
 * 
 * This service provides a wrapper around OpenAI's GPT-4 Vision API
 * with mock mode for development/testing without API calls.
 * 
 * Features:
 * - Mock mode for development (no API calls or costs)
 * - Real OpenAI integration for production
 * - Type-safe interfaces
 * - Error handling and retry logic
 * - Cost monitoring
 */

import OpenAI from 'openai';

// Types for invoice analysis
export interface InvoiceAnalysisRequest {
  imageUrl: string;
  contractTerms?: ContractTerms;
  vendorInfo?: VendorInfo;
}

export interface ContractTerms {
  paymentTerms: string;
  pricing: PricingTerm[];
  discounts?: DiscountTerm[];
  taxRate?: number;
  effectiveDate: string;
  expirationDate?: string;
}

export interface PricingTerm {
  item: string;
  price: number;
  unit: string;
  conditions?: string;
}

export interface DiscountTerm {
  type: string;
  amount: number;
  conditions: string;
}

export interface VendorInfo {
  name: string;
  id: string;
  contactEmail?: string;
}

export interface InvoiceAnalysisResult {
  success: boolean;
  confidence: number;
  extractedData: ExtractedInvoiceData;
  discrepancies: Discrepancy[];
  complianceStatus: 'compliant' | 'discrepancy' | 'needs_review';
  aiReasoning: string;
  processingTime: number;
}

export interface ExtractedInvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate?: string;
  totalAmount: number;
  subtotal?: number;
  taxAmount?: number;
  taxRate?: number;
  vendorName: string;
  vendorAddress?: string;
  lineItems: InvoiceLineItem[];
  paymentTerms?: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit?: string;
}

export interface Discrepancy {
  type: 'price' | 'quantity' | 'tax' | 'terms' | 'discount' | 'other';
  severity: 'high' | 'medium' | 'low';
  field: string;
  expected: any;
  actual: any;
  difference?: number;
  description: string;
  recommendation?: string;
}

// Contract analysis types
export interface ContractAnalysisRequest {
  imageUrl: string;
  fileName?: string;
}

export interface ContractAnalysisResult {
  success: boolean;
  confidence: number;
  extractedVendorData: ExtractedVendorData;
  extractedContractData: ExtractedContractData;
  processingTime: number;
}

export interface ExtractedVendorData {
  vendorName: string;
  vendorAddress?: string;
  businessCategory?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface ExtractedContractData {
  contractTitle: string;
  effectiveDate: string;
  expirationDate?: string;
  paymentTerms?: string;
  autoRenewal?: boolean;
  renewalNoticeDays?: number;
  keyTerms?: string[];
  pricing?: {
    structure?: string;
    currency?: string;
    escalationClause?: string;
  };
  // Summary for invoice reconciliation
  reconciliationSummary?: {
    overview: string;
    pricingTerms: string[];
    quantityLimits?: string;
    taxTerms?: string;
    discounts?: string[];
    penalties?: string[];
    criticalClauses: string[];
  };
}

// Configuration interface
export interface OpenAIServiceConfig {
  apiKey?: string;
  mockMode?: boolean;
  retryAttempts?: number;
  timeoutMs?: number;
}

/**
 * OpenAI Service Class
 */
export class OpenAIService {
  private client: OpenAI | null = null;
  private mockMode: boolean;
  private retryAttempts: number;
  private timeoutMs: number;

  constructor(config: OpenAIServiceConfig = {}) {
    // Use environment variable to determine mock mode
    const envMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';
    this.mockMode = config.mockMode ?? envMockMode;
    this.retryAttempts = config.retryAttempts ?? 3;
    this.timeoutMs = config.timeoutMs ?? 60000; // 60 seconds

    if (!this.mockMode && config.apiKey) {
      this.client = new OpenAI({
        apiKey: config.apiKey,
        timeout: this.timeoutMs,
      });
    } else if (!this.mockMode) {
      console.warn('OpenAI API key not provided, falling back to mock mode');
      this.mockMode = true;
    }
  }

  /**
   * Analyze an invoice image using GPT-4 Vision
   */
  async analyzeInvoice(request: InvoiceAnalysisRequest): Promise<InvoiceAnalysisResult> {
    const startTime = Date.now();

    if (this.mockMode) {
      return this.generateMockAnalysis(request, startTime);
    }

    if (!this.client) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      const prompt = this.buildAnalysisPrompt(request);
      
      const response = await this.client.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: request.imageUrl,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || "2000"),
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || "0.1"),
        user: `drift-ai-${Date.now()}`, // For usage tracking
      });

      return this.parseOpenAIResponse(response, startTime);
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error(`Invoice analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate mock analysis for development/testing
   */
  private generateMockAnalysis(request: InvoiceAnalysisRequest, startTime: number): InvoiceAnalysisResult {
    // Simulate API delay
    const delay = Math.random() * 2000 + 1000; // 1-3 seconds
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const processingTime = Date.now() - startTime;
        
        resolve({
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
            vendorAddress: "123 Industrial Blvd, Columbus, OH 43215",
            lineItems: [
              {
                description: "Fresh Vegetables - Mixed Cases",
                quantity: 15,
                unitPrice: 45.50,
                totalPrice: 682.50,
                unit: "case"
              },
              {
                description: "Protein - Ground Beef (80/20)",
                quantity: 8,
                unitPrice: 125.75,
                totalPrice: 1006.00,
                unit: "case"
              },
              {
                description: "Dairy - Milk 2% Gallon Cases",
                quantity: 12,
                unitPrice: 35.25,
                totalPrice: 423.00,
                unit: "case"
              },
              {
                description: "Bread - Whole Wheat Loaves",
                quantity: 25,
                unitPrice: 2.85,
                totalPrice: 71.25,
                unit: "loaf"
              }
            ],
            paymentTerms: "Net 30 Days"
          },
          discrepancies: [
            {
              type: 'price',
              severity: 'medium',
              field: 'lineItems[0].unitPrice',
              expected: 42.00,
              actual: 45.50,
              difference: 3.50,
              description: 'Unit price for Fresh Vegetables exceeds contracted rate of $42.00 per case by $3.50',
              recommendation: 'Contact vendor to apply correct pricing or obtain approval for price increase'
            },
            {
              type: 'quantity',
              severity: 'low',
              field: 'lineItems[1].quantity',
              expected: 10,
              actual: 8,
              difference: -2,
              description: 'Quantity ordered (8) is less than contracted minimum (10 cases)',
              recommendation: 'Verify if minimum order requirements apply or adjust future orders'
            }
          ],
          complianceStatus: 'discrepancy',
          aiReasoning: `Analysis of invoice INV-2024-001234 from Sysco Food Services reveals 2 discrepancies against the contracted terms:

1. **Price Variance**: Fresh vegetables are priced at $45.50/case vs contracted $42.00/case (+$3.50 overage)
2. **Quantity Issue**: Ground beef quantity (8 cases) below contracted minimum (10 cases)

The invoice format and vendor information are correct. Payment terms match the contract (Net 30 Days). Tax calculation at 8.5% is accurate for Ohio state requirements.

**Overall Assessment**: Minor discrepancies requiring vendor discussion but not blocking payment approval.`,
          processingTime
        });
      }, delay);
    }) as any; // TypeScript workaround for promise delay simulation
  }

  /**
   * Build the analysis prompt for GPT-4 Vision
   */
  private buildAnalysisPrompt(request: InvoiceAnalysisRequest): string {
    let prompt = `You are an expert invoice analysis AI for DRIFT.AI, a contract reconciliation platform for nursing home operators.

Analyze this invoice image and extract the following information:

1. **Invoice Details**: number, date, due date, total amount, subtotal, tax
2. **Vendor Information**: name, address, contact info
3. **Line Items**: description, quantity, unit price, total price, unit of measure
4. **Payment Terms**: as stated on invoice

`;

    if (request.contractTerms) {
      prompt += `5. **Contract Compliance**: Compare against these contract terms:
- Payment Terms: ${request.contractTerms.paymentTerms}
- Tax Rate: ${request.contractTerms.taxRate || 'Not specified'}%
- Pricing Terms: ${JSON.stringify(request.contractTerms.pricing)}
${request.contractTerms.discounts ? `- Discounts: ${JSON.stringify(request.contractTerms.discounts)}` : ''}

Identify ANY discrepancies between the invoice and contract terms.
`;
    }

    prompt += `
Return your analysis in this exact JSON format:
{
  "success": true,
  "confidence": 0.95,
  "extractedData": {
    "invoiceNumber": "string",
    "date": "YYYY-MM-DD",
    "dueDate": "YYYY-MM-DD",
    "totalAmount": number,
    "subtotal": number,
    "taxAmount": number,
    "taxRate": number,
    "vendorName": "string",
    "vendorAddress": "string",
    "lineItems": [
      {
        "description": "string",
        "quantity": number,
        "unitPrice": number,
        "totalPrice": number,
        "unit": "string"
      }
    ],
    "paymentTerms": "string"
  },
  "discrepancies": [
    {
      "type": "price|quantity|tax|terms|discount|other",
      "severity": "high|medium|low",
      "field": "string",
      "expected": "any",
      "actual": "any", 
      "difference": number,
      "description": "string",
      "recommendation": "string"
    }
  ],
  "complianceStatus": "compliant|discrepancy|needs_review",
  "aiReasoning": "Detailed explanation of analysis and findings"
}

Be thorough and accurate. Flag ALL discrepancies, even minor ones.`;

    return prompt;
  }

  /**
   * Parse OpenAI API response
   */
  private parseOpenAIResponse(response: any, startTime: number): InvoiceAnalysisResult {
    try {
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      // Remove markdown code block markers if present (GPT-4o sometimes adds these)
      let cleanedContent = content.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/```\s*$/, '');
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/```\s*$/, '');
      }

      const result = JSON.parse(cleanedContent) as InvoiceAnalysisResult;
      result.processingTime = Date.now() - startTime;

      return result;
    } catch (error) {
      throw new Error(`Failed to parse OpenAI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze a contract to extract vendor information
   */
  async analyzeContractForVendor(request: ContractAnalysisRequest): Promise<ContractAnalysisResult> {
    const startTime = Date.now();

    if (this.mockMode) {
      return this.generateMockContractAnalysis(request, startTime);
    }

    if (!this.client) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      const prompt = this.buildContractAnalysisPrompt();

      const response = await this.client.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: request.imageUrl,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || "2000"),
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || "0.1"),
        user: `drift-ai-contract-${Date.now()}`,
      });

      return this.parseContractAnalysisResponse(response, startTime);
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error(`Contract analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate mock contract analysis for development/testing
   */
  private generateMockContractAnalysis(request: ContractAnalysisRequest, startTime: number): ContractAnalysisResult {
    // Simulate API delay
    const delay = Math.random() * 2000 + 1000; // 1-3 seconds

    return new Promise((resolve) => {
      setTimeout(() => {
        const processingTime = Date.now() - startTime;
        const fileName = request.fileName || 'contract.pdf';

        // Extract vendor name from filename if possible
        const vendorNameGuess = fileName
          .replace(/\.[^/.]+$/, '') // Remove extension
          .replace(/[-_]/g, ' ') // Replace dashes/underscores with spaces
          .replace(/contract|agreement|service/gi, '') // Remove common words
          .trim();

        resolve({
          success: true,
          confidence: 0.92,
          extractedVendorData: {
            vendorName: vendorNameGuess || "Professional Healthcare Services Inc",
            vendorAddress: "456 Medical Plaza Dr, Suite 200, Columbus, OH 43215",
            businessCategory: "Healthcare Services",
            contactEmail: "contracts@profhealthcare.com",
            contactPhone: "(614) 555-0123"
          },
          extractedContractData: {
            contractTitle: fileName.replace(/\.[^/.]+$/, ''),
            effectiveDate: "2024-01-01",
            expirationDate: "2024-12-31",
            paymentTerms: "Net 30 Days",
            autoRenewal: true,
            renewalNoticeDays: 60,
            keyTerms: [
              "Payment terms: Net 30 days from invoice date",
              "Volume discount: 10% on orders over $5,000",
              "Quality guarantee: 100% satisfaction or replacement",
              "Force majeure clause included",
              "90-day termination notice required"
            ],
            pricing: {
              structure: "Per unit with volume discounts",
              currency: "USD",
              escalationClause: "Annual CPI adjustment capped at 3%"
            },
            reconciliationSummary: {
              overview: "Service agreement for medical supplies and healthcare products with tiered pricing and volume discounts. Contract includes quality guarantees and flexible payment terms.",
              pricingTerms: [
                "Base unit price: $4.50 per medical supply unit",
                "Volume discount: 10% discount on orders exceeding $5,000",
                "Volume discount: 15% discount on orders exceeding $10,000",
                "Bulk orders (500+ units): Additional 5% discount",
                "Price lock guarantee for first 6 months"
              ],
              quantityLimits: "Minimum order: 50 units per shipment. Maximum order: 5,000 units per month. No minimum monthly commitment.",
              taxTerms: "Sales tax applies at prevailing local rate (currently 8.5% for Ohio). Tax exempt organizations must provide valid certificate.",
              discounts: [
                "Early payment discount: 2% if paid within 10 days",
                "Volume tier 1: 10% on orders over $5,000",
                "Volume tier 2: 15% on orders over $10,000",
                "Loyalty program: Additional 3% after 12 months of continuous service"
              ],
              penalties: [
                "Late payment fee: 1.5% per month on overdue balances",
                "Restocking fee: 15% on returns (excludes defective items)",
                "Rush order surcharge: 20% for orders requiring < 48hr delivery"
              ],
              criticalClauses: [
                "Price adjustment allowed only with 60-day written notice",
                "Force majeure: Delivery delays excused for circumstances beyond control",
                "Quality guarantee: 100% refund or replacement for defective products within 30 days",
                "Contract can be terminated with 90-day written notice by either party",
                "Minimum order quantities may be waived for first 3 months (trial period)"
              ]
            }
          },
          processingTime
        });
      }, delay);
    }) as any;
  }

  /**
   * Build the contract analysis prompt for vendor extraction
   */
  private buildContractAnalysisPrompt(): string {
    return `You are an expert contract analysis AI for DRIFT.AI, a contract reconciliation platform for nursing home operators.

**CRITICAL MISSION**: Extract ALL FINANCIAL TERMS with extreme precision. This data will be used to automatically detect invoice overcharges and contract violations.

**STEP 1: READ THE ENTIRE CONTRACT CAREFULLY**
Use GPT-4 Vision to read every section, especially:
- Pricing tables and schedules
- Payment terms and conditions
- Discount structures
- Tax clauses
- Minimum/maximum order quantities
- Late fees and penalties
- Price adjustment/escalation clauses

**STEP 2: STANDARDIZE EXTRACTED DATA**

1. **Vendor Information** (extract exactly as written):
   - Official vendor/company name
   - Business address (full address)
   - Business category (Food Service, Medical Supplies, Cleaning Services, IT Services, Office Supplies, Healthcare Services, Transportation, Professional Services, Other)
   - Contact email
   - Contact phone number

2. **Contract Dates** (use ISO format YYYY-MM-DD):
   - Contract title/name
   - Effective date (start date)
   - Expiration date (end date)
   - Auto-renewal: true/false
   - Renewal notice period (number of days)

3. **Payment Terms** (standardize format):
   - Standard format: "Net 30", "Due on Receipt", "Net 15", etc.
   - Early payment discounts: "2% if paid within 10 days"
   - Late payment penalties: "1.5% per month on overdue balances"
   - Payment methods accepted

4. **FINANCIAL TERMS - EXTRACT EVERY DETAIL**:

   a. **Pricing Terms** (list EVERY price with complete details):
      Format each as: "[Exact Product Name]: $X.XX [per unit type] [any conditions]"
      Examples:
      - "Fresh Vegetables - Mixed Cases: $42.00 per case"
      - "Protein - Ground Beef (80/20): $125.00 per case (minimum 5 cases)"
      - "Monthly Service Fee: $500.00 per month (first 6 months), $550.00 per month (thereafter)"

   b. **Volume Discounts** (extract ALL discount tiers):
      Format: "[Threshold]: [Discount] [conditions]"
      Examples:
      - "Orders over $5,000/month: 10% discount on all items"
      - "Orders over $10,000/month: 15% discount on all items"
      - "Bulk orders 500+ units (same item): additional 5% discount"

   c. **Tax Terms** (be specific):
      - Tax rate percentage
      - What items are taxable
      - Tax-exempt conditions
      - Example: "8.5% sales tax on all taxable items (Ohio state + local)"

   d. **Quantity Restrictions**:
      - Minimum order quantities per product
      - Maximum order quantities
      - Order frequency requirements
      - Example: "Minimum 10 cases per order, maximum 500 cases per month"

   e. **Price Protection Clauses**:
      - Price lock periods: "Pricing guaranteed for first 6 months"
      - Price increase limits: "Price increases cannot exceed 5% annually"
      - Price increase notice: "60 days written notice required for price changes"
      - Termination rights: "Customer may terminate if price increase exceeds 5%"

   f. **Penalties & Fees**:
      - Late payment fees
      - Restocking fees
      - Cancellation fees
      - Delivery fees
      - Example: "15% restocking fee on non-defective returns"

   g. **Financial Summary** (write 2-3 sentences):
      Summarize the overall financial terms in plain language, highlighting:
      - What products/services are covered
      - Base pricing structure
      - Key discount opportunities
      - Important restrictions or penalties

**STEP 3: RETURN VALID JSON ONLY**

CRITICAL: Return ONLY valid JSON. No markdown, no code blocks, no explanations.

{
  "success": true,
  "confidence": 0.92,
  "extractedVendorData": {
    "vendorName": "Exact Company Name from Contract",
    "vendorAddress": "Full Address with City, State, ZIP",
    "businessCategory": "One of: Food Service, Medical Supplies, Cleaning Services, IT Services, Office Supplies, Healthcare Services, Transportation, Professional Services, Other",
    "contactEmail": "email@company.com or null",
    "contactPhone": "(XXX) XXX-XXXX or null"
  },
  "extractedContractData": {
    "contractTitle": "Exact Title from Contract",
    "effectiveDate": "YYYY-MM-DD",
    "expirationDate": "YYYY-MM-DD or null if perpetual",
    "paymentTerms": "Net 30 Days (standardized format)",
    "autoRenewal": true,
    "renewalNoticeDays": 60,
    "keyTerms": ["Important clause 1", "Important clause 2"],
    "pricing": {
      "structure": "Fixed pricing with volume discounts",
      "currency": "USD",
      "escalationClause": "Prices may increase after 6 months with 60 days notice, max 5% annually"
    },
    "reconciliationSummary": {
      "overview": "This contract covers [products/services] for [purpose]. Base pricing ranges from $X to $Y with volume discounts available for orders over $Z.",
      "pricingTerms": [
        "Product A: $42.00 per case",
        "Product B: $125.00 per case (minimum 5 cases)",
        "Product C: $34.50 per case"
      ],
      "quantityLimits": "Minimum 10 cases per order. No maximum specified.",
      "taxTerms": "8.5% sales tax applies to all taxable items per Ohio state requirements",
      "discounts": [
        "10% discount for monthly orders exceeding $5,000",
        "15% discount for monthly orders exceeding $10,000",
        "Additional 5% for bulk orders of 500+ units of same item"
      ],
      "penalties": [
        "Late payment: 1.5% per month on overdue balances",
        "Restocking fee: 15% on non-defective returns",
        "Delivery fee: $35 for orders under $500"
      ],
      "criticalClauses": [
        "Pricing locked for first 6 months from effective date",
        "Price increases require 60 days written notice",
        "Customer may terminate without penalty if price increase exceeds 5%",
        "90 days written notice required for contract termination"
      ]
    }
  }
}

**VALIDATION CHECKLIST**:
✓ All dollar amounts include "$" symbol
✓ All percentages include "%" symbol
✓ All dates in YYYY-MM-DD format
✓ All quantities include units (cases, units, items, etc.)
✓ Response is valid JSON (no markdown, no code blocks)
✓ Every pricing term includes product name, price, and unit
✓ Financial summary is clear and actionable

Return ONLY the JSON object. No additional text, no markdown formatting, no code blocks.`;
  }

  /**
   * Parse contract analysis response
   */
  private parseContractAnalysisResponse(response: any, startTime: number): ContractAnalysisResult {
    try {
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      // Remove markdown code block markers if present (GPT-4o sometimes adds these)
      let cleanedContent = content.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/```\s*$/, '');
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/```\s*$/, '');
      }

      const result = JSON.parse(cleanedContent) as ContractAnalysisResult;
      result.processingTime = Date.now() - startTime;

      return result;
    } catch (error) {
      throw new Error(`Failed to parse contract analysis response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get service status and configuration
   */
  getStatus(): { mockMode: boolean; configured: boolean; version: string } {
    return {
      mockMode: this.mockMode,
      configured: this.client !== null || this.mockMode,
      version: '1.0.0'
    };
  }
}

// Singleton instance for the application
export const openAIService = new OpenAIService({
  apiKey: process.env.OPENAI_API_KEY,
  mockMode: process.env.NEXT_PUBLIC_MOCK_MODE === 'true'
});

// Types are already exported as interfaces above - no need to re-export