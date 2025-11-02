# DRIFT.AI Contract Reconciliation Platform V2

## Project Overview

**DRIFT.AI** is an AI-powered contract reconciliation platform designed specifically for nursing home operators to streamline vendor contract management and automated invoice reconciliation. The platform leverages GPT-4 Vision to intelligently analyze contracts and invoices, automatically detecting discrepancies and providing actionable insights.

### Core Purpose
Nursing home operators manage hundreds of vendor contracts and process thousands of invoices annually. DRIFT.AI automates the reconciliation process, reducing manual review time by 85% and catching pricing discrepancies that would otherwise go unnoticed.

### Key Value Propositions
- **AI-Powered Analysis**: GPT-4 Vision extracts contract terms and invoice line items automatically
- **Real-Time Discrepancy Detection**: Instant identification of pricing, quantity, and terms violations
- **Vendor Management**: Centralized dashboard for all vendor relationships and contract lifecycles
- **Analytics & Reporting**: Comprehensive insights into spending patterns and contract compliance
- **Mobile-First Design**: Full functionality across desktop, tablet, and mobile devices

---

## Version Control & Change Tracking

### Current Version
**Version**: 2.0.0
**Last Updated**: November 1, 2025
**Status**: Active Development

### Change Log Format

Use this template when documenting changes:

```markdown
### [Version Number] - YYYY-MM-DD
**Changed By**: [Your Name/Claude Code]
**Type**: [Feature/Fix/Enhancement/Refactor/Documentation]

#### Changes Made
- Brief description of change 1
- Brief description of change 2
- Brief description of change 3

#### Files Modified
- `/path/to/file1.tsx` - Description of modifications
- `/path/to/file2.ts` - Description of modifications

#### Impact
- User-facing impact or technical improvement description

#### Testing Notes
- What was tested and verified
```

### Recent Changes

#### [2.0.0] - 2025-09-02
**Changed By**: Development Team
**Type**: Major Feature - Sidebar Implementation

**Changes Made**:
- Implemented modern collapsible sidebar navigation system
- Fixed critical z-index and overlay rendering issues
- Added QueryClient provider for proper React Query integration
- Enhanced responsive behavior for mobile/desktop experiences
- Implemented comprehensive accessibility features (WCAG 2.1 AA compliant)

**Files Modified**:
- `/src/components/layout/sidebar.tsx` - Complete sidebar redesign with collapse functionality
- `/src/components/layout/main-layout.tsx` - State management and provider integration
- `/src/components/settings/settings-sidebar.tsx` - Settings-specific navigation

**Impact**:
- Professional, modern navigation experience across all devices
- Improved mobile usability with drawer-based navigation
- Enhanced keyboard navigation and screen reader support

**Testing Notes**:
- Tested across Chrome, Firefox, Safari, Edge
- Verified mobile responsiveness on iOS and Android
- Accessibility audit completed and passed

---

## Architecture Overview

### Technology Stack

#### Core Framework
- **Next.js**: 14.2.25 (App Router)
- **React**: 18.3.1
- **TypeScript**: 5.x (Strict mode enabled)
- **Node.js**: >=18.0.0

#### UI & Styling
- **Tailwind CSS**: 3.4.0
- **shadcn/ui**: Component library built on Radix UI
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **Class Variance Authority**: Component variant management
- **Tailwind Merge**: Utility class conflict resolution

#### Data & State Management
- **TanStack React Query**: 5.85.3 - Server state management
- **React Hook Form**: 7.62.0 - Form state and validation
- **date-fns**: 4.1.0 - Date manipulation and formatting

#### Document Processing
- **PDF.js**: 5.4.54 - PDF rendering and text extraction
- **React PDF**: 10.1.0 - React wrapper for PDF.js
- **React Dropzone**: 14.3.8 - File upload handling

#### Charts & Analytics
- **Recharts**: 3.1.2 - Data visualization and charting

#### Testing
- **Playwright**: 1.55.0 - End-to-end testing
- **@playwright/test**: E2E test framework

