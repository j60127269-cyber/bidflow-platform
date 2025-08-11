# 🗄️ Database Setup Guide for Flutterwave Integration

## 🚨 **Current Issue**
You're getting "Subscription plan not found" errors because the database tables and subscription plan haven't been created yet.

## ✅ **Solution: Run the Database Setup**

### **Step 1: Open Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar

### **Step 2: Run the Setup Script**
1. Copy the entire contents of `flutterwave_setup.sql`
2. Paste it into the SQL Editor
3. Click **Run** to execute the script

### **Step 3: Verify Setup**
After running the script, you should see:
- ✅ `subscription_plans` table created
- ✅ `subscriptions` table created  
- ✅ `payments` table created
- ✅ Professional plan inserted (30,000 UGX/month)
- ✅ RLS policies created
- ✅ Database functions created

## 🔍 **What the Script Does**

### **Creates Tables:**
- `subscription_plans` - Available subscription plans
- `subscriptions` - User subscription records
- `payments` - Payment transaction history

### **Adds to Existing Tables:**
- `profiles` - Adds subscription status columns

### **Inserts Data:**
- Professional Plan: 30,000 UGX/month
- Features: Unlimited access, analytics, notifications

### **Creates Security:**
- Row Level Security (RLS) policies
- User-specific data access
- Secure payment records

## 🧪 **Test After Setup**

After running the script:

1. **Refresh your browser** (the subscription page)
2. **Check the console** - errors should be gone
3. **Test the subscription flow** - should work now

## 📋 **Quick SQL Commands to Verify**

Run these in Supabase SQL Editor to verify setup:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('subscription_plans', 'subscriptions', 'payments');

-- Check if Professional plan exists
SELECT * FROM subscription_plans WHERE name = 'Professional';

-- Check RLS policies
SELECT schemaname, tablename, policyname FROM pg_policies 
WHERE tablename IN ('subscription_plans', 'subscriptions', 'payments');
```

## 🚀 **After Setup**

Once the database is set up:
- ✅ Subscription page will load without errors
- ✅ Professional plan will be displayed
- ✅ Payment flow will work
- ✅ User subscription status will be tracked

## 📞 **Need Help?**

If you encounter any issues:
1. Check the Supabase SQL Editor for error messages
2. Verify your Supabase connection settings
3. Make sure you have admin access to your Supabase project

---

**Run the `flutterwave_setup.sql` script and your subscription integration will work perfectly!** 🎉
