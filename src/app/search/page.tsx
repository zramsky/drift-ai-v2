'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Building2, FileText, Receipt, AlertCircle, User } from 'lucide-react'
import { apiClient, type Vendor, type Invoice } from '@/lib/api'

interface SearchResult {
  type: 'vendor' | 'contract' | 'invoice'
  id: string
  title: string
  description: string
  metadata: Record<string, any>
}

function SearchPageContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState('all')

  // Fetch vendors that match search
  const { data: vendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ['vendors-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return []
      const response = await apiClient.getVendors()
      if (response.error) return []
      
      return (response.data || []).filter((vendor: Vendor) =>
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.canonicalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.businessDescription?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    },
    enabled: !!searchQuery.trim()
  })

  // Fetch invoices that match search  
  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return []
      const response = await apiClient.getInvoices()
      if (response.error) return []
      
      return (response.data || []).filter((invoice: Invoice) =>
        invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.vendor?.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    },
    enabled: !!searchQuery.trim()
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // The search will be triggered by the query key changes
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      case 'flagged':
        return <Badge className="bg-yellow-100 text-yellow-800">Flagged</Badge>
      case 'reconciled':
        return <Badge className="bg-blue-100 text-blue-800">Reconciled</Badge>
      case 'pending':
        return <Badge variant="outline">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const totalResults = (vendors?.length || 0) + (invoices?.length || 0)
  const isLoading = vendorsLoading || invoicesLoading

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Search Results</h1>
        <p className="text-muted-foreground">
          {searchQuery ? `Results for "${searchQuery}"` : 'Enter a search term to find vendors, contracts, and invoices'}
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vendors, contracts, invoices..."
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={!searchQuery.trim()}>
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {searchQuery && (
        <>
          {/* Results Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-muted-foreground">
                    {isLoading ? 'Searching...' : `Found ${totalResults} result${totalResults !== 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                All ({totalResults})
              </TabsTrigger>
              <TabsTrigger value="vendors" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Vendors ({vendors?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="invoices" className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Invoices ({invoices?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {isLoading ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p>Searching...</p>
                  </CardContent>
                </Card>
              ) : totalResults === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No results found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search terms or check the spelling.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {/* Vendors */}
                  {vendors && vendors.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Vendors</h3>
                      {vendors.map((vendor) => (
                        <Card key={vendor.id} className="hover:shadow-sm transition-shadow">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Building2 className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium">{vendor.name}</h4>
                                  {vendor.canonicalName && vendor.canonicalName !== vendor.name && (
                                    <p className="text-sm text-muted-foreground">
                                      DBA: {vendor.canonicalName}
                                    </p>
                                  )}
                                  {vendor.businessDescription && (
                                    <Badge variant="outline" className="mt-1 text-xs">
                                      {vendor.businessDescription}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="text-right text-sm">
                                <p className="text-muted-foreground">
                                  {vendor.totalInvoices} invoices
                                </p>
                                <p className="text-green-600 font-medium">
                                  {formatCurrency(vendor.totalSavings)} saved
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Invoices */}
                  {invoices && invoices.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Invoices</h3>
                      {invoices.map((invoice) => (
                        <Card key={invoice.id} className="hover:shadow-sm transition-shadow">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                                  <Receipt className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium">{invoice.invoiceNumber}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {invoice.vendor?.name || 'Unknown Vendor'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDate(invoice.invoiceDate)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">
                                  {formatCurrency(invoice.totalAmount)}
                                </p>
                                {getStatusBadge(invoice.status)}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="vendors" className="space-y-4">
              {vendors && vendors.length > 0 ? (
                vendors.map((vendor) => (
                  <Card key={vendor.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{vendor.name}</h4>
                            {vendor.canonicalName && vendor.canonicalName !== vendor.name && (
                              <p className="text-sm text-muted-foreground">
                                DBA: {vendor.canonicalName}
                              </p>
                            )}
                            {vendor.businessDescription && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                {vendor.businessDescription}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-muted-foreground">
                            {vendor.totalInvoices} invoices
                          </p>
                          <p className="text-green-600 font-medium">
                            {formatCurrency(vendor.totalSavings)} saved
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : !isLoading ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No vendors found</h3>
                    <p className="text-muted-foreground">
                      No vendors match your search query.
                    </p>
                  </CardContent>
                </Card>
              ) : null}
            </TabsContent>

            <TabsContent value="invoices" className="space-y-4">
              {invoices && invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <Card key={invoice.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Receipt className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{invoice.invoiceNumber}</h4>
                            <p className="text-sm text-muted-foreground">
                              {invoice.vendor?.name || 'Unknown Vendor'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(invoice.invoiceDate)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(invoice.totalAmount)}
                          </p>
                          {getStatusBadge(invoice.status)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : !isLoading ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
                    <p className="text-muted-foreground">
                      No invoices match your search query.
                    </p>
                  </CardContent>
                </Card>
              ) : null}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Search Results</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p>Loading search...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
}