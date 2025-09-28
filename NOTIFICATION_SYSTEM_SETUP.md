# 🎯 Complete Notification System Setup Guide

## 📋 **What You're Getting**

### **1. Immediate Notifications (Real-time)**
- **When**: New contract published that matches user preferences
- **Who**: Users with matching industry/location/contract type preferences
- **Content**: Single contract with full details and "View Contract" button
- **Style**: Professional email with blue header

### **2. Daily Digest Emails (James Edition Style)**
- **When**: Every day at 8:00 AM East African Time
- **Who**: All users with email addresses
- **Content**: Multiple opportunities in beautiful grid layout
- **Style**: "Just For You" header like James Edition

## 🗄️ **Database Integration**

### **Current Database Structure**
Your existing database has:
- ✅ `profiles` table (user data)
- ✅ `contracts` table (contract data)
- ✅ `bid_tracking` table (user tracking preferences)
- ❌ Missing: `notifications` table
- ❌ Missing: `user_notification_preferences` table
- ❌ Missing: Notification preference columns in `profiles`

### **What We're Adding**
1. **`notifications` table** - Stores all notifications
2. **`user_notification_preferences` table** - User notification settings
3. **New columns in `profiles`** - Industry preferences and notification settings
4. **RLS policies** - Security for notification data
5. **Database functions** - Automated notification processing

## 🚀 **Setup Steps**

### **Step 1: Run Database Migration**
```sql
-- Copy and paste this into your Supabase SQL Editor:
-- (The content from src/lib/migrations/simple-notification-setup.sql)
```

### **Step 2: Update Environment Variables**
```bash
# Add to your .env.local:
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Step 3: Test the System**
```bash
# Test daily digest
curl -X GET "http://localhost:3000/api/daily-digest/process"

# Test immediate notifications
curl -X GET "http://localhost:3000/api/notifications/process"
```

## 📧 **Email Templates**

### **Daily Digest (James Edition Style)**
- **Header**: "BidFlow" + "Just For You"
- **Subtitle**: "We've found more exceptional opportunities that match your interests"
- **Grid Layout**: 2x2 contract cards with images, prices, deadlines
- **Match Scoring**: 5-star relevance system
- **Call-to-Action**: "EXPLORE MORE →" button

### **Immediate Notifications**
- **Header**: "🎯 New Contract Match!"
- **Content**: Single contract with full details
- **Action**: "View Full Contract Details" button
- **Footer**: Preference management links

## ⚙️ **How It Works**

### **User Onboarding Flow**
1. **User registers** → Profile created in `profiles` table
2. **User sets preferences** → Industry/location/contract type preferences stored
3. **System ready** → Notifications will be sent based on preferences

### **New Contract Published**
1. **Contract added** → New contract in `contracts` table
2. **System checks** → All user preferences for matches
3. **Immediate emails** → Sent to users with matching preferences
4. **Daily digest** → Includes all new opportunities

### **Daily Schedule**
- **8:00 AM EAT**: Daily digest with personalized opportunities
- **9:00 AM EAT**: Deadline reminders for tracked contracts
- **Every 6 hours**: Process new contracts for immediate notifications

## 🎨 **Personalization Features**

### **Smart Matching**
- **Industry Preferences**: Matches user's selected industries
- **Location Preferences**: Matches user's preferred locations
- **Contract Types**: Matches user's preferred contract categories
- **Match Scoring**: 1-5 star relevance rating

### **Email Content**
- **Personalized greeting**: "Just For You"
- **Relevant opportunities**: Only contracts matching preferences
- **Match indicators**: Visual scoring system
- **Direct actions**: "View Details" and "Track" buttons

## 🔧 **API Endpoints**

### **Daily Digest**
- `GET /api/daily-digest/process` - Process and send daily digest
- `GET /api/daily-digest/debug` - Debug daily digest service

### **Notifications**
- `GET /api/notifications/process` - Process pending notifications
- `POST /api/notifications/mark-read` - Mark notification as read

### **Contract Matching**
- `GET /api/contracts/match` - Process new contract matches

## 📊 **Database Tables**

### **`notifications` Table**
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users)
- type (VARCHAR: 'new_contract_match', 'deadline_reminder', 'daily_digest')
- title (VARCHAR)
- message (TEXT)
- data (JSONB)
- notification_status (VARCHAR: 'pending', 'sent', 'failed', 'read')
- channel (VARCHAR: 'email', 'in_app', 'whatsapp')
- priority (VARCHAR: 'low', 'medium', 'high', 'urgent')
- scheduled_at (TIMESTAMP)
- sent_at (TIMESTAMP)
- read_at (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### **`user_notification_preferences` Table**
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users)
- new_contract_notifications (BOOLEAN)
- deadline_reminders (BOOLEAN)
- daily_digest_enabled (BOOLEAN)
- email_enabled (BOOLEAN)
- in_app_enabled (BOOLEAN)
- whatsapp_enabled (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### **New Columns in `profiles` Table**
```sql
- industry_preferences (TEXT[])
- location_preferences (TEXT[])
- contract_type_preferences (TEXT[])
- daily_digest_enabled (BOOLEAN)
- email_notifications (BOOLEAN)
- whatsapp_notifications (BOOLEAN)
- notification_frequency (TEXT)
```

## 🎯 **Next Steps**

1. **Run the SQL migration** in your Supabase SQL Editor
2. **Set up environment variables** for Resend API
3. **Test the endpoints** to ensure everything works
4. **Deploy to production** and configure cron jobs
5. **Monitor the system** for any issues

## 🚨 **Important Notes**

- **Daily digest is MANDATORY** for all users (cannot be disabled)
- **Industry preferences** are the primary matching criteria
- **Email templates** use black, white, and signature blue colors
- **No contract values** are shown in emails (as requested)
- **"Track" buttons** instead of "Submit Bid Now" buttons

The system is now ready to provide personalized notifications exactly like James Edition! 🎉
