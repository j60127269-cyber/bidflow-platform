import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Test basic connection
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('count')
      .limit(1);

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    const { data: subscriptionPlans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*')
      .limit(1);

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful!',
      tables: {
        contracts: contractsError ? '❌ Error' : '✅ Connected',
        profiles: profilesError ? '❌ Error' : '✅ Connected',
        subscription_plans: plansError ? '❌ Error' : '✅ Connected'
      },
      subscriptionPlan: subscriptionPlans?.[0] || null,
      errors: {
        contracts: contractsError?.message,
        profiles: profilesError?.message,
        plans: plansError?.message
      }
    });

  } catch (error: any) {
    console.error('Supabase connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Supabase connection failed',
      details: error.message,
      envCheck: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Present' : '❌ Missing',
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Present' : '❌ Missing'
      }
    }, { status: 500 });
  }
}
