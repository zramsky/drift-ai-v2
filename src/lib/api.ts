import { mockApiClient } from './mock-data'
import { UserState } from '@/hooks/use-user-state'
import type { DashboardStats } from '@/types/dashboard'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
// Changed to use real API endpoints by default
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'; // Use mock data only if explicitly set to true

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface Vendor {
  id: string;
  name: string;
  canonicalName: string;
  businessDescription?: string;
  active: boolean;
  totalInvoices: number;
  totalDiscrepancies: number;
  totalSavings: number;
  createdAt: string;
  updatedAt: string;
}

export interface Contract {
  id: string;
  vendorId: string;
  vendor?: Vendor;
  fileName: string;
  fileUrl: string;
  effectiveDate: string;
  renewalDate?: string;
  endDate?: string;
  status: 'active' | 'inactive' | 'needs_review' | 'expired';
  terms?: any;
  extractedText?: string;
  // Enhanced for document viewing
  totalPages?: number;
  pdfBlob?: Blob;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ContractExtractionData {
  primaryVendorName: string;
  dbaDisplayName?: string;
  effectiveDate: string;
  renewalEndDate?: string;
  category?: string;
  contractReconciliationSummary: string;
}

export interface ProcessingJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'timeout';
  progress: number;
  result?: ContractExtractionData;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorCreationRequest {
  primaryVendorName: string;
  dbaDisplayName?: string;
  effectiveDate: string;
  renewalEndDate?: string;
  category?: string;
  contractFile: File;
}

export interface Invoice {
  id: string;
  vendorId: string;
  vendor?: Vendor;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  fileName: string;
  fileUrl: string;
  status: 'pending' | 'reconciled' | 'flagged' | 'approved' | 'rejected';
  totalAmount: number;
  subtotal: number;
  taxAmount?: number;
  lineItems: Array<{
    description: string;
    quantity: number;
    rate: number;
    unit: string;
    total: number;
  }>;
  fees?: Array<{
    type: 'percent' | 'fixed';
    description: string;
    amount: number;
  }>;
  extractedText?: string;
  // Enhanced for document viewing
  totalPages?: number;
  pdfBlob?: Blob;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

// Evidence anchor types for PRD requirements
export interface EvidenceAnchor {
  doc: 'contract' | 'invoice';
  page: number;
  bbox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  quoted_text: string;
}

export interface Finding {
  id: string;
  type: 'high' | 'medium' | 'low';
  description: string;
  evidence_anchor: EvidenceAnchor;
  amount?: number;
}

export interface InvoiceReportSummary {
  narrative: string;
  evidence_anchors: EvidenceAnchor[];
  findings: Finding[];
  highest_priority: 'high' | 'medium' | 'low';
  total_variance: number;
  reviewed: boolean;
}

export interface ReconciliationReport {
  id: string;
  invoiceId: string;
  contractId: string;
  hasDiscrepancies: boolean;
  totalDiscrepancyAmount: number;
  discrepancies: Array<{
    type: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    expectedValue: any;
    actualValue: any;
    amount: number;
    lineItemIndex?: number;
    evidence_anchor?: EvidenceAnchor;
  }>;
  checklist: Array<{
    item: string;
    passed: boolean;
    details: string;
    confidence: number;
  }>;
  rationaleText: string;
  // Enhanced for PRD requirements
  summary?: InvoiceReportSummary;
  findings?: Finding[];
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<ApiResponse<T>> {
    const maxRetries = 3;
    const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff, max 10s

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle different HTTP status codes
      if (!response.ok) {
        const errorMessage = await this.extractErrorMessage(response);
        
        // Retry on 5xx server errors or network issues
        if (response.status >= 500 && retryCount < maxRetries) {
          console.warn(`Request failed with ${response.status}, retrying in ${retryDelay}ms...`);
          await this.delay(retryDelay);
          return this.request<T>(endpoint, options, retryCount + 1);
        }

        return {
          error: errorMessage,
          status: response.status,
        };
      }

      const contentType = response.headers.get('Content-Type');
      let data: T;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text() as unknown as T;
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      // Handle network errors, timeouts, and other fetch failures
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            error: 'Request timed out. Please check your connection and try again.',
            status: 0,
          };
        }

        if (error.message.includes('fetch')) {
          // Network error - retry if we haven't exceeded max retries
          if (retryCount < maxRetries) {
            console.warn(`Network error, retrying in ${retryDelay}ms...`, error.message);
            await this.delay(retryDelay);
            return this.request<T>(endpoint, options, retryCount + 1);
          }

          return {
            error: 'Network error. Please check your internet connection and try again.',
            status: 0,
          };
        }
      }

