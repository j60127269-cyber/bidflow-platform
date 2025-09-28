import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { EmailServiceProvider, emailConfig } from '@/lib/email-config';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Sending emails for existing notifications...');
    
    // Get pending email notifications for new contracts
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select(`
        *,
        profiles!notifications_user_id_fkey (
          email,
          first_name,
          last_name
        )
      `)
      .eq('type', 'new_contract_match')
      .eq('channel', 'email')
      .eq('notification_status', 'pending')
      .order('created_at', { ascending: true });

    if (notificationsError) {
      console.error('Error fetching notifications:', notificationsError);
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }

    if (!notifications || notifications.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending notifications found',
        emailsSent: 0
      });
    }

    console.log(`Found ${notifications.length} pending notifications`);

    let successCount = 0;
    let errorCount = 0;

    // Process each notification
    for (const notification of notifications) {
      try {
        const userEmail = notification.profiles?.email;
        if (!userEmail) {
          console.error('No email found for notification:', notification.id);
          errorCount++;
          continue;
        }

        // Get contract data from notification
        const contractData = notification.data;
        
        // Send email
        const emailSent = await EmailServiceProvider.sendEmail(emailConfig, {
          to: userEmail,
          subject: `🚀 New Contract Match: ${contractData.contract_title}`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>New Contract Match</title>
              </head>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #007bff; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">🎯 New Contract Match!</h1>
                  <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">A contract matching your preferences has been published</p>
                </div>
                
                <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
                  <h2 style="color: #000000; margin-top: 0;">${contractData.contract_title}</h2>
                  
                  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #000000; margin-top: 0;">Contract Details</h3>
                    <p><strong>Procuring Entity:</strong> ${contractData.procuring_entity}</p>
                    <p><strong>Category:</strong> ${contractData.category}</p>
                    <p><strong>Estimated Value:</strong> ${contractData.estimated_value_min ? `UGX ${contractData.estimated_value_min.toLocaleString()}` : 'Not specified'}</p>
                    <p><strong>Submission Deadline:</strong> ${contractData.submission_deadline || 'Not specified'}</p>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/contracts/${contractData.contract_id}" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Contract Details</a>
                  </div>
                  
                  <p style="color: #666; font-size: 14px; margin-top: 30px;">
                    This is an automated notification from BidCloud. 
                    You received this because a new contract matching your preferences has been published.
                  </p>
                </div>
              </body>
            </html>
          `,
          text: `
            New Contract Match: ${contractData.contract_title}
            
            A contract matching your preferences has been published.
            
            Contract Details:
            - Title: ${contractData.contract_title}
            - Procuring Entity: ${contractData.procuring_entity}
            - Category: ${contractData.category}
            - Estimated Value: ${contractData.estimated_value_min ? `UGX ${contractData.estimated_value_min.toLocaleString()}` : 'Not specified'}
            - Submission Deadline: ${contractData.submission_deadline || 'Not specified'}
            
            View Contract Details: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/contracts/${contractData.contract_id}
            
            This is an automated notification from BidCloud.
          `
        });

        if (emailSent) {
          // Mark notification as sent
          await supabase
            .from('notifications')
            .update({
              notification_status: 'sent',
              sent_at: new Date().toISOString()
            })
            .eq('id', notification.id);

          console.log(`✅ Email sent to: ${userEmail}`);
          successCount++;
        } else {
          console.error(`❌ Failed to send email to: ${userEmail}`);
          errorCount++;
        }

      } catch (error) {
        console.error('Error processing notification:', error);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Email notifications processed',
      emailsSent: successCount,
      errors: errorCount
    });

  } catch (error) {
    console.error('Error in send-existing-notifications:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
