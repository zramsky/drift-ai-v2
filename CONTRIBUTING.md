# Contributing to DRIFT.AI V2

First off, thank you for considering contributing to DRIFT.AI! It's people like you that make DRIFT.AI such a great platform for nursing home operators.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors. We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Examples of behavior that contributes to a positive environment:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Examples of unacceptable behavior:**
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

---

## Getting Started

### Prerequisites

Before you begin, ensure you have:
- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **Git** installed and configured
- A code editor (we recommend VS Code)
- Basic knowledge of React, Next.js, and TypeScript

### Setting Up Your Development Environment

1. **Fork the repository**

   Click the "Fork" button at the top right of the repository page.

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/drift-ai-v2.git
   cd drift-ai-v2
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/original-org/drift-ai-v2.git
   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Create a .env.local file**

   ```bash
   cp .env.example .env.local
   # Add your local environment variables
   ```

6. **Start the development server**

   ```bash
   npm run dev
   ```

7. **Verify setup**

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Development Workflow

### Branching Strategy

We use a simplified Git Flow model:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes
- `refactor/*` - Code refactoring
- `docs/*` - Documentation updates

### Creating a Feature Branch

```bash
# Update your local repository
git checkout main
git pull upstream main

# Create a new feature branch
git checkout -b feature/your-feature-name
```

### Branch Naming Conventions

Use descriptive names with the following prefixes:

- `feature/add-vendor-filtering`
- `bugfix/fix-invoice-upload`
- `hotfix/critical-auth-issue`
- `refactor/simplify-dashboard-logic`
- `docs/update-api-documentation`

---

## Coding Standards

### TypeScript

- **Strict mode enabled**: All code must pass TypeScript strict checks
- **Explicit types**: Use explicit return types for all functions
- **No `any` types**: Use `unknown` if type is truly unknown
- **Interface over type**: Prefer interfaces for object shapes

**Good Example:**
```typescript
interface InvoiceProps {
  invoice: Invoice
  onUpdate: (id: string) => Promise<void>
}

export const InvoiceCard: FC<InvoiceProps> = ({ invoice, onUpdate }): JSX.Element => {
  // Component logic
  return <div>...</div>
}
```

**Bad Example:**
```typescript
export const InvoiceCard = (props: any) => {
  // Missing types
  return <div>...</div>
}
```

### File Naming

- **Components**: PascalCase with `.tsx` (e.g., `DashboardCard.tsx`)
- **Utilities**: camelCase with `.ts` (e.g., `formatCurrency.ts`)
- **Pages**: kebab-case folders (e.g., `vendor-details/page.tsx`)
- **Types**: PascalCase with `.ts` (e.g., `Invoice.ts`)

### Import Organization

Organize imports in the following order:

```typescript
// 1. React and Next.js
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
```

### Component Structure

Follow this template for all React components:

```typescript
import { type FC } from 'react'

interface ComponentNameProps {
  // Required props
  title: string
  // Optional props with default values
  isActive?: boolean
  // Callbacks with explicit types
  onAction: (value: string) => void
}

/**
 * Brief description of what this component does
 *
 * @param props - Component props
 * @returns JSX element
 */
export const ComponentName: FC<ComponentNameProps> = ({
  title,
  isActive = false,
  onAction
}): JSX.Element => {
  // Hooks first
  const [state, setState] = useState<string>('')

  // Event handlers
  const handleClick = (): void => {
    onAction(state)
  }

  // Render
  return (
    <div className="...">
      <h2>{title}</h2>
    </div>
  )
}
```

### Styling Guidelines

- **Tailwind-first**: Always use Tailwind utility classes
- **Use `cn()` utility**: For conditional class application
- **Mobile-first**: Use responsive breakpoints (`sm:`, `md:`, `lg:`)
- **Brand colors**: Use defined color variables (e.g., `brand-orange`)
- **No inline styles**: Avoid `style={{}}` attributes

**Good Example:**
```typescript
<div className={cn(
  "rounded-lg bg-white p-6 shadow-card",
  isActive && "border-2 border-brand-orange",
  className
)}>
```

**Bad Example:**
```typescript
<div style={{ borderRadius: '8px', padding: '24px' }}>
```

### State Management

Choose the appropriate state management tool:

| Use Case | Tool | Example |
|----------|------|---------|
| Server data | React Query | Invoice lists, vendor data |
| Local UI state | useState | Modal state, form inputs |
| Complex forms | React Hook Form | Multi-step forms |
| Global state | React Context | User preferences, theme |

### Accessibility Requirements

All components must be accessible:

- ✅ Keyboard navigation support
- ✅ Focus indicators (brand orange ring)
- ✅ ARIA labels where needed
- ✅ Semantic HTML elements
- ✅ Minimum 4.5:1 contrast ratio

