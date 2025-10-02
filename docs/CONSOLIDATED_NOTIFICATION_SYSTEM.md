# 🚀 Consolidated Notification System

## Overview

The Consolidated Notification System is a unified, reliable notification system for BidCloud that focuses on email notifications with enhanced delivery tracking, retry logic, and error handling.

## 🎯 Key Features

### ✅ **Enhanced Email Delivery**
- **Retry Logic**: Automatic retry with exponential backoff (3 attempts)
- **Delivery Tracking**: Track delivery time, retry count, and error messages
- **Error Handling**: Comprehensive error logging and recovery
- **Template System**: Beautiful, responsive email templates

### ✅ **Smart Notification Management**
- **Quiet Hours**: Respect user's preferred notification times
- **User Preferences**: Granular control over notification types
- **Scheduling**: Automatic scheduling for quiet hours
- **Status Tracking**: Real-time notification status monitoring

### ✅ **Performance Optimizations**
- **Database Views**: Optimized queries for notification statistics
- **Indexes**: Performance indexes for fast queries
- **Cleanup Functions**: Automatic cleanup of old notifications
- **Monitoring**: Real-time delivery statistics

## 🏗️ System Architecture

### Core Components

1. **ConsolidatedNotificationSystem** - Main notification orchestrator
2. **EnhancedEmailService** - Advanced email delivery with retry logic
3. **Database Schema** - Optimized tables with delivery tracking
4. **API Endpoints** - RESTful API for notification operations

### Database Schema

```sql
-- Notifications table with delivery tracking
notifications (
  id, user_id, type, title, message, data,
  notification_status, channel, priority,
  message_id, delivery_time, retry_count, error_message,
  scheduled_at, sent_at, read_at, created_at, updated_at
)

-- User preferences with quiet hours
user_notification_preferences (
  id, user_id, new_contract_notifications, deadline_reminders,
  email_enabled, in_app_enabled, quiet_hours_start, quiet_hours_end
)

-- Delivery tracking logs
notification_logs (
  id, notification_id, old_status, new_status, changed_at
)
```

## 🚀 Usage

### Sending Notifications

```typescript
import { ConsolidatedNotificationSystem } from '@/lib/consolidated-notification-system';

// Send contract match notification
const result = await ConsolidatedNotificationSystem.sendNotification(
  userId,
  'new_contract_match',
  'New Contract Match',
  'A new contract matches your preferences',
  { contract: contractData, user: userData },
  { email: true, in_app: true }
);
```

### Enhanced Email Service

```typescript
import { EnhancedEmailService } from '@/lib/enhanced-email-service';

// Send with retry logic
const result = await EnhancedEmailService.sendContractMatchNotification(
  userEmail,
  contract,
  userPreferences
);

console.log(`Delivery: ${result.success}, Time: ${result.deliveryTime}ms`);
```

### API Endpoints

```bash
# Send notification
POST /api/notifications/consolidated
{
  "action": "send_notification",
  "userId": "user-id",
  "type": "new_contract_match",
  "title": "New Contract Match",
  "message": "A new contract matches your preferences",
  "data": { contract: {...} },
  "channels": { email: true, in_app: true }
}

# Process pending notifications
POST /api/notifications/consolidated
{
  "action": "process_pending"
}

# Get user statistics
GET /api/notifications/consolidated?action=get_user_stats&userId=user-id

# Test email delivery
POST /api/notifications/consolidated
{
  "action": "test_email",
  "data": { email: "test@example.com", contract: {...} }
}
```

## 📊 Monitoring & Analytics

### Delivery Statistics

```sql
-- View delivery statistics
SELECT * FROM notification_delivery_stats 
WHERE date >= CURRENT_DATE - INTERVAL '7 days';

-- User notification summary
SELECT * FROM user_notification_summary 
WHERE user_id = 'user-id';
```

### Maintenance Functions

```sql
-- Clean up old notifications
SELECT cleanup_old_notifications();

-- Retry failed notifications
SELECT retry_failed_notifications();

-- Daily maintenance
SELECT * FROM daily_notification_maintenance();
```

## 🔧 Configuration

### Environment Variables

```bash
# Email configuration
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=notifications@bidcloud.org
FROM_NAME=BidCloud Notifications

# App configuration
NEXT_PUBLIC_APP_URL=https://bidcloud.org
```

### User Preferences

```typescript
interface NotificationPreferences {
  new_contract_notifications: boolean;
  deadline_reminders: boolean;
  email_enabled: boolean;
  in_app_enabled: boolean;
  quiet_hours_start?: string;   // HH:MM format
  quiet_hours_end?: string;     // HH:MM format
}
```

