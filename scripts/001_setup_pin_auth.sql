-- Create a fixed user for PIN authentication
-- This user will be used for all PIN-based logins

-- First, let's create a profiles table to store user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pin_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Allow authenticated users to view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Allow authenticated users to update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Update the existing barcodes table to ensure it has proper RLS
ALTER TABLE public.barcodes ENABLE ROW LEVEL SECURITY;

-- Create policies for barcodes
CREATE POLICY "Allow authenticated users to view their own barcodes" 
ON public.barcodes FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to insert their own barcodes" 
ON public.barcodes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to delete their own barcodes" 
ON public.barcodes FOR DELETE 
USING (auth.uid() = user_id);

-- Insert a default user with PIN 0000 (hashed)
-- Note: In production, you would hash the PIN properly
-- For this demo, we'll use a simple approach
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'pin@barcode.app',
  crypt('0000', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"pin_user": true}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Insert corresponding profile
INSERT INTO public.profiles (id, pin_hash) 
VALUES (
  '00000000-0000-0000-0000-000000000001',
  crypt('0000', gen_salt('bf'))
) ON CONFLICT (id) DO NOTHING;
