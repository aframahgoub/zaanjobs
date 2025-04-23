-- Create storage buckets for resume photos and CVs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('resume_photos', 'resume_photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('resume_cvs', 'resume_cvs', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies to allow authenticated users to upload files
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'buckets' AND schemaname = 'storage' AND policyname = 'Allow authenticated users to upload photos') THEN
    CREATE POLICY "Allow authenticated users to upload photos"
      ON storage.objects
      FOR INSERT
      WITH CHECK (bucket_id = 'resume_photos' AND auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'buckets' AND schemaname = 'storage' AND policyname = 'Allow authenticated users to upload CVs') THEN
    CREATE POLICY "Allow authenticated users to upload CVs"
      ON storage.objects
      FOR INSERT
      WITH CHECK (bucket_id = 'resume_cvs' AND auth.role() = 'authenticated');
  END IF;
END $$;

-- Create policies to allow public access to read files
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Allow public to read photos') THEN
    CREATE POLICY "Allow public to read photos"
      ON storage.objects
      FOR SELECT
      USING (bucket_id = 'resume_photos');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Allow public to read CVs') THEN
    CREATE POLICY "Allow public to read CVs"
      ON storage.objects
      FOR SELECT
      USING (bucket_id = 'resume_cvs');
  END IF;
END $$;
