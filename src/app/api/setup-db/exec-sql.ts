import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function executeSQL(sql: string) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    console.log(
      "Executing SQL:",
      sql.substring(0, 100) + (sql.length > 100 ? "..." : ""),
    );

    // Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase URL or key");
      return { success: false, error: "Missing Supabase configuration" };
    }

    // Skip RPC method since it's not available in the current Supabase setup
    console.log("Skipping RPC method and using direct query approach");

    // Try direct query as a fallback
    try {
      // For simple CREATE TABLE statements, try to execute directly
      if (
        sql.trim().toUpperCase().startsWith("CREATE TABLE") ||
        sql.trim().toUpperCase().startsWith("CREATE EXTENSION")
      ) {
        try {
          // Try executing the SQL
          await supabase.rpc("exec_sql", { sql });

          // For CREATE TABLE specifically, check if we can query the table
          if (
            sql
              .trim()
              .toUpperCase()
              .includes("CREATE TABLE IF NOT EXISTS PUBLIC.RESUMES")
          ) {
            try {
              const { data: checkData, error: checkError } = await supabase
                .from("resumes")
                .select("count")
                .limit(1);

              if (!checkError) {
                console.log("Table exists and is accessible");
                return { success: true };
              }
            } catch (innerQueryError) {
              console.log("Failed to query resumes table:", innerQueryError);
            }
          }
        } catch (directQueryError) {
          console.log(
            "Direct table creation attempt failed, continuing with other methods",
            directQueryError,
          );
        }
      }
    } catch (directError) {
      console.log("Direct query failed, falling back to REST API", directError);
    }

    // Last resort: try the REST API
    console.log("Attempting SQL execution via REST API");
    console.log(`Using Supabase URL: ${supabaseUrl.substring(0, 20)}...`);

    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseKey}`,
        apikey: supabaseKey,
        Prefer: "params=single-object",
      },
      body: JSON.stringify({ sql }),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: "Could not parse error response" };
      }

      // Special case: if we're creating a table and get a duplicate table error,
      // consider this a success since the table already exists
      if (
        sql.trim().toUpperCase().includes("CREATE TABLE") &&
        (response.status === 409 ||
          (errorData &&
            typeof errorData === "object" &&
            (errorData.message?.includes("already exists") ||
              errorData.error?.includes("already exists"))))
      ) {
        console.log("Table already exists, considering this a success");
        return { success: true };
      }

      console.error("Error executing SQL via REST API:", errorData);
      return { success: false, error: errorData };
    }

    const result = await response.json();
    console.log("SQL execution successful");
    return { success: true, data: result };
  } catch (err) {
    console.error("Error executing SQL:", err);
    return { success: false, error: err };
  }
}
