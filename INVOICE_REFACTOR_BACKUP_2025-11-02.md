# Invoice Detail View Refactor - Backup & Revert Guide

**Date**: November 2, 2025
**Session**: Invoice Detail Simplification
**Component**: InvoiceDetailView
**Git Commit Before Changes**: `05f65b4c9c58ca1113ac44e4a3373512c6849bca`
**Git Branch**: main

---

## 📋 Overview

This document provides a complete backup of the InvoiceDetailView component before refactoring changes, along with instructions for reverting if needed.

### Changes Being Made

1. **Remove**: Invoice Details card (two-column top section, left card)
2. **Remove**: Vendor Context card (two-column top section, right card)
3. **Move**: Reconciliation Report card from bottom to top (after invoice header)
4. **Keep**: Back button, Invoice header, Line Items table, Evidence Viewer, Action buttons

### New Layout Structure

```
Before:                           After:
├── Back Button                   ├── Back Button
├── Invoice Header                ├── Invoice Header
├── Two-Column Section            ├── Reconciliation Report (MOVED HERE)
│   ├── Invoice Details (REMOVE)
│   └── Vendor Context (REMOVE)
├── Line Items Table              ├── Line Items Table
├── Evidence Viewer               ├── Evidence Viewer
├── Reconciliation Report (MOVE)
└── Action Buttons                └── Action Buttons
```

---

## 🔄 Quick Revert Instructions

### Option 1: Git Revert (Recommended)

```bash
# Navigate to project
cd /Users/zackram/Drift.AI-V2

# Revert to commit before changes
git checkout 05f65b4c9c58ca1113ac44e4a3373512c6849bca

# Or revert the specific file only
git checkout 05f65b4c9c58ca1113ac44e4a3373512c6849bca -- src/components/vendors/invoice-detail-view.tsx
```

### Option 2: Manual Restore

Copy the "Complete Component Backup" section below and paste it back into:
`/Users/zackram/Drift.AI-V2/src/components/vendors/invoice-detail-view.tsx`

---

## 📦 Complete Component Backup

### File: `src/components/vendors/invoice-detail-view.tsx`

**Line Count**: 535 lines
**Last Modified**: November 2, 2025

<details>
<summary>Click to expand full component code (535 lines)</summary>

