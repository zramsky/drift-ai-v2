# DRIFT.AI V2 - Invoice Restructuring Testing Guide
**Date**: November 2, 2025
**Implementation**: Option 1 - Content Replacement Pattern
**Status**: LOCAL TEST - Ready for Testing

## Dev Server Information
**URL**: http://localhost:3000
**Status**: Running ✅
**Started**: November 2, 2025

---

## What Was Implemented

### Summary of Changes

1. **Created 2 New Components**:
   - `VendorSummaryView` - Displays vendor summary (KPIs, vendor/contract info, recent activity)
   - `InvoiceDetailView` - Displays full invoice details within vendor context

2. **Modified Vendor Detail Page**:
   - Added conditional rendering based on `?invoice=` URL parameter
   - Summary tab now uses `VendorSummaryView` component
   - Invoice detail replaces entire page content when invoice ID in URL

3. **Updated Dashboard Navigation**:
   - Action Required cards now navigate to `/vendors/[vendorId]?invoice=[invoiceId]`
   - Added `vendorId` field to all action items

### URL Pattern Change

**OLD**:
```
/invoices/INV-2024-0315 (standalone page)
```

**NEW**:
```
/vendors/VND-001?invoice=INV-2024-0315 (invoice within vendor context)
```

---

## Testing Checklist

### Test 1: Dashboard to Invoice Detail ✅ Test This First

**Steps**:
1. Open http://localhost:3000
2. Navigate to Dashboard
3. Locate "Action Required" section
4. Click the first card (Acme Medical Supplies - Price Variance)

**Expected Behavior**:
- [ ] URL changes to `/vendors/VND-001?invoice=INV-2024-0315`
- [ ] Page shows invoice detail view
- [ ] No tabs visible (content replacement)
- [ ] Back button shows "← Back to Acme Medical Supplies"
- [ ] Invoice details display correctly
- [ ] Line items table visible
- [ ] Evidence section present
- [ ] Reconciliation report shows discrepancies
- [ ] Approve/Reject buttons visible

**Screenshot Location**: Take screenshot and save as `test-1-dashboard-to-invoice.png`

---

### Test 2: Invoice Detail Back Button

**Steps**:
1. From invoice detail view (Test 1)
2. Click "← Back to Acme Medical Supplies" button

**Expected Behavior**:
- [ ] URL changes to `/vendors/VND-001`
- [ ] Shows vendor summary view
- [ ] Tabs visible (Summary, Invoices, Reports)
- [ ] Summary tab is active
- [ ] KPIs, vendor/contract cards, and recent activity table visible

---

### Test 3: Vendor Page Recent Activity to Invoice

**Steps**:
1. Navigate to `/vendors/VND-001`
2. Scroll to "Recent Activity" table
3. Click on any invoice row (e.g., second row)

**Expected Behavior**:
- [ ] URL changes to `/vendors/VND-001?invoice=[clicked-invoice-id]`
- [ ] Invoice detail view appears
- [ ] Content replaces vendor summary
- [ ] Back button works
- [ ] Invoice data matches clicked row

---

### Test 4: Browser Back/Forward Buttons

**Steps**:
1. Start at dashboard (/)
2. Click action card → Invoice detail view
3. Click browser BACK button
4. Click browser FORWARD button

**Expected Behavior**:
- [ ] Back button returns to dashboard
- [ ] Forward button returns to invoice detail
- [ ] URL updates correctly
- [ ] Content renders correctly on each navigation
- [ ] No console errors

---

### Test 5: Direct URL Access

**Steps**:
1. Open new browser tab
2. Navigate directly to: `http://localhost:3000/vendors/VND-001?invoice=INV-2024-0315`

**Expected Behavior**:
- [ ] Invoice detail view loads immediately
- [ ] No "flash" of summary view
- [ ] All data loads correctly
- [ ] Back button navigates to vendor summary

---

### Test 6: Invalid Invoice ID

**Steps**:
1. Navigate to: `http://localhost:3000/vendors/VND-001?invoice=INVALID-999`

**Expected Behavior**:
- [ ] Shows error message: "Invoice not found"
- [ ] Provides way to return to vendor summary
- [ ] No JavaScript errors in console

---

### Test 7: Keyboard Navigation

**Steps**:
1. Navigate to `/vendors/VND-001` (summary view)
2. Use TAB key to navigate through Recent Activity table
3. Press ENTER on an invoice row

**Expected Behavior**:
- [ ] TAB key moves focus between invoice rows
- [ ] Focus ring is visible (brand orange)
- [ ] ENTER key navigates to invoice detail
- [ ] Same behavior as mouse click

---

### Test 8: Mobile Responsiveness

**Steps**:
1. Open Chrome DevTools
2. Switch to mobile view (375px width)
3. Navigate to vendor detail page
4. Click invoice in Recent Activity
5. View invoice detail on mobile

**Expected Behavior**:
- [ ] Summary view looks good on mobile
- [ ] Invoice detail view is readable on mobile
- [ ] Tables scroll horizontally if needed
- [ ] Buttons are touch-friendly
- [ ] No horizontal overflow

---

### Test 9: Invoice Tab Still Works

**Steps**:
1. Navigate to `/vendors/VND-001`
2. Click "Invoices" tab
3. Verify invoice list displays

**Expected Behavior**:
- [ ] Invoices tab still functions
- [ ] Invoice list displays
- [ ] Can still view all invoices for vendor
- [ ] "View" buttons work (if present)

---

### Test 10: Reports Tab Still Works

**Steps**:
1. Navigate to `/vendors/VND-001`
2. Click "Reports" tab
3. Verify reconciliation reports display

**Expected Behavior**:
- [ ] Reports tab still functions
- [ ] Reports data displays correctly
- [ ] No regression from changes

---

## Console Error Monitoring

While testing, keep browser console open and monitor for:

### Expected (OK):
- React warnings about missing keys (known issue in mock data)
- Font loading messages

### Unexpected (FAIL):
- ❌ Module not found errors
- ❌ Component rendering errors
- ❌ Router navigation errors
- ❌ Unhandled promise rejections
- ❌ TypeScript type errors

---

## Performance Check

**Metrics to Monitor**:
- [ ] Page load time < 2 seconds
- [ ] Navigation between views feels instant
- [ ] No layout shift when switching views
- [ ] Smooth transitions

**How to Check**:
1. Open Chrome DevTools → Performance tab
2. Record page navigation
3. Check for long tasks or janky animations

---

## Cross-Browser Testing (Optional)

Test in multiple browsers:
- [ ] Chrome (primary)
- [ ] Firefox
- [ ] Safari (if on Mac)
- [ ] Edge

---

## Test Results Summary

After completing all tests, fill out:

**Total Tests**: 10
**Passed**: ___ / 10
**Failed**: ___ / 10

**Critical Issues Found**:
1.
2.
3.

**Minor Issues Found**:
1.
2.
3.

**Overall Assessment**:
- [ ] ✅ Ready for production
- [ ] ⚠️ Needs minor fixes
- [ ] ❌ Major issues - rollback recommended

---

## Next Steps

### If Tests Pass:
1. Update CLAUDE.md with version 2.1.0 entry
2. Commit changes with descriptive message
3. Deploy to staging/production
4. Monitor for user feedback

### If Tests Fail:
1. Document specific failures
2. Review rollback documentation
3. Decide: Fix issues OR rollback
4. Execute appropriate action

---

**Testing Started**: ___________
**Testing Completed**: ___________
**Tested By**: ___________
**Results**: ___________
