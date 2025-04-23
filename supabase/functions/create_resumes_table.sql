-- Create a stored procedure to set up the resumes table
CREATE OR REPLACE FUNCTION create_resumes_table()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if the table already exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'resumes') THEN
    -- Create the resumes table
    CREATE TABLE public.resumes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
    CREATE INDEX resumes_user_id_idx ON public.resumes(user_id);
    CREATE INDEX resumes_created_at_idx ON public.resumes(created_at DESC);
    
    -- Set up RLS (Row Level Security)
    ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

    -- Create policies
    -- Allow users to view their own resumes
    CREATE POLICY "Users can view their own resumes"
      ON public.resumes
      FOR SELECT
      USING (auth.uid() = user_id);

    -- Allow users to insert their own resumes
    CREATE POLICY "Users can insert their own resumes"
      ON public.resumes
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    -- Allow users to update their own resumes
    CREATE POLICY "Users can update their own resumes"
      ON public.resumes
      FOR UPDATE
      USING (auth.uid() = user_id);

    -- Allow users to delete their own resumes
    CREATE POLICY "Users can delete their own resumes"
      ON public.resumes
      FOR DELETE
      USING (auth.uid() = user_id);

    -- Allow public access to view all resumes
    CREATE POLICY "Public can view all resumes"
      ON public.resumes
      FOR SELECT
      TO PUBLIC
      USING (true);
  END IF;
END;
$$;
