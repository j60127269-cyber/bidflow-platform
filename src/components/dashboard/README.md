# Dashboard Components

This folder contains complex dashboard components that combine multiple UI elements.

## Components

### Search & Discovery
- `ContractSearch.tsx` - Advanced search interface
- `FilterPanel.tsx` - Search filters and controls
- `SearchResults.tsx` - Search results display
- `MatchIndicator.tsx` - Match percentage indicators

### Pipeline Management
- `OpportunityPipeline.tsx` - Kanban-style pipeline view
- `PipelineCard.tsx` - Individual opportunity cards
- `TeamCollaboration.tsx` - Team member assignments
- `DeadlineTracker.tsx` - Deadline monitoring

### Analytics & Intelligence
- `MarketIntelligence.tsx` - Market analysis dashboard
- `CompetitorAnalysis.tsx` - Competitor insights
- `WinRateAnalytics.tsx` - Success rate analysis
- `TrendAnalysis.tsx` - Market trend visualization

### Notifications & Alerts
- `NotificationCenter.tsx` - Centralized notifications
- `AlertPanel.tsx` - Alert management
- `DeadlineAlerts.tsx` - Deadline notifications
- `MarketUpdates.tsx` - Market intelligence alerts

## Usage

```tsx
import { ContractSearch, OpportunityPipeline } from '@/components/dashboard'

// Use in dashboard pages
<ContractSearch onSearch={handleSearch} />
<OpportunityPipeline opportunities={opportunities} />
```

## Features

- Real-time data updates
- Drag-and-drop functionality
- Team collaboration features
- Export and reporting capabilities
- Mobile-responsive design