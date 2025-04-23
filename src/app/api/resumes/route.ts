import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createResumesTable } from "../../api/setup-db/create-table";

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // Ensure the resumes table exists using the shared function
    try {
      console.log("GET /api/resumes - Ensuring resumes table exists");
      const tableResult = await createResumesTable();
      console.log(
        `Resumes table creation check: ${tableResult.success ? "Success" : "Failed, but continuing"}`,
      );
    } catch (tableError) {
      console.warn(
        "GET /api/resumes - Table creation error (non-critical):",
        tableError,
      );
      // Continue anyway as the table might already exist
    }

    // Check if a specific user_id is provided as a query parameter
    const url = new URL(request.url);
    const userId = url.searchParams.get("user_id");

    console.log("GET /api/resumes - Public access enabled");

    // Get all resumes, optionally filtered by user_id if provided
    let query = supabase
      .from("resumes")
      .select("*")
      .order("created_at", { ascending: false });

    // If a specific user_id is provided, filter by that user
    if (userId) {
      query = query.eq("user_id", userId);
      console.log(`GET /api/resumes - Filtering by user_id: ${userId}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("GET /api/resumes - Database error:", error);
      if (error.code === "42P01") {
        // Table doesn't exist error
        return NextResponse.json(
          { error: "Resume table not found. Please try again later." },
          { status: 500 },
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`GET /api/resumes - Retrieved ${data?.length || 0} resumes`);
    return NextResponse.json({ resumes: data });
  } catch (error: any) {
    console.error("GET /api/resumes - Unexpected error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // Ensure the resumes table exists using the shared function
    try {
      console.log("POST /api/resumes - Ensuring resumes table exists");
      const tableResult = await createResumesTable();
      console.log(
        `Resumes table creation check: ${tableResult.success ? "Success" : "Failed, but continuing"}`,
      );
    } catch (tableError) {
      console.warn(
        "POST /api/resumes - Table creation error (non-critical):",
        tableError,
      );
      // Continue anyway as the table might already exist
    }

    // Get the current user
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("POST /api/resumes - Session error:", sessionError);
      return NextResponse.json(
        { error: "Authentication error" },
        { status: 401 },
      );
    }

    if (!session) {
      console.error("POST /api/resumes - Unauthorized: No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("POST /api/resumes - User authenticated:", session.user.id);

    // Skip API endpoint approach as it's causing fetch errors
    console.log("POST /api/resumes - Using direct table creation only");

    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log("POST /api/resumes - Request body received", {
        firstName: body.firstName,
        lastName: body.lastName,
        title: body.title,
      });
    } catch (parseError) {
      console.error(
        "POST /api/resumes - Error parsing request body:",
        parseError,
      );
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 },
      );
    }

    // Log if user_id is missing in request body but continue using session user
    if (!body.user_id) {
      console.warn(
        "POST /api/resumes - Missing user_id in request body, using session user ID instead",
      );
      // We'll use session.user.id as fallback in resumeData
    }

    // Validate required fields
    const requiredFields = [
      "firstName",
      "lastName",
      "title",
      "bio",
      "email",
      "phone",
      "location",
    ];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      console.error(
        "POST /api/resumes - Missing required fields:",
        missingFields,
      );
      return NextResponse.json(
        {
          error: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Fix duplicate fields in the request - use lowercase field names to match database columns
    const resumeData = {
      user_id: body.user_id || session.user.id, // Use the user_id from the request body or fallback to session user
      firstname: body.firstName || body.firstname, // Accept both camelCase and lowercase
      lastname: body.lastName || body.lastname, // Accept both camelCase and lowercase
      fullname:
        body.fullName ||
        `${body.firstName || body.firstname} ${body.lastName || body.lastname}`,
      title: body.title,
      bio: body.bio,
      specialistprofile: body.specialistProfile,
      location: body.location,
      email: body.email,
      phone: body.phone,
      website: body.website,
      skills: body.skills || [],
      education: body.education || [],
      experience: body.experience || [],
      socialmedia: body.social_media || body.socialMedia || {},
      attachments: body.attachments || [],
      certifications: body.certifications || [],
      photo:
        body.photo ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${body.title.replace(/\s+/g, "")}`,
      cv_url: body.cv_url || null,
      nationality: body.nationality || null,
      age: body.age || null,
      yearsofexperience: body.yearsOfExperience || null,
      educationlevel: body.educationLevel || "High school",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      views: 0,
      contacts: 0,
    };

    console.log("Resume data to be inserted:", {
      user_id: resumeData.user_id,
      session_user_id: session.user.id, // Log session user ID for comparison
      firstname: resumeData.firstname,
      lastname: resumeData.lastname,
      title: resumeData.title,
      email: resumeData.email,
    });

    // Generate a slug for the resume
    const baseSlug = (resumeData.title || "resume")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Add a random string to make the slug unique
    const randomString = Math.random().toString(36).substring(2, 8);
    resumeData.slug = `${baseSlug}-${randomString}`;

    // Create the resume in the database
    console.log("POST /api/resumes - Attempting database insert with data:", {
      firstname: resumeData.firstname,
      lastname: resumeData.lastname,
      title: resumeData.title,
      email: resumeData.email,
      skills: resumeData.skills?.length || 0,
      slug: resumeData.slug,
    });
    const { data, error } = await supabase
      .from("resumes")
      .insert([resumeData])
      .select();

    if (error) {
      console.error("POST /api/resumes - Database error:", error);

      // Handle specific database errors
      if (error.code === "23505") {
        // Unique violation
        return NextResponse.json(
          {
            error: "A resume with this information already exists.",
          },
          { status: 409 },
        );
      }

      if (error.code === "42P01") {
        // Table doesn't exist error
        return NextResponse.json(
          { error: "Resume table not found. Please try again later." },
          { status: 500 },
        );
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      console.error("POST /api/resumes - No data returned after insert");
      return NextResponse.json(
        {
          error: "Resume created but failed to retrieve details",
        },
        { status: 500 },
      );
    }

    console.log("POST /api/resumes - Resume created successfully:", data[0].id);
    // Log the full resume data for debugging
    console.log("POST /api/resumes - Full resume data:", {
      id: data[0].id,
      firstName: data[0].firstname,
      lastName: data[0].lastname,
      title: data[0].title,
      slug: data[0].slug,
      created_at: data[0].created_at,
      updated_at: data[0].updated_at,
    });
    return NextResponse.json({ resume: data[0] });
  } catch (error: any) {
    console.error("POST /api/resumes - Unexpected error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 },
    );
  }
}
