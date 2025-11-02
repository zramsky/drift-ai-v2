# DRIFT.AI V2 - Invoice Restructuring Implementation Backup
**Date**: November 2, 2025
**Implementation**: Option 1 - Content Replacement Pattern
**Status**: BACKUP - Pre-Implementation Snapshot

## Purpose
This document captures the exact state of files BEFORE implementing the invoice restructuring. Use this to rollback if needed.

---

## Files That Will Be Modified

### 1. `/src/app/vendors/[id]/page.tsx`
**Current State**: Has 3 tabs (Summary, Invoices, Reports)
**Current Navigation**: Line 438 - `router.push('/invoices/${invoice.id}')`
**Backup Location**: See git commit before this change

**Lines to Change**:
- Line 438: Recent Activity onClick navigation
- Line 443: Keyboard navigation handler
- Overall structure: Will add conditional rendering based on searchParams

### 2. `/src/app/dashboard-improved.tsx`
**Current State**: Mock action items navigate to `/invoices/[id]`
**Lines to Change**:
- Lines 75, 91: Action item onAction handlers

### 3. `/src/components/dashboard/action-required-section.tsx`
**Current State**: Action cards navigate to invoice pages
**Lines to Change**:
- Navigation logic in action handlers

---

## Files That Will Be Created

### 1. `/src/components/vendors/invoice-detail-view.tsx`
**Purpose**: Display full invoice details within vendor context
**New Component**: Will show invoice details, evidence, reconciliation

### 2. `/src/components/vendors/vendor-summary-view.tsx`
**Purpose**: Extract current Summary tab content into reusable component
**New Component**: KPIs + Vendor/Contract cards + Recent Activity

---

## Current URL Structure
```
Vendor Summary:     /vendors/[id]
Invoice Detail:     /invoices/[id] (standalone page)
Evidence:           /evidence/[id]
```

## New URL Structure (After Implementation)
```
Vendor Summary:     /vendors/[id]
Invoice Detail:     /vendors/[id]?invoice=[invoiceId]
Evidence:           /vendors/[id]?invoice=[invoiceId]&view=evidence
```

---

## Git State Before Implementation
**Branch**: main
**Latest Commit**: `6996b14 feat: add interactive dashboard elements in v2.0.4`
**Commit Hash**: 6996b14

To rollback:
```bash
# Revert all changes
git checkout HEAD -- src/app/vendors/[id]/page.tsx
git checkout HEAD -- src/app/dashboard-improved.tsx
git checkout HEAD -- src/components/dashboard/action-required-section.tsx

# Remove new files
rm -f src/components/vendors/invoice-detail-view.tsx
rm -f src/components/vendors/vendor-summary-view.tsx

# Restart dev server
npm run dev
```

---

## Testing Checklist (Before and After)

### Before Implementation (Current State)
- [ ] Dashboard loads at http://localhost:3004
- [ ] Clicking Action Required card navigates to /invoices/[id]
- [ ] Vendor page Recent Activity clicking navigates to /invoices/[id]
- [ ] All 3 tabs work (Summary, Invoices, Reports)

### After Implementation (New State)
- [ ] Dashboard loads at http://localhost:3004
- [ ] Clicking Action Required card navigates to /vendors/[id]?invoice=[id]
- [ ] Vendor page shows invoice detail when ?invoice param present
- [ ] Breadcrumb "Back to Vendor" works
- [ ] Browser back button works
- [ ] All navigation flows work

---

## Rollback Decision Points

**Rollback if**:
- Navigation is broken
- Invoice details don't display correctly
- Evidence viewer doesn't work
- Performance issues
- User testing reveals confusion

**Proceed if**:
- All navigation works
- Invoice details display properly
- Evidence viewer integrated well
- Performance acceptable
- UX feels natural

---

**Document Created**: November 2, 2025
**Next Step**: Begin implementation with frontend-architect agent
**Status**: Ready for implementation
