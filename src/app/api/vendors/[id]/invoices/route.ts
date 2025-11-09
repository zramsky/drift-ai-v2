/**
 * Vendor Invoices API Endpoint
 *
 * GET /api/vendors/:id/invoices - List all invoices for a vendor
 * POST /api/vendors/:id/invoices - Create a new invoice for a vendor
 */

import { NextRequest, NextResponse } from 'next/server'
import { vendorStorage, invoiceStorage } from '@/lib/storage'
import { z } from 'zod'

// Validation schema for invoice creation
const CreateInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  invoiceDate: z.string(),
  dueDate: z.string().optional(),
  fileName: z.string().min(1, 'File name is required'),
  fileUrl: z.string().optional(),
  status: z.enum(['pending', 'reconciled', 'flagged', 'approved', 'rejected']).default('pending'),
  totalAmount: z.number(),
  subtotal: z.number(),
  taxAmount: z.number().optional(),
  lineItems: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    rate: z.number(),
    unit: z.string(),
    total: z.number(),
  })),
  fees: z.array(z.object({
    type: z.enum(['percent', 'fixed']),
    description: z.string(),
    amount: z.number(),
  })).optional(),
  extractedText: z.string().optional(),
  metadata: z.any().optional(),
})

// GET /api/vendors/:id/invoices
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify vendor exists
    const vendor = vendorStorage.getById(params.id)
    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      )
    }

    const invoices = invoiceStorage.getByVendorId(params.id)

    return NextResponse.json(invoices, { status: 200 })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

// POST /api/vendors/:id/invoices
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify vendor exists
    const vendor = vendorStorage.getById(params.id)
    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      )
    }

    const body = await request.json()

    // Validate input
    const validatedData = CreateInvoiceSchema.parse(body)

    // Create invoice
    const invoice = invoiceStorage.create({
      vendorId: params.id,
      vendor,
      invoiceNumber: validatedData.invoiceNumber,
      invoiceDate: validatedData.invoiceDate,
      dueDate: validatedData.dueDate,
      fileName: validatedData.fileName,
      fileUrl: validatedData.fileUrl || '',
      status: validatedData.status,
      totalAmount: validatedData.totalAmount,
      subtotal: validatedData.subtotal,
      taxAmount: validatedData.taxAmount,
      lineItems: validatedData.lineItems,
      fees: validatedData.fees || [],
      extractedText: validatedData.extractedText,
      metadata: validatedData.metadata,
    })

    console.log(`Created invoice: ${invoice.id} for vendor: ${vendor.name}`)

    // Update vendor invoice count
    vendorStorage.update(params.id, {
      totalInvoices: invoiceStorage.getByVendorId(params.id).length,
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: error.issues
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}
