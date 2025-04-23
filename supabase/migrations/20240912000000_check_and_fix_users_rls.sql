-- Check if RLS is enabled on users table
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'users';

-- Enable RLS on users table if not already enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Public access" ON public.users;
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;

-- Create policies for users table
-- Allow public read access to all users
CREATE POLICY "Public access"
ON public.users FOR SELECT
USING (true);

-- Allow users to update their own data
CREATE POLICY "Users can update their own data"
ON public.users FOR UPDATE
USING (auth.uid() = id);

-- Allow users to delete their own data
CREATE POLICY "Users can delete their own data"
ON public.users FOR DELETE
USING (auth.uid() = id);

-- Allow authenticated users to insert their own data
CREATE POLICY "Users can insert their own data"
ON public.users FOR INSERT
WITH CHECK (auth.uid() = id);

-- Enable realtime for users table
-- Table is already a member of supabase_realtime publication
