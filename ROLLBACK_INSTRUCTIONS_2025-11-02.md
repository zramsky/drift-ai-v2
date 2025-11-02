# DRIFT.AI V2 - Rollback Instructions
**Date**: November 2, 2025
**Implementation**: Invoice Restructuring (Option 1 - Content Replacement)
**Git Commit Before Changes**: `6996b14`

## When to Rollback

Execute rollback if ANY of these occur:
- ❌ Critical navigation bugs preventing invoice access
- ❌ TypeScript compilation errors in production
- ❌ Severe performance degradation (>50% slower)
- ❌ User testing reveals major UX confusion
- ❌ Data integrity issues (wrong invoices shown)
- ❌ Accessibility regressions (keyboard nav broken)

---

## Quick Rollback (5 Minutes)

### Option A: Git Revert (Recommended)

```bash
# Navigate to project
cd /Users/zackram/Drift.AI-V2

# Check current status
git status

# Revert to commit before implementation
git checkout 6996b14 -- src/app/vendors/[id]/page.tsx
git checkout 6996b14 -- src/app/dashboard-improved.tsx
git checkout 6996b14 -- src/components/dashboard/action-required-section.tsx

# Remove new components (optional - they won't affect app if not imported)
rm -f src/components/vendors/vendor-summary-view.tsx
rm -f src/components/vendors/invoice-detail-view.tsx

# Verify no errors
npm run type-check

# Restart dev server
# Kill current server (find PID with: lsof -ti:3000)
kill -9 $(lsof -ti:3000)

# Start fresh
npm run dev

# Test at http://localhost:3000
```

### Option B: Full Git Reset (Nuclear Option)

```bash
cd /Users/zackram/Drift.AI-V2

# Save any uncommitted work you want to keep
git stash save "Work in progress before rollback"

# Hard reset to last known good commit
git reset --hard 6996b14

# Restart server
kill -9 $(lsof -ti:3000)
npm run dev
```

---

## Detailed Rollback Steps

### Step 1: Stop Development Server

```bash
# Find process on port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)
```

### Step 2: Verify Git State

```bash
cd /Users/zackram/Drift.AI-V2

# Check current branch
git branch

# Check commit history
git log --oneline -5

# Verify we're at or after commit 6996b14
```

### Step 3: Revert Modified Files

```bash
# Revert vendor detail page
git checkout 6996b14 -- src/app/vendors/[id]/page.tsx

# Revert dashboard
git checkout 6996b14 -- src/app/dashboard-improved.tsx

# Revert action required component
git checkout 6996b14 -- src/components/dashboard/action-required-section.tsx

# Check what was reverted
git status
```

### Step 4: Clean Up New Files (Optional)

```bash
# These files are new and won't affect the app if left alone
# But you can remove them for cleanliness

rm -f src/components/vendors/vendor-summary-view.tsx
rm -f src/components/vendors/invoice-detail-view.tsx

# Verify removed
ls -la src/components/vendors/
```

### Step 5: Verify TypeScript Compilation

```bash
npm run type-check
```

**Expected Output**: No errors

**If errors appear**:
- Run: `npm install` (dependencies might be out of sync)
- Run: `npm run type-check` again
- If still errors, proceed to Option B (Full Reset)

### Step 6: Restart Development Server

```bash
npm run dev
```

**Expected Output**:
```
▲ Next.js 14.2.33
- Local:        http://localhost:3000
✓ Ready in ~1-2s
```

### Step 7: Verify Rollback Success

Open browser to http://localhost:3000

**Test 1: Dashboard**
- [ ] Dashboard loads without errors
- [ ] Action Required cards work
- [ ] Clicking card navigates to `/invoices/[id]` (OLD behavior)

**Test 2: Vendor Detail Page**
- [ ] Navigate to `/vendors/VND-001`
- [ ] Summary tab shows KPIs, cards, recent activity
- [ ] Clicking invoice in Recent Activity navigates to `/invoices/[id]` (OLD behavior)
- [ ] No console errors

**Test 3: Standalone Invoice Page**
- [ ] `/invoices/[id]` page loads (OLD page restored)
- [ ] Invoice details display correctly
- [ ] Back button works