#### Development Tools
- **ESLint**: 8.57.0 - Code linting
- **Autoprefixer**: CSS vendor prefixing
- **@vercel/analytics**: Performance monitoring

### Folder Structure

```
/Users/zackram/Drift.AI-V2/
├── src/
│   ├── app/                      # Next.js 15 App Router
│   │   ├── layout.tsx            # Root layout with providers
│   │   ├── page.tsx              # Homepage/Dashboard
│   │   ├── analytics/            # Analytics pages
│   │   ├── api/                  # API routes
│   │   │   └── health/           # Health check endpoint
│   │   ├── evidence/             # Evidence management
│   │   │   └── [id]/             # Dynamic evidence detail pages
│   │   ├── invoices/             # Invoice management
│   │   │   └── [id]/             # Dynamic invoice detail pages
│   │   ├── reports/              # Reporting pages
│   │   ├── search/               # Search functionality
│   │   ├── settings/             # Settings pages
│   │   └── vendors/              # Vendor management
│   │       └── [id]/             # Dynamic vendor detail pages
│   ├── components/               # React components
│   │   ├── dashboard/            # Dashboard-specific components
│   │   ├── error/                # Error handling components
│   │   ├── evidence/             # Evidence-related components
│   │   ├── exports/              # Export functionality
│   │   ├── findings/             # Findings display components
│   │   ├── invoices/             # Invoice components
│   │   ├── layout/               # Layout components (sidebar, header)
│   │   ├── loading/              # Loading states
│   │   ├── relevance/            # Relevance scoring components
│   │   ├── reports/              # Report generation components
│   │   ├── scan/                 # Document scanning components
│   │   ├── settings/             # Settings components
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── upload/               # File upload components
│   │   └── vendors/              # Vendor management components
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utility functions and configurations
│   ├── styles/                   # Global styles and CSS modules
│   └── types/                    # TypeScript type definitions
├── public/                       # Static assets (images, fonts, etc.)
├── tests/                        # Playwright E2E tests
├── package.json                  # Project dependencies
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── next.config.js                # Next.js configuration
├── playwright.config.ts          # Playwright test configuration
├── vercel.json                   # Vercel deployment configuration
└── CLAUDE.md                     # This file
```

### Key Components

#### Layout System
- **MainLayout** (`/src/components/layout/main-layout.tsx`): Primary application layout with sidebar and header
- **Sidebar** (`/src/components/layout/sidebar.tsx`): Collapsible navigation sidebar (280px expanded, 64px collapsed)
- **Header** (`/src/components/layout/header.tsx`): Top navigation bar with mobile hamburger menu

#### Dashboard Components
- Dashboard cards for key metrics
- Real-time analytics displays
- Quick action panels

#### Document Processing
- Contract upload and parsing
- Invoice upload and analysis
- PDF viewer with annotations

#### Vendor Management
- Vendor list and detail views
- Contract association and tracking
- Vendor performance metrics

---

## Development Guidelines

### Getting Started

#### Prerequisites
- Node.js >=18.0.0
- npm >=8.0.0
- Git

#### Initial Setup
```bash
# Clone the repository
cd /Users/zackram/Drift.AI-V2

# Install dependencies
npm install

# Run development server
npm run dev

# Open browser to http://localhost:3000
```

#### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build production bundle with type checking and linting |
| `npm run build:production` | Production build with NODE_ENV=production |
| `npm run build:vercel` | Vercel-optimized build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run type-check` | Run TypeScript compiler without emitting files |
| `npm run clean` | Remove build artifacts (.next, out, dist) |
| `npm run test` | Run Playwright E2E tests |
| `npm run test:ui` | Run tests with Playwright UI |
| `npm run test:debug` | Run tests in debug mode |
| `npm run test:report` | Show test report |

### Code Standards

#### TypeScript
- **Strict mode enabled**: All code must pass strict type checking
- **Explicit types**: Use explicit return types for functions
- **Interfaces over types**: Prefer interfaces for object shapes
- **No implicit any**: All variables must have explicit or inferred types

#### Component Structure
```typescript
// Component template
import { type FC } from 'react'

