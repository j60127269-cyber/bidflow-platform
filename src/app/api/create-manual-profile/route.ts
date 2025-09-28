import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    console.log('Creating manual profile for testing...');
    
    // Create a test profile manually with a known ID
    const testProfile = {
      id: '00000000-0000-0000-0000-000000000001', // Fixed test ID
      email: 'test@bidflow.com',
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
    };

    // Insert the profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert(testProfile)
      .select()
      .single();

    if (profileError) {
      console.error('Error creating profile:', profileError);
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
    }

    console.log('Profile created:', profile);

    // Create notification preferences
    const { error: prefError } = await supabase
      .from('user_notification_preferences')
      .insert({
        user_id: profile.id,
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
      message: 'Manual profile created successfully',
      profile: {
        id: profile.id,
        email: profile.email,
        industry_preferences: profile.industry_preferences,
        contract_type_preferences: profile.contract_type_preferences,
        preferred_categories: profile.preferred_categories
      }
    });

  } catch (error) {
    console.error('Error in create-manual-profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Use POST method to create manual profile'
  });
}
