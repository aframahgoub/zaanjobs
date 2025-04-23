-- Add a slug field to resumes table for easier URL-friendly IDs
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create a unique index on the slug field
CREATE UNIQUE INDEX IF NOT EXISTS idx_resumes_slug ON public.resumes (slug);

-- Update existing resumes to have a slug based on their title and ID
UPDATE public.resumes
SET slug = LOWER(REGEXP_REPLACE(COALESCE(title, 'resume') || '-' || SUBSTRING(id::text, 1, 8), '[^a-z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- Create a function to generate slugs automatically
CREATE OR REPLACE FUNCTION generate_resume_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(REGEXP_REPLACE(COALESCE(NEW.title, 'resume') || '-' || SUBSTRING(NEW.id::text, 1, 8), '[^a-z0-9]+', '-', 'g'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically generate slugs for new resumes
DROP TRIGGER IF EXISTS generate_resume_slug_trigger ON public.resumes;
CREATE TRIGGER generate_resume_slug_trigger
BEFORE INSERT OR UPDATE ON public.resumes
FOR EACH ROW
EXECUTE FUNCTION generate_resume_slug();
