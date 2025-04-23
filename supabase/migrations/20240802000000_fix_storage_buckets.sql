-- Create storage buckets if they don't exist
DO $$
BEGIN
  -- Create resume_photos bucket if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'resume_photos') THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('resume_photos', 'resume_photos', true);
  END IF;

  -- Create resume_cvs bucket if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'resume_cvs') THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('resume_cvs', 'resume_cvs', true);
  END IF;

  -- Set up RLS policies for the buckets
  -- First check if the policy exists using pg_policies system catalog
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Anyone can read resume_photos') THEN
    CREATE POLICY "Anyone can read resume_photos"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'resume_photos');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Anyone can read resume_cvs') THEN
    CREATE POLICY "Anyone can read resume_cvs"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'resume_cvs');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated users can upload to resume_photos') THEN
    CREATE POLICY "Authenticated users can upload to resume_photos"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'resume_photos' AND auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated users can upload to resume_cvs') THEN
    CREATE POLICY "Authenticated users can upload to resume_cvs"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'resume_cvs' AND auth.role() = 'authenticated');
  END IF;

  -- Enable RLS on storage.objects
  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

  -- Add to realtime publication
  ALTER PUBLICATION supabase_realtime ADD TABLE storage.objects;
END $$;
