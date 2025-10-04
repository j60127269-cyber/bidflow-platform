// Design System Spacing Tokens
export const spacing = {
  // Base spacing scale (4px increments)
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.75rem', // 28px
  '4xl': '2rem',    // 32px
  '5xl': '2.25rem', // 36px
  '6xl': '2.5rem',  // 40px
  '7xl': '3rem',    // 48px
  '8xl': '3.5rem',  // 56px
  '9xl': '4rem',    // 64px
} as const;

// Component-specific spacing
export const componentSpacing = {
  // Card padding
  card: {
    sm: spacing.sm,
    md: spacing.lg,
    lg: spacing['2xl'],
  },
  
  // Button padding
  button: {
    sm: `${spacing.sm} ${spacing.md}`,
    md: `${spacing.md} ${spacing.lg}`,
    lg: `${spacing.lg} ${spacing.xl}`,
  },
  
  // Form spacing
  form: {
    fieldGap: spacing.lg,
    labelGap: spacing.sm,
    sectionGap: spacing['2xl'],
  },
  
  // Layout spacing
  layout: {
    sectionGap: spacing['4xl'],
    containerPadding: spacing.lg,
    gridGap: spacing.lg,
  },
} as const;

// Responsive spacing
export const responsiveSpacing = {
  mobile: {
    container: spacing.md,
    section: spacing['2xl'],
  },
  tablet: {
    container: spacing.lg,
    section: spacing['3xl'],
  },
  desktop: {
    container: spacing.xl,
    section: spacing['4xl'],
  },
} as const;
