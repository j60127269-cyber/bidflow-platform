import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { EmailServiceProvider, emailConfig } from '@/lib/email-config';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Demonstrating notification system with real contracts from your ecosystem...');
    
    // Get all real published contracts from your database
    const { data: realContracts, error: contractsError } = await supabase
      .from('contracts')
      .select('*')
      .eq('publish_status', 'published')
      .order('published_at', { ascending: false })
      .limit(3);

    if (contractsError || !realContracts || realContracts.length === 0) {
      console.error('Error fetching real contracts:', contractsError);
      return NextResponse.json({ 
        success: false, 
        error: 'No published contracts found in your database' 
      }, { status: 404 });
    }

    console.log(`Found ${realContracts.length} real published contracts in your database`);

    // Get all users from your database
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        industry_preferences,
        location_preferences,
        contract_type_preferences,
        preferred_categories
      `)
      .not('email', 'is', null);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    console.log(`Found ${users?.length || 0} real users in your database`);

    // Process each real contract
    let totalNotifications = 0;
    const contractResults = [];

    for (const contract of realContracts) {
      console.log(`\n📋 Processing real contract: ${contract.title}`);
      console.log(`   Category: ${contract.category}`);
      console.log(`   Entity: ${contract.procuring_entity}`);
      console.log(`   Published: ${contract.published_at}`);

      // Find matching users for this real contract
      const matchingUsers = users?.filter(user => {
        const checkMatch = (preferences: string[] | null | undefined) => {
          if (!preferences || preferences.length === 0) return true;
          
          return preferences.some(preference => {
            const contractLower = contract.category.toLowerCase();
            const preferenceLower = preference.toLowerCase();
            
            // Check for ICT/IT keywords
            if ((preferenceLower.includes('information technology') || preferenceLower.includes('it')) && 
                (contractLower.includes('ict') || contractLower.includes('computer') || contractLower.includes('software'))) {
              return true;
            }
            
            // Check for construction keywords
            if (preferenceLower.includes('construction') && 
                (contractLower.includes('construction') || contractLower.includes('engineering') || contractLower.includes('building'))) {
              return true;
            }
            
            // Check for agriculture keywords
            if (preferenceLower.includes('agriculture') && 
                (contractLower.includes('agriculture') || contractLower.includes('farming') || contractLower.includes('soil'))) {
              return true;
            }
            
            // Check for healthcare keywords
            if (preferenceLower.includes('health') && 
                (contractLower.includes('health') || contractLower.includes('medical') || contractLower.includes('hospital'))) {
              return true;
            }
            
            return false;
          });
        };

        const matchesIndustry = checkMatch(user.industry_preferences);
        const matchesContractType = checkMatch(user.contract_type_preferences);
        const matchesPreferredCategories = checkMatch(user.preferred_categories);

        return matchesIndustry || matchesContractType || matchesPreferredCategories;
      }) || [];

      console.log(`   ✅ Found ${matchingUsers.length} matching users`);

      contractResults.push({
        contract: {
          title: contract.title,
          category: contract.category,
          procuring_entity: contract.procuring_entity,
          published_at: contract.published_at
        },
        matchingUsers: matchingUsers.length,
        totalUsers: users?.length || 0,
        matchRate: users?.length ? Math.round((matchingUsers.length / users.length) * 100) : 0
      });

      totalNotifications += matchingUsers.length;
    }

    // Send comprehensive demo email
    const emailSent = await EmailServiceProvider.sendEmail(emailConfig, {
      to: 'sebunyaronaldoo@gmail.com',
      subject: `🎯 BidCloud Real Contract Demo - ${totalNotifications} Notifications Generated`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>BidCloud Real Contract Demo</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
            <div style="background: #007bff; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 32px;">🎯 BidCloud Real Contract Demo</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 18px;">Using real contracts from your ecosystem</p>
            </div>
            
            <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
              <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <h2 style="color: #000000; margin-top: 0;">📊 System Performance</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; text-align: center;">
                  <div>
                    <div style="font-size: 24px; font-weight: bold; color: #007bff;">${realContracts.length}</div>
                    <div style="color: #666;">Real Contracts</div>
                  </div>
                  <div>
                    <div style="font-size: 24px; font-weight: bold; color: #28a745;">${users?.length || 0}</div>
                    <div style="color: #666;">Real Users</div>
                  </div>
                  <div>
                    <div style="font-size: 24px; font-weight: bold; color: #dc3545;">${totalNotifications}</div>
                    <div style="color: #666;">Notifications</div>
                  </div>
                </div>
              </div>

              <h2 style="color: #000000;">📋 Real Contracts Processed</h2>
              
              ${contractResults.map((result, index) => `
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
                  <h3 style="color: #000000; margin-top: 0;">${result.contract.title}</h3>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0;">
                    <div>
                      <strong>Category:</strong> ${result.contract.category}<br>
                      <strong>Entity:</strong> ${result.contract.procuring_entity}
                    </div>
                    <div>
                      <strong>Published:</strong> ${new Date(result.contract.published_at).toLocaleDateString()}<br>
                      <strong>Match Rate:</strong> ${result.matchRate}%
                    </div>
                  </div>
                  <div style="background: #e8f5e8; padding: 10px; border-radius: 4px; text-align: center;">
                    <strong>${result.matchingUsers} users matched</strong> out of ${result.totalUsers} total users
                  </div>
                </div>
              `).join('')}

              <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h3 style="color: #856404; margin-top: 0;">🎯 Key Features Demonstrated</h3>
                <ul style="color: #856404; margin: 0; padding-left: 20px;">
                  <li><strong>Real Contract Processing:</strong> Using actual contracts from your BidCloud database</li>
                  <li><strong>Smart Matching:</strong> Intelligent preference matching across categories</li>
                  <li><strong>User Targeting:</strong> Precise user segmentation based on preferences</li>
                  <li><strong>Real-time Notifications:</strong> Immediate alerts when contracts are published</li>
                  <li><strong>Professional Templates:</strong> Branded email notifications with contract details</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3000/dashboard" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">View Your Dashboard</a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center;">
                This demo used <strong>${realContracts.length} real contracts</strong> and <strong>${users?.length || 0} real users</strong> from your BidCloud ecosystem.<br>
                Generated <strong>${totalNotifications} notifications</strong> based on actual user preferences and contract categories.
              </p>
            </div>
          </body>
        </html>
      `,
      text: `
        BidCloud Real Contract Demo - ${totalNotifications} Notifications Generated
        
        System Performance:
        - Real Contracts: ${realContracts.length}
        - Real Users: ${users?.length || 0}
        - Notifications Generated: ${totalNotifications}
        
        Real Contracts Processed:
        ${contractResults.map((result, index) => `
        ${index + 1}. ${result.contract.title}
           Category: ${result.contract.category}
           Entity: ${result.contract.procuring_entity}
           Published: ${new Date(result.contract.published_at).toLocaleDateString()}
           Match Rate: ${result.matchRate}%
           Matching Users: ${result.matchingUsers} out of ${result.totalUsers}
        `).join('')}
        
        Key Features Demonstrated:
        - Real Contract Processing: Using actual contracts from your BidCloud database
        - Smart Matching: Intelligent preference matching across categories
        - User Targeting: Precise user segmentation based on preferences
        - Real-time Notifications: Immediate alerts when contracts are published
        - Professional Templates: Branded email notifications with contract details
        
        View Your Dashboard: http://localhost:3000/dashboard
        
        This demo used ${realContracts.length} real contracts and ${users?.length || 0} real users from your BidCloud ecosystem.
        Generated ${totalNotifications} notifications based on actual user preferences and contract categories.
      `
    });

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: 'Real contract demo completed successfully',
        summary: {
          realContracts: realContracts.length,
          realUsers: users?.length || 0,
          totalNotifications: totalNotifications,
          contractResults: contractResults
        },
        emailSent: true
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to send demo email'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error in demo-real-system:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