      return {
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 0,
      };
    }
  }

  private async extractErrorMessage(response: Response): Promise<string> {
    try {
      const contentType = response.headers.get('Content-Type');
      
      if (contentType?.includes('application/json')) {
        const errorData = await response.json();
        return errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
      } else {
        const textError = await response.text();
        return textError || `HTTP ${response.status}: ${response.statusText}`;
      }
    } catch {
      return `HTTP ${response.status}: ${response.statusText}`;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Vendor API
  async getVendors(): Promise<ApiResponse<Vendor[]>> {
    if (USE_MOCK_DATA) {
      return mockApiClient.getVendors();
    }
    return this.request<Vendor[]>('/vendors');
  }

  async getVendor(id: string): Promise<ApiResponse<Vendor>> {
    if (USE_MOCK_DATA) {
      return mockApiClient.getVendor(id);
    }
    return this.request<Vendor>(`/vendors/${id}`);
  }

  async createVendor(vendor: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt' | 'totalInvoices' | 'totalDiscrepancies' | 'totalSavings'>): Promise<ApiResponse<Vendor>> {
    return this.request<Vendor>('/vendors', {
      method: 'POST',
      body: JSON.stringify(vendor),
    });
  }

  async updateVendor(id: string, vendor: Partial<Vendor>): Promise<ApiResponse<Vendor>> {
    return this.request<Vendor>(`/vendors/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(vendor),
    });
  }

  async deleteVendor(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/vendors/${id}`, {
      method: 'DELETE',
    });
  }

  async getVendorStats(id: string): Promise<ApiResponse<{
    totalInvoices: number;
    totalContracts: number;
    totalDiscrepancies: number;
    totalSavings: number;
    averageSavingsPerInvoice: number;
  }>> {
    return this.request(`/vendors/${id}/stats`);
  }

  // Vendor name uniqueness check
  async checkVendorNameUniqueness(name: string): Promise<ApiResponse<{
    isUnique: boolean;
    existingVendorId?: string;
  }>> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // Simulate checking - return unique for most names
          const isUnique = name.toLowerCase() !== 'acme corp' && name.toLowerCase() !== 'tech solutions'
          resolve({
            data: {
              isUnique,
              existingVendorId: !isUnique ? '1' : undefined
            },
            status: 200
          });
        }, 300);
      });
    }

    return this.request<{
      isUnique: boolean;
      existingVendorId?: string;
    }>('/vendors/check-name', {
      method: 'POST',
      body: JSON.stringify({ name: name.trim() })
    });
  }

  // Invoice approval/rejection methods
  async approveInvoice(invoiceId: string): Promise<ApiResponse<Invoice>> {
    if (USE_MOCK_DATA) {
      const mockInvoice: Invoice = {
        id: invoiceId,
        vendorId: '1',
        invoiceNumber: 'INV-001',
        invoiceDate: '2024-01-15',
        dueDate: '2024-02-15',
        totalAmount: 1250.00,
        vendor: { 
          id: '1', 
          name: 'Acme Corp', 
          canonicalName: 'Acme Corporation',
          active: true,
          totalInvoices: 5,
          totalDiscrepancies: 1,
          totalSavings: 250.00,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T00:00:00Z'
        },
        fileName: 'acme-invoice-001.pdf',
        fileUrl: 'https://example.com/invoices/acme-001.pdf',
        status: 'approved' as const,
        subtotal: 1000.00,
        lineItems: [],
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      };
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: mockInvoice, status: 200 });
        }, 1000);
      });
    }
    
    return this.request<Invoice>(`/invoices/${invoiceId}/approve`, {
      method: 'POST'
    });
  }

  async rejectInvoice(invoiceId: string, reason: string): Promise<ApiResponse<Invoice>> {
    if (USE_MOCK_DATA) {
      const mockInvoice: Invoice = {
        id: invoiceId,
        vendorId: '1',
        invoiceNumber: 'INV-001',
        invoiceDate: '2024-01-15',
        dueDate: '2024-02-15',
        totalAmount: 1250.00,
        vendor: { 
          id: '1', 
          name: 'Acme Corp', 
          canonicalName: 'Acme Corporation',
          active: true,
          totalInvoices: 5,
          totalDiscrepancies: 1,
          totalSavings: 250.00,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T00:00:00Z'
        },
        fileName: 'acme-invoice-001.pdf',
        fileUrl: 'https://example.com/invoices/acme-001.pdf',
        status: 'rejected' as const,
        subtotal: 1000.00,
        lineItems: [],
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z'
      };
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: mockInvoice, status: 200 });
        }, 1000);
      });
    }
    
    return this.request<Invoice>(`/invoices/${invoiceId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  // Contract API
  async getContracts(vendorId?: string, status?: string): Promise<ApiResponse<Contract[]>> {
    if (USE_MOCK_DATA) {
      return mockApiClient.getContracts(vendorId);
    }
    const params = new URLSearchParams();
    if (vendorId) params.append('vendorId', vendorId);
    if (status) params.append('status', status);
    
    return this.request<Contract[]>(`/contracts${params.toString() ? `?${params.toString()}` : ''}`);
  }

  async getContract(id: string): Promise<ApiResponse<Contract>> {
    if (USE_MOCK_DATA) {
      return mockApiClient.getContract(id);
    }
    return this.request<Contract>(`/contracts/${id}`);
  }

  async uploadContract(vendorId: string, file: File): Promise<ApiResponse<{ contractId: string; jobId: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseURL}/contracts/upload?vendorId=${vendorId}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        return {
          error: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        };
      }

      const data = await response.json();
      return {
        data,
        status: response.status,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Upload failed',
        status: 0,
      };
    }
  }

  async updateContractStatus(id: string, status: Contract['status']): Promise<ApiResponse<Contract>> {
    return this.request<Contract>(`/contracts/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async createContract(vendorId: string, contract: {
    fileName: string;
    fileUrl?: string;
    effectiveDate: string;
    renewalDate?: string;
    endDate?: string;
    status?: Contract['status'];
    terms?: any;
    extractedText?: string;
    metadata?: any;
  }): Promise<ApiResponse<Contract>> {
    return this.request<Contract>(`/vendors/${vendorId}/contracts`, {
      method: 'POST',
      body: JSON.stringify(contract),
    });
  }

  // Invoice API
  async getInvoices(vendorId?: string, status?: string): Promise<ApiResponse<Invoice[]>> {
    if (USE_MOCK_DATA) {
      return mockApiClient.getInvoices(vendorId, status);
    }
    const params = new URLSearchParams();
    if (vendorId) params.append('vendorId', vendorId);
    if (status) params.append('status', status);
    
    return this.request<Invoice[]>(`/invoices${params.toString() ? `?${params.toString()}` : ''}`);
  }

  async getInvoice(id: string): Promise<ApiResponse<Invoice>> {
    if (USE_MOCK_DATA) {
      return mockApiClient.getInvoice(id);
    }
    return this.request<Invoice>(`/invoices/${id}`);
  }

  async uploadInvoice(vendorId: string, file: File): Promise<ApiResponse<{ invoiceId: string; jobId: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseURL}/invoices/upload?vendorId=${vendorId}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        return {
          error: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        };
      }

      const data = await response.json();
      return {
        data,
        status: response.status,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Upload failed',
        status: 0,
      };
    }
  }

  async createInvoice(vendorId: string, invoice: {
    invoiceNumber: string;
    invoiceDate: string;
    dueDate?: string;
    fileName: string;
    fileUrl?: string;
    status?: Invoice['status'];
    totalAmount: number;
    subtotal: number;
    taxAmount?: number;
    lineItems: Array<{
      description: string;
      quantity: number;
      rate: number;
      unit: string;
      total: number;
    }>;
    fees?: Array<{
      type: 'percent' | 'fixed';
      description: string;
      amount: number;
    }>;
    extractedText?: string;
    metadata?: any;
  }): Promise<ApiResponse<Invoice>> {
    return this.request<Invoice>(`/vendors/${vendorId}/invoices`, {
      method: 'POST',
      body: JSON.stringify(invoice),
    });
  }

  async getReconciliationReport(invoiceId: string): Promise<ApiResponse<ReconciliationReport>> {
    if (USE_MOCK_DATA) {
      return mockApiClient.getReconciliationReport(invoiceId);
    }
    return this.request<ReconciliationReport>(`/invoices/${invoiceId}/reconciliation`);
  }



  async getInvoiceStats(vendorId?: string, dateRange?: { from: Date, to: Date }): Promise<ApiResponse<{
    total: number;
    pending: number;
    reconciled: number;
    flagged: number;
    approved: number;
    rejected: number;
    totalAmount: number;
    totalDiscrepancies: number;
    totalSavings: number;
    lastUpdated?: string;
  }>> {
    if (USE_MOCK_DATA) {
      return mockApiClient.getInvoiceStats(vendorId, dateRange);
    }
    const params = new URLSearchParams();
    if (vendorId) params.append('vendorId', vendorId);
    if (dateRange) {
      params.append('fromDate', dateRange.from.toISOString());
      params.append('toDate', dateRange.to.toISOString());
    }
    return this.request(`/invoices/stats${params.toString() ? `?${params.toString()}` : ''}`);
  }
  
  // Enhanced KPI data structures
  async getPriorityInvoices(dateRange?: { from: Date, to: Date }): Promise<ApiResponse<{
    high: number;
    medium: number;
    low: number;
    overdue: number;
    total: number;
  }>> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              high: 8,
              medium: 15,
              low: 23,
              overdue: 3,
              total: 46
            },
            status: 200
          })
        }, 300)
      })
    }
    const params = new URLSearchParams();
    if (dateRange) {
      params.append('fromDate', dateRange.from.toISOString());
      params.append('toDate', dateRange.to.toISOString());
    }
    return this.request(`/dashboard/priority-invoices${params.toString() ? `?${params.toString()}` : ''}`);
  }

  async getUpcomingRenewals(daysAhead = 90): Promise<ApiResponse<Array<{
    id: string;
    vendorName: string;
    renewalDate: string;
    daysUntilRenewal: number;
    status: 'expired' | 'due_soon' | 'future';
    value?: number;
    category?: string;
  }>>> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockRenewals = [
            {
              id: '1',
              vendorName: 'Acme Corp',
              renewalDate: '2024-02-15',
              daysUntilRenewal: 18,
              status: 'due_soon' as const,
              value: 45000,
              category: 'Technology'
            },
            {
              id: '2', 
              vendorName: 'Office Supplies Co',
              renewalDate: '2024-01-30',
              daysUntilRenewal: -3,
              status: 'expired' as const,
              value: 12000,
              category: 'Office'
            },
            {
              id: '3',
              vendorName: 'Legal Services LLC',
              renewalDate: '2024-03-20',
              daysUntilRenewal: 52,
              status: 'future' as const,
              value: 75000,
              category: 'Legal'
            },
            {
              id: '4',
              vendorName: 'Cloud Services Inc',
              renewalDate: '2024-02-28',
              daysUntilRenewal: 31,
              status: 'future' as const,
              value: 28000,
              category: 'Technology'
            },
            {
              id: '5',
              vendorName: 'Marketing Agency',
              renewalDate: '2024-02-05',
              daysUntilRenewal: 8,
              status: 'due_soon' as const,
              value: 35000,
              category: 'Marketing'
            }
          ]
          resolve({
            data: mockRenewals,
            status: 200
          })
        }, 400)
      })
    }
    return this.request(`/dashboard/upcoming-renewals?daysAhead=${daysAhead}`);
  }

  // Dashboard-specific API endpoints
  async getDashboardStats(dateRange?: { from: Date, to: Date }): Promise<ApiResponse<DashboardStats>> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              totalDrift: 127500,
              totalProcessed: 1261,
              activeVendors: 12,
              highPriorityFindings: 8,
              attentionRequired: 3,
              monthlySavings: 15750,
              priorityBreakdown: {
                high: 8,
                medium: 15,
                low: 23,
                overdue: 3
              },
              processingRate: {
                daily: 15,
                weekly: 105,
                monthly: 450
              },
              vendorGrowth: {
                thisMonth: 12,
                lastMonth: 10,
                percentChange: 20
              },
              upcomingRenewals: [
                {
                  id: '1',
                  vendorName: 'Acme Corp',
                  renewalDate: '2024-02-15',
                  daysUntilRenewal: 18,
                  status: 'due_soon' as const
                },
                {
                  id: '2',
                  vendorName: 'Office Supplies Co',
                  renewalDate: '2024-01-30',
                  daysUntilRenewal: -3,
                  status: 'expired' as const
                },
                {
                  id: '3',
                  vendorName: 'Legal Services LLC',
                  renewalDate: '2024-03-20',
                  daysUntilRenewal: 52,
                  status: 'future' as const
                }
              ],
              previousPeriodComparisons: {
                driftChange: 12.5,
                processedChange: 8.3,
                vendorsChange: -2.1
              },
              lastUpdated: new Date().toISOString()
            },
            status: 200
          })
        }, 800)
      })
    }
    const params = new URLSearchParams();
    if (dateRange) {
      params.append('fromDate', dateRange.from.toISOString());
      params.append('toDate', dateRange.to.toISOString());
    }
    return this.request(`/dashboard/stats${params.toString() ? `?${params.toString()}` : ''}`);
  }

  // Enhanced vendor analytics
  async getVendorAnalytics(dateRange?: { from: Date, to: Date }): Promise<ApiResponse<{
    totalVendors: number;
    activeVendors: number;
    inactiveVendors: number;
    newVendorsThisMonth: number;
    averageContractValue: number;
    topVendorsByValue: Array<{
      id: string;
      name: string;
      contractValue: number;
      category: string;
    }>;
    vendorsByCategory: Array<{
      category: string;
      count: number;
      totalValue: number;
    }>;
  }>> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              totalVendors: 12,
              activeVendors: 10,
              inactiveVendors: 2,
              newVendorsThisMonth: 2,
              averageContractValue: 25000,
              topVendorsByValue: [
                { id: '1', name: 'Legal Services LLC', contractValue: 75000, category: 'Legal' },
                { id: '2', name: 'Acme Corp', contractValue: 45000, category: 'Technology' },
                { id: '3', name: 'Marketing Agency', contractValue: 35000, category: 'Marketing' }
              ],
              vendorsByCategory: [
                { category: 'Technology', count: 4, totalValue: 120000 },
                { category: 'Legal', count: 2, totalValue: 90000 },
                { category: 'Marketing', count: 3, totalValue: 75000 },
                { category: 'Office', count: 3, totalValue: 45000 }
              ]
            },
            status: 200
          })
        }, 600)
      })
    }
    const params = new URLSearchParams();
    if (dateRange) {
      params.append('fromDate', dateRange.from.toISOString());
      params.append('toDate', dateRange.to.toISOString());
    }
    return this.request(`/dashboard/vendor-analytics${params.toString() ? `?${params.toString()}` : ''}`);
  }
  
  async getAttentionItems(dateRange?: { from: Date, to: Date }): Promise<ApiResponse<Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    amount?: number;
    priority: string;
    invoiceId?: string;
    contractId?: string;
    createdAt: string;
  }>>> {
    if (USE_MOCK_DATA) {
      return mockApiClient.getAttentionItems(dateRange);
    }
    const params = new URLSearchParams();
    if (dateRange) {
      params.append('fromDate', dateRange.from.toISOString());
      params.append('toDate', dateRange.to.toISOString());
    }
    return this.request(`/dashboard/attention${params.toString() ? `?${params.toString()}` : ''}`);
  }
  
  async getTopOffenders(limit = 10, dateRange?: { from: Date, to: Date }): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    category: string;
    totalVariance: number;
    issuesCount: number;
    monthlyVariances: number[];
    riskLevel: string;
  }>>> {
    if (USE_MOCK_DATA) {
      return mockApiClient.getTopOffenders(limit, dateRange);
    }
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (dateRange) {
      params.append('fromDate', dateRange.from.toISOString());
      params.append('toDate', dateRange.to.toISOString());
    }
    return this.request(`/dashboard/offenders${params.toString() ? `?${params.toString()}` : ''}`);
  }
  
  async getContractRenewals(daysAhead = 30): Promise<ApiResponse<Array<{
    id: string;
    vendorName: string;
    renewalDate: string;
    daysUntilRenewal: number;
    category: string;
    value: number;
    confidenceLevel: string;
    aiConfidence: number;
  }>>> {
    if (USE_MOCK_DATA) {
      return mockApiClient.getContractRenewals(daysAhead);
    }
    return this.request(`/dashboard/renewals?daysAhead=${daysAhead}`);
  }

  // Vendor creation from contract workflow
  async uploadContractForVendorCreation(file: File): Promise<ApiResponse<{ jobId: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseURL}/vendors/create-from-contract/upload`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        return {
          error: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        };
      }

      const data = await response.json();
      return {
        data,
        status: response.status,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Upload failed',
        status: 0,
      };
    }
  }

  async getProcessingJobStatus(jobId: string): Promise<ApiResponse<ProcessingJob>> {
    return this.request<ProcessingJob>(`/jobs/${jobId}`);
  }

  async createVendorFromContract(data: {
    primaryVendorName: string;
    dbaDisplayName?: string;
    effectiveDate: string;
    renewalEndDate?: string;
    category?: string;
    jobId: string;
  }): Promise<ApiResponse<{ vendorId: string; contractId: string }>> {
    return this.request<{ vendorId: string; contractId: string }>('/vendors/create-from-contract/confirm', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }


  async replaceVendorContract(vendorId: string, file: File): Promise<ApiResponse<{ jobId: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseURL}/vendors/${vendorId}/replace-contract`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        return {
          error: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        };
      }

      const data = await response.json();
      return {
        data,
        status: response.status,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Upload failed',
        status: 0,
      };
    }
  }

  async reprocessContract(contractId: string): Promise<ApiResponse<{ jobId: string }>> {
    return this.request<{ jobId: string }>(`/contracts/${contractId}/reprocess`, {
      method: 'POST',
    });
  }

  async getVendorAuditLog(vendorId: string): Promise<ApiResponse<Array<{
    id: string;
    action: string;
    field?: string;
    oldValue?: any;
    newValue?: any;
    userId: string;
    userEmail: string;
    timestamp: string;
    metadata?: any;
  }>>> {
    return this.request(`/vendors/${vendorId}/audit-log`);
  }

  // Evidence Management API
  async refreshEvidenceAnchors(invoiceId: string): Promise<ApiResponse<{
    updated_anchors: EvidenceAnchor[];
    summary: InvoiceReportSummary;
  }>> {
    if (USE_MOCK_DATA) {
      // Mock refresh functionality - simulate re-linking evidence
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              updated_anchors: [
                {
                  doc: 'contract',
                  page: 2,
                  bbox: { x: 100, y: 150, width: 150, height: 18 },
                  quoted_text: 'Payment Terms: Net 30'
                },
                {
                  doc: 'invoice',
                  page: 1,
                  bbox: { x: 150, y: 200, width: 200, height: 20 },
                  quoted_text: 'Unit Rate: $31.25/hour'
                }
              ],
              summary: {
                narrative: 'Updated evidence analysis shows invoice rate exceeds contract rate...',
                evidence_anchors: [],
                findings: [],
                highest_priority: 'high' as const,
                total_variance: 1750,
                reviewed: false
              }
            },
            status: 200
          })
        }, 2000)
      })
    }
    return this.request(`/invoices/${invoiceId}/refresh-evidence`, {
      method: 'POST',
    });
  }

  async updateEvidenceReviewStatus(invoiceId: string, reviewed: boolean): Promise<ApiResponse<ReconciliationReport>> {
    if (USE_MOCK_DATA) {
      // Mock implementation
      return new Promise((resolve) => {
        resolve({
          data: {
            id: `report-${invoiceId}`,
            invoiceId,
            contractId: 'mock-contract',
            hasDiscrepancies: true,
            totalDiscrepancyAmount: 1750,
            discrepancies: [],
            checklist: [],
            rationaleText: 'Status updated successfully',
            summary: {
              narrative: 'Review status updated',
              evidence_anchors: [],
              findings: [],
              highest_priority: 'high' as const,
              total_variance: 1750,
              reviewed
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as ReconciliationReport,
          status: 200
        })
      })
    }
    return this.request(`/invoices/${invoiceId}/review-status`, {
      method: 'PATCH',
      body: JSON.stringify({ reviewed }),
    });
  }

  // Streaming CSV Export API per PRD requirements

  // Export invoices with streaming and progress tracking
  async exportInvoicesCSV(filters: {
    start_date?: string;
    end_date?: string;
    vendor_id?: string;
    read_status?: boolean;
    include_not_relevant?: boolean;
    chunk_size?: number;
  } = {}): Promise<{ blob: Blob; exportId: string }> {
    // Mock implementation for development
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // Generate mock CSV content
          const csvContent = [
            'Invoice Number,Vendor Name,Date,Amount,Status,Discrepancies',
            'INV-001,Acme Corp,2024-01-15,$1250.00,approved,0',
            'INV-002,Tech Solutions,2024-01-16,$875.50,flagged,1',
            'INV-003,Office Supplies Co,2024-01-17,$324.99,reconciled,0',
            'INV-004,Legal Services LLC,2024-01-18,$2500.00,pending,2'
          ].join('\n')
          
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
          const exportId = `export_${Date.now()}`
          
          resolve({ blob, exportId })
        }, 2000) // Simulate processing time
      })
    }

    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const url = `${this.baseURL}/streaming-reports/invoices.csv${params.toString() ? `?${params.toString()}` : ''}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const exportId = response.headers.get('X-Export-ID') || 'unknown';
      const blob = await response.blob();
      
      return { blob, exportId };
    } catch (error) {
      throw new Error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Export findings with relevance filtering per PRD
  async exportFindingsCSV(filters: {
    start_date?: string;
    end_date?: string;
    priority?: string;
    relevance?: string;
    finding_type?: string;
    include_not_relevant?: boolean; // PRD: toggle for "Not relevant" findings
    chunk_size?: number;
  } = {}): Promise<{ blob: Blob; exportId: string }> {
    // Mock implementation for development
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // Generate mock CSV content
          const csvContent = [
            'Finding ID,Invoice Number,Vendor,Priority,Type,Amount,Description,Relevance',
            'F001,INV-001,Acme Corp,High,Price,$250.00,Rate exceeds contract,Relevant',
            'F002,INV-002,Tech Solutions,Medium,Fee,$75.50,Unauthorized service charge,Pending',
            'F003,INV-003,Office Supplies Co,Low,Discount,$24.99,Missing bulk discount,Relevant',
            'F004,INV-004,Legal Services LLC,High,Outside Term,$500.00,Work performed outside contract period,Relevant'
          ].join('\n')
          
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
          const exportId = `export_findings_${Date.now()}`
          
          resolve({ blob, exportId })
        }, 1500) // Simulate processing time
      })
    }

    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const url = `${this.baseURL}/streaming-reports/findings.csv${params.toString() ? `?${params.toString()}` : ''}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const exportId = response.headers.get('X-Export-ID') || 'unknown';
      const blob = await response.blob();
      
      return { blob, exportId };
    } catch (error) {
      throw new Error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Export disputes (High priority findings only) per PRD
  async exportDisputesCSV(filters: {
    start_date?: string;
    end_date?: string;
    finding_type?: string;
    chunk_size?: number;
  } = {}): Promise<{ blob: Blob; exportId: string }> {
    // Mock implementation for development
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // Generate mock CSV content for high-priority disputes
          const csvContent = [
            'Dispute ID,Invoice Number,Vendor,Amount,Description,Evidence,Dispute Draft',
            'D001,INV-001,Acme Corp,$250.00,Rate exceeds contract by 25%,Contract page 2 vs Invoice line 3,The hourly rate charged exceeds the contracted amount...',
            'D002,INV-004,Legal Services LLC,$500.00,Work performed outside contract period,Contract dates vs Invoice dates,Services were provided outside the contracted term...'
          ].join('\n')
          
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
          const exportId = `export_disputes_${Date.now()}`
          
          resolve({ blob, exportId })
        }, 1000) // Simulate processing time
      })
    }

    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const url = `${this.baseURL}/streaming-reports/disputes.csv${params.toString() ? `?${params.toString()}` : ''}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const exportId = response.headers.get('X-Export-ID') || 'unknown';
      const blob = await response.blob();
      
      return { blob, exportId };
    } catch (error) {
      throw new Error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get export progress for real-time updates
  async getExportProgress(exportId: string): Promise<ApiResponse<{
    export_id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    progress: number;
    total_records: number;
    processed_records: number;
    current_step: string;
    estimated_completion?: string;
    error?: string;
    created_at: string;
    updated_at: string;
  }>> {
    return this.request(`/streaming-reports/progress/${exportId}`);
  }

  // Cancel ongoing export
  async cancelExport(exportId: string): Promise<ApiResponse<{
    success: boolean;
    message: string;
    export_id: string;
  }>> {
    return this.request(`/streaming-reports/cancel/${exportId}`, {
      method: 'POST',
    });
  }

  // Get all active exports
  async getActiveExports(): Promise<ApiResponse<Array<{
    export_id: string;
    status: string;
    progress: number;
    total_records: number;
    processed_records: number;
    current_step: string;
    created_at: string;
    updated_at: string;
  }>>> {
    return this.request('/streaming-reports/active');
  }

  // Validate export parameters
  async validateExportParams(exportType: 'invoices' | 'findings' | 'disputes', filters: any): Promise<ApiResponse<{
    export_type: string;
    valid: boolean;
    errors: string[];
    estimated_records: number;
    estimated_duration_seconds: number;
  }>> {
    // Mock implementation for development
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockValidation = {
            export_type: exportType,
            valid: true,
            errors: [] as string[],
            estimated_records: exportType === 'disputes' ? 25 : exportType === 'findings' ? 150 : 500,
            estimated_duration_seconds: exportType === 'disputes' ? 5 : exportType === 'findings' ? 15 : 30
          }

          // Add some mock validation errors occasionally
          if (filters.start_date && filters.end_date) {
            const startDate = new Date(filters.start_date)
            const endDate = new Date(filters.end_date)
            if (startDate > endDate) {
              mockValidation.valid = false
              mockValidation.errors.push('Start date must be before end date')
            }
          }

          resolve({
            data: mockValidation,
            status: 200
          })
        }, 300) // Quick validation
      })
    }

    return this.request(`/streaming-reports/validate/${exportType}`, {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }

  // Invoice processing metrics
  async getProcessingMetrics(dateRange?: { from: Date, to: Date }): Promise<ApiResponse<{
    totalProcessed: number;
    averageProcessingTime: number; // in minutes
    processingRate: {
      hourly: number;
      daily: number;
      weekly: number;
    };
    successRate: number; // percentage
    errorRate: number; // percentage
    recentActivity: Array<{
      hour: string;
      processed: number;
      errors: number;
    }>;
  }>> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              totalProcessed: 1261,
              averageProcessingTime: 3.5,
              processingRate: {
                hourly: 2,
                daily: 48,
                weekly: 336
              },
              successRate: 96.8,
              errorRate: 3.2,
              recentActivity: [
                { hour: '14:00', processed: 5, errors: 0 },
                { hour: '13:00', processed: 3, errors: 1 },
                { hour: '12:00', processed: 7, errors: 0 },
                { hour: '11:00', processed: 4, errors: 0 },
                { hour: '10:00', processed: 6, errors: 0 }
              ]
            },
            status: 200
          })
        }, 500)
      })
    }
    const params = new URLSearchParams();
    if (dateRange) {
      params.append('fromDate', dateRange.from.toISOString());
      params.append('toDate', dateRange.to.toISOString());
    }
    return this.request(`/dashboard/processing-metrics${params.toString() ? `?${params.toString()}` : ''}`);
  }

  // User state API for dashboard personalization
  async getUserState(): Promise<ApiResponse<UserState>> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              isNewUser: true, // Set to false to see experienced user view
              hasContracts: false,
              hasInvoices: false,
              hasCompletedOnboarding: false,
              contractCount: 0,
              invoiceCount: 0,
              setupStage: 'contracts' as const,
              hasActiveAnalysis: false,
              totalFindings: 0,
              hasResolvedFindings: false,
              userType: 'first_time' as const,
              onboardingProgress: {
                contractsUploaded: false,
                invoicesUploaded: false,
                firstAnalysisComplete: false,
                firstFindingReviewed: false,
                setupComplete: false
              }
            },
            status: 200
          })
        }, 200)
      })
    }
    return this.request('/user/state');
  }

  // Enhanced API endpoints for actionable insights
  async getActionableInsights(filters?: {
    priority?: 'high' | 'medium' | 'low';
    limit?: number;
    vendor?: string;
  }): Promise<ApiResponse<Array<{
    id: string;
    type: 'overcharge' | 'contract_violation' | 'missing_discount' | 'outside_terms' | 'unauthorized_fee';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    amount: number;
    confidence: number;
    vendor: string;
    invoiceId?: string;
    contractId?: string;
    evidence: {
      contractPage?: number;
      invoicePage?: number;
      quotedText?: string;
    };
    actions: {
      primary: {
        label: string;
        action: 'dispute' | 'contact_vendor' | 'mark_valid' | 'review';
      };
      secondary?: {
        label: string;
        action: 'mark_invalid' | 'see_details' | 'defer';
      };
    };
    createdAt: string;
    updatedAt: string;
  }>>> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockInsights = [
            {
              id: '1',
              type: 'overcharge' as const,
              priority: 'high' as const,
              title: 'CleanCorp Invoice #1234 - $847 Overcharge',
              description: 'Contract: $50/hr, Charged: $67/hr (+34% overcharge)',
              amount: 847,
              confidence: 95,
              vendor: 'CleanCorp',
              evidence: {
                contractPage: 2,
                invoicePage: 1,
                quotedText: 'Hourly rate: $50.00'
              },
              actions: {
                primary: {
                  label: 'Dispute Invoice',
                  action: 'dispute' as const
                },
                secondary: {
                  label: 'Mark Invalid',
                  action: 'mark_invalid' as const
                }
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
            // ... more mock insights would be here
          ]
          resolve({
            data: mockInsights,
            status: 200
          })
        }, 300)
      })
    }
    const params = new URLSearchParams()
    if (filters?.priority) params.append('priority', filters.priority)
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.vendor) params.append('vendor', filters.vendor)
    return this.request(`/insights/actionable${params.toString() ? `?${params.toString()}` : ''}`);
  }

  // AI Status endpoint for dashboard
  async getAIStatus(): Promise<ApiResponse<{
    status: 'analyzing' | 'complete' | 'idle' | 'scanning';
    currentlyAnalyzing: number;
    lastScanTime: string;
    nextScanTime?: string;
    totalPotentialSavings: number;
    confidenceLevel: 'high' | 'medium' | 'low';
    analysisAccuracy: number;
    findingsByPriority: {
      high: { count: number; amount: number };
      medium: { count: number; amount: number };
      low: { count: number; amount: number };
    };
  }>> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              status: 'analyzing' as const,
              currentlyAnalyzing: 3,
              lastScanTime: '2 minutes ago',
              nextScanTime: '15 minutes',
              totalPotentialSavings: 3648,
              confidenceLevel: 'high' as const,
              analysisAccuracy: 96.8,
              findingsByPriority: {
                high: { count: 3, amount: 2847 },
                medium: { count: 2, amount: 567 },
                low: { count: 1, amount: 234 }
              }
            },
            status: 200
          })
        }, 200)
      })
    }
    return this.request('/ai/status');
  }

  // AI Performance metrics endpoint
  async getAIPerformance(): Promise<ApiResponse<{
    totalSaved: number;
    thisMonthSaved: number;
    accuracyRate: number;
    falsePositiveRate: number;
    totalAnalyzed: number;
    thisMonthAnalyzed: number;
    avgProcessingTime: number;
    uptime: number;
    lastModelUpdate: string;
    disputesWon: number;
    disputesTotal: number;
    userTrustRating: number;
    monthlyTrend: number;
  }>> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              totalSaved: 127500,
              thisMonthSaved: 8200,
              accuracyRate: 96.8,
              falsePositiveRate: 1.8,
              totalAnalyzed: 1261,
              thisMonthAnalyzed: 87,
              avgProcessingTime: 2.3,
              uptime: 99.9,
              lastModelUpdate: '3 days ago',
              disputesWon: 89,
              disputesTotal: 94,
              userTrustRating: 4.6,
              monthlyTrend: 12.5
            },
            status: 200
          })
        }, 400)
      })
    }
    return this.request('/ai/performance');
  }

  // Action execution endpoints for findings
  async executeFindingAction(findingId: string, action: {
    type: 'dispute' | 'contact_vendor' | 'mark_valid' | 'review' | 'mark_invalid' | 'see_details' | 'defer';
    metadata?: any;
  }): Promise<ApiResponse<{
    success: boolean;
    message: string;
    nextSteps?: string[];
  }>> {
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              success: true,
              message: `Successfully executed ${action.type} for finding ${findingId}`,
              nextSteps: [
                action.type === 'dispute' ? 'Draft dispute letter created' : 'Action completed',
                'Finding status updated',
                'Notification sent to relevant parties'
              ]
            },
            status: 200
          })
        }, 1000)
      })
    }
    return this.request(`/findings/${findingId}/action`, {
      method: 'POST',
      body: JSON.stringify(action)
    });
  }

  // Utility method to get auth token (implement based on your auth system)
  private getAuthToken(): string {
    // This should return the actual JWT token from your auth system
    // For now, returning empty string - implement based on your auth setup
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token') || '';
    }
    return '';
  }

  // Helper method to download blob as file
  static downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}

export const apiClient = new ApiClient();