### Step 8: Clean Up Documentation Files

```bash
# Optional: Remove implementation-specific documentation
rm -f IMPLEMENTATION_BACKUP_2025-11-02.md
rm -f TESTING_GUIDE_2025-11-02.md
rm -f ROLLBACK_INSTRUCTIONS_2025-11-02.md

# Or keep for reference
mv IMPLEMENTATION_BACKUP_2025-11-02.md docs/archive/
mv TESTING_GUIDE_2025-11-02.md docs/archive/
mv ROLLBACK_INSTRUCTIONS_2025-11-02.md docs/archive/
```

---

## File-by-File Restoration

If you only need to rollback specific files:

### Vendor Detail Page Only
```bash
git checkout 6996b14 -- src/app/vendors/[id]/page.tsx
```

### Dashboard Only
```bash
git checkout 6996b14 -- src/app/dashboard-improved.tsx
git checkout 6996b14 -- src/components/dashboard/action-required-section.tsx
```

### Remove New Components Only
```bash
rm -f src/components/vendors/vendor-summary-view.tsx
rm -f src/components/vendors/invoice-detail-view.tsx
```

---

## Verification Checklist After Rollback

Complete all checks:

### TypeScript & Build
- [ ] `npm run type-check` → No errors
- [ ] `npm run build` → Successful build
- [ ] `npm run lint` → No critical errors

### Functionality
- [ ] Dashboard loads at http://localhost:3000
- [ ] Vendor pages load correctly
- [ ] Invoice pages load at `/invoices/[id]`
- [ ] All navigation works
- [ ] No console errors

### Data Integrity
- [ ] Correct invoices display
- [ ] Vendor data accurate
- [ ] No data loss or corruption

### Performance
- [ ] Page load time acceptable
- [ ] No significant slowdowns
- [ ] Memory usage normal

---

## Rollback Completed - Next Steps

### Immediate Actions
1. **Document what went wrong**:
   - Write post-mortem of issues encountered
   - List specific bugs/UX problems
   - Note any data integrity issues

2. **Communicate rollback**:
   - Notify team of rollback
   - Explain reason for rollback
   - Share lessons learned

3. **Plan next iteration**:
   - Review what didn't work
   - Consider alternative approaches
   - Schedule follow-up implementation

### Future Implementation Attempts

Before attempting implementation again:
- [ ] Address identified issues
- [ ] Create more comprehensive tests
- [ ] Consider phased rollout (beta users first)
- [ ] Set up better monitoring
- [ ] Have rollback plan ready

---

## Emergency Contacts

If rollback fails or causes additional issues:

**Developer**: [Your name]
**Project Lead**: [Lead name]
**DevOps**: [DevOps contact]

**Escalation Path**:
1. Check git status and commit history
2. Restore from backup if available
3. Contact senior developer
4. Consider full repository re-clone if corruption suspected

---

## Rollback Completion Checklist

Sign off when rollback is complete:

- [ ] All files reverted to commit 6996b14
- [ ] New components removed
- [ ] TypeScript compilation successful
- [ ] Dev server running without errors
- [ ] All functionality tested and working
- [ ] Documentation updated
- [ ] Team notified
- [ ] Post-mortem document created

**Rollback Executed By**: ___________
**Rollback Date**: ___________
**Rollback Time**: ___________
**Verification Completed**: ___________
**Status**: ⬜ Success / ⬜ Partial / ⬜ Failed

---

## Backup Plan (If Rollback Fails)

If git revert doesn't work:

```bash
# Clone fresh copy of repository
cd /Users/zackram
git clone [repository-url] Drift.AI-V2-backup
cd Drift.AI-V2-backup

# Checkout known good commit
git checkout 6996b14

# Install dependencies
npm install

# Start server
npm run dev

# Verify works at http://localhost:3000

# If successful, replace old directory
cd /Users/zackram
mv Drift.AI-V2 Drift.AI-V2-broken
mv Drift.AI-V2-backup Drift.AI-V2
```

---

**Document Created**: November 2, 2025
**Last Updated**: November 2, 2025
**Version**: 1.0
**Status**: Ready for Use if Needed