## 📈 Performance Features

### Retry Logic
- **Max Retries**: 3 attempts
- **Retry Delays**: 1s, 3s, 5s (exponential backoff)
- **Error Tracking**: Detailed error messages and retry counts

### Delivery Tracking
- **Message IDs**: Unique identifiers for each email
- **Delivery Time**: Track how long emails take to deliver
- **Success Rate**: Monitor delivery success rates

### Database Optimizations
- **Indexes**: Optimized for common query patterns
- **Views**: Pre-computed statistics for fast reporting
- **Cleanup**: Automatic cleanup of old data

## 🛠️ Maintenance

### Daily Maintenance

```sql
-- Run daily maintenance
SELECT * FROM daily_notification_maintenance();
```

### Manual Cleanup

```sql
-- Clean up old notifications (90+ days)
SELECT cleanup_old_notifications();

-- Retry failed notifications (24 hours old)
SELECT retry_failed_notifications();
```

### Monitoring Queries

```sql
-- Check delivery rates
SELECT 
    notification_status,
    COUNT(*) as count,
    AVG(delivery_time) as avg_delivery_time
FROM notifications 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY notification_status;

-- Check retry rates
SELECT 
    retry_count,
    COUNT(*) as count
FROM notifications 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY retry_count
ORDER BY retry_count;
```

## 🔒 Security Features

### Row Level Security (RLS)
- Users can only access their own notifications
- Admin users can access all notifications
- Secure API endpoints with authentication

### Data Privacy
- No WhatsApp integration (removed for privacy)
- Email-only notifications
- Secure user preference storage

## 🚀 Migration Guide

### Step 1: Run Database Migration
```sql
-- Run the clean notification system migration
-- This removes WhatsApp references and adds delivery tracking
```

### Step 2: Update Code
```typescript
// Replace old notification services with consolidated system
import { ConsolidatedNotificationSystem } from '@/lib/consolidated-notification-system';
```

### Step 3: Test System
```bash
# Test email delivery
curl -X POST "http://localhost:3000/api/notifications/consolidated" \
  -H "Content-Type: application/json" \
  -d '{"action": "test_email", "data": {"email": "test@example.com"}}'
```

## 📋 Troubleshooting

### Common Issues

1. **Email Delivery Failures**
   - Check Resend API key configuration
   - Verify domain authentication
   - Check retry logs for error messages

2. **High Retry Rates**
   - Check email service provider status
   - Verify email templates are valid
   - Check for rate limiting

3. **Performance Issues**
   - Run database maintenance functions
   - Check index usage
   - Monitor query performance

### Debug Queries

```sql
-- Check failed notifications
SELECT * FROM notifications 
WHERE notification_status = 'failed' 
AND created_at >= CURRENT_DATE - INTERVAL '24 hours';

-- Check delivery performance
SELECT 
    AVG(delivery_time) as avg_delivery_time,
    MAX(delivery_time) as max_delivery_time,
    COUNT(*) as total_emails
FROM notifications 
WHERE notification_status = 'sent'
AND created_at >= CURRENT_DATE - INTERVAL '24 hours';
```

## 🎯 Benefits

### For Users
- **Reliable Delivery**: Enhanced retry logic ensures emails are delivered
- **Smart Timing**: Quiet hours respect user preferences
- **Beautiful Templates**: Professional, responsive email designs
- **Granular Control**: Fine-tuned notification preferences

### For Developers
- **Unified API**: Single system for all notification operations
- **Comprehensive Logging**: Detailed delivery tracking and error reporting
- **Performance Optimized**: Fast queries and efficient database operations
- **Easy Maintenance**: Automated cleanup and monitoring functions

### For Business
- **Higher Engagement**: Reliable notifications increase user engagement
- **Better Analytics**: Detailed delivery statistics for optimization
- **Cost Effective**: Email-only system reduces complexity and costs
- **Scalable**: Designed to handle high notification volumes

## 🔮 Future Enhancements

### Planned Features
- **Email Templates**: More template options and customization
- **A/B Testing**: Test different email designs
- **Analytics Dashboard**: Real-time notification analytics
- **Webhook Support**: Integration with external services

### Performance Improvements
- **Caching**: Redis caching for frequently accessed data
- **Queue System**: Background job processing for high volume
- **CDN Integration**: Faster email template delivery
- **Database Sharding**: Horizontal scaling for large datasets

---

**The Consolidated Notification System provides a robust, scalable foundation for all BidCloud notification needs while maintaining simplicity and reliability.**
