# Environment Setup Guide

## Step 1: Create .env.local file

Create a file called `.env.local` in your project root with the following content:

```env
# Supabase (you'll need to add your actual values)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Resend (Email Service) - Your API key
RESEND_API_KEY=re_b8tKpJxy_68ZgMiK7Pw4QE8LKv96HRNQW

# Twilio (WhatsApp Service) - Add when you get them
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token

# App URL (for notification links)
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## Step 2: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Go to Settings > API
3. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

## Step 3: Test the Notifications

1. Visit: http://localhost:3001/test-notifications
2. Click the test buttons to verify everything is working

## Step 4: Optional - Get Twilio for WhatsApp

1. Sign up at https://twilio.com
2. Get your Account SID and Auth Token
3. Add them to `.env.local`

## Current Status

✅ **Resend API Key**: `re_b8tKpJxy_68ZgMiK7Pw4QE8LKv96HRNQW` (Ready to use)

❌ **Supabase Credentials**: Need to be added

❌ **Twilio Credentials**: Optional for WhatsApp

## Next Steps

1. Create the `.env.local` file with your Resend API key
2. Add your Supabase credentials
3. Restart your development server
4. Test the notifications at `/test-notifications`
