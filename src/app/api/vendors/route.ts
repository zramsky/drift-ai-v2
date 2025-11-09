/**
 * Vendors API Endpoint
 *
 * GET /api/vendors - List all vendors
 * POST /api/vendors - Create a new vendor
 */

import { NextRequest, NextResponse } from 'next/server'
import { vendorStorage } from '@/lib/storage'
import { z } from 'zod'

// Validation schema for vendor creation
const CreateVendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required'),
  canonicalName: z.string().optional(),
  businessDescription: z.string().optional(),
  active: z.boolean().default(true),
})

// GET /api/vendors - List all vendors
export async function GET() {
  try {
    const vendors = vendorStorage.getAll()

    // Return vendors array directly - apiClient wraps it in ApiResponse
    return NextResponse.json(vendors, { status: 200 })
  } catch (error) {
    console.error('Error fetching vendors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vendors' },
      { status: 500 }
    )
  }
}

// POST /api/vendors - Create a new vendor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = CreateVendorSchema.parse(body)

    // Check for duplicate vendor name
    const existingVendor = vendorStorage.getAll().find(
      v => v.name.toLowerCase() === validatedData.name.toLowerCase()
    )

    if (existingVendor) {
      return NextResponse.json(
        { error: 'A vendor with this name already exists' },
        { status: 409 } // Conflict
      )
    }

    // Create vendor
    const vendor = vendorStorage.create({
      name: validatedData.name,
      canonicalName: validatedData.canonicalName || validatedData.name,
      businessDescription: validatedData.businessDescription,
      active: validatedData.active,
      totalInvoices: 0,
      totalDiscrepancies: 0,
      totalSavings: 0,
    })

    console.log(`Created vendor: ${vendor.id} - ${vendor.name}`)

    // Return vendor directly - apiClient wraps it in ApiResponse
    return NextResponse.json(vendor, { status: 201 })
  } catch (error) {
    console.error('Error creating vendor:', error)

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
      { error: 'Failed to create vendor' },
      { status: 500 }
    )
  }
}
