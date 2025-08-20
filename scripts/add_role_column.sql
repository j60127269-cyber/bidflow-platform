-- Add role column to profiles table if it doesn't exist
-- This script should be run in your Supabase SQL editor

-- First, check if the role column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'role'
    ) THEN
        -- Add the role column
        ALTER TABLE profiles 
        ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin'));
        
        -- Add an index for better performance
        CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
        
        RAISE NOTICE 'Role column added to profiles table';
    ELSE
        RAISE NOTICE 'Role column already exists in profiles table';
    END IF;
END $$;

-- Update existing profiles to have 'user' role if they don't have one
UPDATE profiles 
SET role = 'user' 
WHERE role IS NULL;

-- Create a function to add role column if it doesn't exist (for API use)
CREATE OR REPLACE FUNCTION add_role_column_if_not_exists()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE profiles 
        ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin'));
        
        CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
    END IF;
END $$;
