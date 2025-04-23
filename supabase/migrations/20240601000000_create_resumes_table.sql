-- Create the uuid-ossp extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the resumes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  firstName TEXT,
  lastName TEXT,
  fullName TEXT,
  title TEXT NOT NULL,
  bio TEXT NOT NULL,
  specialistProfile TEXT,
  location TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  website TEXT,
  skills TEXT[] DEFAULT '{}',
  education JSONB DEFAULT '[]',
  experience JSONB DEFAULT '[]',
  social_media JSONB DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  certifications JSONB DEFAULT '[]',
  photo TEXT,
  cv_url TEXT,
  nationality TEXT,
  age TEXT,
  yearsOfExperience TEXT,
  educationLevel TEXT DEFAULT 'High school',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  views INTEGER DEFAULT 0,
  contacts INTEGER DEFAULT 0
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS resumes_created_at_idx ON public.resumes(created_at DESC);

-- Set up RLS (Row Level Security)
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'resumes' AND policyname = 'Users can view their own resumes') THEN
    CREATE POLICY "Users can view their own resumes"
      ON public.resumes
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'resumes' AND policyname = 'Users can insert their own resumes') THEN
    CREATE POLICY "Users can insert their own resumes"
      ON public.resumes
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'resumes' AND policyname = 'Users can update their own resumes') THEN
    CREATE POLICY "Users can update their own resumes"
      ON public.resumes
      FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'resumes' AND policyname = 'Users can delete their own resumes') THEN
    CREATE POLICY "Users can delete their own resumes"
      ON public.resumes
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'resumes' AND policyname = 'Public can view all resumes') THEN
    CREATE POLICY "Public can view all resumes"
      ON public.resumes
      FOR SELECT
      TO PUBLIC
      USING (true);
  END IF;
END $$;

-- Add table to realtime publication if it's not already a member
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'resumes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.resumes;
  END IF;
END $$;