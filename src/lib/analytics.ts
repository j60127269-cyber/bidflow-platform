// Google Analytics 4 Configuration
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// Google Analytics Measurement ID
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window !== 'undefined' && GA_MEASUREMENT_ID) {
    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.gtag = function() {
      (window.gtag as any).q = (window.gtag as any).q || [];
      (window.gtag as any).q.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });
  }
};

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: title || document.title,
    });
  }
};

// Track custom events
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

// Contract-specific tracking events
export const trackContractView = (contractId: string, contractTitle: string) => {
  trackEvent('contract_view', {
    contract_id: contractId,
    contract_title: contractTitle,
    event_category: 'contracts',
    event_label: 'contract_view',
  });
};

export const trackContractSearch = (searchQuery: string, resultsCount: number) => {
  trackEvent('contract_search', {
    search_term: searchQuery,
    results_count: resultsCount,
    event_category: 'search',
    event_label: 'contract_search',
  });
};

export const trackContractFilter = (filterType: string, filterValue: string) => {
  trackEvent('contract_filter', {
    filter_type: filterType,
    filter_value: filterValue,
    event_category: 'filters',
    event_label: 'contract_filter',
  });
};

export const trackNotificationClick = (notificationType: string, notificationId: string) => {
  trackEvent('notification_click', {
    notification_type: notificationType,
    notification_id: notificationId,
    event_category: 'notifications',
    event_label: 'notification_click',
  });
};

export const trackUserRegistration = (userType: string) => {
  trackEvent('user_registration', {
    user_type: userType,
    event_category: 'user',
    event_label: 'registration',
  });
};

export const trackSubscriptionUpgrade = (planType: string, value: number) => {
  trackEvent('subscription_upgrade', {
    plan_type: planType,
    value: value,
    currency: 'UGX',
    event_category: 'subscription',
    event_label: 'upgrade',
  });
};

// Business intelligence events
export const trackMarketAnalysis = (analysisType: string, insightsCount: number) => {
  trackEvent('market_analysis', {
    analysis_type: analysisType,
    insights_count: insightsCount,
    event_category: 'analytics',
    event_label: 'market_analysis',
  });
};

export const trackCompetitorAnalysis = (competitorCount: number, winProbability: number) => {
  trackEvent('competitor_analysis', {
    competitor_count: competitorCount,
    win_probability: winProbability,
    event_category: 'analytics',
    event_label: 'competitor_analysis',
  });
};

export const trackPipelineUpdate = (stage: string, opportunityCount: number) => {
  trackEvent('pipeline_update', {
    pipeline_stage: stage,
    opportunity_count: opportunityCount,
    event_category: 'pipeline',
    event_label: 'pipeline_update',
  });
};

// User engagement events
export const trackFeatureUsage = (featureName: string, usageDuration: number) => {
  trackEvent('feature_usage', {
    feature_name: featureName,
    usage_duration: usageDuration,
    event_category: 'engagement',
    event_label: 'feature_usage',
  });
};

export const trackDashboardView = (dashboardSection: string) => {
  trackEvent('dashboard_view', {
    dashboard_section: dashboardSection,
    event_category: 'navigation',
    event_label: 'dashboard_view',
  });
};

// Error tracking
export const trackError = (errorType: string, errorMessage: string, errorLocation: string) => {
  trackEvent('error_occurred', {
    error_type: errorType,
    error_message: errorMessage,
    error_location: errorLocation,
    event_category: 'errors',
    event_label: 'error_occurred',
  });
};
