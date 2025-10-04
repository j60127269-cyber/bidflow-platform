# Analytics Implementation

This folder contains the analytics implementation for BidCloud, including both Vercel Analytics and Google Analytics 4.

## Setup Instructions

### 1. Google Analytics 4 Setup

1. **Create GA4 Property:**
   - Go to [Google Analytics](https://analytics.google.com/)
   - Create a new GA4 property for your website
   - Get your Measurement ID (format: G-XXXXXXXXXX)

2. **Add Environment Variable:**
   ```bash
   # Add to your .env.local file
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

3. **Deploy to Vercel:**
   - Add the environment variable to your Vercel project settings
   - Redeploy your application

### 2. Vercel Analytics (Already Configured)

Vercel Analytics is already set up and working. It provides:
- Page views and unique visitors
- Performance metrics
- Geographic data
- Device information

## Analytics Features

### Google Analytics 4 Tracking

#### Contract-Specific Events
- **Contract Views** - Track which contracts are most popular
- **Search Queries** - Monitor what users search for
- **Filter Usage** - Track which filters are used most
- **Notification Clicks** - Email engagement tracking

#### User Behavior
- **Registration Tracking** - User signup events
- **Subscription Upgrades** - Revenue tracking
- **Feature Usage** - Which features are used most
- **Dashboard Navigation** - User journey tracking

#### Business Intelligence
- **Market Analysis** - Analytics feature usage
- **Competitor Analysis** - Competitive intelligence usage
- **Pipeline Updates** - Opportunity management tracking
- **Error Tracking** - Application error monitoring

### Vercel Analytics
- **Performance Monitoring** - Core Web Vitals
- **Traffic Analysis** - Page views and visitors
- **Geographic Data** - User location insights
- **Real-time Data** - Live user activity

## Usage Examples

### In React Components

```tsx
import { useAnalytics } from '@/hooks/useAnalytics'

function ContractCard({ contract }) {
  const analytics = useAnalytics()
  
  const handleView = () => {
    analytics.trackContract(contract.id, contract.title)
    // ... rest of your logic
  }
  
  return (
    <div onClick={handleView}>
      {contract.title}
    </div>
  )
}
```

### In API Routes

```tsx
import { trackEvent } from '@/lib/analytics'

export async function POST(request: Request) {
  // ... your logic
  
  trackEvent('contract_created', {
    contract_id: contract.id,
    contract_type: contract.type,
    event_category: 'contracts'
  })
  
  return Response.json({ success: true })
}
```

## Event Categories

### Contract Events
- `contract_view` - When users view contract details
- `contract_search` - When users search for contracts
- `contract_filter` - When users apply filters
- `contract_save` - When users save contracts

### User Events
- `user_registration` - New user signups
- `user_login` - User login events
- `subscription_upgrade` - Plan upgrades
- `subscription_cancel` - Plan cancellations

### Engagement Events
- `feature_usage` - Feature interaction tracking
- `dashboard_view` - Dashboard section views
- `notification_click` - Email notification clicks
- `export_data` - Data export actions

### Business Events
- `market_analysis` - Market intelligence usage
- `competitor_analysis` - Competitor research
- `pipeline_update` - Opportunity management
- `report_generation` - Report creation

## Privacy & Compliance

### Data Collection
- **User Consent** - Implement cookie consent if required
- **Data Anonymization** - IP addresses are anonymized
- **GDPR Compliance** - Respect user privacy preferences

### Data Retention
- **Google Analytics** - 26 months by default
- **Vercel Analytics** - 30 days by default
- **Custom Events** - Follow your data retention policy

## Monitoring & Alerts

### Key Metrics to Monitor
- **User Engagement** - Time on site, pages per session
- **Feature Adoption** - Which features are used most
- **Conversion Funnel** - Registration to subscription
- **Error Rates** - Application error tracking

### Recommended Alerts
- **High Error Rates** - Monitor application stability
- **Low Engagement** - Identify user experience issues
- **Conversion Drops** - Track business metrics
- **Performance Issues** - Monitor Core Web Vitals

## Troubleshooting

### Common Issues
1. **Events Not Tracking** - Check GA4 Measurement ID
2. **Duplicate Events** - Ensure proper event deduplication
3. **Missing Data** - Verify environment variables
4. **Performance Impact** - Monitor script loading times

### Debug Mode
```tsx
// Enable debug mode in development
if (process.env.NODE_ENV === 'development') {
  window.gtag('config', GA_MEASUREMENT_ID, {
    debug_mode: true
  })
}
```

## Future Enhancements

### Advanced Analytics
- **Custom Dimensions** - Track business-specific data
- **Enhanced Ecommerce** - Revenue and conversion tracking
- **User Journey Analysis** - Complete user flow tracking
- **A/B Testing Integration** - Experiment tracking

### Data Integration
- **CRM Integration** - Connect with customer data
- **Business Intelligence** - Advanced reporting
- **Real-time Dashboards** - Live analytics
- **Automated Insights** - AI-powered analytics
