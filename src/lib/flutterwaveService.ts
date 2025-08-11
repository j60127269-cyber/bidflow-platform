import { supabase } from './supabase';
import { Payment, Subscription, SubscriptionPlan } from '@/types/database';

// Flutterwave configuration (client-side - only public key)
const FLUTTERWAVE_CONFIG = {
  publicKey: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || '',
  baseUrl: 'https://api.flutterwave.com/v3',
  currency: 'UGX',
  country: 'UG',
  redirectUrl: typeof window !== 'undefined' ? `${window.location.origin}/payment/callback` : '',
};

// Debug: Log configuration (remove in production)
console.log('Flutterwave Config:', {
  publicKey: FLUTTERWAVE_CONFIG.publicKey ? 'SET' : 'NOT SET',
  baseUrl: FLUTTERWAVE_CONFIG.baseUrl,
});

// Validate Flutterwave configuration (client-side)
const validateFlutterwaveConfig = () => {
  if (!FLUTTERWAVE_CONFIG.publicKey) {
    throw new Error('NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY is not configured. Please add it to your .env.local file.');
  }
};

export interface FlutterwavePaymentData {
  tx_ref: string;
  amount: number;
  currency: string;
  redirect_url: string;
  customer: {
    email: string;
    name: string;
    phone_number?: string;
  };
  customizations: {
    title: string;
    description: string;
    logo?: string;
  };
  meta?: {
    plan_id: string;
    user_id: string;
    subscription_type: string;
  };
}

export interface FlutterwaveResponse {
  status: string;
  message: string;
  data?: {
    link: string;
    reference: string;
    [key: string]: any;
  };
}

export interface PaymentVerificationResponse {
  status: string;
  message: string;
  data?: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    device_fingerprint: string;
    amount: number;
    currency: string;
    charged_amount: number;
    app_fee: number;
    merchant_fee: number;
    processor_response: string;
    auth_model: string;
    ip: string;
    narration: string;
    status: string;
    payment_type: string;
    created_at: string;
    account_id: number;
    customer: {
      id: number;
      name: string;
      phone_number: string;
      email: string;
      created_at: string;
    };
    card?: {
      first_6digits: string;
      last_4digits: string;
      issuer: string;
      country: string;
      type: string;
      token: string;
      expiry: string;
    };
    [key: string]: any;
  };
}

class FlutterwaveService {
  private async makeRequest(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any): Promise<any> {
    // For client-side, we'll call our server API instead of direct Flutterwave calls
    if (endpoint === '/payments' && method === 'POST') {
      return this.initializePaymentViaServer(data);
    }
    
    throw new Error('This method should be called via server API');
  }

