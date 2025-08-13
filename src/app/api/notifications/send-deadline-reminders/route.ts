import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/emailService';
import { whatsappService } from '@/lib/whatsappService';

export async function POST(request: NextRequest) {
  try {
    // Get all active bid tracking records
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: trackingRecords, error } = await supabase
      .from('bid_tracking')
      .select(`
        *,
        contracts (
          title,
          deadline,
          client
        )
      `)
      .eq('tracking_active', true);

    if (error) {
      console.error('Error getting tracking records:', error);
      return NextResponse.json(
        { error: 'Failed to get tracking records' },
        { status: 500 }
      );
    }

    const now = new Date();
    let notificationsSent = 0;

    for (const record of trackingRecords || []) {
      const deadline = new Date(record.contracts.deadline);
      const timeDiff = deadline.getTime() - now.getTime();
      const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      
      // Check if deadline is tomorrow (1 day left)
      if (daysLeft === 1) {
        const timeRemaining = '1 day';
        const deadlineFormatted = deadline.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        // Send email notification with template
        if (record.email_alerts) {
          const emailHtml = emailService.createDeadlineReminderEmail(
            record.contracts.title,
            record.contracts.client,
            deadlineFormatted,
            timeRemaining
          );
          
          // Get user email
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', record.user_id)
            .single();

          if (profile?.email) {
            await emailService.send(
              profile.email,
              '🚨 URGENT: Bid Deadline Tomorrow',
              emailHtml
            );
            notificationsSent++;
          }
        }

        // Send WhatsApp notification with template
        if (record.sms_alerts) {
          const whatsappMessage = whatsappService.createDeadlineReminderMessage(
            record.contracts.title,
            record.contracts.client,
            deadlineFormatted,
            timeRemaining
          );
          
          // Get user phone
          const { data: profile } = await supabase
            .from('profiles')
            .select('phone')
            .eq('id', record.user_id)
            .single();

          if (profile?.phone) {
            await whatsappService.send(profile.phone, whatsappMessage);
            notificationsSent++;
          }
        }

        // Create in-app notification
        await supabase
          .from('notifications')
          .insert({
            user_id: record.user_id,
            title: 'Deadline Reminder',
            message: `Tomorrow is the deadline for: ${record.contracts.title} (${record.contracts.client})`,
            type: 'warning',
            read: false
          });
      }
      
      // Check if deadline is in 3 days
      else if (daysLeft === 3) {
        const timeRemaining = '3 days';
        const deadlineFormatted = deadline.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        // Send email notification with template
        if (record.email_alerts) {
          const emailHtml = emailService.createDeadlineReminderEmail(
            record.contracts.title,
            record.contracts.client,
            deadlineFormatted,
            timeRemaining
          );
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', record.user_id)
            .single();

          if (profile?.email) {
            await emailService.send(
              profile.email,
              '⚠️ Bid Deadline Approaching',
              emailHtml
            );
            notificationsSent++;
          }
        }

        // Send WhatsApp notification with template
        if (record.sms_alerts) {
          const whatsappMessage = whatsappService.createDeadlineReminderMessage(
            record.contracts.title,
            record.contracts.client,
            deadlineFormatted,
            timeRemaining
          );
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('phone')
            .eq('id', record.user_id)
            .single();

          if (profile?.phone) {
            await whatsappService.send(profile.phone, whatsappMessage);
            notificationsSent++;
          }
        }

        // Create in-app notification
        await supabase
          .from('notifications')
          .insert({
            user_id: record.user_id,
            title: 'Deadline Approaching',
            message: `3 days until deadline for: ${record.contracts.title} (${record.contracts.client})`,
            type: 'info',
            read: false
          });
      }

      // Check if deadline is in 7 days
      else if (daysLeft === 7) {
        const timeRemaining = '1 week';
        const deadlineFormatted = deadline.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        // Send email notification with template
        if (record.email_alerts) {
          const emailHtml = emailService.createDeadlineReminderEmail(
            record.contracts.title,
            record.contracts.client,
            deadlineFormatted,
            timeRemaining
          );
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', record.user_id)
            .single();

          if (profile?.email) {
            await emailService.send(
              profile.email,
              '📅 Bid Deadline Coming Up',
              emailHtml
            );
            notificationsSent++;
          }
        }

        // Send WhatsApp notification with template
        if (record.sms_alerts) {
          const whatsappMessage = whatsappService.createDeadlineReminderMessage(
            record.contracts.title,
            record.contracts.client,
            deadlineFormatted,
            timeRemaining
          );
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('phone')
            .eq('id', record.user_id)
            .single();

          if (profile?.phone) {
            await whatsappService.send(profile.phone, whatsappMessage);
            notificationsSent++;
          }
        }

        // Create in-app notification
        await supabase
          .from('notifications')
          .insert({
            user_id: record.user_id,
            title: 'Deadline Coming Up',
            message: `1 week until deadline for: ${record.contracts.title} (${record.contracts.client})`,
            type: 'info',
            read: false
          });
      }
    }

    return NextResponse.json({ 
      success: true, 
      notificationsSent,
      recordsProcessed: trackingRecords?.length || 0
    });
  } catch (error) {
    console.error('Error in sendDeadlineReminders:', error);
    return NextResponse.json(
      { error: 'Failed to send deadline reminders' },
      { status: 500 }
    );
  }
}
