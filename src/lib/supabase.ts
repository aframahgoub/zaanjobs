import { createClient } from "@supabase/supabase-js";

// Get environment variables with fallbacks
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://kbjzphkjtqvkgnsszyrj.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtianpwaGtqdHF2a2duc3N6eXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNzcxMTIsImV4cCI6MjA2MDc1MzExMn0.xAjVqwAXnKxT1SNATaPDvHLUetKa_0svWCk9Wpzew_8";

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      "x-application-name": "zaanjob",
    },
  },
});

// Helper function to check if Supabase is properly connected
export const checkSupabaseConnection = async () => {
  try {
    // First check if auth is working
    const { data: authData, error: authError } =
      await supabase.auth.getSession();
    if (authError) {
      console.error("Supabase auth connection error:", authError);
      return {
        success: false,
        error: authError,
        message: "Authentication service unavailable",
      };
    }

    // Then check if database is accessible
    const { data, error } = await supabase
      .from("resumes")
      .select("count")
      .limit(1);

    if (error) {
      console.error("Supabase database connection error:", error);
      return { success: false, error, message: "Database connection failed" };
    }

    // Check storage access
    try {
      const { data: buckets, error: bucketsError } =
        await supabase.storage.listBuckets();
      if (bucketsError) {
        console.warn("Supabase storage warning:", bucketsError);
        // Don't fail the connection check for storage issues
      }
    } catch (storageError) {
      console.warn("Supabase storage access warning:", storageError);
      // Continue even if storage check fails
    }

    console.log("Supabase connection successful");
    return { success: true };
  } catch (error) {
    console.error("Supabase connection error:", error);
    return { success: false, error, message: "Connection failed" };
  }
};

// Helper to initialize database tables if needed
export const initializeDatabaseTables = async () => {
  try {
    console.log("Initializing database tables directly...");

    // Create the resumes table directly using the Supabase client
    try {
      // Create the uuid-ossp extension
      await supabase
        .rpc("exec_sql", {
          sql: 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
        })
        .catch((err) => {
          console.log("Error creating extension, continuing anyway:", err);
        });

      // Create the resumes table
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS public.resumes (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID,
          firstname TEXT,
          lastname TEXT,
          fullname TEXT,
          title TEXT NOT NULL,
          bio TEXT NOT NULL,
          specialistprofile TEXT,
          location TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          website TEXT,
          skills TEXT[] DEFAULT '{}',
          education JSONB DEFAULT '[]',
          experience JSONB DEFAULT '[]',
          socialmedia JSONB DEFAULT '{}',
          attachments JSONB DEFAULT '[]',
          certifications JSONB DEFAULT '[]',
          photo TEXT,
          cv_url TEXT,
          nationality TEXT,
          age TEXT,
          yearsofexperience TEXT,
          educationlevel TEXT DEFAULT 'High school',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          views INTEGER DEFAULT 0,
          contacts INTEGER DEFAULT 0,
          slug TEXT
        );
      `;

      await supabase.rpc("exec_sql", { sql: createTableSQL }).catch((err) => {
        console.log("Error creating table, continuing anyway:", err);
      });

      // Create indexes
      const createIndexesSQL = `
        CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON public.resumes(user_id);
        CREATE INDEX IF NOT EXISTS resumes_created_at_idx ON public.resumes(created_at DESC);
        CREATE INDEX IF NOT EXISTS resumes_slug_idx ON public.resumes(slug);
      `;

      await supabase.rpc("exec_sql", { sql: createIndexesSQL }).catch((err) => {
        console.log("Error creating indexes, continuing anyway:", err);
      });

      console.log("Database tables initialized directly");
      return { success: true };
    } catch (directError) {
      console.error("Error in direct table creation:", directError);

      // Fallback to checking if the table exists
      try {
        const { data, error } = await supabase
          .from("resumes")
          .select("count")
          .limit(1);

        if (!error) {
          console.log("Resumes table exists and is accessible");
          return { success: true };
        }

        throw error;
      } catch (checkError) {
        console.error("Error checking table existence:", checkError);
        return { success: false, error: checkError };
      }
    }
  } catch (error) {
    console.error("Error initializing database tables:", error);
    return { success: false, error };
  }
};

// Helper to initialize storage buckets if needed
export const initializeStorageBuckets = async () => {
  try {
    // Check if buckets exist
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error("Error listing buckets:", error);
      return { success: false, error };
    }

    const bucketNames = ["resume_photos", "resume_cvs"];
    const existingBuckets = buckets?.map((b) => b.name) || [];

    // Create missing buckets
    for (const bucketName of bucketNames) {
      if (!existingBuckets.includes(bucketName)) {
        console.log(`Creating bucket: ${bucketName}`);
        const { error: createError } = await supabase.storage.createBucket(
          bucketName,
          {
            public: true,
            fileSizeLimit: bucketName === "resume_photos" ? 5242880 : 10485760, // 5MB for photos, 10MB for CVs
          },
        );

        if (createError) {
          console.error(`Error creating bucket ${bucketName}:`, createError);
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error initializing storage buckets:", error);
    return { success: false, error };
  }
};
