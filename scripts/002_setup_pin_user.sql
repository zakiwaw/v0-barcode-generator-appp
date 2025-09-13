-- Create a specific user for PIN authentication
-- First, create the user in auth.users if it doesn't exist
-- This will be handled by the application code since we can't directly insert into auth.users

-- Update the profiles table to store PIN hash
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Insert or update the profile for our PIN user
INSERT INTO profiles (id, pin_hash, email, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  '$2a$10$N9qo8uLOickgx2ZMRZoMye.Ik.KzAWR6.6wjbdmxnI4F8.05B/QC.',  -- bcrypt hash of "0000"
  'pin@barcode.app',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  pin_hash = EXCLUDED.pin_hash,
  email = EXCLUDED.email;
