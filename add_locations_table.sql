-- Add Locations Table for Dynamic Location Management
-- Run this in your Supabase SQL Editor

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  region TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on locations
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- RLS policies for locations (public read access)
CREATE POLICY "Anyone can view active locations" ON locations
  FOR SELECT USING (is_active = true);

-- Insert default locations
INSERT INTO locations (name, region, sort_order) VALUES
  ('Kampala', 'Central', 1),
  ('Jinja', 'Eastern', 2),
  ('Gulu', 'Northern', 3),
  ('Mbarara', 'Western', 4),
  ('Entebbe', 'Central', 5),
  ('Arua', 'Northern', 6),
  ('Lira', 'Northern', 7),
  ('Mbale', 'Eastern', 8),
  ('Soroti', 'Eastern', 9),
  ('Tororo', 'Eastern', 10),
  ('Kasese', 'Western', 11),
  ('Kabale', 'Western', 12),
  ('Fort Portal', 'Western', 13),
  ('Hoima', 'Western', 14),
  ('Masaka', 'Central', 15),
  ('Mukono', 'Central', 16),
  ('Wakiso', 'Central', 17),
  ('Multiple Locations', 'All', 98),
  ('Any Location', 'All', 99)
ON CONFLICT (name) DO NOTHING;

-- Create function to get active locations
CREATE OR REPLACE FUNCTION get_active_locations()
RETURNS TABLE(name TEXT, region TEXT, sort_order INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT l.name, l.region, l.sort_order
  FROM locations l
  WHERE l.is_active = true
  ORDER BY l.sort_order, l.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
