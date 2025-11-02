# DRIFT.AI V2 - Contract Reconciliation Platform

<div align="center">
  <h3>AI-Powered Contract Reconciliation for Nursing Home Operations</h3>
  <p>Automate invoice reconciliation, detect discrepancies, and save time with GPT-4 Vision</p>

  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#deployment">Deployment</a> •
    <a href="#contributing">Contributing</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/version-2.0.0-orange" alt="Version">
    <img src="https://img.shields.io/badge/Next.js-14.2-black" alt="Next.js">
    <img src="https://img.shields.io/badge/TypeScript-5.x-blue" alt="TypeScript">
    <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  </p>
</div>

---

## Overview

**DRIFT.AI** is an enterprise-grade contract reconciliation platform designed specifically for nursing home operators to streamline vendor contract management and automated invoice reconciliation. The platform leverages GPT-4 Vision to intelligently analyze contracts and invoices, automatically detecting discrepancies and providing actionable insights.

### Live Demo

**Production Application**: [https://frontend-gve1dxbn5-zramskys-projects.vercel.app/](https://frontend-gve1dxbn5-zramskys-projects.vercel.app/)

### Key Benefits

- **85% Reduction** in manual review time
- **Automatic Detection** of pricing discrepancies
- **Real-Time Alerts** for contract violations
- **Comprehensive Analytics** on spending patterns
- **Mobile-First Design** for on-the-go management

---

## Features

### Core Capabilities

#### AI-Powered Analysis
- GPT-4 Vision extracts contract terms and invoice line items automatically
- Intelligent matching of invoice items to contract agreements
- Natural language understanding of complex contract clauses

#### Real-Time Discrepancy Detection
- Instant identification of pricing violations
- Quantity and unit mismatch detection
- Terms and conditions compliance monitoring
- Automatic flagging of suspicious patterns

#### Vendor Management
- Centralized dashboard for all vendor relationships
- Contract lifecycle tracking and renewal alerts
- Vendor performance metrics and scorecards
- Historical spending analysis per vendor

#### Analytics & Reporting
- Comprehensive spending insights
- Contract compliance metrics
- Savings identification and tracking
- Exportable reports (PDF, Excel)

#### Modern User Experience
- Responsive design across desktop, tablet, and mobile
- Collapsible sidebar navigation with persistent state
- Dark mode support with brand theming
- Keyboard shortcuts and accessibility features

---

## Tech Stack

### Core Framework
- **Next.js** 14.2.25 with App Router
- **React** 18.3.1 with Server Components
- **TypeScript** 5.x (Strict mode)
- **Node.js** >=18.0.0

### UI & Styling
- **Tailwind CSS** 3.4.0 - Utility-first styling
- **shadcn/ui** - Accessible component library
- **Radix UI** - Primitives for accessible components
- **Lucide React** - Icon system
- **Class Variance Authority** - Component variants

### Data & State
- **TanStack React Query** 5.85.3 - Server state management
- **React Hook Form** 7.62.0 - Form handling
- **date-fns** 4.1.0 - Date utilities

### Document Processing
- **PDF.js** 5.4.54 - PDF rendering
- **React PDF** 10.1.0 - PDF React integration
- **React Dropzone** 14.3.8 - File uploads

### Analytics & Charts
- **Recharts** 3.1.2 - Data visualization

### Testing & Quality
- **Playwright** 1.55.0 - E2E testing
- **ESLint** 8.57.0 - Code linting
- **TypeScript** - Static type checking

### Deployment & Analytics
- **Vercel** - Hosting platform
- **Vercel Analytics** - Performance monitoring

---

## Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js** version 18.0.0 or higher
- **npm** version 8.0.0 or higher
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/drift-ai-v2.git
   cd drift-ai-v2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env.local file
   cp .env.example .env.local

   # Add your environment variables:
   # NEXT_PUBLIC_API_URL=your_api_url
   # NEXT_PUBLIC_AUTH0_DOMAIN=your_auth0_domain
   # Add other required variables...
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

---

## Available Scripts

### Development

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build production bundle with full validation |
| `npm run build:production` | Production build with NODE_ENV=production |
| `npm run build:vercel` | Vercel-optimized build |
| `npm start` | Start production server |
| `npm run clean` | Remove build artifacts (.next, out, dist) |

### Code Quality

| Command | Description |
|---------|-------------|
| `npm run lint` | Run ESLint code linting |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run type-check` | Run TypeScript compiler check |
| `npm run build-css` | Compile Tailwind CSS |

### Testing

| Command | Description |
|---------|-------------|
| `npm test` | Run Playwright E2E tests |
| `npm run test:ui` | Run tests with Playwright UI |
| `npm run test:debug` | Run tests in debug mode |
| `npm run test:headed` | Run tests in headed mode |
| `npm run test:chromium` | Run tests on Chromium only |
| `npm run test:firefox` | Run tests on Firefox only |
| `npm run test:webkit` | Run tests on WebKit only |
| `npm run test:mobile` | Run tests on mobile Chrome |
| `npm run test:report` | Show test report |

### Deployment

| Command | Description |
|---------|-------------|
| `npm run deploy` | Deploy to Vercel production |
| `npm run deploy:preview` | Deploy to Vercel preview |
| `npm run health-check` | Check application health |

---

## Project Structure

```
drift-ai-v2/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Root layout with providers
│   │   ├── page.tsx              # Dashboard homepage
│   │   ├── analytics/            # Analytics pages
│   │   ├── api/                  # API routes
│   │   │   └── health/           # Health check endpoint
│   │   ├── evidence/             # Evidence management
│   │   ├── invoices/             # Invoice management
│   │   ├── reports/              # Reporting pages
│   │   ├── search/               # Search functionality
│   │   ├── settings/             # Settings pages
│   │   └── vendors/              # Vendor management
│   ├── components/               # React components
│   │   ├── dashboard/            # Dashboard-specific
│   │   ├── error/                # Error handling
│   │   ├── evidence/             # Evidence components
│   │   ├── invoices/             # Invoice components
│   │   ├── layout/               # Layout (sidebar, header)
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── upload/               # File upload
│   │   └── vendors/              # Vendor components
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utility functions
│   ├── styles/                   # Global styles
│   └── types/                    # TypeScript types
├── public/                       # Static assets
├── tests/                        # Playwright E2E tests
├── docs/                         # Documentation
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind config
├── next.config.js                # Next.js config
├── playwright.config.ts          # Playwright config
├── vercel.json                   # Vercel deployment
├── CLAUDE.md                     # AI development guide
└── README.md                     # This file
```

---

## Design System

### Brand Colors

**Primary Brand Color**: Orange `#FF6B35`

Used for:
- Primary call-to-action buttons
- Active navigation states
- Focus rings on interactive elements
- Brand accents and highlights
- Links in body content

### Color Palette

| Purpose | Color | Hex | Tailwind Class |
|---------|-------|-----|----------------|
| **Primary/Brand** | Orange | `#FF6B35` | `brand-orange` |
| **Success** | Green | `#22C55E` | `success` |
| **Warning** | Amber | `#F59E0B` | `warning` |
| **Error** | Red | `#EF4444` | `error` |
| **Info** | Blue | `#60A5FA` | `info` |

### Typography

- **Headings**: Inter (sans-serif)
- **Body**: Roboto (sans-serif)
- **Scale**: Mobile-first responsive sizing

### Accessibility

- WCAG 2.1 AA compliant
- Minimum contrast ratio 4.5:1 for body text
- Keyboard navigation support
- Screen reader optimized
- Focus indicators on all interactive elements

---

## Deployment

### Vercel (Current Production)

**Automatic Deployments**:
- Push to `main` branch triggers production deployment
- Pull requests generate preview deployments
- Environment variables managed in Vercel dashboard

**Manual Deployment**:
```bash
# Deploy to production
npm run deploy

# Deploy preview
npm run deploy:preview
```

### Build Process

1. Clean previous build artifacts
2. Compile Tailwind CSS
3. Run TypeScript type checking
4. Execute ESLint validation
5. Build Next.js production bundle
6. Generate static pages

### Environment Variables

Configure the following in your deployment platform:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.drift.ai

# Authentication
NEXT_PUBLIC_AUTH0_DOMAIN=your-domain.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=your_client_id

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### Health Checks

**Endpoint**: `/api/health`

```bash
curl https://frontend-gve1dxbn5-zramskys-projects.vercel.app/api/health
```

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-01T12:00:00.000Z",
  "version": "2.0.0"
}
```

---

## Performance

### Core Web Vitals Targets

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **TTFB (Time to First Byte)**: < 600ms

### Optimization Techniques

- Next.js automatic code splitting
- Image optimization with next/image
- Font optimization with next/font
- React Query caching and deduplication
- Lazy loading of heavy components
- Bundle size analysis with @next/bundle-analyzer

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details on:

- Code of conduct
- Development workflow
- Pull request process
- Coding standards
- Commit message conventions

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

---

## Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Comprehensive development guide for AI assistants
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines
- **[docs/](./docs/)** - Additional documentation

### Key Documentation Files

- Dashboard Design Specifications
- Card System Guide
- Frontend Enhancements Summary
- E2E Test Report

---

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## Support

For questions, issues, or feature requests:

1. Check the [documentation](./CLAUDE.md)
2. Search [existing issues](https://github.com/your-org/drift-ai-v2/issues)
3. Open a new issue with detailed information
4. Contact the development team

---

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Hosted on [Vercel](https://vercel.com/)

---

<div align="center">
  <p>Made with dedication by the DRIFT.AI Team</p>
  <p>Version 2.0.0 | Last Updated: November 1, 2025</p>
</div>
