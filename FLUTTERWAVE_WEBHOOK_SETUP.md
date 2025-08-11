# Flutterwave Webhook Setup Guide

## 🔧 **Step 1: Add Webhook Secret to Environment**

Add this to your `.env.local` file:

```bash
# Flutterwave Webhook Secret (for webhook verification)
FLUTTERWAVE_WEBHOOK_SECRET=your_webhook_secret_here
```

## 🔧 **Step 2: Configure Webhook in Flutterwave Dashboard**

### **For Development (Local Testing):**
1. **Go to Flutterwave Dashboard** → Settings → Webhooks
2. **Add Webhook URL:**
   ```
   https://your-ngrok-url.ngrok.io/api/webhooks/flutterwave
   ```
   *(Use ngrok or similar to expose your local server)*

### **For Production (Vercel):**
1. **Go to Flutterwave Dashboard** → Settings → Webhooks
2. **Add Webhook URL:**
   ```
   https://your-app-name.vercel.app/api/webhooks/flutterwave
   ```
   *(Replace with your actual Vercel domain)*

### **Webhook Configuration:**
3. **Select Events:**
   - ✅ `charge.completed`
   - ✅ `charge.failed`
   - ✅ `transfer.completed`
4. **Copy the webhook secret hash** (shown in Flutterwave dashboard)
5. **Add the secret hash to your `.env.local`:**
   ```bash
   FLUTTERWAVE_WEBHOOK_SECRET=FLWSECK_TEST_xxxxxxxxxxxxxxxxxxxxx
   ```

## 🔧 **Step 3: Webhook Secret Hash Details**

### **What is the Secret Hash?**
- **Location:** Flutterwave Dashboard → Settings → Webhooks
- **Format:** `FLWSECK_TEST_xxxxxxxxxxxxxxxxxxxxx` (test) or `FLWSECK_xxxxxxxxxxxxxxxxxxxxx` (live)
- **Purpose:** Verifies webhooks are actually from Flutterwave
- **Security:** Never share this publicly

### **How to Get Your Secret Hash:**
1. **Login to Flutterwave Dashboard**
2. **Go to Settings → Webhooks**
3. **Click "Add Webhook"**
4. **Copy the "Secret Hash" shown in the webhook configuration**
5. **Add it to your `.env.local` file**

## 🔧 **Step 4: Test Webhook**

The webhook will automatically:
- ✅ **Update payment status** in database
- ✅ **Create/extend subscriptions** for successful payments
- ✅ **Update user profile** subscription status
- ✅ **Handle failed payments**

## 🔧 **Step 5: Webhook Features**

### **Payment Success:**
- Creates new subscription or extends existing one
- Updates user's subscription status to 'active'
- Records payment in billing history

### **Payment Failure:**
- Updates payment status to 'failed'
- Logs error for debugging

### **Security:**
- Webhook signature verification
- Error handling and logging
- Database transaction safety

## 🚨 **Important Notes:**

1. **Webhook URL must be publicly accessible** (for production)
2. **Use HTTPS** for webhook URLs
3. **Test webhooks** in development environment first
4. **Monitor webhook logs** for any issues
5. **Keep your secret hash secure** - never commit it to version control

## 🧪 **Testing:**

1. **Make a test payment** through your app
2. **Check webhook logs** in Flutterwave dashboard
3. **Verify database updates** in Supabase
4. **Confirm subscription status** in your app

## 📋 **Example Webhook Configuration:**

```
Webhook URL: https://bidflow-app.vercel.app/api/webhooks/flutterwave
Events: charge.completed, charge.failed, transfer.completed
Secret Hash: FLWSECK_TEST_xxxxxxxxxxxxxxxxxxxxx
```

The webhook system is now fully configured and ready to handle payment status updates automatically! 🚀
