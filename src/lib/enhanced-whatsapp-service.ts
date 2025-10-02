import twilio from 'twilio';

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export interface WhatsAppMessage {
  to: string;
  message: string;
  mediaUrl?: string;
}

export interface WhatsAppTemplate {
  name: string;
  language: string;
  components?: any[];
}

export class EnhancedWhatsAppService {
  /**
   * Send a WhatsApp message
   */
  static async sendMessage(message: WhatsAppMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const result = await client.messages.create({
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886'}`,
        to: `whatsapp:${message.to}`,
        body: message.message,
        ...(message.mediaUrl && { mediaUrl: message.mediaUrl })
      });

      return {
        success: true,
        messageId: result.sid
      };
    } catch (error: any) {
      console.error('WhatsApp sending failed:', error);
      return {
        success: false,
        error: error.message || 'Unknown error'
      };
    }
  }

  /**
   * Send a WhatsApp template message
   */
  static async sendTemplate(
    to: string,
    template: WhatsAppTemplate,
    parameters?: Record<string, string>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const result = await client.messages.create({
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886'}`,
        to: `whatsapp:${to}`,
        contentSid: template.name,
        contentVariables: parameters ? JSON.stringify(parameters) : undefined
      });

      return {
        success: true,
        messageId: result.sid
      };
    } catch (error: any) {
      console.error('WhatsApp template sending failed:', error);
      return {
        success: false,
        error: error.message || 'Unknown error'
      };
    }
  }

  /**
   * Create contract match notification message
   */
  static createContractMatchMessage(contract: {
    title: string;
    reference_number: string;
    procuring_entity: string;
    submission_deadline: string;
    estimated_value_min?: number;
    estimated_value_max?: number;
    category: string;
    detail_url?: string;
  }): string {
    const deadline = new Date(contract.submission_deadline).toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const timeRemaining = this.calculateTimeRemaining(contract.submission_deadline);
    const valueRange = this.formatValueRange(contract.estimated_value_min, contract.estimated_value_max);

    return `🎯 *NEW CONTRACT MATCH!*

*${contract.title}*

📋 *Reference:* ${contract.reference_number}
🏢 *Client:* ${contract.procuring_entity}
📅 *Deadline:* ${deadline}
⏰ *Time Remaining:* ${timeRemaining}
💰 *Value:* ${valueRange}
🏷️ *Category:* ${contract.category}

⚡ *This contract matches your preferences!*

🔗 View Details: ${process.env.NEXT_PUBLIC_APP_URL || 'https://bidcloud.org'}/contracts/${contract.id || 'view-all'}

---
*BidCloud - Uganda's Premier Contract Intelligence Platform*`;
  }

  /**
   * Create deadline reminder message
   */
  static createDeadlineReminderMessage(contract: {
    title: string;
    reference_number: string;
    procuring_entity: string;
    submission_deadline: string;
    detail_url?: string;
  }, daysRemaining: number): string {
    const deadline = new Date(contract.submission_deadline).toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const urgency = this.getUrgencyLevel(daysRemaining);
    const urgencyEmoji = this.getUrgencyEmoji(daysRemaining);

    return `${urgencyEmoji} *DEADLINE REMINDER - ${urgency}*

*${contract.title}*

📋 *Reference:* ${contract.reference_number}
🏢 *Client:* ${contract.procuring_entity}
📅 *Deadline:* ${deadline}
⏰ *Days Remaining:* ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}

${this.getUrgencyMessage(daysRemaining)}

🔗 Submit Bid: ${process.env.NEXT_PUBLIC_APP_URL || 'https://bidcloud.org'}/contracts/${contract.id || 'view-all'}

---
*BidCloud - Uganda's Premier Contract Intelligence Platform*`;
  }

  /**
   * Create daily digest message
   */
  static createDailyDigestMessage(contracts: any[], userPreferences?: {
    preferred_categories?: string[];
    max_contract_value?: number;
    min_contract_value?: number;
  }): string {
    if (contracts.length === 0) {
      return `📊 *Daily Contract Digest*

No new contracts match your preferences today.

💡 *Tip:* Update your preferences to see more opportunities:
${process.env.NEXT_PUBLIC_APP_URL || 'https://bidcloud.org'}/dashboard/preferences

---
*BidCloud - Uganda's Premier Contract Intelligence Platform*`;
    }

    let message = `📊 *Daily Contract Digest*\n\n`;
    message += `Found *${contracts.length}* new contract${contracts.length > 1 ? 's' : ''} matching your preferences:\n\n`;

    // Show top 3 contracts
    contracts.slice(0, 3).forEach((contract, index) => {
      const deadline = new Date(contract.submission_deadline).toLocaleDateString('en-UG', {
        month: 'short',
        day: 'numeric'
      });
      
      message += `${index + 1}. *${contract.title}*\n`;
      message += `   📅 ${deadline} • 🏢 ${contract.procuring_entity}\n`;
      if (contract.estimated_value_min) {
        message += `   💰 UGX ${contract.estimated_value_min.toLocaleString()}\n`;
      }
      message += `\n`;
    });

    if (contracts.length > 3) {
      message += `... and *${contracts.length - 3}* more opportunities!\n\n`;
    }

    message += `🔗 View All: ${process.env.NEXT_PUBLIC_APP_URL || 'https://bidcloud.org'}/dashboard\n\n`;
    message += `---
*BidCloud - Uganda's Premier Contract Intelligence Platform*`;

    return message;
  }

  /**
   * Create tracking confirmation message
   */
  static createTrackingConfirmationMessage(contract: {
    title: string;
    procuring_entity: string;
    submission_deadline: string;
  }): string {
    const deadline = new Date(contract.submission_deadline).toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `✅ *TRACKING STARTED*

You're now tracking:
*${contract.title}*

🏢 *Client:* ${contract.procuring_entity}
📅 *Deadline:* ${deadline}

🔔 *You'll receive alerts:*
• 7 days before deadline
• 3 days before deadline
• 1 day before deadline
• Final day reminder

🔗 View Tracked Bids: ${process.env.NEXT_PUBLIC_APP_URL || 'https://bidcloud.org'}/dashboard/tracking

---
*BidCloud - Uganda's Premier Contract Intelligence Platform*`;
  }

  /**
   * Create welcome message for new users
   */
  static createWelcomeMessage(userName?: string): string {
    return `🎉 *Welcome to BidCloud!*

${userName ? `Hi ${userName}, ` : ''}welcome to Uganda's premier contract intelligence platform.

🚀 *Get started:*
• Browse available contracts
• Set your preferences
• Track contracts you're interested in
• Get instant notifications

🔗 Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'https://bidcloud.org'}/dashboard

💡 *Need help?* Reply with "HELP" for assistance.

---
*BidCloud - Uganda's Premier Contract Intelligence Platform*`;
  }

  /**
   * Create help message
   */
  static createHelpMessage(): string {
    return `🆘 *BidCloud Help Center*

*Available Commands:*
• *HELP* - Show this message
• *STATUS* - Check your account status
• *PREFERENCES* - Update notification settings
• *TRACKING* - View tracked contracts

*Quick Links:*
🔗 Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'https://bidcloud.org'}/dashboard
🔗 Contracts: ${process.env.NEXT_PUBLIC_APP_URL || 'https://bidcloud.org'}/contracts
🔗 Settings: ${process.env.NEXT_PUBLIC_APP_URL || 'https://bidcloud.org'}/dashboard/settings

*Contact Support:*
📧 Email: support@bidcloud.org
📞 Phone: +256 770 874 913

---
*BidCloud - Uganda's Premier Contract Intelligence Platform*`;
  }

  /**
   * Calculate time remaining until deadline
   */
  private static calculateTimeRemaining(deadline: string): string {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Expired';
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays <= 7) {
      return `${diffDays} days`;
    } else {
      const weeks = Math.floor(diffDays / 7);
      const remainingDays = diffDays % 7;
      return weeks === 1 
        ? `1 week${remainingDays > 0 ? ` ${remainingDays} days` : ''}`
        : `${weeks} weeks${remainingDays > 0 ? ` ${remainingDays} days` : ''}`;
    }
  }

  /**
   * Format value range for display
   */
  private static formatValueRange(min?: number, max?: number): string {
    if (!min && !max) return 'Not specified';
    if (min && max) return `UGX ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `UGX ${min.toLocaleString()}+`;
    if (max) return `Up to UGX ${max.toLocaleString()}`;
    return 'Not specified';
  }

  /**
   * Get urgency level based on days remaining
   */
  private static getUrgencyLevel(daysRemaining: number): string {
    if (daysRemaining <= 0) return 'EXPIRED';
    if (daysRemaining === 1) return 'FINAL DAY';
    if (daysRemaining <= 3) return 'URGENT';
    if (daysRemaining <= 7) return 'HIGH PRIORITY';
    return 'NORMAL';
  }

  /**
   * Get urgency emoji based on days remaining
   */
  private static getUrgencyEmoji(daysRemaining: number): string {
    if (daysRemaining <= 0) return '🚨';
    if (daysRemaining === 1) return '⚠️';
    if (daysRemaining <= 3) return '🔥';
    if (daysRemaining <= 7) return '⚡';
    return '📅';
  }

  /**
   * Get urgency message based on days remaining
   */
  private static getUrgencyMessage(daysRemaining: number): string {
    if (daysRemaining <= 0) {
      return '❌ *This deadline has passed!*';
    } else if (daysRemaining === 1) {
      return '🚨 *FINAL DAY!* Submit your bid today!';
    } else if (daysRemaining <= 3) {
      return '⚠️ *URGENT!* Only a few days left to submit!';
    } else if (daysRemaining <= 7) {
      return '⚡ *High Priority!* Prepare your bid submission.';
    } else {
      return '📅 *Normal Priority* - Plan your bid submission.';
    }
  }

  /**
   * Validate phone number format
   */
  static validatePhoneNumber(phone: string): { valid: boolean; formatted?: string; error?: string } {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Check if it's a valid Ugandan number
    if (cleaned.startsWith('256')) {
      return {
        valid: true,
        formatted: `+${cleaned}`
      };
    } else if (cleaned.startsWith('0') && cleaned.length === 10) {
      return {
        valid: true,
        formatted: `+256${cleaned.substring(1)}`
      };
    } else if (cleaned.length === 9 && cleaned.startsWith('7')) {
      return {
        valid: true,
        formatted: `+256${cleaned}`
      };
    } else {
      return {
        valid: false,
        error: 'Invalid phone number format. Please use format: +256XXXXXXXXX or 0XXXXXXXXX'
      };
    }
  }

  /**
   * Send bulk messages with rate limiting
   */
  static async sendBulkMessages(
    messages: WhatsAppMessage[],
    delayMs: number = 1000
  ): Promise<{ success: number; failed: number; results: any[] }> {
    const results: any[] = [];
    let success = 0;
    let failed = 0;

    for (let i = 0; i < messages.length; i++) {
      try {
        const result = await this.sendMessage(messages[i]);
        results.push(result);
        
        if (result.success) {
          success++;
        } else {
          failed++;
        }

        // Rate limiting - wait between messages
        if (i < messages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      } catch (error) {
        console.error(`Error sending message ${i + 1}:`, error);
        results.push({ success: false, error: 'Unknown error' });
        failed++;
      }
    }

    return { success, failed, results };
  }
}
