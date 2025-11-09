/**
 * Vendor Contracts API Endpoint
 *
 * GET /api/vendors/:id/contracts - List all contracts for a vendor
 * POST /api/vendors/:id/contracts - Create a new contract for a vendor
 */

import { NextRequest, NextResponse } from 'next/server'
import { vendorStorage, contractStorage } from '@/lib/storage'
import { z } from 'zod'

// Validation schema for contract creation
const CreateContractSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileUrl: z.string().optional(),
  effectiveDate: z.string(),
  renewalDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['active', 'inactive', 'needs_review', 'expired']).default('active'),
  terms: z.any().optional(),
  extractedText: z.string().optional(),
  metadata: z.any().optional(),
})

// GET /api/vendors/:id/contracts
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

    const contracts = contractStorage.getByVendorId(params.id)

    return NextResponse.json(contracts, { status: 200 })
  } catch (error) {
    console.error('Error fetching contracts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contracts' },
      { status: 500 }
    )
  }
}

// POST /api/vendors/:id/contracts
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
    const validatedData = CreateContractSchema.parse(body)

    // Create contract
    const contract = contractStorage.create({
      vendorId: params.id,
      vendor,
      fileName: validatedData.fileName,
      fileUrl: validatedData.fileUrl || '',
      effectiveDate: validatedData.effectiveDate,
      renewalDate: validatedData.renewalDate,
      endDate: validatedData.endDate,
      status: validatedData.status,
      terms: validatedData.terms,
      extractedText: validatedData.extractedText,
      metadata: validatedData.metadata,
    })

    console.log(`Created contract: ${contract.id} for vendor: ${vendor.name}`)

    return NextResponse.json(contract, { status: 201 })
  } catch (error) {
    console.error('Error creating contract:', error)

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
      { error: 'Failed to create contract' },
      { status: 500 }
    )
  }
}
