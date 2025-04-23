-- Check if columns exist before attempting to rename them
DO $$
DECLARE
  column_exists boolean;
BEGIN
  -- Check and rename firstname if it doesn't exist but firstName does
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'resumes' AND column_name = 'firstName'
  ) INTO column_exists;
  
  IF column_exists THEN
    ALTER TABLE public.resumes RENAME COLUMN "firstName" TO firstname;
  END IF;

  -- Check and rename lastname if it doesn't exist but lastName does
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'resumes' AND column_name = 'lastName'
  ) INTO column_exists;
  
  IF column_exists THEN
    ALTER TABLE public.resumes RENAME COLUMN "lastName" TO lastname;
  END IF;

  -- Check and rename fullname if it doesn't exist but fullName does
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'resumes' AND column_name = 'fullName'
  ) INTO column_exists;
  
  IF column_exists THEN
    ALTER TABLE public.resumes RENAME COLUMN "fullName" TO fullname;
  END IF;

  -- Check and rename specialistprofile if it doesn't exist but specialistProfile does
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'resumes' AND column_name = 'specialistProfile'
  ) INTO column_exists;
  
  IF column_exists THEN
    ALTER TABLE public.resumes RENAME COLUMN "specialistProfile" TO specialistprofile;
  END IF;

  -- Check and rename yearsofexperience if it doesn't exist but yearsOfExperience does
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'resumes' AND column_name = 'yearsOfExperience'
  ) INTO column_exists;
  
  IF column_exists THEN
    ALTER TABLE public.resumes RENAME COLUMN "yearsOfExperience" TO yearsofexperience;
  END IF;

  -- Check and rename educationlevel if it doesn't exist but educationLevel does
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'resumes' AND column_name = 'educationLevel'
  ) INTO column_exists;
  
  IF column_exists THEN
    ALTER TABLE public.resumes RENAME COLUMN "educationLevel" TO educationlevel;
  END IF;

  -- Check and rename socialmedia if it doesn't exist but social_media does
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'resumes' AND column_name = 'social_media'
  ) INTO column_exists;
  
  IF column_exists THEN
    ALTER TABLE public.resumes RENAME COLUMN social_media TO socialmedia;
  END IF;

  -- Add a trigger to automatically update the updated_at timestamp if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_resumes_updated_at') THEN
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $func$
    BEGIN
        NEW.updated_at = now();
        RETURN NEW;
    END;
    $func$ language 'plpgsql';

    DROP TRIGGER IF EXISTS update_resumes_updated_at ON public.resumes;

    CREATE TRIGGER update_resumes_updated_at
    BEFORE UPDATE ON public.resumes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$;