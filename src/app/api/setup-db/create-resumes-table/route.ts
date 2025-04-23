import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createResumesTable } from "../create-table";
import { executeSQL } from "../exec-sql";
import { directSQL } from "../direct-sql";

// Support both GET and POST methods for better compatibility
export async function GET() {
  return handleRequest();
}

export async function POST(request: NextRequest) {
  return handleRequest();
}

async function handleRequest() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    console.log(
      "API /api/setup-db/create-resumes-table - Starting to create resumes table...",
    );

    // First, try to create the uuid-ossp extension
    try {
      console.log("Creating uuid-ossp extension if it doesn't exist");
      await directSQL('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    } catch (extensionError) {
      console.log(
        "Error creating extension, continuing anyway:",
        extensionError,
      );
      // Continue anyway as the extension might already exist or be created by the shared function
    }

    // Use the shared function to create the table
    const { success, error } = await createResumesTable();

    if (!success) {
      console.error("Error creating resumes table:", error);

      // Try one more direct approach as a last resort
      try {
        console.log("Attempting direct table creation as fallback");
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

        const directResult = await directSQL(createTableSQL);
        if (!directResult.success) {
          return NextResponse.json({ success: false, error }, { status: 500 });
        }
      } catch (directError) {
        console.error("Direct table creation also failed:", directError);
        return NextResponse.json({ success: false, error }, { status: 500 });
      }
    }

    // Check if the table was created successfully by trying to query it
    try {
      const { data, error: queryError } = await supabase
        .from("resumes")
        .select("count")
        .limit(1);

      if (queryError) {
        console.error("Error verifying resumes table creation:", queryError);

        // If the table doesn't exist, try one more time with a different approach
        if (queryError.message.includes("does not exist")) {
          try {
            console.log(
              "Table doesn't exist, trying alternative creation method...",
            );
            // Create indexes for better performance
            await directSQL(`
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
            `);

            // Try to verify again
            const { error: secondQueryError } = await supabase
              .from("resumes")
              .select("count")
              .limit(1);

            if (secondQueryError) {
              console.error(
                "Second verification attempt failed:",
                secondQueryError,
              );
              return NextResponse.json(
                { success: false, error: secondQueryError.message },
                { status: 500 },
              );
            }

            console.log("Table created successfully on second attempt");
            return NextResponse.json({ success: true });
          } catch (alternativeError) {
            console.error(
              "Alternative table creation failed:",
              alternativeError,
            );
            return NextResponse.json(
              { success: false, error: String(alternativeError) },
              { status: 500 },
            );
          }
        }

        return NextResponse.json(
          { success: false, error: queryError.message },
          { status: 500 },
        );
      }

      console.log("Resumes table created or already exists and is accessible");

      // Create indexes for better performance if the table exists
      try {
        await directSQL(`
          CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON public.resumes(user_id);
          CREATE INDEX IF NOT EXISTS resumes_created_at_idx ON public.resumes(created_at DESC);
        `).catch((err) => {
          console.log("Error creating indexes, continuing anyway:", err);
        });
      } catch (indexError) {
        console.log("Error creating indexes, continuing anyway:", indexError);
      }

      return NextResponse.json({ success: true });
    } catch (verifyError) {
      console.error("Error verifying resumes table:", verifyError);
      return NextResponse.json(
        { success: false, error: String(verifyError) },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Unexpected error creating resumes table:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}
