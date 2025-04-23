-- Add user_type column to users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'user_type') THEN
    -- Create user_type enum type
    CREATE TYPE user_type_enum AS ENUM ('professional', 'employer', 'admin');
    
    -- Add user_type column with default value
    ALTER TABLE public.users ADD COLUMN user_type user_type_enum NOT NULL DEFAULT 'professional';
  END IF;
END $$;

-- Add full_name column if it doesn't exist (noticed it's used in CreateAccountForm but not in original table)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'full_name') THEN
    ALTER TABLE public.users ADD COLUMN full_name TEXT;
  END IF;
END $$;
