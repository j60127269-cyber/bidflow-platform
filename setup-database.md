# Database Setup Guide

## Step 1: Create Environment Variables

Create a `.env.local` file in your project root with the following content:

```env
# Supabase Configuration
# Get these values from your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=https://lclodhtudnxwihvqtbgk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_actual_supabase_service_role_key

# Flutterwave Configuration
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
```

**To get your Supabase credentials:**
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the "Project URL" and "anon public" key
4. Replace the placeholder values in `.env.local`

## Step 2: Run Database Scripts

Once you have your environment variables set up, run these commands:

```bash
# 1. Run the enhanced contract schema script
npx supabase db reset

# 2. Or if you prefer to run the scripts manually:
# Copy the contents of scripts/enhance_contract_schema.sql and run it in your Supabase SQL editor

# 3. Populate sample data
# Copy the contents of scripts/populate_sample_data.sql and run it in your Supabase SQL editor
```

## Step 3: Test the Agency Page

After setting up the database:

1. Restart your development server: `npm run dev`
2. Visit: http://localhost:3003/test-agencies
3. You should see a list of agencies
4. Click "View by Name" to test the agency detail page

## Alternative: Manual Database Setup

If you prefer to set up the database manually:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the contents of `scripts/enhance_contract_schema.sql`
4. Run the contents of `scripts/populate_sample_data.sql`

## Sample Agency URLs to Test

Once set up, you can test these URLs:

- http://localhost:3003/dashboard/agencies/national-information-technology-authority
- http://localhost:3003/dashboard/agencies/ministry-of-health
- http://localhost:3003/dashboard/agencies/uganda-registration-services-bureau
- http://localhost:3003/dashboard/agencies/kampala-capital-city-authority

## Troubleshooting

If you still see "No Agencies Found":

1. Check that your `.env.local` file has the correct Supabase credentials
2. Verify that the database scripts ran successfully
3. Check the browser console for any errors
4. Restart your development server after making changes
