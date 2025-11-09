/**
 * Single Vendor API Endpoint
 *
 * GET /api/vendors/:id - Get a specific vendor
 * PATCH /api/vendors/:id - Update a vendor
 * DELETE /api/vendors/:id - Delete a vendor
 */

import { NextRequest, NextResponse } from 'next/server'
import { vendorStorage, contractStorage, invoiceStorage } from '@/lib/storage'
import { z } from 'zod'

// Validation schema for vendor updates
const UpdateVendorSchema = z.object({
  name: z.string().min(1).optional(),
  canonicalName: z.string().optional(),
  businessDescription: z.string().optional(),
  active: z.boolean().optional(),
})

// GET /api/vendors/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vendor = vendorStorage.getById(params.id)

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      )
    }

    // Get related contracts and invoices
    const contracts = contractStorage.getByVendorId(params.id)
    const invoices = invoiceStorage.getByVendorId(params.id)

    // Calculate stats
    const totalInvoices = invoices.length
    const totalDiscrepancies = invoices.filter(i => i.status === 'flagged').length

    // Return vendor with related data directly
    return NextResponse.json({
      ...vendor,
      totalInvoices,
      totalDiscrepancies,
      contracts,
      invoices,
    }, { status: 200 })
  } catch (error) {
    console.error('Error fetching vendor:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vendor' },
      { status: 500 }
    )
  }
}

// PATCH /api/vendors/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = UpdateVendorSchema.parse(body)

    // Update vendor
    const updated = vendorStorage.update(params.id, validatedData)

    if (!updated) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      )
    }

    console.log(`Updated vendor: ${updated.id} - ${updated.name}`)

    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error('Error updating vendor:', error)

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
      { error: 'Failed to update vendor' },
      { status: 500 }
    )
  }
}

// DELETE /api/vendors/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = vendorStorage.delete(params.id)

    if (!success) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      )
    }

    console.log(`Deleted vendor: ${params.id}`)

    return NextResponse.json(
      { message: 'Vendor deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting vendor:', error)
    return NextResponse.json(
      { error: 'Failed to delete vendor' },
      { status: 500 }
    )
  }
}
