-- Add portfolio_images column to resumes table
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS portfolio_images TEXT[];

-- Enable RLS on resumes table
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Create policy for public access to resumes
DROP POLICY IF EXISTS "Public access to resumes" ON resumes;
CREATE POLICY "Public access to resumes"
  ON resumes FOR SELECT
  USING (true);

-- Create policy for users to update their own resumes
DROP POLICY IF EXISTS "Users can update own resumes" ON resumes;
CREATE POLICY "Users can update own resumes"
  ON resumes FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own resumes
DROP POLICY IF EXISTS "Users can insert own resumes" ON resumes;
CREATE POLICY "Users can insert own resumes"
  ON resumes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to delete their own resumes
DROP POLICY IF EXISTS "Users can delete own resumes" ON resumes;
CREATE POLICY "Users can delete own resumes"
  ON resumes FOR DELETE
  USING (auth.uid() = user_id);
