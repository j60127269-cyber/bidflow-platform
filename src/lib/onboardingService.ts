import { supabase } from './supabase';

export class OnboardingService {
  /**
   * Check if user has completed onboarding
   */
  async hasCompletedOnboarding(userId: string): Promise<boolean> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('onboarding_completed, preferred_categories, business_type, min_contract_value')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking onboarding status:', error);
        return false;
      }

      // If onboarding_completed flag is explicitly set to true, user has completed onboarding
      if (profile.onboarding_completed === true) {
        return true;
      }

      // Legacy check: if user has the required onboarding fields filled, consider onboarding complete
      if (profile.preferred_categories && 
          profile.business_type && 
          profile.min_contract_value) {
        // Mark onboarding as completed for legacy users
        await this.markOnboardingCompleted(userId);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error in hasCompletedOnboarding:', error);
      return false;
    }
  }

  /**
   * Mark onboarding as completed for a user
   */
  async markOnboardingCompleted(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Error marking onboarding as completed:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in markOnboardingCompleted:', error);
      throw error;
    }
  }

  /**
   * Get user's onboarding status
   */
  async getUserOnboardingStatus(userId: string): Promise<{
    completed: boolean;
    hasProfile: boolean;
    missingFields: string[];
  }> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // No profile exists
        return {
          completed: false,
          hasProfile: false,
          missingFields: ['profile']
        };
      }

      if (error) {
        console.error('Error fetching profile:', error);
        return {
          completed: false,
          hasProfile: false,
          missingFields: ['profile']
        };
      }

      const missingFields: string[] = [];
      
      if (!profile.preferred_categories || profile.preferred_categories.length === 0) {
        missingFields.push('preferred_categories');
      }
      
      if (!profile.business_type) {
        missingFields.push('business_type');
      }
      
      if (!profile.min_contract_value) {
        missingFields.push('min_contract_value');
      }

      const completed = profile.onboarding_completed === true || 
                       (profile.preferred_categories && 
                        profile.business_type && 
                        profile.min_contract_value);

      return {
        completed,
        hasProfile: true,
        missingFields
      };
    } catch (error) {
      console.error('Error in getUserOnboardingStatus:', error);
      return {
        completed: false,
        hasProfile: false,
        missingFields: ['profile']
      };
    }
  }
}

export const onboardingService = new OnboardingService();