interface ComponentNameProps {
  // Props with explicit types
  prop1: string
  prop2?: number // Optional props marked with ?
  onAction: (value: string) => void // Callback types
}

export const ComponentName: FC<ComponentNameProps> = ({
  prop1,
  prop2 = 0, // Default values
  onAction
}) => {
  // Component logic

  return (
    <div className="...">
      {/* JSX */}
    </div>
  )
}
```

#### File Naming Conventions
- **Components**: PascalCase with `.tsx` extension (e.g., `DashboardCard.tsx`)
- **Utilities**: camelCase with `.ts` extension (e.g., `formatCurrency.ts`)
- **Pages**: kebab-case for route segments (e.g., `vendor-details/page.tsx`)
- **Types**: PascalCase with `.ts` extension (e.g., `Invoice.ts`)

#### Import Organization
```typescript
// 1. React and framework imports
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'

// 3. Internal utilities and hooks
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'

// 4. Components
import { Button } from '@/components/ui/button'
import { DashboardCard } from '@/components/dashboard/dashboard-card'

// 5. Types
import type { Invoice } from '@/types/invoice'

// 6. Styles (if needed)
import styles from './component.module.css'
```

#### Styling Guidelines
- **Tailwind-first**: Use Tailwind utility classes for all styling
- **Component variants**: Use Class Variance Authority for component variations
- **Conditional classes**: Use `cn()` utility for conditional class application
- **Responsive design**: Mobile-first approach with `sm:`, `md:`, `lg:` breakpoints
- **Consistent spacing**: Use Tailwind spacing scale (4px increments)

```typescript
// Good: Tailwind utilities with cn()
<div className={cn(
  "rounded-lg bg-white p-6 shadow-card",
  isActive && "border-2 border-brand-orange",
  className
)}>

// Avoid: Inline styles
<div style={{ borderRadius: '8px', backgroundColor: 'white' }}>
```

### State Management Patterns

#### Server State (React Query)
```typescript
// Use React Query for server data
const { data, isLoading, error } = useQuery({
  queryKey: ['invoices', vendorId],
  queryFn: () => fetchInvoices(vendorId),
  staleTime: 5 * 60 * 1000, // 5 minutes
})
```

#### Local State (React useState)
```typescript
// Use useState for component-local UI state
const [isOpen, setIsOpen] = useState(false)
const [searchQuery, setSearchQuery] = useState('')
```

#### Form State (React Hook Form)
```typescript
// Use React Hook Form for complex forms
const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  defaultValues: { ... }
})
```

### Error Handling

```typescript
// Always implement error boundaries for component trees
// Use try-catch for async operations
// Provide user-friendly error messages

try {
  const result = await processInvoice(invoiceData)
  return result
} catch (error) {
  console.error('Invoice processing failed:', error)
  toast.error('Failed to process invoice. Please try again.')
  return null
}
```

### Performance Best Practices
- **Code splitting**: Use dynamic imports for large components
- **Image optimization**: Use Next.js `<Image>` component
- **Memoization**: Use `useMemo` and `useCallback` for expensive computations
- **Lazy loading**: Implement pagination for large lists
- **Bundle analysis**: Regularly check bundle size with `npm run analyze`

---

## Design System

### Brand Identity

#### Primary Brand Color
**Orange**: `#FF6B35` - The signature DRIFT.AI color used throughout the platform

```css
/* Tailwind class */
.text-brand-orange { color: #FF6B35; }
.bg-brand-orange { background-color: #FF6B35; }
.border-brand-orange { border-color: #FF6B35; }

/* Hover states */
.hover:bg-brand-orange:hover { background-color: #FF6B35; }
```

### Color Palette

#### Semantic Colors

| Purpose | Color | Hex | Tailwind Class |
|---------|-------|-----|----------------|
| **Primary/Brand** | Orange | `#FF6B35` | `brand-orange` |
| **Success** | Green | `#22C55E` | `success` |
| **Warning** | Amber | `#F59E0B` | `warning` |
| **Error** | Red | `#EF4444` | `error` |
| **Info** | Blue | `#60A5FA` | `info` |

