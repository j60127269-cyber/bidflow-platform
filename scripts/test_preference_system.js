// Test script for preference-based recommendations and notifications
// Run with: node scripts/test_preference_system.js

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPreferenceSystem() {
  console.log('🧪 Testing Preference-Based System...\n');

  try {
    // 1. Test user profile with preferences
    console.log('1. Testing user profile with preferences...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .not('preferred_categories', 'is', null)
      .limit(5);

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }

    console.log(`✅ Found ${profiles?.length || 0} users with preferences`);
    if (profiles && profiles.length > 0) {
      console.log('   Sample user preferences:', {
        id: profiles[0].id,
        preferred_categories: profiles[0].preferred_categories,
        min_contract_value: profiles[0].min_contract_value,
        max_contract_value: profiles[0].max_contract_value,
        business_type: profiles[0].business_type
      });
    }

    // 2. Test contract matching
    console.log('\n2. Testing contract matching...');
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('*')
      .neq('status', 'awarded')
      .neq('status', 'completed')
      .limit(10);

    if (contractsError) {
      console.error('❌ Error fetching contracts:', contractsError);
      return;
    }

    console.log(`✅ Found ${contracts?.length || 0} active contracts`);
    if (contracts && contracts.length > 0) {
      console.log('   Sample contract:', {
        id: contracts[0].id,
        title: contracts[0].title,
        category: contracts[0].category,
        estimated_value_min: contracts[0].estimated_value_min,
        estimated_value_max: contracts[0].estimated_value_max
      });
    }

    // 3. Test recommendation scoring
    console.log('\n3. Testing recommendation scoring...');
    if (profiles && profiles.length > 0 && contracts && contracts.length > 0) {
      const user = profiles[0];
      const contract = contracts[0];
      
      let score = 0;
      const reasons = [];

      // Category match
      if (user.preferred_categories && user.preferred_categories.includes(contract.category)) {
        score += 50;
        reasons.push(`Category match: ${contract.category}`);
      }

      // Value range match
      const contractValue = contract.estimated_value_min || contract.estimated_value_max || 0;
      if (contractValue >= user.min_contract_value && contractValue <= user.max_contract_value) {
        score += 30;
        reasons.push(`Value range match: ${contractValue}`);
      }

      // Business type match
      if (user.business_type && user.business_type !== "General") {
        const allText = [
          contract.title,
          contract.short_description,
          contract.evaluation_methodology
        ].join(' ').toLowerCase();
        
        if (allText.includes(user.business_type.toLowerCase())) {
          score += 20;
          reasons.push(`Business type match: ${user.business_type}`);
        }
      }

      console.log(`✅ Recommendation score: ${score}/100`);
      console.log('   Reasons:', reasons);
    }

    // 4. Test notifications
    console.log('\n4. Testing notifications...');
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (notificationsError) {
      console.error('❌ Error fetching notifications:', notificationsError);
      return;
    }

    console.log(`✅ Found ${notifications?.length || 0} notifications`);
    if (notifications && notifications.length > 0) {
      console.log('   Sample notification:', {
        id: notifications[0].id,
        title: notifications[0].title,
        type: notifications[0].type,
        read: notifications[0].read
      });
    }

    // 5. Test API endpoints
    console.log('\n5. Testing API endpoints...');
    try {
      const response = await fetch('http://localhost:3000/api/notifications/preference-check', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deadline-reminders' })
      });

      if (response.ok) {
        console.log('✅ Preference notification API endpoint is working');
      } else {
        console.log('⚠️  Preference notification API endpoint returned:', response.status);
      }
    } catch (error) {
      console.log('⚠️  Could not test API endpoint (server may not be running):', error.message);
    }

    console.log('\n🎉 Preference system test completed!');
    console.log('\n📋 Summary:');
    console.log(`   - Users with preferences: ${profiles?.length || 0}`);
    console.log(`   - Active contracts: ${contracts?.length || 0}`);
    console.log(`   - Notifications: ${notifications?.length || 0}`);
    console.log('\n💡 Next steps:');
    console.log('   1. Import new contracts to trigger preference notifications');
    console.log('   2. Set up a cron job for deadline reminders');
    console.log('   3. Test the recommended page with real user data');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testPreferenceSystem();
