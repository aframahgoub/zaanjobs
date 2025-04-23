-- Add indexes to improve search performance on firstname and lastname
CREATE INDEX IF NOT EXISTS idx_resumes_firstname ON resumes (firstname);
CREATE INDEX IF NOT EXISTS idx_resumes_lastname ON resumes (lastname);

-- Enable case-insensitive search with trigram indexes
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_resumes_firstname_trgm ON resumes USING gin (firstname gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_resumes_lastname_trgm ON resumes USING gin (lastname gin_trgm_ops);
