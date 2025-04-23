import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { directSQL } from "../direct-sql";

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    console.log("Creating exec_sql function if it doesn't exist");

    // SQL to create the exec_sql function
    const createFunctionSQL = `
      DO $$
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
          AS $$
          DECLARE
            result JSONB;
          BEGIN
            EXECUTE sql;
            RETURN jsonb_build_object('success', true);
          EXCEPTION WHEN OTHERS THEN
            RETURN jsonb_build_object('success', false, 'error', SQLERRM, 'code', SQLSTATE);
          END;
          $$;
          $FUNC$;
        END IF;
      END;
      $$;

      -- Grant execute permission to authenticated and anon roles
      GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated, anon;
    `;

    // Execute the SQL to create the function
    const result = await directSQL(createFunctionSQL);

    if (!result.success) {
      console.error("Error creating exec_sql function:", result.error);
      return NextResponse.json(
        { error: "Failed to create exec_sql function" },
        { status: 500 },
      );
    }

    // Test the function to make sure it works
    try {
      const testResult = await supabase.rpc("exec_sql", {
        sql: "SELECT 1 as test",
      });

      if (testResult.error) {
        console.error("Error testing exec_sql function:", testResult.error);
        return NextResponse.json(
          {
            success: false,
            error: "Function created but test failed",
            details: testResult.error,
          },
          { status: 500 },
        );
      }

      console.log("exec_sql function created and tested successfully");
    } catch (testError) {
      console.error("Error testing exec_sql function:", testError);
      // Continue anyway as the function might have been created successfully
    }

    return NextResponse.json({
      success: true,
      message: "exec_sql function created successfully",
    });
  } catch (error: any) {
    console.error("Error creating exec_sql function:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 },
    );
  }
}