#### Surface Colors

| Surface Level | Color | Hex | Tailwind Class | Usage |
|---------------|-------|-----|----------------|-------|
| **Primary** | White | `#FFFFFF` | `surface-primary` | Main background, cards |
| **Secondary** | Light Gray | `#F8F9FA` | `surface-secondary` | Secondary backgrounds |
| **Tertiary** | Gray | `#F5F5F5` | `surface-tertiary` | Subtle contrast areas |

#### Text Colors

| Text Type | Color | Tailwind Class | Usage |
|-----------|-------|----------------|-------|
| **Primary** | Dark Gray | `foreground` | Body text, headings |
| **Secondary** | Medium Gray | `muted-foreground` | Supporting text, labels |
| **Tertiary** | Light Gray | `muted` | Disabled states, placeholders |
| **Brand** | Orange | `brand-orange` | Links, CTAs, emphasis |

### Typography

#### Font Families
- **Headings**: Inter (sans-serif)
- **Body**: Roboto (sans-serif)
- **Fallback**: system-ui, sans-serif

#### Type Scale

| Element | Size | Line Height | Weight | Tailwind Class |
|---------|------|-------------|--------|----------------|
| **H1 Large** | 72px (4.5rem) | 1.1 | 700 | `text-h1-lg` |
| **H1** | 56px (3.5rem) | 1.2 | 700 | `text-h1` |
| **H2** | 36px (2.25rem) | 1.3 | 600 | `text-h2` |
| **H3** | 28px (1.75rem) | 1.4 | 600 | `text-h3` |
| **Body Large** | 20px (1.25rem) | 1.6 | 400 | `text-body-lg` |
| **Body** | 18px (1.125rem) | 1.6 | 400 | `text-body` |
| **Base** | 16px (1rem) | 1.5 | 400 | `text-base` |
| **Small** | 14px (0.875rem) | 1.5 | 400 | `text-sm` |

#### Usage Guidelines
```typescript
// Page titles
<h1 className="text-h1 font-bold text-foreground">Dashboard</h1>

// Section headings
<h2 className="text-h2 font-semibold text-foreground">Recent Activity</h2>

// Body text
<p className="text-body text-muted-foreground">
  Invoice reconciliation details...
</p>
```

### Spacing System

Tailwind's default spacing scale (4px increments):

| Size | Pixels | Tailwind | Usage |
|------|--------|----------|--------|
| 0 | 0px | `0` | Reset |
| 1 | 4px | `1` | Minimal gaps |
| 2 | 8px | `2` | Small padding/margin |
| 3 | 12px | `3` | Compact spacing |
| 4 | 16px | `4` | Default padding |
| 6 | 24px | `6` | Medium spacing |
| 8 | 32px | `8` | Large spacing |
| 12 | 48px | `12` | Extra large spacing |
| 16 | 64px | `16` | Section spacing |

### Border Radius

| Size | Pixels | Tailwind | Usage |
|------|--------|----------|--------|
| **Small** | 4px | `rounded-sm` | Small elements |
| **Medium** | 6px | `rounded-md` | Buttons, inputs |
| **Large** | 8px | `rounded-lg` | Cards, modals |
| **Drift** | 12px | `rounded-drift` | Brand-specific radius |
| **Full** | 9999px | `rounded-full` | Pills, avatars |

### Shadows

| Type | Tailwind Class | Usage |
|------|----------------|-------|
| **Card** | `shadow-card` | Default card elevation |
| **Card Hover** | `shadow-card-hover` | Card hover state |
| **Focus Ring** | `shadow-focus-ring` | Focus indicator (brand orange) |

### Component Patterns

#### Card Component
```typescript
<div className="rounded-lg bg-white p-6 shadow-card hover:shadow-card-hover transition-shadow duration-200">
  <h3 className="text-h3 font-semibold mb-2">Card Title</h3>
  <p className="text-body text-muted-foreground">Card content...</p>
</div>
```

