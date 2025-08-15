-- Create Storage Bucket for Bid Attachments
-- Run this in your Supabase SQL Editor

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bid-attachments',
  'bid-attachments',
  true,
  10485760, -- 10MB limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the storage bucket
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'bid-attachments' 
  AND auth.role() = 'authenticated'
);

-- Allow public read access to bid attachments
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (
  bucket_id = 'bid-attachments'
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE USING (
  bucket_id = 'bid-attachments' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own files
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'bid-attachments' 
  AND auth.role() = 'authenticated'
);

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
