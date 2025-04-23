-- Create resumes table
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    fullName TEXT NOT NULL,
    title TEXT NOT NULL,
    bio TEXT NOT NULL,
    specialistProfile TEXT NOT NULL,
    location TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    website TEXT,
    skills TEXT[] DEFAULT '{}',
    photo TEXT,
    cv_url TEXT,
    education JSONB[] DEFAULT '{}',
    experience JSONB[] DEFAULT '{}',
    certifications JSONB[] DEFAULT '{}',
    social_media JSONB DEFAULT '{}',
    attachments JSONB[] DEFAULT '{}',
    views INTEGER DEFAULT 0,
    contacts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON public.resumes(user_id);

-- Set up Row Level Security (RLS)
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Policy for users to view only their own resumes
CREATE POLICY "Users can view their own resumes" 
    ON public.resumes 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Policy for users to insert their own resumes
CREATE POLICY "Users can insert their own resumes" 
    ON public.resumes 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own resumes
CREATE POLICY "Users can update their own resumes" 
    ON public.resumes 
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- Policy for users to delete their own resumes
CREATE POLICY "Users can delete their own resumes" 
    ON public.resumes 
    FOR DELETE 
    USING (auth.uid() = user_id);