#### Button Variants
```typescript
// Primary button (brand orange)
<button className="px-4 py-2 bg-brand-orange text-white rounded-md hover:bg-orange-600 focus:ring-2 focus:ring-brand-orange">
  Primary Action
</button>

// Secondary button
<button className="px-4 py-2 bg-gray-100 text-gray-900 rounded-md hover:bg-gray-200">
  Secondary Action
</button>

// Outline button
<button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
  Outline Action
</button>
```

#### Input Fields
```typescript
<input
  type="text"
  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none"
  placeholder="Enter value..."
/>
```

### Responsive Design

#### Breakpoints
```typescript
// Tailwind default breakpoints
sm:  640px  // Small devices (phones)
md:  768px  // Medium devices (tablets)
lg:  1024px // Large devices (desktops)
xl:  1280px // Extra large devices
2xl: 1536px // Ultra wide displays
```

#### Mobile-First Approach
```typescript
// Stack on mobile, row on desktop
<div className="flex flex-col lg:flex-row gap-4">
  <div className="w-full lg:w-1/2">Column 1</div>
  <div className="w-full lg:w-1/2">Column 2</div>
</div>

// Hide on mobile, show on desktop
<div className="hidden lg:block">Desktop only content</div>

// Show on mobile, hide on desktop
<div className="block lg:hidden">Mobile only content</div>
```

### Accessibility

#### Focus States
All interactive elements must have visible focus indicators:
```typescript
focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2
```

#### Color Contrast
- Body text: Minimum 4.5:1 contrast ratio
- Large text (18px+): Minimum 3:1 contrast ratio
- Interactive elements: Minimum 4.5:1 contrast ratio

#### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Logical tab order throughout the application
- Skip links for main content areas

---

## Deployment Information

### Current Deployments

#### Production (Vercel)
- **URL**: https://frontend-gve1dxbn5-zramskys-projects.vercel.app/
- **Platform**: Vercel
- **Branch**: main (auto-deploy enabled)
- **Environment**: Production
- **Build Command**: `npm run build:vercel`
- **Node Version**: 18.x

#### Previous Production (Firebase)
- **URL**: https://contractrecplatform.web.app/
- **Platform**: Firebase Hosting
- **Status**: Legacy deployment (reference only)

### Deployment Process

#### Vercel Deployment (Current)

1. **Automatic Deployments**
   - Push to `main` branch triggers automatic production deployment
   - Pull requests generate preview deployments automatically

2. **Manual Deployment**
   ```bash
   # Deploy to production
   npm run deploy

   # Deploy preview
   npm run deploy:preview
   ```

3. **Environment Variables**
   Configure in Vercel dashboard:
   - API endpoint URLs
   - Authentication credentials
   - Feature flags
   - Analytics keys

#### Build Configuration

**vercel.json**:
```json
{
  "buildCommand": "npm run build:vercel",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

**Build Steps**:
1. Clean previous build artifacts
2. Compile Tailwind CSS
3. Run TypeScript type checking
4. Execute ESLint validation
5. Build Next.js production bundle
6. Generate static pages where applicable

### Environment Management

| Environment | Purpose | Auto-Deploy | URL Pattern |
|-------------|---------|-------------|-------------|
| **Production** | Live user-facing app | Yes (main branch) | production-domain.vercel.app |
| **Preview** | PR testing | Yes (per PR) | pr-[number]-project.vercel.app |
| **Development** | Local development | No | localhost:3000 |

### Health Checks

The application includes a health check endpoint:

**Endpoint**: `/api/health`

```bash
# Check application health
curl https://frontend-gve1dxbn5-zramskys-projects.vercel.app/api/health

