import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createResumesTable } from "./create-table";
import { executeSQL } from "./exec-sql";
import { directSQL } from "./direct-sql";

export async function GET(request: NextRequest) {
  // Set up storage buckets directly instead of using fetch
  try {
    console.log("Setting up storage buckets directly");
    const supabase = createRouteHandlerClient({ cookies: () => cookies() });

    // Create resume_photos bucket if it doesn't exist
    try {
      const { data: photoBucket, error: photoError } =
        await supabase.storage.getBucket("resume_photos");
      if (photoError && photoError.message.includes("does not exist")) {
        console.log("Creating resume_photos bucket");
        await supabase.storage.createBucket("resume_photos", {
          public: true,
          fileSizeLimit: 5242880, // 5MB
        });
        console.log("resume_photos bucket created successfully");
      } else {
        console.log("resume_photos bucket already exists");
      }
    } catch (error) {
      console.warn(
        "Error checking/creating resume_photos bucket, but continuing:",
        error,
      );
    }

    // Create resume_cvs bucket if it doesn't exist
    try {
      const { data: cvBucket, error: cvError } =
        await supabase.storage.getBucket("resume_cvs");
      if (cvError && cvError.message.includes("does not exist")) {
        console.log("Creating resume_cvs bucket");
        await supabase.storage.createBucket("resume_cvs", {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
        console.log("resume_cvs bucket created successfully");
      } else {
        console.log("resume_cvs bucket already exists");
      }
    } catch (error) {
      console.warn(
        "Error checking/creating resume_cvs bucket, but continuing:",
        error,
      );
    }
  } catch (storageError) {
    console.warn(
      "Error setting up storage buckets, but continuing:",
      storageError,
    );
  }

  // Create exec_sql function directly instead of using fetch
  try {
    console.log("Creating exec_sql function directly");
    const createFunctionSQL = `
      DO $
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_proc p
          JOIN pg_namespace n ON p.pronamespace = n.oid
          WHERE n.nspname = 'public' AND p.proname = 'exec_sql'
        ) THEN
          EXECUTE $FUNC$
          CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
          RETURNS JSONB
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $
          DECLARE
            result JSONB;
          BEGIN
            EXECUTE sql;
            RETURN jsonb_build_object('success', true);
          EXCEPTION WHEN OTHERS THEN
            RETURN jsonb_build_object('success', false, 'error', SQLERRM, 'code', SQLSTATE);
          END;
          $;
          $FUNC$;
        END IF;
      END;
      $;

      -- Grant execute permission to authenticated and anon roles
      GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated, anon;
    `;

    await directSQL(createFunctionSQL).catch((err) => {
      console.log("Error creating exec_sql function, continuing anyway:", err);
    });
    console.log("exec_sql function creation attempted");
  } catch (execSqlError) {
    console.warn(
      "Error creating exec_sql function, but continuing:",
      execSqlError,
    );
  }

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // Create the uuid-ossp extension using direct SQL
    await directSQL('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";').catch(
      (err) => {
        console.log("Error creating extension, continuing anyway:", err);
      },
    );

    // Create the resumes table
    const { success, error } = await createResumesTable();

    if (!success) {
      console.error("Error creating resumes table:", error);
      return NextResponse.json(
        { error: "Failed to create resumes table" },
        { status: 500 },
      );
    }

    // Create indexes for better performance using direct SQL
    await directSQL(`
      CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON public.resumes(user_id);
      CREATE INDEX IF NOT EXISTS resumes_created_at_idx ON public.resumes(created_at DESC);
    `).catch((err) => {
      console.log("Error creating indexes, continuing anyway:", err);
    });

    // Set up RLS (Row Level Security) using direct SQL
    await directSQL(`
      ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
    `).catch((err) => {
      console.log("Error setting up RLS, continuing anyway:", err);
    });

    // Create policies
    const policies = [
      `DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'resumes' AND policyname = 'Users can view their own resumes') THEN
          CREATE POLICY "Users can view their own resumes"
            ON public.resumes
            FOR SELECT
            USING (auth.uid() = user_id);
        END IF;
      END $$;`,

      `DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'resumes' AND policyname = 'Users can insert their own resumes') THEN
          CREATE POLICY "Users can insert their own resumes"
            ON public.resumes
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);
        END IF;
      END $$;`,

      `DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'resumes' AND policyname = 'Users can update their own resumes') THEN
          CREATE POLICY "Users can update their own resumes"
            ON public.resumes
            FOR UPDATE
            USING (auth.uid() = user_id);
        END IF;
      END $$;`,

      `DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'resumes' AND policyname = 'Users can delete their own resumes') THEN
          CREATE POLICY "Users can delete their own resumes"
            ON public.resumes
            FOR DELETE
            USING (auth.uid() = user_id);
        END IF;
      END $$;`,

      `DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'resumes' AND policyname = 'Public can view all resumes') THEN
          CREATE POLICY "Public can view all resumes"
            ON public.resumes
            FOR SELECT
            TO PUBLIC
            USING (true);
        END IF;
      END $$;`,
    ];

    // Execute each policy creation separately using direct SQL
    for (const policySQL of policies) {
      await directSQL(policySQL).catch((err) => {
        console.log(`Error creating policy, continuing anyway: ${err}`);
      });
    }

    // Verify the table exists
    const { data, error: verifyError } = await supabase
      .from("resumes")
      .select("id")
      .limit(1);

    if (verifyError) {
      console.error("Table verification failed:", verifyError);
      return NextResponse.json({ error: verifyError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Database setup completed successfully",
      skipped: false,
    });
  } catch (error: any) {
    console.error("Error setting up database:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 },
    );
  }
}
