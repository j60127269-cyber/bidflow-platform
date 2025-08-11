import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Flutterwave configuration (server-side)
const FLUTTERWAVE_CONFIG = {
  secretKey: process.env.FLUTTERWAVE_SECRET_KEY || '',
  baseUrl: 'https://api.flutterwave.com/v3',
  currency: 'UGX',
  country: 'UG',
};

// Validate Flutterwave configuration
const validateFlutterwaveConfig = () => {
  if (!FLUTTERWAVE_CONFIG.secretKey) {
    throw new Error('FLUTTERWAVE_SECRET_KEY is not configured on the server.');
  }
};

async function makeFlutterwaveRequest(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any): Promise<any> {
  validateFlutterwaveConfig();
  
  const url = `${FLUTTERWAVE_CONFIG.baseUrl}${endpoint}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${FLUTTERWAVE_CONFIG.secretKey}`,
  };

  const config: RequestInit = {
    method,
    headers,
  };

  if (data && method === 'POST') {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Payment request failed');
    }
    
    return result;
  } catch (error) {
    console.error('Flutterwave API error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentData } = body;

    // Validate required fields
    if (!paymentData.tx_ref || !paymentData.amount || !paymentData.currency) {
      return NextResponse.json(
        { error: 'Missing required payment data' },
        { status: 400 }
      );
    }

    // Initialize payment with Flutterwave
    const payload = {
      tx_ref: paymentData.tx_ref,
      amount: paymentData.amount,
      currency: paymentData.currency,
      redirect_url: paymentData.redirect_url,
      customer: paymentData.customer,
      customizations: paymentData.customizations,
      meta: paymentData.meta,
    };

    const response = await makeFlutterwaveRequest('/payments', 'POST', payload);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Payment initialization failed',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}
