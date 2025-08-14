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
    try {
      console.log('🔍 hasActiveSubscription called for user:', userId);
      
      // First, check and handle any expired subscriptions
      await this.checkAndHandleExpiredSubscriptions(userId);
      
      // Check for active subscription in subscriptions table
      const subscription = await this.getUserActiveSubscription(userId);
      console.log('🔍 getUserActiveSubscription result:', subscription);
      
      if (subscription && Array.isArray(subscription) && subscription.length > 0) {
        console.log('🔍 Found active subscription, returning true');
        return true;
      }

      console.log('🔍 No active subscription found, checking profile...');

      // If no subscription found, check profile status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('id', userId)
        .single();

      console.log('🔍 Profile query result:', { profile, profileError });

      if (profileError) {
        console.error('Error checking profile subscription status:', profileError);
        // If profile doesn't exist, user definitely doesn't have active subscription
        console.log('🔍 Profile error, returning false');
        return false;
      }

      // If profile exists, only return true if it shows active subscription (not expired)
      if (profile) {
        const result = profile.subscription_status === 'active';
        console.log('🔍 Profile exists, subscription_status:', profile.subscription_status, 'returning:', result);
        return result;
      }

      // If no profile found, user doesn't have active subscription
      console.log('🔍 No profile found, returning false');
      return false;
    } catch (error) {
      console.error('Error in hasActiveSubscription:', error);
      return false;
    }
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
   * Check and handle expired subscriptions
   */
  async checkAndHandleExpiredSubscriptions(userId: string): Promise<void> {
    try {
      // Find expired subscriptions
      const { data: expiredSubscriptions, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .lt('current_period_end', new Date().toISOString());

      if (error) {
        console.error('Error checking expired subscriptions:', error);
        return;
      }

      // Update expired subscriptions to 'expired' status
      if (expiredSubscriptions && expiredSubscriptions.length > 0) {
        for (const subscription of expiredSubscriptions) {
          await this.updateSubscriptionStatus(subscription.id, 'expired');
        }

        // Update user's profile subscription status
        await supabase
          .from('profiles')
          .update({ subscription_status: 'expired' })
          .eq('id', userId);

        console.log(`Updated ${expiredSubscriptions.length} expired subscription(s) for user ${userId}`);
      }
    } catch (error) {
      console.error('Error in checkAndHandleExpiredSubscriptions:', error);
    }
  }

  /**
   * Check if user can access premium features
   */
  async canAccessPremiumFeatures(userId: string): Promise<boolean> {
    try {
      // Check if user has active subscription
      const hasActiveSub = await this.hasActiveSubscription(userId);
      return hasActiveSub;
    } catch (error) {
      console.error('Error in canAccessPremiumFeatures:', error);
      return false;
    }
  }

  /**
   * Get subscription status for user
   */
  async getUserSubscriptionStatus(userId: string): Promise<{
    status: 'none' | 'active' | 'cancelled' | 'expired';
    subscriptionEndsAt?: string;
    planName?: string;
  }> {
    try {
      // First, check and handle any expired subscriptions
      await this.checkAndHandleExpiredSubscriptions(userId);
      
      // Check for active subscription (paid subscription)
      const activeSubscription = await this.getUserActiveSubscription(userId);
      if (activeSubscription && Array.isArray(activeSubscription) && activeSubscription.length > 0) {
        return {
          status: 'active',
          subscriptionEndsAt: activeSubscription.current_period_end,
          planName: activeSubscription.plan_name,
        };
      }

      // If no active subscription found, check the profile status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile subscription status:', profileError);
        return { status: 'none' };
      }

      if (profile && profile.subscription_status) {
        return { status: profile.subscription_status };
      }

      return { status: 'none' };
    } catch (error) {
      console.error('Error in getUserSubscriptionStatus:', error);
      return { status: 'none' };
    }
  }


}

export const subscriptionService = new SubscriptionService();
