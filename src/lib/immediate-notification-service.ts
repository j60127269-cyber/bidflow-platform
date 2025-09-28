import { supabase } from '@/lib/supabase';
import { EmailServiceProvider, emailConfig } from '@/lib/email-config';
import { generateImmediateNotificationEmail } from '@/lib/email-service';

export class ImmediateNotificationService {
  static async processNewContractNotifications() {
    try {
      console.log('🔄 Processing immediate notifications for new contracts...');
      
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
        return { success: false, error: notificationsError };
      }

      if (!notifications || notifications.length === 0) {
        console.log('No pending immediate notifications found');
        return { success: true, processed: 0 };
      }

      console.log(`Found ${notifications.length} pending immediate notifications`);

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

          // Generate email content
          const contractData = notification.data;
          const contract = {
            title: contractData.contract_title || 'New Contract',
            procuring_entity: contractData.procuring_entity || 'Unknown Entity',
            category: contractData.category || 'General',
            estimated_value_min: contractData.estimated_value_min,
            submission_deadline: contractData.submission_deadline
          };
          
          const emailContent = generateImmediateNotificationEmail(contract, userEmail);

          // Send email
          const emailSent = await EmailServiceProvider.sendEmail(emailConfig, {
            to: userEmail,
            subject: `🚀 New Contract Match: ${contractData.contract_title}`,
            html: emailContent.html,
            text: emailContent.text
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

            console.log(`✅ Immediate notification sent to: ${userEmail}`);
            successCount++;
          } else {
            console.error(`❌ Failed to send immediate notification to: ${userEmail}`);
            errorCount++;
          }

        } catch (error) {
          console.error('Error processing immediate notification:', error);
          errorCount++;
        }
      }

      console.log(`✅ Immediate notification processing completed: ${successCount} sent, ${errorCount} errors`);
      
      return {
        success: true,
        processed: successCount,
        errors: errorCount
      };

    } catch (error) {
      console.error('Error in immediate notification processing:', error);
      return { success: false, error };
    }
  }
}