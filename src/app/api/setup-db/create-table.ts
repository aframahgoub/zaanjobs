import { directSQL } from "./direct-sql";
import { executeSafeSql, tableExists } from "./create-table-helper";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function createResumesTable() {
  console.log("Starting to create resumes table...");
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // Create the uuid-ossp extension
    await executeSafeSql(
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
      "uuid-ossp extension creation",
    );

    // Try to query the resumes table first to see if it exists
    try {
      const { data, error } = await supabase
        .from("resumes")
        .select("count")
        .limit(1);

      if (!error) {
        console.log("Resumes table already exists and is accessible");
        return { success: true };
      }
    } catch (queryError) {
      console.log("Table query check failed, will create table", queryError);
    }

    // Create the table with IF NOT EXISTS to avoid errors if it already exists
    const createTableSQL = `
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
    `;

    // Execute the create table SQL
    const result = await directSQL(createTableSQL);

    // If successful or if the table already exists, create indexes
    if (result.success) {
      console.log("Table created successfully or already exists");

      // Create indexes for better performance
      await executeSafeSql(
        `CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON public.resumes(user_id);`,
        "create user_id index",
      );

      await executeSafeSql(
        `CREATE INDEX IF NOT EXISTS resumes_created_at_idx ON public.resumes(created_at DESC);`,
        "create created_at index",
      );

      return { success: true };
    }

    // If we get here, there was an error creating the table
    console.error("Error creating resumes table:", result.error);

    // Try one more approach - use the Supabase client directly
    try {
      // Check if the table exists by trying to query it
      const { data, error } = await supabase
        .from("resumes")
        .select("count")
        .limit(1);

      if (!error) {
        console.log("Table exists after all, operation successful");
        return { success: true };
      }
    } catch (finalError) {
      console.error("Final table check failed", finalError);
    }

    return result;
  } catch (error) {
    console.error("Unexpected error creating resumes table:", error);
    return { success: false, error };
  }
}
