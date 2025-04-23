-- Fix case sensitivity issues in the resumes table
ALTER TABLE public.resumes
RENAME COLUMN "firstName" TO firstname;

ALTER TABLE public.resumes
RENAME COLUMN "lastName" TO lastname;

ALTER TABLE public.resumes
RENAME COLUMN "fullName" TO fullname;

ALTER TABLE public.resumes
RENAME COLUMN "specialistProfile" TO specialistprofile;

ALTER TABLE public.resumes
RENAME COLUMN "yearsOfExperience" TO yearsofexperience;

ALTER TABLE public.resumes
RENAME COLUMN "educationLevel" TO educationlevel;

ALTER TABLE public.resumes
RENAME COLUMN "social_media" TO socialmedia;

-- Add a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_resumes_updated_at ON public.resumes;

CREATE TRIGGER update_resumes_updated_at
BEFORE UPDATE ON public.resumes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
