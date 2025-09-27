# Daily Digest Email System Setup Guide

## 🎯 What You Need to Add/Configure

### 1. Database Migration (Required)
Run this SQL in your Supabase SQL editor:

```sql
-- Add daily_digest_enabled field to user_notification_preferences table (MANDATORY)
ALTER TABLE user_notification_preferences 
ADD COLUMN IF NOT EXISTS daily_digest_enabled BOOLEAN NOT NULL DEFAULT true;

-- Update existing users to have daily digest enabled (MANDATORY for all)
UPDATE user_notification_preferences 
SET daily_digest_enabled = true 
WHERE daily_digest_enabled IS NULL OR daily_digest_enabled = false;

-- Ensure all users have daily digest enabled (MANDATORY)
UPDATE user_notification_preferences 
SET daily_digest_enabled = true;

-- Add constraint to ensure it's always true (MANDATORY)
ALTER TABLE user_notification_preferences 
ADD CONSTRAINT daily_digest_mandatory 
CHECK (daily_digest_enabled = true);
```

### 2. Email Service Provider Configuration (Already Set Up!)
Your Resend configuration is already set up! The system is configured to use Resend with your existing API key.

**Current Configuration:**
```typescript
export const emailConfig = {
  provider: 'resend', // Using Resend for email sending
  apiKey: process.env.RESEND_API_KEY, // Your existing Resend API key
  fromEmail: process.env.FROM_EMAIL || 'notifications@bidflow.com',
  fromName: process.env.FROM_NAME || 'BidFlow Notifications'
};
```

### 3. Environment Variables (Already Set Up!)
Your environment variables are already configured! The system will use your existing Resend API key.

**Your Current Setup:**
```bash
# Email Configuration (Already configured)
RESEND_API_KEY=re_1234567890abcdef  # Your existing Resend API key
FROM_EMAIL=notifications@bidflow.com
FROM_NAME=BidFlow Notifications

# App URL (Add this if not already set)
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Supabase Configuration (Already set)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. User Preferences UI (Optional - Daily Digest is Mandatory)
Since daily digest is mandatory for all users, you can either:

**Option A: Hide the toggle (Recommended)**
```tsx
// Don't show daily digest toggle since it's mandatory
const [preferences, setPreferences] = useState({
  new_contract_notifications: true,
  deadline_reminders: true,
  // daily_digest_enabled: true, // MANDATORY - Don't show in UI
  email_enabled: true,
  in_app_enabled: true,
  whatsapp_enabled: false
});
```

**Option B: Show as disabled (Informational)**
```tsx
// Show as disabled since it's mandatory
<div className="form-group">
  <label>
    <input 
      type="checkbox" 
      checked={true} // Always true - mandatory
      disabled={true} // Cannot be changed
    />
    Daily Digest Emails (Required)
  </label>
  <p>All users receive daily emails with matched opportunities</p>
</div>
```

## 🚀 Deployment Checklist

### ✅ Files Already Created:
- ✅ `src/lib/daily-digest-service.ts` - Daily digest processing
- ✅ `src/lib/email-service.ts` - Email templates and sending
- ✅ `src/app/api/daily-digest/process/route.ts` - API endpoint
- ✅ `src/app/api/contracts/match/route.ts` - Contract matching endpoint
- ✅ `vercel.json` - Cron job configuration
- ✅ `src/lib/cron-jobs.ts` - Cron job documentation

### ✅ Database Schema:
- ✅ `notifications` table
- ✅ `user_notification_preferences` table
- ✅ All necessary indexes and constraints

### ✅ Email Templates:
- ✅ Daily digest email template
- ✅ Contract match email template
- ✅ Deadline reminder email template
- ✅ Email preview file (`email-preview.html`)

## 🎯 What Happens After Setup

### Daily Schedule (East African Time):
- **8:00 AM EAT**: Daily digest emails sent to all users with `daily_digest_enabled = true`
- **9:00 AM EAT**: Deadline reminder emails sent
- **Every 6 hours**: Contract matching processes new contracts

### Email Content:
- **Daily Digest**: Top 3-10 matched opportunities per user
- **Contract Match**: Immediate notification for new matching contracts
- **Deadline Reminder**: Contracts due within 3 days

### User Experience:
- Users receive personalized opportunities based on their preferences
- Match scoring shows relevance (1-5 stars)
- Direct links to view contract details and track contracts
- Professional, mobile-friendly email design

## 🔧 Testing the System

### 1. Test Daily Digest:
```bash
curl -X GET https://yourdomain.com/api/daily-digest/process
```

### 2. Test Contract Matching:
```bash
curl -X GET https://yourdomain.com/api/contracts/match
```

### 3. Test Notifications:
```bash
curl -X GET https://yourdomain.com/api/notifications/process
```

### 4. View Email Previews:
Open `email-preview.html` in your browser to see how emails will look.

## 📊 Monitoring

### Check Cron Jobs in Vercel:
1. Go to your Vercel dashboard
2. Navigate to Functions tab
3. Check Cron Jobs section
4. Verify all 3 cron jobs are scheduled

### Monitor Email Delivery:
- Check your email service provider dashboard
- Monitor bounce rates and delivery statistics
- Check user engagement with email links

## 🎉 You're All Set!

Once you complete the database migration and email service configuration, your daily digest system will automatically:

1. **Send daily emails** at 8:00 AM East African Time
2. **Match opportunities** based on user preferences
3. **Track engagement** and provide analytics
4. **Scale automatically** as your user base grows

The system is designed to be robust, scalable, and user-friendly! 🚀
