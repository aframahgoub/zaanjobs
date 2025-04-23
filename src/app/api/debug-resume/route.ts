import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // Check authentication
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      return NextResponse.json(
        { error: "Authentication error", details: sessionError },
        { status: 401 },
      );
    }

    // Check if user is logged in
    const isLoggedIn = !!session;
    const userId = session?.user?.id;

    // Check database connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from("resumes")
      .select("count")
      .limit(1);

    // Get table info
    const { data: tableInfo, error: tableError } = await supabase
      .rpc("exec_sql", {
        sql: `
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = 'resumes'
          ORDER BY ordinal_position;
        `,
      })
      .catch(() => ({
        data: null,
        error: { message: " function not available" },
      }));

    // Try to create a test resume
    let testInsertResult = null;
    if (isLoggedIn) {
      const testData = {
        user_id: userId,
        firstname: "Test",
        lastname: "User",
        fullname: "Test User",
        title: "Debug Test Resume",
        bio: "This is a test resume created by the debug endpoint.",
        location: "Test Location",
        email: "test@example.com",
        phone: "123-456-7890",
        skills: ["Testing", "Debugging"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        slug: `test-resume-${Math.random().toString(36).substring(2, 8)}`,
      };

      const { data: insertData, error: insertError } = await supabase
        .from("resumes")
        .insert([testData])
        .select();

      testInsertResult = {
        success: !insertError,
        data: insertData,
        error: insertError,
      };
    }

    // Get all existing resumes
    const { data: existingResumes, error: resumesError } = await supabase
      .from("resumes")
      .select("*");

    return NextResponse.json({
      auth: {
        isLoggedIn,
        userId,
        session: session
          ? { id: session.user.id, email: session.user.email }
          : null,
      },
      database: {
        connectionTest: {
          success: !connectionError,
          data: connectionTest,
          error: connectionError,
        },
        tableInfo: {
          success: !tableError,
          data: tableInfo,
          error: tableError,
        },
        testInsert: testInsertResult,
        existingResumes: {
          success: !resumesError,
          count: existingResumes?.length || 0,
          data: existingResumes,
          error: resumesError,
        },
      },
    });
  } catch (error: any) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 },
    );
  }
}
