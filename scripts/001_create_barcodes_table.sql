-- Create barcodes table to store generated barcodes
CREATE TABLE IF NOT EXISTS public.barcodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'CODE128',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.barcodes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for CRUD operations
CREATE POLICY "Allow users to view their own barcodes" 
  ON public.barcodes FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own barcodes" 
  ON public.barcodes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own barcodes" 
  ON public.barcodes FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own barcodes" 
  ON public.barcodes FOR DELETE 
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_barcodes_user_id ON public.barcodes(user_id);
CREATE INDEX IF NOT EXISTS idx_barcodes_created_at ON public.barcodes(created_at DESC);