# Response
{
  "status": "healthy",
  "timestamp": "2025-11-01T12:00:00.000Z",
  "version": "2.0.0"
}
```

### Performance Monitoring

**Vercel Analytics Integration**:
- Real User Monitoring (RUM)
- Core Web Vitals tracking
- Page performance metrics
- Bundle size analysis

**Key Metrics to Monitor**:
- **LCP (Largest Contentful Paint)**: Target <2.5s
- **FID (First Input Delay)**: Target <100ms
- **CLS (Cumulative Layout Shift)**: Target <0.1
- **TTFB (Time to First Byte)**: Target <600ms

---

## AI Development Notes

### Instructions for Claude Code

When working on this project, Claude Code should adhere to the following guidelines:

#### 1. Design System Compliance

**ALWAYS** use the brand orange color (`#FF6B35`) for:
- Primary call-to-action buttons
- Active navigation states
- Focus rings on interactive elements
- Brand accents and highlights
- Links in body content

```typescript
// Correct usage
<button className="bg-brand-orange hover:bg-orange-600 text-white">
  Primary Action
</button>

// Incorrect usage - don't use arbitrary orange values
<button className="bg-orange-500 text-white">
```

#### 2. Component Development

**Prefer shadcn/ui components** when available:
- Check `/src/components/ui/` for existing components first
- Use Radix UI primitives for accessible components
- Extend existing components rather than creating new ones
- Follow the established pattern for component variants

**Component Creation Checklist**:
- [ ] TypeScript interface for props
- [ ] Proper typing with FC or function component
- [ ] Responsive design (mobile-first)
- [ ] Accessibility attributes (ARIA labels, roles)
- [ ] Focus states with brand orange ring
- [ ] Loading and error states where applicable
- [ ] Tailwind classes using `cn()` utility

#### 3. File Operations

**Before creating new files**, check if similar functionality exists:
```bash
# Search for existing components
find /src/components -name "*component-name*"

# Search for similar functionality
grep -r "function-name" /src
```

**File creation priorities**:
1. Extend existing components first
2. Create new component only if truly unique
3. Follow established folder structure
4. Use consistent naming conventions

#### 4. Styling Guidelines

**MUST USE**:
- Tailwind utility classes (never inline styles)
- `cn()` utility for conditional classes
- Responsive breakpoints (`sm:`, `md:`, `lg:`)
- Brand color variables (not arbitrary values)

**AVOID**:
- Inline `style={{}}` attributes
- CSS modules or separate CSS files
- Arbitrary color values (use theme colors)
- Custom CSS classes outside Tailwind

```typescript
// Good
<div className={cn(
  "rounded-lg bg-white p-6",
  isActive && "border-2 border-brand-orange"
)}>

// Bad
<div style={{ borderRadius: '8px', padding: '24px' }}>
<div className="custom-card-style">
```

#### 5. State Management

**Use the appropriate state management tool**:

| Use Case | Tool | Example |
|----------|------|---------|
| Server data fetching | React Query | Invoice lists, vendor data |
| Local UI state | useState | Modal open/close, form inputs |
| Complex forms | React Hook Form | Multi-step forms, validation |
| Global app state | React Context (if needed) | User preferences, theme |

```typescript
// React Query for server data
const { data: invoices, isLoading } = useQuery({
  queryKey: ['invoices'],
  queryFn: fetchInvoices,
})

// useState for local UI state
const [isOpen, setIsOpen] = useState(false)

// React Hook Form for forms
const { register, handleSubmit } = useForm<FormData>()
```

#### 6. Error Handling

**Always implement proper error handling**:
```typescript
// API calls
try {
  const result = await apiCall()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  toast.error('User-friendly error message')
  return null
}

// React Query
const { data, error, isError } = useQuery({...})

if (isError) {
  return <ErrorDisplay error={error} />
}
```

#### 7. Accessibility Requirements

**Every interactive element must have**:
- Keyboard accessibility (tab navigation)
- Focus indicators (brand orange ring)
- ARIA labels where needed
- Semantic HTML elements

```typescript
// Good accessibility
<button
  aria-label="Close modal"
  className="focus:outline-none focus:ring-2 focus:ring-brand-orange"
  onClick={handleClose}
>
  <CloseIcon />
</button>

// Bad accessibility
<div onClick={handleClose}>X</div>
```

