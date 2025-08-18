import { supabase } from './supabase';

export interface TrackingPreferences {
  email_alerts: boolean;
  whatsapp_alerts: boolean;
  push_alerts: boolean;
  deadline_reminders: boolean;
  status_updates: boolean;
  document_updates: boolean;
}

export class TrackingPreferencesService {
  // Get user's default tracking preferences (from their most recent tracking entry)
  static async getUserDefaultPreferences(userId: string): Promise<TrackingPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('bid_tracking')
        .select('email_alerts, whatsapp_alerts, push_alerts')
        .eq('user_id', userId)
        .eq('tracking_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching user preferences:', error);
        return null;
      }

      if (data && data.length > 0) {
        return {
          email_alerts: data[0].email_alerts,
          whatsapp_alerts: data[0].whatsapp_alerts,
          push_alerts: data[0].push_alerts,
          deadline_reminders: true, // Default to true
          status_updates: true, // Default to true
          document_updates: true // Default to true
        };
      }

      return null;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }

  // Check if user has any existing tracking preferences
  static async hasExistingPreferences(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('bid_tracking')
        .select('id')
        .eq('user_id', userId)
        .eq('tracking_active', true)
        .limit(1);

      if (error) {
        console.error('Error checking preferences:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  }

  // Track contract with preferences
  static async trackContract(
    userId: string, 
    contractId: string, 
    preferences: TrackingPreferences
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('bid_tracking')
        .upsert({
          user_id: userId,
          contract_id: contractId,
          email_alerts: preferences.email_alerts,
          whatsapp_alerts: preferences.whatsapp_alerts,
          push_alerts: preferences.push_alerts,
          tracking_active: true
        });

      if (error) {
        console.error('Error tracking contract:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  }

  // Track contract with existing preferences (for one-click tracking)
  static async trackContractWithDefaults(userId: string, contractId: string): Promise<boolean> {
    try {
      const defaultPreferences = await this.getUserDefaultPreferences(userId);
      
      if (!defaultPreferences) {
        return false; // No defaults found, need to show modal
      }

      return await this.trackContract(userId, contractId, defaultPreferences);
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  }
}
