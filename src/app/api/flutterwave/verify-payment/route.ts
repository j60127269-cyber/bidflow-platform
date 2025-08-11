import { NextRequest, NextResponse } from 'next/server';

// Flutterwave configuration (server-side)
const FLUTTERWAVE_CONFIG = {
  secretKey: process.env.FLUTTERWAVE_SECRET_KEY || '',
  baseUrl: 'https://api.flutterwave.com/v3',
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
      throw new Error(result.message || 'Payment verification failed');
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
    const { transactionId } = body;

    // Validate required fields
    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // Verify payment with Flutterwave
    const response = await makeFlutterwaveRequest(`/transactions/${transactionId}/verify`);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Payment verification failed',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}
