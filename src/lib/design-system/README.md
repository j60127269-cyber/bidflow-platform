# Design System

This folder contains the design system tokens and utilities used across the application.

## Design Tokens

### Colors
- `colors.ts` - Color palette definitions
- `status-colors.ts` - Status-specific colors
- `theme-colors.ts` - Light/dark theme colors

### Typography
- `typography.ts` - Font sizes, weights, line heights
- `font-families.ts` - Font family definitions

### Spacing
- `spacing.ts` - Spacing scale and utilities
- `layout.ts` - Layout-specific spacing

### Shadows
- `shadows.ts` - Shadow definitions and elevations

## Utilities

### Component Variants
- `variants.ts` - Component size and color variants
- `states.ts` - Interactive states (hover, active, disabled)

### Responsive Design
- `breakpoints.ts` - Responsive breakpoint definitions
- `media-queries.ts` - Media query utilities

## Usage

```tsx
import { colors, spacing, shadows } from '@/lib/design-system'

// Use in components
const cardStyle = {
  backgroundColor: colors.white,
  padding: spacing.lg,
  boxShadow: shadows.md,
}
```

## Implementation Strategy

1. **Start with tokens** - Define all design values
2. **Create utilities** - Helper functions for common patterns
3. **Build components** - Use tokens in component implementations
4. **Test consistency** - Ensure design system compliance
