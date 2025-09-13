-- Disable email confirmation for easier PIN authentication
-- This allows users to sign in immediately without email confirmation

-- Update auth settings to disable email confirmation
-- Note: This would normally be done in Supabase dashboard, but we'll handle it in the app logic
-- by using the emailRedirectTo and data options in signUp

-- Ensure our PIN user profile exists
INSERT INTO profiles (id, pin_hash, email, created_at)
VALUES (
  gen_random_uuid(),
  '$2a$10$N9qo8uLOickgx2ZMRZoMye.Ik.KzAWR6.6wjbdmxnI4F8.05B/QC.',  -- bcrypt hash of "0000"
  'pin@barcode.app',
  NOW()
)
ON CONFLICT (email) DO NOTHING;
