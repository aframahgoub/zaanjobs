import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // Check database connection
    console.log("Checking database connection...");

    // Get table information
    const { data: tableInfo, error: tableError } = await supabase.rpc(
      "exec_sql",
      {
        sql: `
          SELECT table_name, column_name, data_type 
          FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = 'resumes'
          ORDER BY ordinal_position;
        `,
      },
    );

    if (tableError) {
      console.error("Error getting table info:", tableError);
      return NextResponse.json({ error: tableError.message }, { status: 500 });
    }

    // Check if the resumes table exists
    const { data: tableExists, error: existsError } = await supabase
      .from("resumes")
      .select("count")
      .limit(1);

    // Get current user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    // Create a test resume if user is logged in
    let testInsertResult = null;
    if (session) {
      const testData = {
        user_id: session.user.id,
        firstname: "Test",
        lastname: "User",
        fullname: "Test User",
        title: "Test Resume",
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

    return NextResponse.json({
      success: true,
      tableInfo,
      tableExists: {
        success: !existsError,
        data: tableExists,
        error: existsError,
      },
      session: {
        exists: !!session,
        userId: session?.user?.id,
      },
      testInsert: testInsertResult,
    });
  } catch (error: any) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 },
    );
  }
}
