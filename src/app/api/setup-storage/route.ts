import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    console.log("Setting up storage buckets");

    // Create resume_photos bucket if it doesn't exist
    try {
      const { data: photoBucket, error: photoError } =
        await supabase.storage.getBucket("resume_photos");

      if (photoError && photoError.message.includes("does not exist")) {
        console.log("Creating resume_photos bucket");
        const { data, error } = await supabase.storage.createBucket(
          "resume_photos",
          {
            public: true,
            fileSizeLimit: 5242880, // 5MB
          },
        );

        if (error) {
          console.error("Error creating resume_photos bucket:", error);
        } else {
          console.log("resume_photos bucket created successfully");
        }
      } else {
        console.log("resume_photos bucket already exists");
      }
    } catch (error) {
      console.error("Error checking/creating resume_photos bucket:", error);
    }

    // Create resume_cvs bucket if it doesn't exist
    try {
      const { data: cvBucket, error: cvError } =
        await supabase.storage.getBucket("resume_cvs");

      if (cvError && cvError.message.includes("does not exist")) {
        console.log("Creating resume_cvs bucket");
        const { data, error } = await supabase.storage.createBucket(
          "resume_cvs",
          {
            public: true,
            fileSizeLimit: 10485760, // 10MB
          },
        );

        if (error) {
          console.error("Error creating resume_cvs bucket:", error);
        } else {
          console.log("resume_cvs bucket created successfully");
        }
      } else {
        console.log("resume_cvs bucket already exists");
      }
    } catch (error) {
      console.error("Error checking/creating resume_cvs bucket:", error);
    }

    return NextResponse.json({
      success: true,
      message: "Storage buckets setup completed",
    });
  } catch (error: any) {
    console.error("Error setting up storage buckets:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 },
    );
  }
}
