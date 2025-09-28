import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { EmailServiceProvider, emailConfig } from '@/lib/email-config';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Testing with real contracts from your database...');
    
    // Get a real published contract from your database
    const { data: realContract, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('publish_status', 'published')
      .order('published_at', { ascending: false })
      .limit(1)
      .single();

    if (contractError || !realContract) {
      console.error('Error fetching real contract:', contractError);
      return NextResponse.json({ 
        success: false, 
        error: 'No published contracts found in database' 
      }, { status: 404 });
    }

    console.log(`Using real contract: ${realContract.title}`);
    console.log(`Category: ${realContract.category}`);
    console.log(`Procuring Entity: ${realContract.procuring_entity}`);

    // Get users with matching preferences for this real contract
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

    // Find users who match this real contract
    const matchingUsers = users?.filter(user => {
      const checkMatch = (preferences: string[] | null | undefined) => {
        if (!preferences || preferences.length === 0) return true;
        
        return preferences.some(preference => {
          const contractLower = realContract.category.toLowerCase();
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

    console.log(`Found ${matchingUsers.length} users matching real contract: ${realContract.title}`);

    // Send email notification to you about this real contract
    const emailSent = await EmailServiceProvider.sendEmail(emailConfig, {
      to: 'sebunyaronaldoo@gmail.com',
      subject: `🚀 Real Contract Match: ${realContract.title}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Real Contract Match</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #007bff; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎯 Real Contract Match!</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">A real contract from your database matching user preferences</p>
            </div>
            
            <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
              <h2 style="color: #000000; margin-top: 0;">${realContract.title}</h2>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #000000; margin-top: 0;">Contract Details</h3>
                <p><strong>Procuring Entity:</strong> ${realContract.procuring_entity}</p>
                <p><strong>Category:</strong> ${realContract.category}</p>
                <p><strong>Estimated Value:</strong> ${realContract.estimated_value_min ? `UGX ${realContract.estimated_value_min.toLocaleString()}` : 'Not specified'}</p>
                <p><strong>Submission Deadline:</strong> ${realContract.submission_deadline || 'Not specified'}</p>
                <p><strong>Published Date:</strong> ${realContract.published_at ? new Date(realContract.published_at).toLocaleDateString() : 'Not specified'}</p>
              </div>
              
              <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #000000; margin-top: 0;">📊 Matching Results</h4>
                <p><strong>Total Users in Database:</strong> ${users?.length || 0}</p>
                <p><strong>Matching Users:</strong> ${matchingUsers.length}</p>
                <p><strong>Match Rate:</strong> ${users?.length ? Math.round((matchingUsers.length / users.length) * 100) : 0}%</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3000/dashboard/contracts/${realContract.id}" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Real Contract</a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                This notification was generated using a real contract from your BidCloud database.
                The system successfully matched ${matchingUsers.length} users based on their preferences.
              </p>
            </div>
          </body>
        </html>
      `,
      text: `
        Real Contract Match: ${realContract.title}
        
        A real contract from your database matching user preferences.
        
        Contract Details:
        - Title: ${realContract.title}
        - Procuring Entity: ${realContract.procuring_entity}
        - Category: ${realContract.category}
        - Estimated Value: ${realContract.estimated_value_min ? `UGX ${realContract.estimated_value_min.toLocaleString()}` : 'Not specified'}
        - Submission Deadline: ${realContract.submission_deadline || 'Not specified'}
        - Published Date: ${realContract.published_at ? new Date(realContract.published_at).toLocaleDateString() : 'Not specified'}
        
        Matching Results:
        - Total Users: ${users?.length || 0}
        - Matching Users: ${matchingUsers.length}
        - Match Rate: ${users?.length ? Math.round((matchingUsers.length / users.length) * 100) : 0}%
        
        View Real Contract: http://localhost:3000/dashboard/contracts/${realContract.id}
        
        This notification was generated using a real contract from your BidCloud database.
      `
    });

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: 'Real contract test completed successfully',
        realContract: {
          title: realContract.title,
          category: realContract.category,
          procuring_entity: realContract.procuring_entity,
          published_at: realContract.published_at
        },
        matchingResults: {
          totalUsers: users?.length || 0,
          matchingUsers: matchingUsers.length,
          matchRate: users?.length ? Math.round((matchingUsers.length / users.length) * 100) : 0
        },
        emailSent: true
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to send email notification'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error in test-real-contracts:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
