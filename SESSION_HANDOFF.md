# DRIFT.AI V2 - New Session Quick Start

**Copy this entire document into a new Claude Code session to get up to speed instantly.**

---

## 📍 Project Overview

**Project Name**: DRIFT.AI V2 Contract Reconciliation Platform
**Current Version**: 2.0.4
**Last Updated**: November 2, 2025
**Status**: Production-ready, actively deployed

**Purpose**: AI-powered contract reconciliation platform for nursing home operators. Uses GPT-4 Vision to analyze vendor contracts and invoices, automatically detecting pricing discrepancies.

---

## 🗂️ Project Location

**Absolute Path**: `/Users/zackram/Drift.AI-V2`

**Key Directories**:
- Source code: `/Users/zackram/Drift.AI-V2/src/`
- Components: `/Users/zackram/Drift.AI-V2/src/components/`
- Pages: `/Users/zackram/Drift.AI-V2/src/app/`
- Documentation: `/Users/zackram/Drift.AI-V2/CLAUDE.md`

---

## 🚀 Tech Stack

**Core**:
- Next.js 14.2.33 (App Router)
- React 18
- TypeScript (strict mode)
- Tailwind CSS 3.4.0
- shadcn/ui components

**State Management**: TanStack React Query 5.85.3
**Icons**: Lucide React
**Deployment**: Vercel
**Version Control**: Git + GitHub

---

## 🌐 URLs

### Local Development
- **Server**: http://localhost:3004 (or next available port)
- **Command**: `npm run dev` (likely already running)

### Production (Live)
- **Current**: https://driftai-v2-izwt0dqpn-zramskys-projects.vercel.app
- **GitHub**: https://github.com/zramsky/drift-ai-v2

---

## 📋 What We Just Completed (v2.0.4)

### Interactive Dashboard Elements ✅
- **Files**:
  - `/Users/zackram/Drift.AI-V2/src/components/dashboard/action-required-section.tsx`
  - `/Users/zackram/Drift.AI-V2/src/components/dashboard/variance-vendors-table.tsx`
