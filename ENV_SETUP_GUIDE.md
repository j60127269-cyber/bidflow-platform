# Environment Variables Setup Guide

## Required Environment Variables

Add these to your `.env.local` file for email and WhatsApp notifications:

```env
# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Resend (Email Service)
RESEND_API_KEY=re_1234567890abcdef

# Twilio (WhatsApp Service)
TWILIO_ACCOUNT_SID=AC1234567890abcdef
TWILIO_AUTH_TOKEN=1234567890abcdef

# App URL (for notification links)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Setup Instructions

### 1. Resend (Email) Setup

1. **Sign up**: Go to https://resend.com
2. **Create account**: Use your email
3. **Get API key**: 
   - Go to API Keys section
   - Click "Create API Key"
   - Copy the key (starts with `re_`)
4. **Add to .env.local**:
   ```env
   RESEND_API_KEY=re_your_actual_api_key_here
   ```

### 2. Twilio (WhatsApp) Setup

1. **Sign up**: Go to https://twilio.com
2. **Create account**: Use your email
3. **Get credentials**:
   - Go to Console Dashboard
   - Copy Account SID (starts with `AC`)
   - Copy Auth Token
4. **Add to .env.local**:
   ```env
   TWILIO_ACCOUNT_SID=AC_your_actual_account_sid
   TWILIO_AUTH_TOKEN=your_actual_auth_token
   ```

### 3. App URL Setup

For production, set your actual domain:
```env
NEXT_PUBLIC_APP_URL=https://bidflow.ug
```

For development, use localhost:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Testing the Setup

### Test Email Notifications

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Test via API route**:
   ```bash
   curl -X POST http://localhost:3000/api/notifications/send-email \
     -H "Content-Type: application/json" \
     -d '{
       "userId": "your-user-id",
       "subject": "Test Email",
       "html": "<h1>Test Email</h1><p>This is a test email from BidFlow!</p>"
     }'
   ```

3. **Test in browser console**:
   ```javascript
   fetch('/api/notifications/send-email', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       userId: 'your-user-id',
       subject: 'Test Email',
       html: '<h1>Test Email</h1><p>This is a test email from BidFlow!</p>'
     })
   });
   ```

### Test WhatsApp Notifications

1. **Test via API route**:
   ```bash
   curl -X POST http://localhost:3000/api/notifications/send-whatsapp \
     -H "Content-Type: application/json" \
     -d '{
       "userId": "your-user-id",
       "message": "🚨 Test WhatsApp message from BidFlow!"
     }'
   ```

2. **Test in browser console**:
   ```javascript
   fetch('/api/notifications/send-whatsapp', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       userId: 'your-user-id',
       message: '🚨 Test WhatsApp message from BidFlow!'
     })
   });
   ```

### Test Deadline Reminders

1. **Test via API route**:
   ```bash
   curl -X POST http://localhost:3000/api/notifications/send-deadline-reminders
   ```

2. **Test in browser console**:
   ```javascript
   fetch('/api/notifications/send-deadline-reminders', {
     method: 'POST'
   });
   ```

## API Routes Created

### 1. `/api/notifications/send-email`
- **Method**: POST
- **Body**: `{ userId, subject, html }`
- **Purpose**: Send email notifications

### 2. `/api/notifications/send-whatsapp`
- **Method**: POST
- **Body**: `{ userId, message }`
- **Purpose**: Send WhatsApp notifications

### 3. `/api/notifications/send-deadline-reminders`
- **Method**: POST
- **Purpose**: Send deadline reminders to all tracked bids
- **Use**: Call this via cron job for automated reminders

## Cron Job Setup (Production)

### Vercel Cron Jobs

Add this to your `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/notifications/send-deadline-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

This runs daily at 9 AM to send deadline reminders.

### Manual Testing

You can manually trigger deadline reminders by calling the API endpoint.

## Free Tier Limits

### Resend (Email)
- **Free Tier**: 3,000 emails/month
- **Cost**: $0/month for small to medium usage
- **Upgrade**: When approaching 3,000 emails

### Twilio (WhatsApp)
- **Free Tier**: $15-20 credit for trial
- **Cost**: ~$0.005 per message after trial
- **Upgrade**: When credit runs out

## Troubleshooting

### Email Not Sending
1. Check `RESEND_API_KEY` is correct
2. Verify email address is valid
3. Check Resend dashboard for errors
4. Check API route logs in Vercel

### WhatsApp Not Sending
1. Check `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`
2. Verify phone number format (+256...)
3. Check Twilio console for errors
4. Check API route logs in Vercel

### Environment Variables Not Loading
1. Restart your development server
2. Check `.env.local` file exists
3. Verify variable names are correct
4. For production, check Vercel environment variables

## Production Deployment

### Vercel
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add all the variables above
5. Deploy with cron jobs enabled

### Other Platforms
- Add environment variables in your hosting platform's settings
- Ensure all variables are set correctly
- Set up cron jobs for deadline reminders
- Test notifications after deployment

## Security Notes

1. **Never commit `.env.local`** to version control
2. **Use different API keys** for development and production
3. **Rotate API keys** regularly
4. **Monitor usage** to stay within free limits
5. **API routes are server-side only** - environment variables are secure

## Cost Optimization

1. **Use in-app notifications** for most updates
2. **Email only for critical deadlines** (1 day before)
3. **WhatsApp only for urgent alerts**
4. **Let users choose frequency** in preferences
5. **Monitor API usage** in Resend and Twilio dashboards

## Next Steps

1. **Set up environment variables**
2. **Test notifications** using the API routes
3. **Deploy to production** with Vercel
4. **Set up cron jobs** for automated reminders
5. **Monitor usage** and costs

This setup will give you free email and WhatsApp notifications for your BidFlow platform! 🎉
