import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createResumesTable } from "../../../../api/setup-db/create-table";

// UUID validation regex pattern
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = params.id === "[id]" ? "" : params.id;
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    console.log(`GET /api/resumes/${id}/view - Fetching resume`);

    // First, ensure the resumes table exists using the shared function
    try {
      console.log(
        `GET /api/resumes/${id}/view - Ensuring resumes table exists`,
      );
      const tableResult = await createResumesTable();
      console.log(
        `Resumes table creation check: ${tableResult.success ? "Success" : "Failed, but continuing"}`,
      );
    } catch (tableError) {
      console.warn(
        `GET /api/resumes/${id}/view - Table creation error (non-critical):`,
        tableError,
      );
      // Continue anyway as the table might already exist
    }

    // Try multiple approaches to find the resume
    let resumeData = null;
    let error = null;

    // 1. First try by slug (most reliable)
    try {
      const { data, error: slugError } = await supabase
        .from("resumes")
        .select("*")
        .eq("slug", id)
        .maybeSingle();

      if (data) {
        console.log(`GET /api/resumes/${id}/view - Resume found by slug`);
        resumeData = data;
      } else if (slugError && slugError.code !== "PGRST116") {
        error = slugError;
      }
    } catch (slugError) {
      console.warn(
        `GET /api/resumes/${id}/view - Error searching by slug:`,
        slugError,
      );
    }

    // 2. If not found by slug, try by UUID if it looks like a UUID
    if (!resumeData && UUID_REGEX.test(id)) {
      try {
        const { data, error: uuidError } = await supabase
          .from("resumes")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (data) {
          console.log(`GET /api/resumes/${id}/view - Resume found by UUID`);
          resumeData = data;
        } else if (uuidError && uuidError.code !== "PGRST116") {
          error = uuidError;
        }
      } catch (uuidError) {
        console.warn(
          `GET /api/resumes/${id}/view - Error searching by UUID:`,
          uuidError,
        );
      }
    }

    // 3. If still not found, try by name search
    if (!resumeData) {
      try {
        const { data, error: nameError } = await supabase
          .from("resumes")
          .select("*")
          .or(
            `firstname.ilike.%${id}%,lastname.ilike.%${id}%,fullname.ilike.%${id}%`,
          )
          .limit(1)
          .maybeSingle();

        if (data) {
          console.log(
            `GET /api/resumes/${id}/view - Resume found by name search`,
          );
          resumeData = data;
        } else if (nameError && nameError.code !== "PGRST116") {
          error = nameError;
        }
      } catch (nameError) {
        console.warn(
          `GET /api/resumes/${id}/view - Error searching by name:`,
          nameError,
        );
      }
    }

    // If resume not found after all attempts
    if (!resumeData) {
      console.log(
        `GET /api/resumes/${id}/view - Resume not found after all search attempts`,
      );
      return NextResponse.json(
        {
          error: "Resume not found",
          code: "NOT_FOUND",
          details: "No resume found with the provided identifier",
        },
        { status: 404 },
      );
    }

    // Increment view count
    try {
      const { error: updateError } = await supabase
        .from("resumes")
        .update({ views: (resumeData.views || 0) + 1 })
        .eq("id", resumeData.id);

      if (updateError) {
        console.error(
          `GET /api/resumes/${id}/view - Error updating view count:`,
          updateError,
        );
        // Continue even if view count update fails
      }
    } catch (updateError) {
      console.error(
        `GET /api/resumes/${id}/view - Error updating view count:`,
        updateError,
      );
      // Continue even if view count update fails
    }

    console.log(`GET /api/resumes/${id}/view - Resume retrieved successfully`);
    return NextResponse.json({ resume: resumeData });
  } catch (error: any) {
    console.error(`GET /api/resumes/${id}/view - Unexpected error:`, error);
    return NextResponse.json(
      {
        error: error.message || "Server error",
        code: "INTERNAL_ERROR",
        details: "An unexpected error occurred while processing your request",
      },
      { status: 500 },
    );
  }
}