- **What**: Made dashboard items clickable for intuitive navigation
- **Features**:
  - Action Required cards navigate to invoice detail pages
  - Variance Vendors rows navigate to vendor detail pages
  - Hover states (hover:bg-gray-50)
  - Keyboard navigation support (Tab, Enter, Space)
  - Brand orange focus rings (#FF6B35)
  - Cursor pointer visual feedback
  - ARIA labels for screen readers
- **Technical**:
  - Used Next.js useRouter for navigation
  - Implemented onClick and onKeyDown handlers
  - Added role="button" and tabIndex={0} for accessibility
  - Consistent with existing vendor detail page pattern

---

## 🎨 Design System

**Brand Color**: Orange #FF6B35 (for CTAs, focus states, brand accents)
**Background**: White #FFFFFF
**Spacing**: 24-32px gaps throughout
**Typography**: Inter (headings), Roboto (body)
**Responsive**: Mobile-first (1 col → 2 col → 4 col)

**Key Design Patterns**:
```tsx
// Cards
<Card className="flex flex-col h-full">
  <CardHeader className="flex-shrink-0">...</CardHeader>
  <CardContent className="flex-grow">...</CardContent>
</Card>

// Grid layouts
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-stretch">

// Brand orange for CTAs
<Button className="bg-brand-orange hover:bg-orange-600">
```

---

## 📂 Important Files Reference

### Pages (Next.js App Router)
- **Dashboard**: `/Users/zackram/Drift.AI-V2/src/app/dashboard-improved.tsx`
- **Vendors List**: `/Users/zackram/Drift.AI-V2/src/app/vendors/page.tsx`
- **Vendor Detail**: `/Users/zackram/Drift.AI-V2/src/app/vendors/[id]/page.tsx` ⭐ (just updated)
- **Main Layout**: `/Users/zackram/Drift.AI-V2/src/components/layout/main-layout.tsx`

### Components
- **Dashboard KPI Card**: `/Users/zackram/Drift.AI-V2/src/components/dashboard/dashboard-kpi-card.tsx`
- **shadcn/ui**: `/Users/zackram/Drift.AI-V2/src/components/ui/` (Table, Card, Badge, Button, etc.)

### Configuration
- **Tailwind**: `/Users/zackram/Drift.AI-V2/tailwind.config.ts` ⭐ (just fixed)
- **TypeScript**: `/Users/zackram/Drift.AI-V2/tsconfig.json`
- **Next.js**: `/Users/zackram/Drift.AI-V2/next.config.js`
- **Package**: `/Users/zackram/Drift.AI-V2/package.json`

### Documentation
- **Full Docs**: `/Users/zackram/Drift.AI-V2/CLAUDE.md` ⭐ (updated with v2.0.3)
- **Context**: `/Users/zackram/Drift.AI-V2/CONTEXT_HANDOFF.md`
- **This File**: `/Users/zackram/Drift.AI-V2/SESSION_HANDOFF.md`

---

## 🔄 Recent Version History

### v2.0.4 (Current - Nov 2, 2025) ⭐
- Interactive Action Required cards (click to navigate to invoices)
- Clickable Variance Vendors table rows (navigate to vendor detail)
- Hover states with gray backgrounds
- Full keyboard navigation (Tab, Enter, Space)
- Brand orange focus rings for accessibility
- **Deployed to production**: ✅

### v2.0.3 (Nov 1, 2025)
- Equal-height two-column layout for vendor cards
- Enhanced Recent Activity table (4 columns, clickable rows)
- Fixed Tailwind grid utilities (critical bug)
- **Deployed to production**: ✅

### v2.0.2 (Nov 1, 2025)
- Dashboard KPI card redesign
- Created DashboardKPICard component
- Removed duplicate header bug
- Professional white/orange design

---

## 🎯 Current State Summary

**What's Working**:
- ✅ Dashboard with redesigned KPI cards (v2.0.2)
- ✅ Interactive Action Required cards - click to navigate to invoices (v2.0.4)
- ✅ Clickable Variance Vendors table - navigate to vendor detail (v2.0.4)
- ✅ Full keyboard navigation with brand orange focus rings (v2.0.4)
- ✅ Vendors list page with clickable rows
- ✅ Vendor detail page with equal-height cards
- ✅ Recent Activity as professional table
- ✅ Full responsive design (mobile, tablet, desktop)
- ✅ All Tailwind grid utilities working
- ✅ Zero TypeScript errors
- ✅ Deployed to Vercel production

**What Uses Mock Data**:
- Dashboard stats
- Vendor invoices (shows 1-2 sample invoices)
- Action items
- Variance vendors

---

## 🔧 Common Commands

```bash
# Navigate to project
cd /Users/zackram/Drift.AI-V2

# Start dev server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Run linter
npm run lint

# Deploy to Vercel
vercel --prod --yes

# Git workflow
git status
git add .
git commit -m "feat: description"
git push origin main
```

---

## 🛠️ Development Workflow

1. **Make changes** to files in `/Users/zackram/Drift.AI-V2/src/`
2. **Test locally** at http://localhost:3004
3. **Run type check**: `npm run type-check`
4. **Commit changes**: `git add . && git commit -m "feat: ..."`
5. **Push to GitHub**: `git push origin main`
6. **Deploy**: `vercel --prod --yes` (or auto-deploys from main branch)
7. **Update CLAUDE.md** with version entry

---

## 📌 Key Implementation Notes

### Vendor Detail Page Structure
```
Header (Vendor name + Active badge)
  ↓
Tabs (Summary | Invoices | Reports)
  ↓
KPI Cards (4 horizontal cards)
  ↓
TWO-COLUMN GRID (equal heights)
  ├─ Vendor Information Card
  └─ Contract Information Card
  ↓
Recent Activity Table (4 columns, 6 rows)
```

### Grid Layout Pattern
```tsx
// Vendor & Contract cards (line 193)
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-stretch">
  <Card className="flex flex-col h-full">...</Card>
  <Card className="flex flex-col h-full">...</Card>
</div>
```

### Table Pattern (Recent Activity)
```tsx
// Lines 387-485
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Invoice Date</TableHead>
      <TableHead>Invoice Number</TableHead>
      <TableHead className="text-right">Amount</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {invoices.slice(0, 6).map(invoice => (
      <TableRow
        onClick={() => router.push(`/invoices/${invoice.id}`)}
        className="cursor-pointer hover:bg-gray-50"
      >
        {/* TableCell components */}
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## 🔜 Next Possible Tasks

### High Priority
1. **Connect Real Data**: Replace mock data with actual API calls
2. **Invoice Detail Page**: Create `/invoices/[id]` route (currently 404)
3. **Add More Test Data**: Add 6+ invoices to test table fully
4. **Reports Page**: Build out analytics/reports section
5. **Settings Page**: User preferences and configuration

### Medium Priority
6. **Filtering/Search**: Add filters to Recent Activity table
7. **Export Functionality**: PDF/Excel export for invoice data
8. **Vendor Form Enhancements**: Improve edit vendor dialog
9. **Contract Upload**: Enhance contract upload workflow
10. **Dashboard Enhancements**: Real-time updates, date range picker

### Low Priority (Polish)
11. **Loading States**: Add skeleton loaders
12. **Error Boundaries**: Implement error handling UI
13. **Mobile Optimization**: Fine-tune mobile experience
14. **Performance**: Optimize bundle size
15. **Documentation**: Add component JSDocs

---

## 🚨 Important Gotchas

### 1. Tailwind Grid Classes
**Issue**: Custom gridTemplateColumns in config was overriding defaults
**Fix**: Now inside `theme.extend` - DO NOT move it back out
**Location**: `/Users/zackram/Drift.AI-V2/tailwind.config.ts`

### 2. Header Architecture
**Important**: MainLayout provides the header (search bar, notifications, user icon)
**Don't**: Add duplicate headers to individual pages
**Why**: Was causing duplicate header bug in v2.0.1

### 3. Mock Data Locations
**Dashboard**: Lines 80-82 in `dashboard-improved.tsx`
**Vendors**: Uses `mockVendors` from `/Users/zackram/Drift.AI-V2/src/lib/mock-data.ts`
**Invoices**: Uses `mockInvoices` from same file

### 4. Port Management
Dev server tries ports: 3000 → 3001 → 3002 → 3003 → 3004
**Current**: Usually 3004 (check terminal output)

---

## 🎓 Design System Quick Reference

### Colors (Tailwind Classes)
```css
bg-brand-orange      /* #FF6B35 */
text-brand-orange    /* #FF6B35 */
bg-white             /* #FFFFFF */
text-gray-900        /* Primary text */
text-gray-500        /* Secondary text */
border-gray-200      /* Borders */
```

### Spacing
```css
gap-6                /* 24px */
gap-8                /* 32px */
p-6                  /* 24px padding */
space-y-6            /* 24px vertical spacing */
```

### Responsive Breakpoints
```css
sm:   640px   /* Tablet */
md:   768px   /* Tablet landscape */
lg:   1024px  /* Desktop */
xl:   1280px  /* Large desktop */
```

### Common Patterns
```tsx
// KPI Card
<DashboardKPICard
  title="Total Invoices"
  value={15}
  description="Total processed"
  icon={Building2}
  aria-label="Total number of invoices processed"
/>

// Status Badge
<Badge variant="success">Clean</Badge>
<Badge variant="warning">Flagged</Badge>
<Badge variant="error">Rejected</Badge>

// Primary Button
<Button className="bg-brand-orange hover:bg-orange-600">
  Primary Action
</Button>
```

---

## 💡 Pro Tips

1. **Always read CLAUDE.md first** for latest changes
2. **Use agents for complex tasks** to save context
3. **Test on multiple breakpoints** (375px, 768px, 1440px)
4. **Run type-check before committing** (`npm run type-check`)
5. **Update CLAUDE.md** after significant changes
6. **Follow mobile-first design** (mobile → tablet → desktop)
7. **Use shadcn/ui components** when available (don't reinvent)

---

## 📝 Quick Testing Checklist

Before deploying any changes:
- [ ] `npm run type-check` passes
- [ ] No console errors in browser
- [ ] Desktop view (1440px) looks correct
- [ ] Tablet view (768px) looks correct
- [ ] Mobile view (375px) looks correct
- [ ] Keyboard navigation works
- [ ] Brand colors used correctly (#FF6B35)
- [ ] CLAUDE.md updated with changes

---

## 🆘 Getting Help

**Full Documentation**: `/Users/zackram/Drift.AI-V2/CLAUDE.md`
**Design System**: See CLAUDE.md "Design System" section
**Component Examples**: Look at existing pages (dashboard, vendors)
**shadcn/ui Docs**: https://ui.shadcn.com
**Tailwind Docs**: https://tailwindcss.com

---

## ✅ Ready to Start

You now have everything you need to continue working on DRIFT.AI V2!

**Current version**: 2.0.4
**Last session**: Implemented interactive dashboard elements
**Production**: ✅ Deployed and live
**Next**: Choose a task from "Next Possible Tasks" above

**Copy the "Common Commands" section** and you're ready to code! 🚀

---

**Document Last Updated**: November 2, 2025
**By**: Claude Code Session
**Session ID**: drift-ai-v2-enhancements-session