#### 8. Performance Considerations

**Optimize for performance**:
- Lazy load components with `dynamic()` from Next.js
- Memoize expensive computations with `useMemo`
- Avoid unnecessary re-renders with `useCallback`
- Implement pagination for large datasets
- Use Next.js Image component for images

```typescript
// Lazy loading
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./heavy-component'), {
  loading: () => <LoadingSpinner />
})

// Memoization
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data)
}, [data])
```

#### 9. Type Safety

**Maintain strict TypeScript compliance**:
- No `any` types (use `unknown` if necessary)
- Explicit return types for functions
- Interface over type for object shapes
- Import types with `type` keyword

```typescript
// Good
interface InvoiceProps {
  invoice: Invoice
  onUpdate: (id: string) => Promise<void>
}

export const InvoiceCard: FC<InvoiceProps> = ({ invoice, onUpdate }) => {
  // ...
}

// Bad
export const InvoiceCard = (props: any) => {
  // ...
}
```

#### 10. Testing Approach

When creating new features, consider:
- What E2E tests should be added (Playwright)
- Edge cases and error scenarios
- Mobile responsiveness testing
- Accessibility testing

#### 11. Documentation

**When creating or modifying components**:
- Add JSDoc comments for complex functions
- Update this CLAUDE.md file for significant changes
- Document props with TypeScript interfaces
- Include usage examples for reusable components

#### 12. Common Patterns to Follow

**Card Components**:
```typescript
<div className="rounded-lg bg-white p-6 shadow-card hover:shadow-card-hover transition-shadow">
  {/* Content */}
</div>
```

**Page Headers**:
```typescript
<div className="mb-8">
  <h1 className="text-h1 font-bold text-foreground mb-2">Page Title</h1>
  <p className="text-body text-muted-foreground">Page description</p>
</div>
```

**Loading States**:
```typescript
if (isLoading) {
  return <LoadingSkeleton />
}
```

**Error States**:
```typescript
if (isError) {
  return <ErrorDisplay error={error} retry={refetch} />
}
```

---

## Important File Locations

### Configuration Files

| File | Purpose | Location |
|------|---------|----------|
| **Package.json** | Dependencies and scripts | `/Users/zackram/Drift.AI-V2/package.json` |
| **TypeScript Config** | TypeScript compiler options | `/Users/zackram/Drift.AI-V2/tsconfig.json` |
| **Tailwind Config** | Design system configuration | `/Users/zackram/Drift.AI-V2/tailwind.config.ts` |
| **Next.js Config** | Next.js settings | `/Users/zackram/Drift.AI-V2/next.config.js` |
| **ESLint Config** | Linting rules | `/Users/zackram/Drift.AI-V2/.eslintrc.json` |
| **Playwright Config** | E2E test configuration | `/Users/zackram/Drift.AI-V2/playwright.config.ts` |
| **Vercel Config** | Deployment settings | `/Users/zackram/Drift.AI-V2/vercel.json` |

### Key Application Files

| File | Purpose | Location |
|------|---------|----------|
| **Root Layout** | App shell and providers | `/Users/zackram/Drift.AI-V2/src/app/layout.tsx` |
| **Homepage** | Dashboard/landing page | `/Users/zackram/Drift.AI-V2/src/app/page.tsx` |
| **Main Layout** | Sidebar and header wrapper | `/Users/zackram/Drift.AI-V2/src/components/layout/main-layout.tsx` |
| **Sidebar** | Navigation component | `/Users/zackram/Drift.AI-V2/src/components/layout/sidebar.tsx` |
| **Global Styles** | CSS variables and globals | `/Users/zackram/Drift.AI-V2/src/app/globals.css` |
| **Utility Functions** | Helper functions | `/Users/zackram/Drift.AI-V2/src/lib/` |
| **Type Definitions** | TypeScript types | `/Users/zackram/Drift.AI-V2/src/types/` |

### Component Directories

