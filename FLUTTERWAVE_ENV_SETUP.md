# Flutterwave Environment Variables Setup

## 🚨 **Error: "Failed to fetch" when clicking "Subscribe Now"**

This error occurs because the Flutterwave environment variables are not configured. Follow these steps to fix it:

## 📋 **Step 1: Create `.env.local` file**

Create a new file called `.env.local` in your project root directory and add the following:

```bash
# Supabase Configuration (you should already have these)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Flutterwave Configuration (ADD THESE)
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key_here
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key_here
```

## 🔑 **Step 2: Get Flutterwave API Keys**

### **Option A: Use Test Keys (Recommended for Development)**

For testing, you can use Flutterwave's test keys:

```bash
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-X
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-X
```

### **Option B: Get Real Keys from Flutterwave Dashboard**

1. Go to [Flutterwave Dashboard](https://dashboard.flutterwave.com/)
2. Sign up/Login to your account
3. Navigate to **Settings > API Keys**
4. Copy your **Public Key** and **Secret Key**
5. Replace the test keys with your real keys

## 🔄 **Step 3: Restart Development Server**

After creating the `.env.local` file:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

## ✅ **Step 4: Test the Fix**

1. Go to the subscription page in your onboarding flow
2. Click "Subscribe Now"
3. You should now see the Flutterwave payment page instead of the error

## 🧪 **Test Payment Flow**

For testing, you can use these test card details:

- **Card Number:** 5531886652142950
- **Expiry Date:** 09/32
- **CVV:** 564
- **PIN:** 3310
- **OTP:** 12345

## 🚨 **Important Notes**

1. **Never commit `.env.local` to git** - it's already in `.gitignore`
2. **Use test keys for development** - real keys only for production
3. **Restart server after changing environment variables**
4. **Check browser console** for any remaining errors

## 🔍 **Troubleshooting**

If you still get errors:

1. **Check if `.env.local` exists** in project root
2. **Verify keys are correct** (no extra spaces)
3. **Restart the development server**
4. **Check browser console** for specific error messages
5. **Ensure you're using the correct Flutterwave environment** (test vs live)

## 📞 **Need Help?**

If you're still having issues:

1. Check the browser console for specific error messages
2. Verify your Flutterwave account is active
3. Ensure you're using the correct API keys for your environment