```typescript
'use client'

import { useState } from 'react'
import {
  ArrowLeft,
  Building2,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { mockInvoices, mockVendors, mockReconciliationReports } from '@/lib/mock-data'
import { format } from 'date-fns'

interface InvoiceDetailViewProps {
  vendorId: string
  invoiceId: string
  onBack: () => void
}

export function InvoiceDetailView({ vendorId, invoiceId, onBack }: InvoiceDetailViewProps) {
  // Find invoice and vendor from mock data
  const invoice = mockInvoices.find(inv => inv.id === invoiceId)
  const vendor = mockVendors.find(v => v.id === vendorId)
  const reconciliationReport = mockReconciliationReports.find(report => report.invoiceId === invoiceId)

  // Handle not found cases
  if (!invoice) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-error opacity-50" />
        <h3 className="text-lg font-semibold text-error mb-2">Invoice Not Found</h3>
        <p className="text-muted-foreground mb-6">
          The requested invoice could not be found.
        </p>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-error opacity-50" />
        <h3 className="text-lg font-semibold text-error mb-2">Vendor Not Found</h3>
        <p className="text-muted-foreground mb-6">
          The vendor for this invoice could not be found.
        </p>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'reconciled':
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-success" />
      case 'flagged':
      case 'pending':
        return <AlertTriangle className="h-5 w-5 text-warning" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-error" />
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'secondary' => {
    switch (status) {
      case 'reconciled':
      case 'approved':
        return 'success'
      case 'flagged':
      case 'pending':
        return 'warning'
      case 'rejected':
        return 'error'
      default:
        return 'secondary'
    }
  }

  const handleApprove = () => {
    alert('Invoice approved! (Demo mode)')
  }

  const handleReject = () => {
    alert('Invoice rejected! (Demo mode)')
  }

  const handleDownload = () => {
    alert('Download PDF functionality coming soon!')
  }

  const handleViewEvidence = () => {
    alert('Evidence viewer coming soon!')
  }

  return (
    <div className="space-y-6">
      {/* Back Button / Breadcrumb */}
      <div>
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-brand-orange hover:text-orange-600 hover:bg-brand-orange/10 -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to {vendor.name}
        </Button>
      </div>

      {/* Invoice Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center bg-brand-steel/10 rounded-lg">
            <FileText className="h-6 w-6 text-brand-steel" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Invoice {invoice.invoiceNumber}
            </h1>
            <p className="text-sm text-muted-foreground">
              {format(new Date(invoice.invoiceDate), 'MMMM dd, yyyy')} • ${invoice.totalAmount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </p>
          </div>
        </div>
        <Badge variant={getStatusColor(invoice.status)}>
          {getStatusIcon(invoice.status)}
          <span className="ml-2 capitalize">{invoice.status}</span>
        </Badge>
      </div>

      {/* Two-Column Top Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Invoice Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
            <CardDescription>
              Basic invoice information and amounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Invoice Number
                </label>
                <p className="text-foreground mt-1 font-medium">
                  {invoice.invoiceNumber}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(invoice.status)}
                  <span className="capitalize">{invoice.status}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Invoice Date
                </label>
                <p className="text-foreground mt-1">
                  {format(new Date(invoice.invoiceDate), 'MMM dd, yyyy')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Due Date
                </label>
                <p className="text-foreground mt-1">
                  {invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM dd, yyyy') : 'Not specified'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Subtotal
                </label>
                <p className="text-foreground mt-1 font-semibold">
                  ${invoice.subtotal.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Tax Amount
                </label>
                <p className="text-foreground mt-1">
                  ${(invoice.taxAmount || 0).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Total Amount
              </label>
              <p className="text-foreground mt-1 text-xl font-bold">
                ${invoice.totalAmount.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Vendor Context Card */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor Context</CardTitle>
            <CardDescription>
              Information about the vendor for this invoice
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center bg-brand-steel/10 rounded-lg">
                <Building2 className="h-5 w-5 text-brand-steel" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">
                  {vendor.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {vendor.canonicalName}
                </p>
              </div>
              <Badge variant={vendor.active ? 'success' : 'secondary'}>
                {vendor.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Business Type
              </label>
              <p className="text-foreground mt-1">
                {vendor.businessDescription || 'Not specified'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Total Invoices
                </label>
                <p className="text-foreground mt-1 font-semibold">
                  {vendor.totalInvoices}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Total Savings
                </label>
                <p className="text-foreground mt-1 font-semibold text-success">
                  ${vendor.totalSavings.toLocaleString()}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={onBack}
            >
              View Vendor Profile
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Line Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
          <CardDescription>
            Detailed breakdown of invoice charges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-center">Unit</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.lineItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {item.description}
                    </TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-center">{item.unit}</TableCell>
                    <TableCell className="text-right">
                      ${item.rate.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${item.total.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Evidence Viewer Section (Placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Evidence Viewer</CardTitle>
          <CardDescription>
            View supporting evidence and contract excerpts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Eye className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-muted-foreground mb-4">
              Evidence viewer functionality will be integrated here
            </p>
            <Button onClick={handleViewEvidence} variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              View Full Evidence
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reconciliation Report */}
      {reconciliationReport ? (
        <Card>
          <CardHeader>
            <CardTitle>Reconciliation Report</CardTitle>
            <CardDescription>
              AI analysis and contract compliance results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Summary */}
            <div className={`p-4 rounded-lg border-2 ${
              reconciliationReport.hasDiscrepancies
                ? 'bg-warning/10 border-warning/20'
                : 'bg-success/10 border-success/20'
            }`}>
              <div className="flex items-center gap-3">
                {reconciliationReport.hasDiscrepancies ? (
                  <AlertTriangle className="h-6 w-6 text-warning" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-success" />
                )}
                <div>
                  <h3 className="font-semibold">
                    {reconciliationReport.hasDiscrepancies ? 'Issues Found' : 'All Clear'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {reconciliationReport.hasDiscrepancies
                      ? `${reconciliationReport.discrepancies.length} discrepancy(ies) identified`
                      : 'Invoice matches contract terms'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Discrepancies */}
            {reconciliationReport.hasDiscrepancies && (
              <div>
                <h4 className="font-semibold mb-4">Discrepancies Found</h4>
                <div className="space-y-4">
                  {reconciliationReport.discrepancies.map((discrepancy, index) => (
                    <div key={index} className="p-4 border border-border rounded-lg bg-warning/5">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h5 className="font-medium">{discrepancy.description}</h5>
                          <Badge
                            className="mt-2"
                            variant={
                              discrepancy.priority === 'high' ? 'error' :
                              discrepancy.priority === 'medium' ? 'warning' :
                              'secondary'
                            }
                          >
                            {discrepancy.priority} priority
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-error">
                            ${discrepancy.amount.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                        <div>
                          <label className="text-muted-foreground">Expected</label>
                          <p className="font-medium">{discrepancy.expectedValue}</p>
                        </div>
                        <div>
                          <label className="text-muted-foreground">Actual</label>
                          <p className="font-medium">{discrepancy.actualValue}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Checklist */}
            <div>
              <h4 className="font-semibold mb-4">Compliance Checklist</h4>
              <div className="space-y-3">
                {reconciliationReport.checklist.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    {item.passed ? (
                      <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-error mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{item.item}</p>
                      <p className="text-sm text-muted-foreground">{item.details}</p>
                      <p className="text-xs text-muted-foreground">
                        Confidence: {Math.round(item.confidence * 100)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Rationale */}
            <div>
              <h4 className="font-semibold mb-2">AI Analysis</h4>
              <div className="bg-surface-secondary p-4 rounded-lg">
                <p className="text-sm text-muted-foreground italic">
                  "{reconciliationReport.rationaleText}"
                </p>
                {reconciliationReport.metadata && (
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span>Processing time: {reconciliationReport.metadata.processingTime}s</span>
                    <span>Model: {reconciliationReport.metadata.aiModel}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Reconciliation Report</CardTitle>
            <CardDescription>
              AI analysis and contract compliance results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-muted-foreground">
                No reconciliation report available for this invoice
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
        <Button variant="outline" onClick={handleReject}>
          Reject
        </Button>
        <Button
          onClick={handleApprove}
          className="bg-brand-orange hover:bg-orange-600 text-white"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Approve Invoice
        </Button>
      </div>
    </div>
  )
}
```

