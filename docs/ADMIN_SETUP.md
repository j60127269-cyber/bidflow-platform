# Admin Setup Guide for BidCloud

This guide will help you set up admin-only access to your BidCloud platform's admin section.

## Overview

The admin system includes:
- **Role-based access control** with three levels: `user`, `admin`, `super_admin`
- **AdminGuard component** that protects all admin routes
- **Admin login page** at `/admin/login`
- **Admin setup page** at `/admin-setup` for initial configuration

## Setup Steps

### 1. Database Setup

First, run the SQL script to add the role column to your profiles table:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the contents of `scripts/add_role_column.sql`

This will:
- Add a `role` column to the `profiles` table
- Set default role as `user`
- Add constraints to only allow valid roles
- Create an index for better performance

### 2. Set Up Your First Admin User

1. **Register a regular user account** through the normal registration process
2. **Navigate to the admin setup page**: `http://your-domain.com/admin-setup`
3. **Enter the email** of the user you want to make admin
4. **Select the role**:
   - `admin`: Standard admin privileges
   - `super_admin`: Additional privileges (future use)
5. **Click "Grant Admin Privileges"**

### 3. Access the Admin Panel

1. **Go to the admin login page**: `http://your-domain.com/admin/login`
2. **Sign in** with your admin credentials
3. **You'll be redirected** to the admin dashboard

## Security Features

### AdminGuard Component
- **Protects all admin routes** under `/admin/*`
- **Checks user authentication** and admin role
- **Redirects unauthorized users** to login with proper error messages
- **Shows access denied page** for non-admin users

### Role Hierarchy
- `user`: Regular platform users (default)
- `admin`: Can access admin panel and manage platform
- `super_admin`: Highest privileges (for future features)

### Access Control
- **Admin routes are protected** by the AdminGuard component
- **Role checking** happens on every admin page load
- **Automatic redirects** to login for unauthenticated users
- **Clear error messages** for unauthorized access attempts

## Admin Features

Once you have admin access, you can:

### Dashboard (`/admin`)
- View platform statistics
- Monitor user activity
- Quick access to admin functions

### Contracts (`/admin/contracts`)
- Add new contracts manually
- Bulk import contracts via CSV
- Edit existing contracts
- View all contracts in the system

### Users (`/admin/users`)
- View all user profiles
- Monitor user activity
- Check subscription status

### Roles (`/admin/roles`)
- Assign admin roles to users
- Manage user permissions
- View role assignments

### Analytics (`/admin/analytics`)
- Platform usage statistics
- User engagement metrics
- Revenue analytics

## Security Best Practices

### 1. Remove Setup Page
After setting up your admin user, **remove or protect** the `/admin-setup` page:

```bash
# Option 1: Delete the file
rm src/app/admin-setup/page.tsx

# Option 2: Add environment variable protection
# Add to your .env.local:
NEXT_PUBLIC_ENABLE_ADMIN_SETUP=false
```

### 2. Use Strong Passwords
Ensure admin accounts use strong, unique passwords.

### 3. Regular Security Audits
- Monitor admin access logs
- Regularly review admin user list
- Update admin passwords periodically

### 4. Environment Variables
Make sure your Supabase service role key is properly configured:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Troubleshooting

### "Access Denied" Error
- Ensure the user has been granted admin role
- Check that the role column exists in the database
- Verify the user's profile exists

### "User not found" Error
- Make sure the user has registered and verified their email
- Check that the email address is correct
- Ensure the user has a profile in the database

### Database Errors
- Run the SQL script in Supabase SQL Editor
- Check that the `profiles` table exists
- Verify the role column was added successfully

## API Endpoints

### Admin Setup
- `POST /api/admin/setup-first-admin`: Grant admin privileges to a user

### Role Management
- `POST /api/admin/assign-role`: Assign roles to users
- `POST /api/admin/setup-role-field`: Add role column to database

## File Structure

```
src/
├── components/
│   └── AdminGuard.tsx          # Admin route protection
├── app/
│   ├── admin/
│   │   ├── layout.tsx          # Admin layout with protection
│   │   ├── login/
│   │   │   └── page.tsx        # Admin login page
│   │   └── ...                 # Other admin pages
│   └── admin-setup/
│       └── page.tsx            # Initial admin setup
└── types/
    └── database.ts             # Updated with role field
```

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify your Supabase configuration
3. Ensure all environment variables are set
4. Check the database schema matches the expected structure
