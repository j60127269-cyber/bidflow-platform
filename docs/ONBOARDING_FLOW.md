# Onboarding Flow Implementation

## Overview

The onboarding flow ensures that new users complete a one-time setup process before accessing the main application. Once completed, users are automatically redirected to the dashboard on subsequent sign-ins.

## Key Components

### 1. OnboardingService (`src/lib/onboardingService.ts`)

Central service for managing onboarding status:

- `hasCompletedOnboarding(userId)`: Checks if user has completed onboarding
- `markOnboardingCompleted(userId)`: Marks onboarding as completed
- `getUserOnboardingStatus(userId)`: Gets detailed onboarding status

### 2. Database Schema

The `profiles` table includes:
- `onboarding_completed`: Boolean flag indicating completion
- `preferred_categories`: Array of selected industries
- `business_type`: User's business type
- `min_contract_value`: Minimum contract value preference

### 3. Middleware (`src/middleware.ts`)

Handles routing logic:
- Redirects unauthenticated users to login
- Redirects users without completed onboarding to onboarding flow
- Redirects users with completed onboarding away from onboarding routes

## Onboarding Flow Steps

1. **Welcome** (`/onboarding/welcome`)
   - Introduction and overview
   - Checks if user already completed onboarding

2. **Preferences** (`/onboarding/preferences`)
   - Industry selection
   - Business type selection
   - Contract value range selection

3. **Notifications** (`/onboarding/notifications`)
   - Email notification preferences
   - WhatsApp notification setup
   - Frequency selection

4. **Subscription** (`/onboarding/subscription`)
   - Plan selection
   - Payment setup
   - Option to skip (free tier)

## Completion Logic

Onboarding is considered complete when:
1. User has `onboarding_completed = true` in their profile, OR
2. User has filled all required fields (`preferred_categories`, `business_type`, `min_contract_value`)

## User Journey

### New User (First Time)
1. Signs up → Email verification
2. Redirected to `/onboarding/welcome`
3. Completes all onboarding steps
4. Marked as `onboarding_completed = true`
5. Redirected to dashboard

### Returning User (Completed Onboarding)
1. Signs in
2. Middleware checks `onboarding_completed` status
3. Automatically redirected to dashboard
4. No onboarding flow shown

### Returning User (Incomplete Onboarding)
1. Signs in
2. Middleware detects incomplete onboarding
3. Redirected to `/onboarding/welcome`
4. Must complete remaining steps

## Implementation Details

### Authentication Callback
- `src/app/auth/callback/page.tsx` uses `OnboardingService` to check status
- Routes user appropriately based on completion status

### Login Flow
- `src/app/login/page.tsx` checks onboarding status after successful login
- Redirects to appropriate destination

### Dashboard Protection
- `src/app/dashboard/profile/page.tsx` verifies onboarding completion
- Redirects to onboarding if incomplete

## Database Migration

Run the migration script to add the `onboarding_completed` column:

```sql
-- See scripts/migrate-onboarding-status.sql
```

## Testing

To test the onboarding flow:

1. **New User Test**:
   - Create a new account
   - Verify email
   - Should be redirected to onboarding
   - Complete all steps
   - Should be redirected to dashboard

2. **Returning User Test**:
   - Sign in with completed user
   - Should go directly to dashboard
   - Should not see onboarding flow

3. **Incomplete User Test**:
   - Sign in with user who started but didn't complete onboarding
   - Should be redirected to onboarding to complete remaining steps

## Troubleshooting

### Common Issues

1. **User stuck in onboarding loop**:
   - Check if `onboarding_completed` is properly set
   - Verify all required fields are filled

2. **User not redirected to dashboard**:
   - Check middleware configuration
   - Verify authentication state

3. **Legacy users not working**:
   - Run migration script to set `onboarding_completed` for existing users
   - Check if required fields are present

### Debug Logs

Enable debug logging in `OnboardingService` to track onboarding status checks:

```typescript
console.log('Onboarding status check:', { userId, hasCompleted });
```