</details>

---

## 🎯 Specific Code Sections Being Removed

### Section 1: Invoice Details Card (Lines 152-237)

**REMOVED**: 86 lines of code containing:
- Invoice number
- Status display
- Invoice date / due date
- Subtotal / tax amount
- Total amount with large display

### Section 2: Vendor Context Card (Lines 239-302)

**REMOVED**: 64 lines of code containing:
- Vendor name and canonical name
- Business type description
- Total invoices count
- Total savings amount
- "View Vendor Profile" button

### Section 3: Two-Column Grid Container (Lines 150-302)

**REMOVED**: The entire grid wrapper containing both cards above:
```typescript
<div className="grid gap-6 lg:grid-cols-2">
  {/* Invoice Details Card */}
  {/* Vendor Context Card */}
</div>
```

**Total Lines Removed**: 153 lines

---

## 🔀 Code Section Being Moved

### Reconciliation Report (Lines 374-513)

**MOVED FROM**: After Evidence Viewer section
**MOVED TO**: After Invoice Header (before Line Items)

**Code Block**: 140 lines containing:
- Reconciliation report card with conditional rendering
- Status summary (Issues Found / All Clear)
- Discrepancies list with priority badges
- Compliance checklist with pass/fail icons
- AI analysis rationale
- Processing metadata

---

## 📊 Impact Analysis

### Before Changes
- **Total Lines**: 535 lines
- **Component Size**: ~19 KB
- **Cards Displayed**: 6 cards (Invoice Details, Vendor Context, Line Items, Evidence, Reconciliation, Action buttons)

### After Changes (Expected)
- **Total Lines**: ~382 lines (estimated)
- **Component Size**: ~13 KB (estimated)
- **Cards Displayed**: 4 cards (Reconciliation, Line Items, Evidence, Action buttons)
- **Lines Removed**: ~153 lines
- **Code Reduction**: ~28.6%

### User Experience Changes
- **Simplified View**: Fewer cards to scroll through
- **Focus on AI Results**: Reconciliation report becomes immediately visible
- **Reduced Redundancy**: Invoice details already in header; vendor info accessible via back button
- **Faster Decision Making**: Key information (reconciliation status) appears earlier

---

## ✅ Testing Checklist

After making changes, verify:

- [ ] Component compiles without TypeScript errors
- [ ] Invoice header still displays correctly
- [ ] Reconciliation report appears immediately after header
- [ ] Line Items table displays properly
- [ ] Evidence Viewer section intact
- [ ] Action buttons functional (Approve, Reject, Download)
- [ ] Back button navigation works
- [ ] Mobile responsive (breakpoints: 375px, 768px, 1024px)
- [ ] No console errors
- [ ] Proper spacing maintained (space-y-6)

---

## 🔧 Related Files

### Files That May Be Affected
- **Parent Component**: `/Users/zackram/Drift.AI-V2/src/app/vendors/[id]/page.tsx`
- **Mock Data**: `/Users/zackram/Drift.AI-V2/src/lib/mock-data.ts`

### Files NOT Modified
- VendorSummaryView component (unchanged)
- Dashboard components (unchanged)
- Vendor detail page parent (unchanged)

---

## 📝 Notes

### Design Rationale for Changes

1. **Invoice Details Removal**: Information is already displayed in the invoice header (number, date, amount, status)

2. **Vendor Context Removal**: Vendor information is:
   - Visible in the breadcrumb ("Back to [Vendor Name]")
   - Accessible by clicking back button
   - Part of the surrounding vendor profile context

3. **Reconciliation Report Priority**: This is the most important information for users:
   - Shows AI analysis results
   - Highlights discrepancies that need attention
   - Contains actionable items for decision-making

### Potential Future Enhancements
- Add "Show Details" expandable section if invoice details needed
- Consider adding vendor quick summary chip/badge near header
- Implement collapsible sections for long reconciliation reports

---

## 🚀 Deployment Notes

### If Changes Are Successful
1. Test thoroughly in local environment
2. Run type-check: `npm run type-check`
3. Commit with message: `feat: simplify invoice detail view - remove redundant cards and prioritize reconciliation report`
4. Deploy to Vercel: `vercel --prod --yes`
5. Update CLAUDE.md with v2.2.0 entry

### If Revert Is Needed
1. Follow "Quick Revert Instructions" above
2. Test that reverted version works
3. Document reason for revert
4. Consider alternative approach

---

**Backup Document Created**: November 2, 2025
**Created By**: Claude Code Session
**Verified By**: User Review Required
**Status**: Pre-Implementation Backup

---

*Keep this document for reference even after successful deployment. It serves as historical record of component evolution.*
