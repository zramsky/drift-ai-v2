'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Plus, Search, Building2 } from 'lucide-react'
import { apiClient, type Vendor } from '@/lib/api'
import { AddVendorSimpleDialog } from '@/components/vendors/add-vendor-simple-dialog'

export default function VendorsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false)

  const { data: vendors, isLoading, error, refetch } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const response = await apiClient.getVendors()
      if (response.error) {
        throw new Error(response.error)
      }
      return response.data || []
    },
  })

  // Simple search filtering
  const filteredVendors = vendors?.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.businessDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.canonicalName?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  }) || []

  // Navigation handlers
  const handleRowClick = (vendorId: string) => {
    router.push(`/vendors/${vendorId}`)
  }

  const handleRowKeyDown = (e: React.KeyboardEvent, vendorId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      router.push(`/vendors/${vendorId}`)
    }
  }

  if (isLoading) {
    return (
      <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2" style={{fontSize: 'clamp(28px, 5vw, 32px)', fontWeight: '700'}}>Vendors</h1>
            <p className="text-gray-600" style={{fontSize: '16px', color: '#6b7280'}}>A clean directory of your vendors</p>
          </div>
          <Button disabled className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md font-medium shrink-0" style={{backgroundColor: '#FF6B35', minHeight: '44px'}}>
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Add Vendor</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
        <div className="text-center py-12">Loading vendors...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2" style={{fontSize: 'clamp(28px, 5vw, 32px)', fontWeight: '700'}}>Vendors</h1>
            <p className="text-gray-600" style={{fontSize: '16px', color: '#6b7280'}}>A clean directory of your vendors</p>
          </div>
          <Button disabled className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md font-medium shrink-0" style={{backgroundColor: '#FF6B35', minHeight: '44px'}}>
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Add Vendor</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="text-center text-red-600">
            Error loading vendors. Please check your backend connection.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto">
      {/* Clean Header Section */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2" style={{fontSize: 'clamp(28px, 5vw, 32px)', fontWeight: '700'}}>Vendors</h1>
          <p className="text-gray-600" style={{fontSize: '16px', color: '#6b7280'}}>A clean directory of your vendors</p>
        </div>
        <Button
          onClick={() => setIsAddVendorOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md font-medium shrink-0"
          style={{backgroundColor: '#FF6B35', minHeight: '44px'}}
        >
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Add Vendor</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Simple Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 focus:border-orange-500 focus:ring-orange-500"
            style={{'--tw-ring-color': '#FF6B35'} as React.CSSProperties}
          />
        </div>
      </div>

      {/* Clean Table Layout - Desktop */}
      <div className="hidden sm:block bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200">
              <TableHead className="px-6 py-4 text-left font-medium text-gray-900">Vendor</TableHead>
              <TableHead className="px-6 py-4 text-left font-medium text-gray-900">Category</TableHead>
              <TableHead className="px-6 py-4 text-left font-medium text-gray-900">Status</TableHead>
              <TableHead className="px-6 py-4 text-center font-medium text-gray-900">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVendors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <Building2 className="h-12 w-12 text-gray-300" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {vendors?.length === 0 ? 'No vendors yet' : 'No vendors match your search'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {vendors?.length === 0 
                          ? 'Add your first vendor to get started.' 
                          : 'Try adjusting your search criteria.'
                        }
                      </p>
                    </div>
                    {vendors?.length === 0 && (
                      <Button 
                        onClick={() => setIsAddVendorOpen(true)}
                        className="bg-orange-500 hover:bg-orange-600 mt-2"
                        style={{backgroundColor: '#FF6B35', minHeight: '44px'}}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Vendor
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredVendors.map((vendor) => (
                <TableRow
                  key={vendor.id}
                  className="cursor-pointer hover:bg-orange-50 transition-colors"
                  style={{height: '72px'}}
                  onClick={() => handleRowClick(vendor.id)}
                  onKeyDown={(e) => handleRowKeyDown(e, vendor.id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for ${vendor.name}`}
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center bg-blue-100 rounded-lg">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{vendor.name}</div>
                        {vendor.canonicalName && vendor.canonicalName !== vendor.name && (
                          <div className="text-sm text-gray-500">
                            DBA: {vendor.canonicalName}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {vendor.businessDescription ? (
                      <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">
                        {vendor.businessDescription}
                      </Badge>
                    ) : (
                      <span className="text-sm text-gray-500">Not specified</span>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge
                      variant={vendor.active ? 'default' : 'secondary'}
                      className={vendor.active
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                      }
                    >
                      {vendor.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/vendors/${vendor.id}`)
                      }}
                      className="h-9 px-4 hover:bg-gray-50"
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card Layout */}
      <div className="sm:hidden space-y-4">
        {filteredVendors.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="font-medium text-gray-900 mb-1">
              {vendors?.length === 0 ? 'No vendors yet' : 'No vendors match your search'}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              {vendors?.length === 0 
                ? 'Add your first vendor to get started.' 
                : 'Try adjusting your search criteria.'
              }
            </p>
            {vendors?.length === 0 && (
              <Button 
                onClick={() => setIsAddVendorOpen(true)}
                className="bg-orange-500 hover:bg-orange-600 w-full"
                style={{backgroundColor: '#FF6B35', minHeight: '44px'}}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Vendor
              </Button>
            )}
          </div>
        ) : (
          filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:bg-orange-50 hover:border-orange-200 transition-colors"
              onClick={() => handleRowClick(vendor.id)}
              onKeyDown={(e) => handleRowKeyDown(e, vendor.id)}
              tabIndex={0}
              role="button"
              aria-label={`View details for ${vendor.name}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex h-10 w-10 items-center justify-center bg-blue-100 rounded-lg">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{vendor.name}</div>
                    {vendor.canonicalName && vendor.canonicalName !== vendor.name && (
                      <div className="text-sm text-gray-500">
                        DBA: {vendor.canonicalName}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/vendors/${vendor.id}`)
                  }}
                  className="h-9 px-4"
                  style={{minHeight: '44px'}}
                >
                  View
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {vendor.businessDescription ? (
                    <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">
                      {vendor.businessDescription}
                    </Badge>
                  ) : (
                    <span className="text-sm text-gray-500">No category</span>
                  )}

                  <Badge
                    variant={vendor.active ? 'default' : 'secondary'}
                    className={vendor.active
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                    }
                  >
                    {vendor.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Vendor Dialog */}
      <AddVendorSimpleDialog
        open={isAddVendorOpen}
        onOpenChange={setIsAddVendorOpen}
        onSuccess={() => {
          refetch()
          setIsAddVendorOpen(false)
        }}
      />
    </div>
  )
}