import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    console.log('Creating test user...');
    
    // Create a test user in the profiles table
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .insert({
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        company_name: 'Test Company',
        business_type: 'IT Consulting',
        industry_preferences: ['Information Technology'],
        contract_type_preferences: ['Information Technology'],
        preferred_categories: ['Information Technology'],
        location_preferences: ['Kampala'],
        daily_digest_enabled: true,
        email_notifications: true,
        whatsapp_notifications: false,
        notification_frequency: 'daily',
        onboarding_completed: true,
        role: 'user'
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating test user:', userError);
      return NextResponse.json({ error: 'Failed to create test user' }, { status: 500 });
    }

    console.log('Test user created:', user);

    // Also create notification preferences
    const { error: prefError } = await supabase
      .from('user_notification_preferences')
      .insert({
        user_id: user.id,
        new_contract_notifications: true,
        deadline_reminders: true,
        daily_digest_enabled: true,
        email_enabled: true,
        in_app_enabled: true,
        whatsapp_enabled: false
      });

    if (prefError) {
      console.error('Error creating notification preferences:', prefError);
    }

    return NextResponse.json({
      success: true,
      message: 'Test user created successfully',
      user: {
        id: user.id,
        email: user.email,
        industry_preferences: user.industry_preferences,
        contract_type_preferences: user.contract_type_preferences,
        preferred_categories: user.preferred_categories
      }
    });

  } catch (error) {
    console.error('Error in create-test-user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Use POST method to create test user'
  });
}
