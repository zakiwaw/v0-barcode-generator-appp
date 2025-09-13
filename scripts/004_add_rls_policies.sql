-- Adding RLS policies for profiles table to allow insert and select operations
-- Enable RLS on profiles table (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to insert new profiles (for PIN registration)
CREATE POLICY "Allow profile creation" ON profiles
  FOR INSERT
  WITH CHECK (true);

-- Policy to allow anyone to select profiles (for PIN authentication)
CREATE POLICY "Allow profile reading" ON profiles
  FOR SELECT
  USING (true);

-- Policy to allow profile updates (in case needed later)
CREATE POLICY "Allow profile updates" ON profiles
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
