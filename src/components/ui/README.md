# UI Component Library

This folder contains reusable UI components that can be used throughout the application.

## Base Components

### Layout Components
- `Card.tsx` - Base card component with variants
- `Container.tsx` - Responsive container wrapper
- `Section.tsx` - Page section wrapper
- `Grid.tsx` - Grid layout component

### Data Display
- `MetricCard.tsx` - Key-value metric display
- `ProgressBar.tsx` - Progress indicators
- `StatusBadge.tsx` - Status indicators
- `DataTable.tsx` - Table with sorting/filtering

### Interactive Elements
- `Button.tsx` - Button variants
- `Input.tsx` - Form inputs
- `Select.tsx` - Dropdown selects
- `Modal.tsx` - Modal dialogs

### Visualization
- `Chart.tsx` - Chart wrapper component
- `PieChart.tsx` - Pie chart component
- `BarChart.tsx` - Bar chart component
- `LineChart.tsx` - Line chart component

## Usage

```tsx
import { Card, MetricCard, ProgressBar } from '@/components/ui'

// Use in any component
<Card>
  <MetricCard title="Win Rate" value="68%" />
  <ProgressBar value={68} max={100} />
</Card>
```

## Design System

- Consistent spacing and typography
- Color-coded status indicators
- Responsive breakpoints
- Accessibility features
- Dark/light mode support
