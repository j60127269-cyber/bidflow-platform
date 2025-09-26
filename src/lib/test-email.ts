// Test Email Notification System
// This file demonstrates how to test the email notification system

import { EmailService } from './email-service';
import { NotificationService } from './notifications';

/**
 * Test email notification system
 */
export class EmailTestService {
  /**
   * Test sending a contract match email
   */
  static async testContractMatchEmail(): Promise<void> {
    try {
      console.log('🧪 Testing contract match email...');
      
      const mockContract = {
        id: 'test-contract-123',
        title: 'Supply of Office Equipment',
        category: 'Supplies',
        procuring_entity: 'Ministry of Health',
        estimated_value_min: 5000000,
        estimated_value_max: 10000000,
        submission_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      };

      const testEmail = 'test@example.com';
      
      const emailData = EmailService.generateContractMatchEmail(mockContract, testEmail);
      
      console.log('Generated email data:', {
        to: emailData.to,
        subject: emailData.subject,
        htmlLength: emailData.html.length,
        textLength: emailData.text.length
      });

      // Uncomment the line below to actually send the email
      // const success = await EmailService.sendEmail(emailData);
      // console.log('Email sent successfully:', success);
      
      console.log('✅ Contract match email test completed');
    } catch (error) {
      console.error('❌ Error testing contract match email:', error);
    }
  }

  /**
   * Test sending a deadline reminder email
   */
  static async testDeadlineReminderEmail(): Promise<void> {
    try {
      console.log('🧪 Testing deadline reminder email...');
      
      const mockContract = {
        id: 'test-contract-456',
        title: 'Construction of Health Center',
        category: 'Works',
        procuring_entity: 'Kampala Capital City Authority',
        estimated_value_min: 50000000,
        estimated_value_max: 100000000,
        submission_deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days from now
      };

      const testEmail = 'test@example.com';
      const daysRemaining = 2;
      
      const emailData = EmailService.generateDeadlineReminderEmail(mockContract, testEmail, daysRemaining);
      
      console.log('Generated email data:', {
        to: emailData.to,
        subject: emailData.subject,
        htmlLength: emailData.html.length,
        textLength: emailData.text.length
      });

      // Uncomment the line below to actually send the email
      // const success = await EmailService.sendEmail(emailData);
      // console.log('Email sent successfully:', success);
      
      console.log('✅ Deadline reminder email test completed');
    } catch (error) {
      console.error('❌ Error testing deadline reminder email:', error);
    }
  }

  /**
   * Test creating a notification with email
   */
  static async testCreateNotificationWithEmail(): Promise<void> {
    try {
      console.log('🧪 Testing notification creation with email...');
      
      const testUserId = 'test-user-123';
      const testContract = {
        id: 'test-contract-789',
        title: 'IT Services Contract',
        category: 'Services',
        procuring_entity: 'Uganda Revenue Authority',
        estimated_value_min: 20000000,
        estimated_value_max: 50000000,
        submission_deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days from now
      };

      const notificationData = {
        contract_id: testContract.id,
        contract_title: testContract.title,
        contract_category: testContract.category,
        procuring_entity: testContract.procuring_entity,
        estimated_value_min: testContract.estimated_value_min,
        estimated_value_max: testContract.estimated_value_max,
        submission_deadline: testContract.submission_deadline,
        contract_url: `/dashboard/contracts/${testContract.id}`,
        user_email: 'test@example.com',
        contract: testContract
      };

      // Create notification
      const notificationId = await NotificationService.createNotification(
        testUserId,
        'new_contract_match',
        `New Contract Match: ${testContract.title}`,
        `A new contract matching your preferences has been published: ${testContract.title}`,
        notificationData,
        'email',
        'medium'
      );

      if (notificationId) {
        console.log('✅ Notification created successfully:', notificationId);
        
        // Process the notification (this would normally be done by a cron job)
        // await NotificationProcessor.processPendingNotifications();
        
        console.log('✅ Notification processing test completed');
      } else {
        console.error('❌ Failed to create notification');
      }
    } catch (error) {
      console.error('❌ Error testing notification creation:', error);
    }
  }

  /**
   * Run all email tests
   */
  static async runAllTests(): Promise<void> {
    console.log('🚀 Starting email notification system tests...\n');
    
    await this.testContractMatchEmail();
    console.log('');
    
    await this.testDeadlineReminderEmail();
    console.log('');
    
    await this.testCreateNotificationWithEmail();
    console.log('');
    
    console.log('🎉 All email notification tests completed!');
  }
}
