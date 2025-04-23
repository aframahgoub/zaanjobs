-- Make resumes publicly accessible (if not already)
DROP POLICY IF EXISTS "Public read access" ON resumes;
CREATE POLICY "Public read access"
ON resumes FOR SELECT
USING (true);
