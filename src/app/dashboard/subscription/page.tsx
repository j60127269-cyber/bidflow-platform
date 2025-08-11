'use client'

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { subscriptionService } from "@/lib/subscriptionService";
import { supabase } from "@/lib/supabase";
import { 
  CreditCard, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  RefreshCw,
  Settings
} from "lucide-react";

interface Subscription {
  id: string;
  status: string;
  current_period_end: string;
  subscription_plans: {
    name: string;
    price: number;
    currency: string;
    billing_interval: string;
  };
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  flutterwave_reference: string;
}

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadSubscriptionData();
    }
  }, [user]);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load subscription details
      const subscriptionData = await subscriptionService.getUserActiveSubscription(user?.id || '');
      setSubscription(subscriptionData);

      // Load payment history
      const { data: paymentHistory, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (paymentError) {
        console.error('Error loading payments:', paymentError);
      } else {
        setPayments(paymentHistory || []);
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
      setError('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'expired':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Subscription Management</h1>
          <p className="text-slate-600 mt-2">Manage your subscription and billing</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Subscription */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Current Subscription</h2>
                <button
                  onClick={loadSubscriptionData}
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Refresh
                </button>
              </div>

              {subscription ? (
                <div className="space-y-6">
                  {/* Plan Details */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {subscription.subscription_plans.name} Plan
                        </h3>
                        <p className="text-slate-600">
                          {formatCurrency(subscription.subscription_plans.price, subscription.subscription_plans.currency)} / {subscription.subscription_plans.billing_interval}
                        </p>
                      </div>
                      <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
                        {getStatusIcon(subscription.status)}
                        <span className="ml-1 capitalize">{subscription.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Next Billing */}
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-slate-400 mr-3" />
                      <div>
                        <p className="text-sm text-slate-600">Next billing date</p>
                        <p className="font-semibold text-slate-900">
                          {formatDate(subscription.current_period_end)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-4">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                      Manage Subscription
                    </button>
                    <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-4 rounded-lg font-medium transition-colors">
                      Download Invoice
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Active Subscription</h3>
                  <p className="text-slate-600 mb-4">
                    You don't have an active subscription. Subscribe to access all features.
                  </p>
                  <button
                    onClick={() => window.location.href = '/onboarding/subscription'}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium transition-colors"
                  >
                    Subscribe Now
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Billing History */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Billing History</h2>
              
              {payments.length > 0 ? (
                <div className="space-y-4">
                  {payments.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-900">
                          {formatCurrency(payment.amount, payment.currency)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        {formatDate(payment.created_at)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Ref: {payment.flutterwave_reference}
                      </p>
                    </div>
                  ))}
                  
                  {payments.length > 5 && (
                    <button className="w-full text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View all payments ({payments.length})
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600 text-sm">No payment history yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center mb-4">
              <Settings className="w-6 h-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-slate-900">Account Settings</h3>
            </div>
            <p className="text-slate-600 text-sm mb-4">
              Update your billing information and account preferences.
            </p>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Manage Settings →
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center mb-4">
              <Download className="w-6 h-6 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-slate-900">Download Invoices</h3>
            </div>
            <p className="text-slate-600 text-sm mb-4">
              Access and download your billing invoices and receipts.
            </p>
            <button className="text-green-600 hover:text-green-700 text-sm font-medium">
              View Invoices →
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-orange-600 mr-3" />
              <h3 className="text-lg font-semibold text-slate-900">Support</h3>
            </div>
            <p className="text-slate-600 text-sm mb-4">
              Need help with your subscription? Contact our support team.
            </p>
            <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
              Contact Support →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
