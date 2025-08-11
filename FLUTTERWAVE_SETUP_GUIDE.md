# 🚀 Flutterwave Payment Integration Setup Guide

## Overview

This guide will help you set up Flutterwave payment integration for the BidFlow platform. The integration includes:

- ✅ **Database Schema**: Payment and subscription tables
- ✅ **Payment Processing**: Flutterwave API integration
- ✅ **Subscription Management**: User subscription lifecycle
- ✅ **Webhook Handling**: Payment status updates
- ✅ **User Interface**: Payment pages and subscription management

## 📋 Prerequisites

1. **Flutterwave Account**: Sign up at [flutterwave.com](https://flutterwave.com)
2. **Supabase Project**: Already configured
3. **Next.js Application**: Already set up

## 🔧 Step 1: Database Setup

### 1.1 Run Database Schema

Execute the SQL script in your Supabase SQL Editor:

```sql
-- Run the entire flutterwave_setup.sql file
-- This creates all necessary tables and policies
```

**Tables Created:**
- `subscription_plans` - Available subscription plans
- `subscriptions` - User subscription records
- `payments` - Payment transaction records
- Updated `profiles` - Added subscription fields

**Features:**
- ✅ Row Level Security (RLS) policies
- ✅ Automatic subscription status updates
- ✅ Payment tracking and history
- ✅ Professional plan (30,000 UGX/month)

## 🔑 Step 2: Environment Variables

### 2.1 Add Flutterwave Keys

Add these to your `.env.local` file:

```env
# Flutterwave Configuration
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
```

### 2.2 Get Flutterwave Keys

1. **Login to Flutterwave Dashboard**
2. **Go to Settings → API Keys**
3. **Copy your keys:**
   - **Public Key**: Starts with `FLWPUBK_`
   - **Secret Key**: Starts with `FLWSECK_`

### 2.3 Production vs Test Keys

- **Test Mode**: Use test keys for development
- **Live Mode**: Use live keys for production
- **Switch in Flutterwave Dashboard**

## 🌐 Step 3: Webhook Configuration

### 3.1 Set Up Webhook URL

In your Flutterwave Dashboard:

1. **Go to Settings → Webhooks**
2. **Add Webhook URL:**
   ```
   https://your-domain.com/api/webhooks/flutterwave
   ```
3. **Select Events:**
   - ✅ `charge.completed`
   - ✅ `charge.failed`
   - ✅ `transfer.completed`

### 3.2 Webhook Security (Optional)

For production, implement webhook signature verification:

```typescript
// In src/app/api/webhooks/flutterwave/route.ts
function verifyWebhookSignature(payload: any, signature: string | null): boolean {
  // Implement signature verification
  const expectedSignature = crypto
    .createHmac('sha256', process.env.FLUTTERWAVE_SECRET_KEY!)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return signature === expectedSignature;
}
```

## 🧪 Step 4: Testing

### 4.1 Test Payment Flow

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Navigate to Subscription Page:**
   ```
   http://localhost:3000/onboarding/subscription
   ```

3. **Test Payment:**
   - Click "Subscribe Now"
   - Use Flutterwave test cards:
     - **Visa**: `4000 0000 0000 0002`
     - **Mastercard**: `5204 8300 0000 2514`
   - **CVV**: Any 3 digits
   - **Expiry**: Any future date

### 4.2 Test Webhooks

1. **Use ngrok for local testing:**
   ```bash
   npx ngrok http 3000
   ```

2. **Update webhook URL in Flutterwave:**
   ```
   https://your-ngrok-url.ngrok.io/api/webhooks/flutterwave
   ```

3. **Monitor webhook calls:**
   - Check browser console
   - Check ngrok dashboard

## 📱 Step 5: Payment Methods

### 5.1 Supported Payment Methods

The integration supports:

- ✅ **Credit/Debit Cards** (Visa, Mastercard, etc.)
- ✅ **Mobile Money** (MTN, Airtel, etc.)
- ✅ **Bank Transfers**
- ✅ **USSD Payments**

### 5.2 Payment Flow

1. **User clicks "Subscribe"**
2. **Payment record created in database**
3. **Redirect to Flutterwave payment page**
4. **User completes payment**
5. **Webhook updates payment status**
6. **Subscription activated**
7. **User redirected to dashboard**

## 🔄 Step 6: Subscription Management

### 6.1 Subscription Lifecycle

- **Trial Period**: 7 days (configurable)
- **Active Subscription**: Monthly billing
- **Cancellation**: Immediate or end of period
- **Expiration**: Automatic after non-payment

### 6.2 Subscription Features

- ✅ **Unlimited tender alerts**
- ✅ **Advanced search & filtering**
- ✅ **Unlimited saved tenders**
- ✅ **1GB document storage**
- ✅ **Email support**
- ✅ **Real-time notifications**
- ✅ **Bid tracking & analytics**
- ✅ **AI-powered recommendations**

## 🛠️ Step 7: Customization

### 7.1 Modify Pricing

Update the Professional plan in Supabase:

```sql
UPDATE subscription_plans 
SET price = 50000 
WHERE name = 'Professional';
```

### 7.2 Add New Plans

```sql
INSERT INTO subscription_plans (name, description, price, currency, billing_interval, features) 
VALUES (
  'Enterprise',
  'Advanced features for large organizations',
  100000,
  'UGX',
  'month',
  '{"unlimited_tender_alerts": true, "advanced_search_filtering": true, "unlimited_saved_tenders": true, "document_storage_gb": 10, "priority_support": true, "real_time_notifications": true, "bid_tracking": true, "analytics_dashboard": true, "recommendations": true, "api_access": true}'
);
```

### 7.3 Customize Payment UI

Edit `src/app/onboarding/subscription/page.tsx`:
- Change plan features
- Modify pricing display
- Add custom branding

## 🔍 Step 8: Monitoring & Debugging

### 8.1 Payment Status Tracking

Check payment status in Supabase:

```sql
SELECT 
  p.status,
  p.amount,
  p.currency,
  p.flutterwave_transaction_id,
  p.created_at,
  u.email
FROM payments p
JOIN auth.users u ON p.user_id = u.id
ORDER BY p.created_at DESC;
```

### 8.2 Subscription Status

```sql
SELECT 
  s.status,
  s.current_period_end,
  sp.name as plan_name,
  sp.price,
  u.email
FROM subscriptions s
JOIN subscription_plans sp ON s.plan_id = sp.id
JOIN auth.users u ON s.user_id = u.id
WHERE s.status = 'active';
```

### 8.3 Common Issues

**Payment Not Processing:**
- Check Flutterwave keys
- Verify webhook URL
- Check browser console for errors

**Subscription Not Activating:**
- Verify webhook is receiving events
- Check payment status in database
- Ensure user has proper permissions

**Webhook Not Working:**
- Verify webhook URL is accessible
- Check Flutterwave webhook settings
- Monitor server logs

## 🚀 Step 9: Production Deployment

### 9.1 Environment Variables

Add to Vercel/Production:

```env
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_live_...
FLUTTERWAVE_SECRET_KEY=FLWSECK_live_...
```

### 9.2 Webhook URL

Update webhook URL to production domain:

```
https://your-domain.com/api/webhooks/flutterwave
```

### 9.3 SSL Certificate

Ensure your domain has SSL certificate for secure payments.

## 📞 Support

### 9.1 Flutterwave Support

- **Documentation**: [docs.flutterwave.com](https://docs.flutterwave.com)
- **Support**: support@flutterwave.com
- **Status Page**: [status.flutterwave.com](https://status.flutterwave.com)

### 9.2 BidFlow Support

- **Email**: support@bidflow.com
- **Documentation**: Check project README
- **Issues**: GitHub repository

## ✅ Checklist

- [ ] Database schema executed
- [ ] Environment variables set
- [ ] Flutterwave keys configured
- [ ] Webhook URL configured
- [ ] Test payment successful
- [ ] Subscription activation working
- [ ] Production keys ready
- [ ] SSL certificate installed
- [ ] Monitoring set up

## 🎉 Success!

Your BidFlow platform now has full Flutterwave payment integration! Users can:

- ✅ Subscribe to Professional plan
- ✅ Pay via multiple methods
- ✅ Manage subscriptions
- ✅ View billing history
- ✅ Receive payment notifications

**Next Steps:**
1. Test the complete payment flow
2. Monitor webhook events
3. Set up production environment
4. Launch your platform! 🚀
