# Components Directory Structure

This directory contains all reusable components organized by category and complexity.

## Directory Structure

```
src/components/
├── ui/                    # Base UI components
│   ├── Card.tsx          # Card component with variants
│   ├── MetricCard.tsx    # Metric display component
│   ├── ProgressBar.tsx   # Progress indicator
│   ├── StatusBadge.tsx   # Status indicators
│   └── index.ts          # Component exports
├── features/              # Feature-specific components
│   ├── ContractSearch.tsx    # Contract search interface
│   ├── OpportunityPipeline.tsx # Pipeline management
│   └── index.ts              # Component exports
├── dashboard/             # Complex dashboard components
│   ├── README.md          # Dashboard component docs
│   └── index.ts           # Placeholder exports
└── README.md              # This file
```

## Usage Guidelines

### 1. Base UI Components (`/ui`)
- **Purpose**: Reusable, simple components
- **Usage**: Import and use anywhere in the app
- **Examples**: Cards, buttons, inputs, badges

### 2. Feature Components (`/features`)
- **Purpose**: Feature-specific, complex components
- **Usage**: Import in feature pages or sections
- **Examples**: Search interfaces, pipeline views, analytics

### 3. Dashboard Components (`/dashboard`)
- **Purpose**: Complex dashboard-specific components
- **Usage**: Import in dashboard pages
- **Examples**: Analytics dashboards, data visualizations

## Implementation Strategy

### Phase 1: Base Components ✅
- [x] Card component with variants
- [x] MetricCard for data display
- [x] ProgressBar for progress indicators
- [x] StatusBadge for status display

### Phase 2: Feature Components ✅
- [x] ContractSearch interface
- [x] OpportunityPipeline management
- [ ] MarketIntelligence dashboard
- [ ] CompetitorAnalysis panel

### Phase 3: Dashboard Components (Future)
- [ ] Advanced analytics components
- [ ] Real-time data visualizations
- [ ] Complex interaction patterns

## Design System Integration

All components use the design system tokens:
- **Colors**: Consistent color palette
- **Spacing**: Standardized spacing scale
- **Shadows**: Elevation system
- **Typography**: Consistent font system

## Component Development

### 1. Start with Props Interface
```tsx
interface ComponentProps {
  // Define all props with types
}
```

### 2. Use Design System Tokens
```tsx
import { colors, spacing, shadows } from '@/lib/design-system'
```

### 3. Implement Responsive Design
```tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

### 4. Add Accessibility
```tsx
aria-label="Description"
role="button"
tabIndex={0}
```

## Future Enhancements

- **Animation**: Add smooth transitions
- **Theming**: Dark/light mode support
- **Internationalization**: Multi-language support
- **Testing**: Component testing setup
- **Documentation**: Storybook integration