**Example:**
```typescript
<button
  aria-label="Close modal"
  className="focus:outline-none focus:ring-2 focus:ring-brand-orange"
  onClick={handleClose}
>
  <X className="h-4 w-4" />
</button>
```

### Performance Best Practices

- Use `useMemo` for expensive computations
- Use `useCallback` for callback functions passed to child components
- Lazy load heavy components with `dynamic()`
- Implement pagination for large datasets
- Use Next.js `<Image>` component for images

---

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic changes)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

**Feature:**
```
feat(vendors): add vendor filtering by status

Implement dropdown filter to allow users to filter vendors by active/inactive status. Includes query parameter persistence for sharing filtered views.
```

**Bug Fix:**
```
fix(invoices): resolve PDF upload timeout issue

Increase upload timeout to 60 seconds and add progress indicator. Fixes issue where large PDF files would fail to upload.

Closes #123
```

**Documentation:**
```
docs(readme): update deployment instructions

Add step-by-step Vercel deployment guide with environment variable configuration examples.
```

### Commit Message Rules

- Use imperative mood ("add" not "added" or "adds")
- Don't capitalize first letter
- No period at the end
- Keep subject line under 72 characters
- Reference issues and PRs in footer

---

## Pull Request Process

### Before Submitting

1. **Update your branch**
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-feature-branch
   git rebase main
   ```

2. **Run all checks**
   ```bash
   npm run type-check  # TypeScript check
   npm run lint        # ESLint check
   npm test            # Run tests
   npm run build       # Ensure build succeeds
   ```

3. **Update documentation**
   - Update README.md if needed
   - Update CLAUDE.md for significant changes
   - Add JSDoc comments to new functions

### Submitting a Pull Request

1. **Push your branch**
   ```bash
   git push origin your-feature-branch
   ```

2. **Create Pull Request**
   - Go to GitHub and create a PR from your fork
   - Use a clear, descriptive title
   - Fill out the PR template completely
   - Link related issues

### Pull Request Template

```markdown
## Description
Brief description of changes made

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran and how to reproduce them

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published
```

### Review Process

1. **Automated checks**: All CI/CD checks must pass
2. **Code review**: At least one maintainer review required
3. **Testing**: Changes must be tested in preview deployment
4. **Documentation**: Documentation updates must be included

### After Approval

- Squash and merge preferred for clean history
- Delete branch after merge
- Update local repository:
  ```bash
  git checkout main
  git pull upstream main
  ```

---

## Testing Guidelines

### Running Tests

```bash
# Run all tests
npm test

# Run tests in UI mode
npm run test:ui

# Run tests in debug mode
npm run test:debug

# Run specific browser tests
npm run test:chromium
npm run test:firefox
npm run test:webkit
```

### Writing Tests

**E2E Test Example (Playwright):**
```typescript
import { test, expect } from '@playwright/test'

test.describe('Vendor Management', () => {
  test('should display vendor list', async ({ page }) => {
    await page.goto('/vendors')

    await expect(page.locator('h1')).toContainText('Vendors')

    const vendorCards = page.locator('[data-testid="vendor-card"]')
    await expect(vendorCards).toHaveCount.greaterThan(0)
  })

  test('should filter vendors by status', async ({ page }) => {
    await page.goto('/vendors')

    await page.selectOption('[data-testid="status-filter"]', 'active')

    const activeVendors = page.locator('[data-status="active"]')
    await expect(activeVendors).toHaveCount.greaterThan(0)
  })
})
```

### Test Coverage

- Aim for 80%+ code coverage
- All new features must include tests
- Bug fixes should include regression tests
- Test edge cases and error scenarios

---

## Documentation

### Code Documentation

Use JSDoc comments for functions and complex logic:

```typescript
/**
 * Calculates the total savings from invoice reconciliation
 *
 * @param invoices - Array of processed invoices
 * @param contracts - Array of associated contracts
 * @returns Total savings amount in dollars
 *
 * @example
 * const savings = calculateSavings(invoices, contracts)
 * // Returns: 127500
 */
export function calculateSavings(
  invoices: Invoice[],
  contracts: Contract[]
): number {
  // Implementation
}
```

### Project Documentation

Update these files when making significant changes:

- **CLAUDE.md**: AI development guidelines and architecture
- **README.md**: User-facing documentation
- **docs/**: Detailed technical documentation

---

## Questions or Need Help?

- Review the [CLAUDE.md](./CLAUDE.md) file for detailed development guidelines
- Check existing [GitHub Issues](https://github.com/original-org/drift-ai-v2/issues)
- Ask questions in pull request comments
- Contact the development team

---

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes for significant contributions
- Project acknowledgments

Thank you for contributing to DRIFT.AI!
