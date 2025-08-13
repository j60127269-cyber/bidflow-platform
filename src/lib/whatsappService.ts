import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export const whatsappService = {
  async send(to: string, message: string) {
    try {
      return await client.messages.create({
        from: 'whatsapp:+14155238886', // Twilio sandbox number
        to: `whatsapp:${to}`,
        body: message,
      });
    } catch (error) {
      console.error('WhatsApp sending failed:', error);
      throw error;
    }
  },

  // Create WhatsApp message for deadline reminders
  createDeadlineReminderMessage(contractTitle: string, client: string, deadline: string, timeRemaining: string) {
    return `🚨 *BidFlow Deadline Reminder*

*Contract:* ${contractTitle}
*Client:* ${client}
*Deadline:* ${deadline}
*Time Remaining:* ${timeRemaining}

⚠️ Don't miss this opportunity!

View details: ${process.env.NEXT_PUBLIC_APP_URL || 'https://bidflow.ug'}/dashboard

---
BidFlow - Uganda's Premier Contract Intelligence Platform`;
  },

  // Create WhatsApp message for tracking confirmation
  createTrackingConfirmationMessage(contractTitle: string, client: string) {
    return `✅ *BidFlow Tracking Started*

You're now tracking: *${contractTitle}*
Client: ${client}

You'll receive alerts for:
• 7 days before deadline
• 3 days before deadline  
• 1 day before deadline

View tracked bids: ${process.env.NEXT_PUBLIC_APP_URL || 'https://bidflow.ug'}/dashboard/tracking

---
BidFlow - Uganda's Premier Contract Intelligence Platform`;
  },

  // Create WhatsApp message for general notifications
  createGeneralNotificationMessage(title: string, message: string) {
    return `📢 *BidFlow Notification*

*${title}*

${message}

View dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'https://bidflow.ug'}/dashboard

---
BidFlow - Uganda's Premier Contract Intelligence Platform`;
  }
};
