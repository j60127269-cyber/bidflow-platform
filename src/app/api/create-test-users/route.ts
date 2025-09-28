import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    console.log('Creating test users...');
    
    // Create test users directly in the profiles table
    const testUsers = [
      {
        id: '11111111-1111-1111-1111-111111111111', // Fixed UUID for testing
        email: 'test1@example.com',
        first_name: 'Test',
        last_name: 'User 1',
        company_name: 'Test Company 1',
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
      },
      {
        id: '22222222-2222-2222-2222-222222222222', // Fixed UUID for testing
        email: 'test2@example.com',
        first_name: 'Test',
        last_name: 'User 2',
        company_name: 'Test Company 2',
        business_type: 'Construction',
        industry_preferences: ['Construction'],
        contract_type_preferences: ['Construction'],
        preferred_categories: ['Construction'],
        location_preferences: ['Kampala'],
        daily_digest_enabled: true,
        email_notifications: true,
        whatsapp_notifications: false,
        notification_frequency: 'daily',
        onboarding_completed: true,
        role: 'user'
      }
    ];

    const createdUsers = [];
    const errors = [];

    for (const userData of testUsers) {
      try {
        const { data: user, error: userError } = await supabase
          .from('profiles')
          .insert(userData)
          .select()
          .single();

        if (userError) {
          console.error(`Error creating user ${userData.email}:`, userError);
          errors.push({ email: userData.email, error: userError.message });
        } else {
          console.log(`User created: ${userData.email}`);
          createdUsers.push(user);

          // Create notification preferences for this user
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
            console.error(`Error creating preferences for ${userData.email}:`, prefError);
          }
        }
      } catch (err) {
        console.error(`Exception creating user ${userData.email}:`, err);
        errors.push({ email: userData.email, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Test users creation completed',
      createdUsers: createdUsers.map(u => ({
        id: u.id,
        email: u.email,
        industry_preferences: u.industry_preferences,
        contract_type_preferences: u.contract_type_preferences,
        preferred_categories: u.preferred_categories
      })),
      errors: errors
    });

  } catch (error) {
    console.error('Error in create-test-users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Use POST method to create test users'
  });
}