  private async initializePaymentViaServer(paymentData: any): Promise<any> {
    try {
      const response = await fetch('/api/flutterwave/initialize-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentData }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Payment initialization failed');
      }
      
      return result;
    } catch (error) {
      console.error('Server API error:', error);
      throw error;
    }
  }

  /**
   * Initialize a payment transaction
   */
  async initializePayment(paymentData: FlutterwavePaymentData): Promise<FlutterwaveResponse> {
    // Validate configuration first
    validateFlutterwaveConfig();
    
    return this.initializePaymentViaServer(paymentData);
  }

  /**
   * Verify a payment transaction
   */
  async verifyPayment(transactionId: string): Promise<PaymentVerificationResponse> {
    try {
      const response = await fetch('/api/flutterwave/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionId }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Payment verification failed');
      }
      
      return result;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }

  /**
   * Create a subscription plan in Flutterwave
   */
  async createSubscriptionPlan(planData: {
    name: string;
    amount: number;
    interval: string;
    duration: number;
  }): Promise<any> {
    const payload = {
      name: planData.name,
      amount: planData.amount,
      interval: planData.interval,
      duration: planData.duration,
      currency: FLUTTERWAVE_CONFIG.currency,
    };

    return this.makeRequest('/subscriptions', 'POST', payload);
  }

  /**
   * Create a subscription for a user
   */
  async createSubscription(subscriptionData: {
    email: string;
    plan: string;
    card_token?: string;
  }): Promise<any> {
    const payload = {
      email: subscriptionData.email,
      plan: subscriptionData.plan,
      card_token: subscriptionData.card_token,
    };

    return this.makeRequest('/subscriptions', 'POST', payload);
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId: string): Promise<any> {
    return this.makeRequest(`/subscriptions/${subscriptionId}`);
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<any> {
    return this.makeRequest(`/subscriptions/${subscriptionId}/cancel`, 'POST');
  }

  /**
   * Generate a unique transaction reference
   */
  generateTransactionRef(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `BIDFLOW_${timestamp}_${random}`.toUpperCase();
  }

  /**
   * Save payment record to database
   */
  async savePaymentRecord(paymentData: {
    user_id: string;
    plan_id: string;
    amount: number;
    currency: string;
    flutterwave_transaction_id?: string;
    flutterwave_reference: string;
    status: 'pending' | 'successful' | 'failed' | 'cancelled';
    payment_method?: string;
    metadata?: any;
  }): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert([paymentData])
      .select()
      .single();

    if (error) {
      console.error('Error saving payment record:', error);
      throw new Error('Failed to save payment record');
    }

    return data;
  }

  /**
   * Update payment record status
   */
  async updatePaymentStatus(
    paymentId: string,
    status: 'pending' | 'successful' | 'failed' | 'cancelled',
    flutterwaveTransactionId?: string
  ): Promise<Payment> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (flutterwaveTransactionId) {
      updateData.flutterwave_transaction_id = flutterwaveTransactionId;
    }

    const { data, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', paymentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating payment status:', error);
      throw new Error('Failed to update payment status');
    }

    return data;
  }

  /**
   * Create subscription record in database
   */
  async createSubscriptionRecord(subscriptionData: {
    user_id: string;
    plan_id: string;
    status: 'active' | 'cancelled' | 'expired' | 'past_due';
    flutterwave_subscription_id?: string;
    current_period_end?: string;
  }): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([subscriptionData])
      .select()
      .single();

    if (error) {
      console.error('Error creating subscription record:', error);
      throw new Error('Failed to create subscription record');
    }

    return data;
  }

  /**
   * Get user's active subscription
   */
  async getUserActiveSubscription(userId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        subscription_plans (*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .gte('current_period_end', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user subscription:', error);
      throw new Error('Failed to fetch user subscription');
    }

    return data;
  }

  /**
   * Get subscription plan by name
   */
  async getSubscriptionPlan(planName: string): Promise<SubscriptionPlan | null> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('name', planName)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching subscription plan:', error);
      throw new Error('Failed to fetch subscription plan');
    }

    return data;
  }

  /**
   * Process payment webhook
   */
  async processWebhook(webhookData: any): Promise<void> {
    const { tx_ref, transaction_id, status, amount, currency } = webhookData;

    try {
      // Find payment record by reference
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('flutterwave_reference', tx_ref)
        .single();

      if (paymentError) {
        console.error('Payment not found for webhook:', paymentError);
        return;
      }

      // Update payment status
      await this.updatePaymentStatus(payment.id, status, transaction_id);

      // If payment is successful, create or update subscription
      if (status === 'successful') {
        const { data: subscription, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', payment.user_id)
          .eq('status', 'active')
          .single();

        if (subscriptionError && subscriptionError.code === 'PGRST116') {
          // Create new subscription
          const currentPeriodEnd = new Date();
          currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

          await this.createSubscriptionRecord({
            user_id: payment.user_id,
            plan_id: payment.plan_id,
            status: 'active',
            current_period_end: currentPeriodEnd.toISOString(),
          });
        }
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      throw error;
    }
  }
}

export const flutterwaveService = new FlutterwaveService();
