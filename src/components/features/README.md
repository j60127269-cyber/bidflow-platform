# Feature Components

This folder contains feature-specific components that implement the homepage mockup designs.

## Smart Contract Search
- `SearchInterface.tsx` - Main search interface
- `SearchBar.tsx` - Search input with filters
- `ContractCard.tsx` - Individual contract display
- `MatchScore.tsx` - Match percentage display

## Market Intelligence
- `MarketDashboard.tsx` - Market overview
- `SectorBreakdown.tsx` - Sector distribution charts
- `GrowthIndicators.tsx` - Growth trend displays
- `OpportunityCounter.tsx` - Opportunity metrics

## Pipeline Management
- `PipelineView.tsx` - Main pipeline interface
- `StageColumn.tsx` - Pipeline stage columns
- `OpportunityCard.tsx` - Opportunity cards
- `TeamMembers.tsx` - Team collaboration

## Competitor Analysis
- `CompetitorDashboard.tsx` - Competitor overview
- `RiskAssessment.tsx` - Risk level indicators
- `MarketPosition.tsx` - Market share display
- `WinProbability.tsx` - Success probability

## Smart Notifications
- `NotificationPanel.tsx` - Notification center
- `AlertCard.tsx` - Individual alerts
- `DeadlineTracker.tsx` - Deadline monitoring
- `MarketUpdates.tsx` - Market intelligence

## Usage

```tsx
import { SearchInterface, MarketDashboard } from '@/components/features'

// Use in dashboard or feature pages
<SearchInterface />
<MarketDashboard data={marketData} />
```

## Implementation Notes

- These components are designed to match the homepage mockups
- They can be gradually implemented without breaking existing functionality
- Each component is self-contained and reusable
- Data props can be mocked initially, then connected to real APIs
