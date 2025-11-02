# Supporting Evidence Section - UX Redesign Mockup

## Executive Summary

This document provides a visual specification for redesigning the "Supporting Evidence" section in the AI Analysis card of the invoice detail view. The redesign focuses on **clarity**, **prominence**, and **trust-building** to increase user engagement with the evidence viewer feature.

---

## Current Implementation (BEFORE)

```
┌─────────────────────────────────────────────────────────────┐
│ AI Analysis                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [AI rationale text in gray background box]                 │
│                                                             │
│ Processing time: 2.3s  Model: claude-3.5-sonnet           │
│                                                             │
│ ─────────────────────────────────────────────────────────  │ ← Thin border
│                                                             │
│ Supporting Evidence                          ← Small text  │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │  👁  View Interactive Evidence                      │   │ ← Outline button (low prominence)
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ See highlighted invoice sections with AI explanations      │ ← Tiny gray text
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Problems with Current Design:
1. ❌ **Low visual hierarchy** - Outline button blends in
2. ❌ **Generic heading** - "Supporting Evidence" is vague
3. ❌ **No preview** - Users don't know what to expect
4. ❌ **Weak value prop** - Doesn't explain WHY to click
5. ❌ **Tiny description** - text-xs is too small to read
6. ❌ **No trust signals** - No indication of AI quality/completeness

---

## Recommended Redesign (AFTER)

### Option 1: Enhanced Section with Badge Preview

```
┌─────────────────────────────────────────────────────────────┐
│ AI Analysis                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [AI rationale text in gray background box]                 │
│                                                             │
│ Processing time: 2.3s  Model: claude-3.5-sonnet           │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 🔹  See How AI Analyzed This Invoice     ✨ GPT-4  │   │ ← LEFT BORDER: Orange (4px)
│ │                                                     │   │ ← BACKGROUND: Subtle gradient gray
│ │ ┏━━━━━━━━━━━┓ ┏━━━━━━━━━━┓ ┏━━━━━━━━━━━━┓        │   │
│ │ ┃ ✓ 3 Exact┃ ┃ ⓘ 1      ┃ ┃ ⚠ 1        ┃        │   │ ← Colored badges
│ │ ┃   Matches┃ ┃   Compliant┃ ┃   Discrepancy┃     │   │ ← (Green, Blue, Red)
│ │ ┗━━━━━━━━━━━┛ ┗━━━━━━━━━━┛ ┗━━━━━━━━━━━━┛        │   │
│ │                                                     │   │
│ │ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   │   │
│ │ ┃  🔍  Explore AI's Analysis              →  ┃   │   │ ← Prominent button
│ │ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   │   │ ← Orange border, hover: filled
│ │                                                     │   │
│ │ ✓  5 highlighted sections with AI reasoning        │   │ ← Benefit-focused bullets
│ │ ✓  Click any highlight to see contract references  │   │ ← text-sm (readable)
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Color Specifications:**
- **Section Background**: `bg-gradient-to-br from-gray-50 to-white`
- **Left Border**: `border-l-4 border-brand-orange` (#FF6B35)
- **Badges**:
  - Green: `bg-success/10 text-success border-success` (#22C55E)
  - Blue: `bg-blue-500/10 text-blue-600 border-blue-500` (#3B82F6)
  - Red: `bg-error/10 text-error border-error` (#EF4444)
- **Button**: `border-2 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white`

---

### Option 2: Compact Version (If Space Constrained)

```
┌─────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────┐   │
│ │ 🔹  AI Analysis Breakdown           ✨ GPT-4 Vision │   │
│ │                                                     │   │
│ │ 3 Matches ✓  •  1 Compliant ⓘ  •  1 Issue ⚠       │   │ ← Inline badges
│ │                                                     │   │
│ │ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   │   │
│ │ ┃  🔍  Explore AI's Analysis              →  ┃   │   │
│ │ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   │   │
│ │                                                     │   │
│ │ Interactive highlights • Contract references       │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

### Option 3: High-Urgency Variant (When Discrepancies Exist)

```
┌─────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────┐   │
│ │ ⚠  Review Discrepancy Evidence          ✨ GPT-4   │   │ ← LEFT BORDER: Red (urgent)
│ │                                                     │   │ ← BACKGROUND: Light warning yellow
│ │ ⚠  1 DISCREPANCY FOUND - Review Required           │   │ ← Urgent message
│ │                                                     │   │
│ │ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   │   │
│ │ ┃  👁  See What AI Flagged               →  ┃   │   │ ← Red/orange button
│ │ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   │   │
│ │                                                     │   │
│ │ Quantity exceeds contract limit by 300 units       │   │ ← Specific issue preview
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. Section Header

```tsx
<div className="flex items-center justify-between mb-3">
  <h4 className="text-base font-semibold text-foreground">
    See How AI Analyzed This Invoice
  </h4>
  <Badge variant="outline" className="text-xs">
    <Sparkles className="h-3 w-3 mr-1 text-brand-orange" />
    GPT-4 Vision
  </Badge>
</div>
```

**Why this works:**
- ✅ **Specific heading** tells users exactly what they'll see
- ✅ **Trust badge** shows AI model quality
- ✅ **Sparkles icon** reinforces AI/intelligent analysis
- ✅ **text-base** (16px) is readable vs. current text-sm (14px)

---

### 2. Preview Badge Strip

```tsx
<div className="flex gap-2 mb-4">
  <Badge className="bg-success/10 text-success border-success text-xs">
    <CheckCircle className="h-3 w-3 mr-1" />
    3 Exact Matches
  </Badge>
  <Badge className="bg-blue-500/10 text-blue-600 border-blue-500 text-xs">
    <Info className="h-3 w-3 mr-1" />
    1 Compliant
  </Badge>
  <Badge className="bg-error/10 text-error border-error text-xs">
    <AlertTriangle className="h-3 w-3 mr-1" />
    1 Discrepancy
  </Badge>
</div>
```

**Why this works:**
- ✅ **Visual preview** of what's in the evidence viewer
- ✅ **Color coding** creates instant understanding (green=good, red=issue)
- ✅ **Counts** show completeness ("AI checked 5 things")
- ✅ **Icons** provide visual anchors for scanning

---

### 3. Primary CTA Button

```tsx
<Button
  onClick={() => window.location.href = `/vendors/${vendorId}/invoice/${invoiceId}/evidence`}
  className="w-full bg-white border-2 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white transition-colors"
>
  <FileSearch className="h-4 w-4 mr-2" />
  Explore AI's Analysis
  <ArrowRight className="h-4 w-4 ml-auto" />
</Button>
```

**Why this works:**
- ✅ **Orange border** creates visual prominence (brand color)
- ✅ **FileSearch icon** suggests investigation/analysis
- ✅ **Arrow icon** indicates navigation to new page
- ✅ **Hover state** (fills with orange) provides clear feedback
- ✅ **Benefit-focused text** ("Explore" vs. "View")

---

### 4. Benefit Descriptions

```tsx
<div className="mt-3 space-y-1">
  <p className="text-sm text-foreground flex items-center gap-2">
    <CheckCircle className="h-4 w-4 text-brand-orange flex-shrink-0" />
    5 highlighted sections with AI reasoning
  </p>
  <p className="text-sm text-muted-foreground flex items-center gap-2">
    <CheckCircle className="h-4 w-4 text-brand-orange flex-shrink-0" />
    Click any highlight to see contract references
  </p>
</div>
```

**Why this works:**
- ✅ **Bullet format** is scannable and clear
- ✅ **Specific details** ("5 sections", "contract references") set expectations
- ✅ **Orange checkmarks** tie to brand and suggest completeness
- ✅ **text-sm** (14px) is readable vs. current text-xs (12px)

---

## Full Code Implementation (Phase 1)

Replace lines 277-292 in `/Users/zackram/Drift.AI-V2/src/components/vendors/invoice-detail-view.tsx`:

```tsx
{/* Evidence Viewer Section - Enhanced Design */}
<div className="pt-6 pb-4 px-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border-l-4 border-brand-orange">
  {/* Header with Trust Badge */}
  <div className="flex items-center justify-between mb-3">
    <h4 className="text-base font-semibold text-foreground">
      See How AI Analyzed This Invoice
    </h4>
    <Badge variant="outline" className="text-xs border-brand-orange/30">
      <Sparkles className="h-3 w-3 mr-1 text-brand-orange" />
      GPT-4 Vision
    </Badge>
  </div>

  {/* Preview Badge Strip */}
  <div className="flex gap-2 mb-4 flex-wrap">
    <Badge className="bg-success/10 text-success border-success text-xs">
      <CheckCircle className="h-3 w-3 mr-1" />
      3 Exact Matches
    </Badge>
    <Badge className="bg-blue-500/10 text-blue-600 border-blue-500 text-xs">
      <Info className="h-3 w-3 mr-1" />
      1 Compliant
    </Badge>
    <Badge className="bg-error/10 text-error border-error text-xs">
      <AlertTriangle className="h-3 w-3 mr-1" />
      1 Discrepancy
    </Badge>
  </div>

  {/* Primary CTA */}
  <Button
    onClick={() => {
      window.location.href = `/vendors/${vendorId}/invoice/${invoiceId}/evidence`
    }}
    className="w-full bg-white border-2 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white transition-colors"
  >
    <FileSearch className="h-4 w-4 mr-2" />
    Explore AI's Analysis
    <ArrowRight className="h-4 w-4 ml-auto" />
  </Button>

  {/* Benefit Descriptions */}
  <div className="mt-3 space-y-1">
    <p className="text-sm text-foreground flex items-center gap-2">
      <CheckCircle className="h-4 w-4 text-brand-orange flex-shrink-0" />
      5 highlighted sections with AI reasoning
    </p>
    <p className="text-sm text-muted-foreground flex items-center gap-2">
      <CheckCircle className="h-4 w-4 text-brand-orange flex-shrink-0" />
      Click any highlight to see contract references
    </p>
  </div>
</div>
```

### Additional Imports Needed:

Add to the existing imports at the top of the file (lines 4-12):

```tsx
import {
  ArrowLeft,
  Building2,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  // Add these new icons:
  Sparkles,
  FileSearch,
  ArrowRight,
  Info
} from 'lucide-react'
```

---

## Conditional Variant (Phase 2)

For invoices with discrepancies, use this urgent variant:

```tsx
{/* Evidence Viewer Section - URGENT VARIANT */}
{reconciliationReport.hasDiscrepancies ? (
  <div className="pt-6 pb-4 px-4 bg-warning/5 rounded-lg border-l-4 border-error">
    <div className="flex items-center justify-between mb-3">
      <h4 className="text-base font-semibold text-error flex items-center gap-2">
        <AlertTriangle className="h-5 w-5" />
        Review Discrepancy Evidence
      </h4>
      <Badge variant="outline" className="text-xs border-brand-orange/30">
        <Sparkles className="h-3 w-3 mr-1 text-brand-orange" />
        GPT-4 Vision
      </Badge>
    </div>

    <div className="mb-4 p-3 bg-white rounded-md border border-warning">
      <p className="text-sm font-medium text-error">
        {reconciliationReport.discrepancies.length} discrepancy(ies) found - Review required
      </p>
    </div>

    <Button
      onClick={() => {
        window.location.href = `/vendors/${vendorId}/invoice/${invoiceId}/evidence`
      }}
      className="w-full bg-error hover:bg-error/90 text-white"
    >
      <AlertTriangle className="h-4 w-4 mr-2" />
      See What AI Flagged
      <ArrowRight className="h-4 w-4 ml-auto" />
    </Button>

    <p className="mt-3 text-sm text-muted-foreground">
      Review highlighted discrepancies and contract violations
    </p>
  </div>
) : (
  // Standard variant (code from Phase 1)
)}
```

---

## Responsive Behavior

### Mobile (< 768px)

```tsx
// Badge strip stacks vertically on mobile
<div className="flex flex-col sm:flex-row gap-2 mb-4">
  {/* Badges here */}
</div>

// Reduce padding on mobile
<div className="pt-4 sm:pt-6 pb-3 sm:pb-4 px-3 sm:px-4 ...">
```

### Desktop (> 1024px)

No changes needed - the design works well at all desktop sizes.

---

## Accessibility Improvements

```tsx
<Button
  onClick={() => {
    window.location.href = `/vendors/${vendorId}/invoice/${invoiceId}/evidence`
  }}
  className="w-full bg-white border-2 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white transition-colors"
  aria-label="View detailed AI analysis with 5 highlighted invoice sections and contract references"
  aria-describedby="evidence-description"
>
  <FileSearch className="h-4 w-4 mr-2" aria-hidden="true" />
  Explore AI's Analysis
  <ArrowRight className="h-4 w-4 ml-auto" aria-hidden="true" />
</Button>

<div id="evidence-description" className="sr-only">
  Opens an interactive page showing the invoice with color-coded highlights.
  Click any highlight to see AI explanations and contract references.
</div>
```

---

## A/B Testing Recommendations

### Test 1: Heading Language

**Control (A):** "See How AI Analyzed This Invoice"
**Variant (B):** "AI Analysis Breakdown"
**Variant (C):** "Verify AI's Reconciliation"

**Hypothesis:** More specific language ("See How...") will increase engagement.

---

### Test 2: Button Text

**Control (A):** "Explore AI's Analysis"
**Variant (B):** "Review Evidence Details"
**Variant (C):** "See What AI Found"

**Hypothesis:** Action-oriented language ("Explore") will outperform passive language ("Review").

---

### Test 3: Badge Presence

**Control (A):** Full badge strip with counts
**Variant (B):** No badges, just button and description
**Variant (C):** Inline text: "3 matches, 1 compliant, 1 issue"

**Hypothesis:** Visual badges will increase clicks by 30%+ vs. no preview.

---

## Success Criteria

### Primary Metrics:
1. **Click-through rate**: > 60% of invoice viewers click "Explore AI's Analysis"
2. **Time on evidence page**: > 45 seconds average (indicates engagement)
3. **Bounce rate from evidence page**: < 20% (users find it valuable)

### Secondary Metrics:
1. **User confidence surveys**: "How confident are you in AI's analysis?" > 4/5 stars
2. **Feature awareness**: "Did you know you could view AI evidence?" > 80% awareness
3. **Support tickets**: Reduction in "How did AI decide this?" questions

---

## Design Rationale Summary

### Why This Design Works:

1. **Visual Hierarchy**
   - Orange left border creates instant attention
   - Large heading (text-base) establishes importance
   - Button with orange accent commands focus

2. **Progressive Disclosure**
   - Badge preview shows "what's inside" without overwhelming
   - Counts give users sense of completeness
   - Descriptions clarify expectations

3. **Trust Building**
   - GPT-4 Vision badge signals quality
   - Specific counts (5 highlights) show thoroughness
   - Color coding (green/blue/red) provides transparency

4. **User Mental Model Alignment**
   - "See How AI Analyzed" matches user question: "How did it decide?"
   - "Contract references" addresses auditability concern
   - Interactive language ("Explore") invites investigation

5. **Scannability**
   - Visual badges can be understood in < 2 seconds
   - Bullet points are easy to scan
   - Icons provide visual anchors

---

## Next Steps

1. **Phase 1 (Quick Win)**: Implement basic redesign with new heading, button, and descriptions
2. **Phase 2 (Visual Enhancement)**: Add badge strip and conditional styling
3. **Phase 3 (Advanced)**: Add thumbnail preview and hover interactions
4. **A/B Testing**: Test heading and button variations
5. **User Research**: Conduct usability tests with 5-10 nursing home finance users

---

## Questions for Stakeholders

1. **Do we have access to actual highlight counts** or should we hardcode "5 highlights" for now?
2. **Should discrepancy variant be red or orange** for the CTA button? (Red = urgent, Orange = brand)
3. **Mobile strategy**: Should we show fewer badges on mobile or stack them vertically?
4. **Analytics**: Do we have tracking in place to measure click-through rates?
5. **Timeline**: When do we want to ship Phase 1 vs. Phase 2?

---

**Document Version**: 1.0
**Created**: November 2, 2025
**Author**: UX Audit Agent
**Status**: Ready for Frontend Implementation

