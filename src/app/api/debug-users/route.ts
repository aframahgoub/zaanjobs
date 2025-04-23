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

    // Get all users from the users table
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*");

    // Get auth users
    let authUsers = null;
    let authUsersError = null;

    try {
      const { data, error } = await supabase.rpc("exec_sql", {
        sql: `
      SELECT * FROM auth.users LIMIT 10;
    `,
      });

      authUsers = data;
      authUsersError = error;
    } catch {
      authUsers = null;
      authUsersError = {
        message: "Cannot access auth.users or exec_sql function not available",
      };
    }

    // Check RLS status
    let rlsStatus = null;
    let rlsError = null;

    try {
      const { data, error } = await supabase.rpc("exec_sql", {
        sql: `
      SELECT relname, relrowsecurity
      FROM pg_class
      WHERE relname = 'users';
    `,
      });

      rlsStatus = data;
      rlsError = error;
    } catch {
      rlsStatus = null;
      rlsError = {
        message: "Cannot check RLS status or exec_sql function not available",
      };
    }

    // Check policies
    let policies = null;
    let policiesError = null;

    try {
      const { data, error } = await supabase.rpc("exec_sql", {
        sql: `
      SELECT * FROM pg_policies WHERE tablename = 'users';
    `,
      });

      policies = data;
      policiesError = error;
    } catch {
      policies = null;
      policiesError = {
        message: "Cannot check policies or exec_sql function not available",
      };
    }

    return NextResponse.json({
      auth: {
        isLoggedIn: !!session,
        userId: session?.user?.id,
        session: session
          ? { id: session.user.id, email: session.user.email }
          : null,
      },
      database: {
        users: {
          success: !usersError,
          count: users?.length || 0,
          data: users,
          error: usersError,
        },
        authUsers: {
          success: !authUsersError,
          data: authUsers,
          error: authUsersError,
        },
        rlsStatus: {
          success: !rlsError,
          data: rlsStatus,
          error: rlsError,
        },
        policies: {
          success: !policiesError,
          data: policies,
          error: policiesError,
        },
      },
      supabaseConfig: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set",
      },
    });
  } catch (error: any) {
    console.error("Debug users endpoint error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 },
    );
  }
}
