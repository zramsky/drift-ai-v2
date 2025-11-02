# DRIFT.AI Frontend - Contract Reconciliation Platform

## Overview

This is the complete DRIFT.AI frontend foundation built with Next.js 14+, TypeScript, and Tailwind CSS. The platform follows the exact design specifications with a dark theme, modern component architecture, and responsive layout.

## Design System

### Colors
- **App Background**: `#0A0A0A`
- **Surface Colors**: 
  - Primary: `#121212`
  - Secondary: `#1A1A1A`
  - Tertiary: `#262626`
- **Text Colors**:
  - Primary: `#F5F5F5`
  - Secondary: `#C9C9C9`
- **Brand Colors**:
  - Maroon: `#800020`
  - Steel Blue: `#4682B4`
  - Muted Gold: `#D4A017`
- **Semantic Colors**:
  - Success: `#22C55E`
  - Warning: `#EAB308`
  - Error: `#EF4444`
  - Info: `#60A5FA`

### Typography
- **Headings**: Inter font family
- **Body**: Roboto font family
- **Scale**: 
  - H1: 56px - 72px (responsive)
  - H2: 36px
  - H3: 28px
  - Body: 18-20px

### Components
- **Card Border Radius**: 12px
- **Focus Rings**: Steel Blue (`#4682B4`)
- **Grid System**: 12-column responsive
- **WCAG AA+ Compliance**: All contrast ratios meet accessibility standards

## Project Structure

```
/frontend/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── layout.tsx          # Root layout with fonts
│   │   ├── page.tsx            # Dashboard page
│   │   ├── globals.css         # Tailwind + DRIFT.AI theme
│   │   ├── vendors/            # Vendors page
│   │   └── reports/            # Reports page
│   ├── components/
│   │   ├── dashboard/          # Dashboard-specific components
│   │   │   ├── dashboard-header.tsx
│   │   │   ├── attention-required.tsx
│   │   │   └── top-offenders.tsx
│   │   ├── layout/             # Layout components
│   │   │   ├── main-layout.tsx # Main app layout
│   │   │   └── sidebar.tsx     # Collapsible sidebar
│   │   └── ui/                 # Reusable UI components
│   │       ├── kpi-card.tsx    # KPI display cards
│   │       ├── card.tsx        # Basic card component
│   │       └── badge.tsx       # Status badges
│   └── lib/                    # Utilities
│       ├── utils.ts            # Utility functions
│       └── query-client.tsx    # React Query setup
```

## Key Components

### 1. Collapsible Sidebar
- Dashboard, Vendors, Reports navigation
- DRIFT.AI branding
- Smooth collapse/expand animation
- Active state indicators
- User profile section

### 2. KPI Cards
- **Total Saved by DRIFT.AI**: $127,500 (Green accent)
- **Invoices Processed**: 1,261 (Orange accent)  
- **Active Vendors**: 12 (Red accent)
- Trend indicators with percentages
- Responsive grid layout

### 3. Dashboard Layout
- Sticky header with tagline
- 3-column KPI card layout
- 2-column content sections:
  - Attention Required
  - Top 3 Offenders
- Responsive breakpoints

### 4. Attention Required Section
- Color-coded issue types
- Clickable items with hover states
- Issue count badge
- Action links

### 5. Top Offenders Section
- Vendor ranking (1-3)
- Risk level indicators
- Savings potential
- Issue counts
- Category labels

## Features

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Collapsible sidebar on mobile
- Flexible grid layouts
- Touch-friendly interactive elements

### Accessibility
- WCAG AA+ contrast compliance
- Focus rings on all interactive elements
- Screen reader friendly
- Keyboard navigation support
- Semantic HTML structure
- ARIA labels and descriptions

### Performance
- Next.js 15 with App Router
- React 19 optimizations
- Tailwind CSS purging
- Font optimization with display: swap
- Lazy loading ready
- Bundle size optimization

## Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
cd frontend
npm install
npm run dev
```

### Build
```bash
npm run build-css  # Compile Tailwind
npm run build      # Build Next.js
npm run start      # Start production server
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build-css` - Compile Tailwind CSS
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Technical Decisions

### Framework Choice
- **Next.js 15**: Latest features, App Router, React 19 support
- **TypeScript**: Type safety and developer experience
- **Tailwind CSS**: Utility-first styling, design consistency

### Component Architecture
- Atomic design principles
- Composition over inheritance
- Props-based customization
- Reusable UI components

### State Management
- React Query for server state
- Component-level state with React hooks
- Context for global app state (future implementation)

### Styling Strategy
- Tailwind utility classes
- Custom CSS variables for theme
- Component-scoped styles
- Dark theme first approach

## Browser Support
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements
- Animation and micro-interactions
- Chart components for analytics
- Advanced filtering and search
- Real-time updates with WebSockets
- Progressive Web App features
- Advanced accessibility features

## Dependencies
- Next.js 15.4.7
- React 19.1.0
- TypeScript 5+
- Tailwind CSS 3.4+
- Radix UI components
- Lucide React icons
- React Query 5+

The frontend is production-ready and follows modern React/Next.js best practices with a focus on performance, accessibility, and maintainability.