import { supabase } from './supabase';
import { Subscription, SubscriptionPlan, UserActiveSubscription } from '@/types/database';

class SubscriptionService {
  /**
   * Get user's active subscription
   */
  async getUserActiveSubscription(userId: string): Promise<UserActiveSubscription | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_active_subscription', { user_uuid: userId });

      if (error) {
        console.error('Error fetching active subscription:', error);
        // Check if the function doesn't exist
        if (error.message?.includes('function') || error.code === '42883') {
          console.error('Database function get_user_active_subscription not found. Please run the flutterwave_setup.sql script.');
        }
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserActiveSubscription:', error);
      return null;
    }
  }

  /**
   * Check if user has active subscription
   */
  async hasActiveSubscription(userId: string): Promise<boolean> {
    const subscription = await this.getUserActiveSubscription(userId);
    return subscription !== null;
  }

  /**
   * Get subscription plan by name
   */
  async getSubscriptionPlan(planName: string): Promise<SubscriptionPlan | null> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('name', planName)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching subscription plan:', error);
        // Check if table doesn't exist
        if (error.message?.includes('relation') || error.code === '42P01') {
          console.error('Table subscription_plans not found. Please run the flutterwave_setup.sql script.');
        }
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getSubscriptionPlan:', error);
      return null;
    }
  }

  /**
   * Get all active subscription plans
   */
  async getActiveSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching subscription plans:', error);
        // Check if table doesn't exist
        if (error.message?.includes('relation') || error.code === '42P01') {
          console.error('Table subscription_plans not found. Please run the flutterwave_setup.sql script.');
        }
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getActiveSubscriptionPlans:', error);
      return [];
    }
  }

  /**
   * Create a new subscription
   */
  async createSubscription(subscriptionData: {
    user_id: string;
    plan_id: string;
    status: 'active' | 'cancelled' | 'expired' | 'past_due';
    flutterwave_subscription_id?: string;
    current_period_end?: string;
  }): Promise<Subscription | null> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert([subscriptionData])
        .select()
        .single();

      if (error) {
        console.error('Error creating subscription:', error);
        // Check if table doesn't exist
        if (error.message?.includes('relation') || error.code === '42P01') {
          console.error('Table subscriptions not found. Please run the flutterwave_setup.sql script.');
        }
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createSubscription:', error);
      return null;
    }
  }

  /**
   * Update subscription status
   */
  async updateSubscriptionStatus(
    subscriptionId: string,
    status: 'active' | 'cancelled' | 'expired' | 'past_due'
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId);

      if (error) {
        console.error('Error updating subscription status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateSubscriptionStatus:', error);
      return false;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId);

      if (error) {
        console.error('Error cancelling subscription:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in cancelSubscription:', error);
      return false;
    }
  }

  /**
   * Set subscription to cancel at period end
   */
  async setCancelAtPeriodEnd(subscriptionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId);

      if (error) {
        console.error('Error setting cancel at period end:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in setCancelAtPeriodEnd:', error);
      return false;
    }
  }

  /**
   * Get user's subscription history
   */
  async getUserSubscriptionHistory(userId: string): Promise<Subscription[]> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          subscription_plans (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching subscription history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserSubscriptionHistory:', error);
      return [];
    }
  }

  /**
   * Check if user is in trial period
   */
  async isUserInTrial(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('trial_ends_at, subscription_status')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking trial status:', error);
        return false;
      }

      if (!data) return false;

      // Check if user has trial status and trial hasn't expired
      if (data.subscription_status === 'trial' && data.trial_ends_at) {
        const trialEndDate = new Date(data.trial_ends_at);
        return trialEndDate > new Date();
      }

      return false;
    } catch (error) {
      console.error('Error in isUserInTrial:', error);
      return false;
    }
  }

  /**
   * Start trial period for user
   */
  async startTrial(userId: string, trialDays: number = 7): Promise<boolean> {
    try {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + trialDays);

      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'trial',
          trial_ends_at: trialEndDate.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('Error starting trial:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in startTrial:', error);
      return false;
    }
  }

  /**
   * End trial period for user
   */
  async endTrial(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'none',
          trial_ends_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('Error ending trial:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in endTrial:', error);
      return false;
    }
  }

  /**
   * Check if user can access premium features
   */
  async canAccessPremiumFeatures(userId: string): Promise<boolean> {
    try {
      // Check if user has active subscription
      const hasActiveSub = await this.hasActiveSubscription(userId);
      if (hasActiveSub) return true;

      // Check if user is in trial
      const isInTrial = await this.isUserInTrial(userId);
      if (isInTrial) return true;

      return false;
    } catch (error) {
      console.error('Error in canAccessPremiumFeatures:', error);
      return false;
    }
  }

  /**
   * Get subscription status for user
   */
  async getUserSubscriptionStatus(userId: string): Promise<{
    status: 'none' | 'trial' | 'active' | 'cancelled' | 'expired';
    trialEndsAt?: string;
    subscriptionEndsAt?: string;
    planName?: string;
  }> {
    try {
      // Check for active subscription
      const activeSubscription = await this.getUserActiveSubscription(userId);
      if (activeSubscription) {
        return {
          status: 'active',
          subscriptionEndsAt: activeSubscription.current_period_end,
          planName: activeSubscription.plan_name,
        };
      }

      // Check trial status
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_status, trial_ends_at')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching subscription status:', error);
        return { status: 'none' };
      }

      if (!data) return { status: 'none' };

      // Check if user has trial status and trial hasn't expired
      if (data.subscription_status === 'trial' && data.trial_ends_at) {
        const trialEndDate = new Date(data.trial_ends_at);
        if (trialEndDate > new Date()) {
          return {
            status: 'trial',
            trialEndsAt: data.trial_ends_at,
          };
        }
      }

      return { status: 'none' };
    } catch (error) {
      console.error('Error in getUserSubscriptionStatus:', error);
      return { status: 'none' };
    }
  }
}

export const subscriptionService = new SubscriptionService();