| Directory | Purpose | Location |
|-----------|---------|----------|
| **UI Components** | shadcn/ui base components | `/Users/zackram/Drift.AI-V2/src/components/ui/` |
| **Layout Components** | Page structure components | `/Users/zackram/Drift.AI-V2/src/components/layout/` |
| **Dashboard** | Dashboard-specific widgets | `/Users/zackram/Drift.AI-V2/src/components/dashboard/` |
| **Invoices** | Invoice management UI | `/Users/zackram/Drift.AI-V2/src/components/invoices/` |
| **Vendors** | Vendor management UI | `/Users/zackram/Drift.AI-V2/src/components/vendors/` |
| **Settings** | Settings pages and forms | `/Users/zackram/Drift.AI-V2/src/components/settings/` |

### Documentation Files

| File | Purpose | Location |
|------|---------|----------|
| **This File** | Project documentation | `/Users/zackram/Drift.AI-V2/CLAUDE.md` |
| **README** | General project info | `/Users/zackram/Drift.AI-V2/README.md` |
| **Dashboard Design** | UI/UX specifications | `/Users/zackram/Drift.AI-V2/DRIFT_AI_NEW_DASHBOARD_DESIGN.md` |
| **Card System Guide** | Card component patterns | `/Users/zackram/Drift.AI-V2/IMPROVED_CARD_SYSTEM_GUIDE.md` |
| **E2E Test Report** | Testing documentation | `/Users/zackram/Drift.AI-V2/e2e-test-report.md` |
| **Frontend Enhancements** | Feature summary | `/Users/zackram/Drift.AI-V2/FRONTEND_ENHANCEMENTS_SUMMARY.md` |

---

## Quick Reference

### Brand Orange Color
```
Hex: #FF6B35
Tailwind: brand-orange
RGB: rgb(255, 107, 53)
HSL: hsl(16, 100%, 60%)
```

### Most Common Commands
```bash
# Start development
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Type check
npm run type-check

# Deploy to production
npm run deploy
```

### Most Common Tailwind Patterns
```typescript
// Card
className="rounded-lg bg-white p-6 shadow-card"

// Primary button
className="px-4 py-2 bg-brand-orange text-white rounded-md hover:bg-orange-600"

// Focus ring
className="focus:outline-none focus:ring-2 focus:ring-brand-orange"

// Responsive layout
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
```

### Component Import Paths
```typescript
// UI components
import { Button } from '@/components/ui/button'

// Layout components
import { Sidebar } from '@/components/layout/sidebar'

// Utilities
import { cn } from '@/lib/utils'

// Hooks
import { useQuery } from '@tanstack/react-query'

// Types
import type { Invoice } from '@/types/invoice'
```

---

## Project Status

### Completed Features
- Modern collapsible sidebar navigation
- Responsive mobile/desktop layouts
- shadcn/ui component library integration
- Tailwind CSS design system
- TypeScript strict mode
- React Query setup
- Playwright E2E testing framework
- Vercel deployment pipeline

### In Progress
- AI-powered contract reconciliation engine
- Invoice processing workflows
- Vendor management dashboard
- Analytics and reporting features

### Planned Enhancements
- Advanced filtering and search
- Bulk invoice processing
- Export functionality (PDF, Excel)
- User authentication and permissions
- Real-time notifications
- Mobile app (React Native)

---

## Contact & Support

### Project Ownership
**Project**: DRIFT.AI Contract Reconciliation Platform V2
**Location**: `/Users/zackram/Drift.AI-V2`
**Repository**: Git repository (local)

### Getting Help

1. **Review Documentation**: Start with this CLAUDE.md file
2. **Check Existing Issues**: Review documentation files for known issues
3. **Code Search**: Use `grep` or IDE search for examples
4. **Component Library**: Refer to shadcn/ui and Radix UI documentation

---

**Document Version**: 1.0
**Last Updated**: November 1, 2025
**Maintained By**: Development Team with Claude Code assistance

---

*This documentation is a living document. Update it whenever significant changes are made to the project architecture, design system, or development practices.*
