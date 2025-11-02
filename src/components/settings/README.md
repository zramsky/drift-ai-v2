# DRIFT.AI Settings System

A comprehensive, user-friendly settings architecture designed specifically for the DRIFT.AI Contract Reconciliation Platform. This system provides organized, searchable, and validated settings management with a focus on contract reconciliation workflows.

## Architecture Overview

### Core Components

1. **SettingsLayout** - Main layout component with responsive sidebar navigation
2. **SettingsSidebar** - Category navigation with search functionality
3. **SettingsSection** - Individual settings sections with validation
4. **SettingsControls** - Reusable form controls (toggles, inputs, selects, etc.)
5. **SettingsSearch** - Advanced search functionality with filtering
6. **useSettings** - Custom hook for state management and persistence

### Design Principles

- **Progressive Disclosure**: Show relevant settings based on user role and context
- **Clear Organization**: Logical grouping of related settings
- **Immediate Feedback**: Real-time validation and saving indicators
- **Mobile-First**: Responsive design optimized for all devices
- **Accessibility**: Full keyboard navigation and screen reader support

## Settings Categories

### 1. Profile & Account
- **Personal Information**: User details, contact info, timezone
- User role and organization settings
- Account preferences

### 2. Notifications
- **Email Notifications**: Contract alerts, discrepancy notifications
- **System Alerts**: Real-time browser notifications
- **Report Delivery**: Automated report scheduling
- Threshold-based alerting for contract expirations and discrepancies

### 3. Workflow Preferences
- **Approval Workflows**: Automated approval rules and chains
- **AI Processing**: Confidence thresholds and processing preferences
- **Contract Management**: Renewal reminders and lifecycle settings
- Bulk processing and automation controls

### 4. Display & Interface
- **Theme & Appearance**: Light/dark mode, compact view options
- **Dashboard Preferences**: Default views and layouts
- **Data Formatting**: Date, currency, and number formats
- Table and list display preferences

### 5. Security
- **Authentication**: Two-factor authentication, session management
- **Access Control**: API access, download restrictions
- **Session Management**: Timeout settings, login notifications
- IP whitelisting and security policies

### 6. Integrations
- **Export Settings**: Default formats, available options
- **External Systems**: ERP integration, sync settings
- **Third-Party Services**: Email providers, storage systems
- API connectivity and data synchronization

### 7. Compliance & Audit
- **Data Retention**: Automated cleanup and archival policies
- **Audit Trails**: Logging and compliance reporting
- **Backup Settings**: Automated backup scheduling
- GDPR and regulatory compliance controls

## Key Features

### 🔍 Advanced Search
- Real-time search across all settings
- Category filtering and result highlighting
- Smart matching on names, descriptions, and categories
- Keyboard navigation support

### ✅ Validation & Feedback
- Real-time validation with error messages
- Warning system for potentially risky settings
- Visual indicators for unsaved changes
- Confirmation dialogs for critical changes

### 📱 Mobile Optimization
- Collapsible sidebar navigation
- Touch-friendly controls and spacing
- Optimized layouts for all screen sizes
- Swipe gestures and mobile interactions

### 🎨 Design Consistency
- Consistent with platform's #FF6B35 orange accent color
- Clean white background with subtle shadows
- Professional typography hierarchy
- Accessible color contrast ratios

### 🔄 State Management
- Automatic change detection
- Category-specific save/reset functionality
- Change history tracking
- Optimistic UI updates

## Contract-Specific Features

### Approval Workflows
- Configure multi-level approval chains
- Set monetary thresholds for automatic processing
- Define dual approval requirements
- Custom approval rules by contract type

### AI Processing Controls
- Confidence threshold configuration
- Model selection and preferences
- Bulk processing enablement
- Custom processing rules

### Document Management
- Vendor auto-categorization settings
- Document retention policies
- OCR and analysis preferences
- Export format configurations

### Compliance & Reporting
- Automated compliance checks
- Custom reporting schedules
- Audit trail configurations
- Data privacy controls

## Usage Examples

### Basic Settings Update
```tsx
import { useSettings } from '@/hooks/use-settings'

function MyComponent() {
  const { settings, updateSetting, saveCategory } = useSettings()
  
  const handleToggle = async (value: boolean) => {
    updateSetting('notifications', 'emailNotifications', value)
    await saveCategory('notifications')
  }
}
```

### Custom Validation
```tsx
const customValidation = {
  required: true,
  min: 0,
  max: 1000,
  custom: (value: number) => {
    if (value > 500) return 'Warning: High threshold may increase risk'
    return null
  }
}
```

### Search Integration
```tsx
import { SettingsSearch } from '@/components/settings/settings-search'

function SearchExample() {
  const handleResultSelect = (categoryId: string, sectionId: string, settingId: string) => {
    // Navigate to specific setting
    setActiveCategory(categoryId)
    scrollToSetting(settingId)
  }
  
  return <SettingsSearch onResultSelect={handleResultSelect} />
}
```

## Implementation Status

✅ **Completed**
- Complete settings architecture design
- Responsive sidebar navigation
- All control types (toggles, inputs, selects, sliders, etc.)
- Advanced search with filtering
- Validation system with error handling
- Mobile-optimized layouts
- Accessibility features
- Contract-specific workflow settings

## Technical Details

### Dependencies
- React 18+ with hooks
- Tailwind CSS for styling
- Radix UI for accessible components
- Lucide React for icons
- TypeScript for type safety

### File Structure
```
src/components/settings/
├── settings-layout.tsx      # Main layout wrapper
├── settings-sidebar.tsx     # Navigation sidebar
├── settings-section.tsx     # Individual setting sections
├── settings-controls.tsx    # Form control components
├── settings-search.tsx      # Search functionality
└── README.md               # This documentation

src/hooks/
└── use-settings.ts         # Settings state management

src/types/
└── settings.ts             # TypeScript definitions

src/lib/
└── settings-config.tsx     # Settings configuration
```

### Accessibility Features
- Full keyboard navigation
- Screen reader compatibility
- High contrast mode support
- Focus management
- ARIA labels and descriptions
- Semantic HTML structure

### Performance Optimizations
- Lazy loading of settings sections
- Optimized re-renders with React.memo
- Debounced search queries
- Virtual scrolling for large option lists
- Efficient state management

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS 14+, Android 10+)

## Contributing

When adding new settings:
1. Define the setting in `settings-config.tsx`
2. Add validation rules if needed
3. Update TypeScript types in `settings.ts`
4. Test across all device sizes
5. Ensure accessibility compliance