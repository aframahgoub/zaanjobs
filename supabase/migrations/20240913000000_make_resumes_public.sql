-- Make resumes publicly accessible
DROP POLICY IF EXISTS "Public read access" ON resumes;
CREATE POLICY "Public read access"
ON resumes FOR SELECT
USING (true);

-- Enable realtime for resumes table
alter publication supabase_realtime add table resumes;
