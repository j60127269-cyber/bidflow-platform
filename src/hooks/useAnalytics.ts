import { useCallback } from 'react';
import {
  trackEvent,
  trackContractView,
  trackContractSearch,
  trackContractFilter,
  trackNotificationClick,
  trackUserRegistration,
  trackSubscriptionUpgrade,
  trackMarketAnalysis,
  trackCompetitorAnalysis,
  trackPipelineUpdate,
  trackFeatureUsage,
  trackDashboardView,
  trackError,
} from '@/lib/analytics';

export const useAnalytics = () => {
  // Generic event tracking
  const track = useCallback((eventName: string, parameters?: Record<string, any>) => {
    trackEvent(eventName, parameters);
  }, []);

  // Contract-specific tracking
  const trackContract = useCallback((contractId: string, contractTitle: string) => {
    trackContractView(contractId, contractTitle);
  }, []);

  const trackSearch = useCallback((query: string, resultsCount: number) => {
    trackContractSearch(query, resultsCount);
  }, []);

  const trackFilter = useCallback((filterType: string, filterValue: string) => {
    trackContractFilter(filterType, filterValue);
  }, []);

  // Notification tracking
  const trackNotification = useCallback((type: string, id: string) => {
    trackNotificationClick(type, id);
  }, []);

  // User tracking
  const trackRegistration = useCallback((userType: string) => {
    trackUserRegistration(userType);
  }, []);

  const trackUpgrade = useCallback((planType: string, value: number) => {
    trackSubscriptionUpgrade(planType, value);
  }, []);

  // Analytics tracking
  const trackMarket = useCallback((analysisType: string, insightsCount: number) => {
    trackMarketAnalysis(analysisType, insightsCount);
  }, []);

  const trackCompetitor = useCallback((competitorCount: number, winProbability: number) => {
    trackCompetitorAnalysis(competitorCount, winProbability);
  }, []);

  const trackPipeline = useCallback((stage: string, opportunityCount: number) => {
    trackPipelineUpdate(stage, opportunityCount);
  }, []);

  // Engagement tracking
  const trackFeature = useCallback((featureName: string, usageDuration: number) => {
    trackFeatureUsage(featureName, usageDuration);
  }, []);

  const trackDashboard = useCallback((section: string) => {
    trackDashboardView(section);
  }, []);

  // Error tracking
  const trackErrorEvent = useCallback((errorType: string, errorMessage: string, errorLocation: string) => {
    trackError(errorType, errorMessage, errorLocation);
  }, []);

  return {
    // Generic tracking
    track,
    
    // Contract tracking
    trackContract,
    trackSearch,
    trackFilter,
    
    // User tracking
    trackNotification,
    trackRegistration,
    trackUpgrade,
    
    // Analytics tracking
    trackMarket,
    trackCompetitor,
    trackPipeline,
    
    // Engagement tracking
    trackFeature,
    trackDashboard,
    
    // Error tracking
    trackError: trackErrorEvent,
  };
};
