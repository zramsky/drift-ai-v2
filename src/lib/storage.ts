/**
 * In-Memory Storage for Vendors, Contracts, and Invoices
 * This is a temporary solution until a real database is implemented
 * Data will reset when the server restarts
 */

import type { Vendor, Contract, Invoice } from './api'

// In-memory storage
let vendors: Vendor[] = []
let contracts: Contract[] = []
let invoices: Invoice[] = []

// Helper to generate IDs
function generateId(prefix: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  return `${prefix}-${timestamp}-${random}`
}

// Vendor operations
export const vendorStorage = {
  getAll(): Vendor[] {
    return vendors
  },

  getById(id: string): Vendor | undefined {
    return vendors.find(v => v.id === id)
  },

  create(data: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>): Vendor {
    const now = new Date().toISOString()
    const vendor: Vendor = {
      ...data,
      id: generateId('VND'),
      createdAt: now,
      updatedAt: now,
    }
    vendors.push(vendor)
    return vendor
  },

  update(id: string, data: Partial<Vendor>): Vendor | null {
    const index = vendors.findIndex(v => v.id === id)
    if (index === -1) return null

    const now = new Date().toISOString()
    vendors[index] = {
      ...vendors[index],
      ...data,
      id: vendors[index].id, // Prevent ID change
      createdAt: vendors[index].createdAt, // Prevent creation date change
      updatedAt: now,
    }
    return vendors[index]
  },

  delete(id: string): boolean {
    const index = vendors.findIndex(v => v.id === id)
    if (index === -1) return false
    vendors.splice(index, 1)
    return true
  }
}

// Contract operations
export const contractStorage = {
  getAll(): Contract[] {
    return contracts
  },

  getById(id: string): Contract | undefined {
    return contracts.find(c => c.id === id)
  },

  getByVendorId(vendorId: string): Contract[] {
    return contracts.filter(c => c.vendorId === vendorId)
  },

  create(data: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>): Contract {
    const now = new Date().toISOString()
    const contract: Contract = {
      ...data,
      id: generateId('CON'),
      createdAt: now,
      updatedAt: now,
    }
    contracts.push(contract)
    return contract
  },

  update(id: string, data: Partial<Contract>): Contract | null {
    const index = contracts.findIndex(c => c.id === id)
    if (index === -1) return null

    const now = new Date().toISOString()
    contracts[index] = {
      ...contracts[index],
      ...data,
      id: contracts[index].id,
      createdAt: contracts[index].createdAt,
      updatedAt: now,
    }
    return contracts[index]
  },

  delete(id: string): boolean {
    const index = contracts.findIndex(c => c.id === id)
    if (index === -1) return false
    contracts.splice(index, 1)
    return true
  }
}

// Invoice operations
export const invoiceStorage = {
  getAll(): Invoice[] {
    return invoices
  },

  getById(id: string): Invoice | undefined {
    return invoices.find(i => i.id === id)
  },

  getByVendorId(vendorId: string): Invoice[] {
    return invoices.filter(i => i.vendorId === vendorId)
  },

  create(data: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Invoice {
    const now = new Date().toISOString()
    const invoice: Invoice = {
      ...data,
      id: generateId('INV'),
      createdAt: now,
      updatedAt: now,
    }
    invoices.push(invoice)
    return invoice
  },

  update(id: string, data: Partial<Invoice>): Invoice | null {
    const index = invoices.findIndex(i => i.id === id)
    if (index === -1) return null

    const now = new Date().toISOString()
    invoices[index] = {
      ...invoices[index],
      ...data,
      id: invoices[index].id,
      createdAt: invoices[index].createdAt,
      updatedAt: now,
    }
    return invoices[index]
  },

  delete(id: string): boolean {
    const index = invoices.findIndex(i => i.id === id)
    if (index === -1) return false
    invoices.splice(index, 1)
    return true
  }
}

// Reset all storage (useful for testing)
export function resetStorage() {
  vendors = []
  contracts = []
  invoices = []
}

// Export storage for debugging/inspection
export function getStorageSnapshot() {
  return {
    vendors: [...vendors],
    contracts: [...contracts],
    invoices: [...invoices],
  }
}
