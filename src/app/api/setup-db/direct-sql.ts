import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// This is a direct SQL execution function that doesn't rely on RPC methods
export async function directSQL(sql: string) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    console.log(
      "Executing direct SQL:",
      sql.substring(0, 100) + (sql.length > 100 ? "..." : ""),
    );

    // Get Supabase credentials
    const supabaseUrl =
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase URL or key");
      return { success: false, error: "Missing Supabase configuration" };
    }

    // Try using the Supabase client directly first
    try {
      console.log("Attempting to execute SQL using Supabase client");
      const { data, error } = await supabase.rpc("exec_sql", { sql });

      if (!error) {
        console.log("SQL execution successful using Supabase client");
        return { success: true, data };
      }

      // If we get here, there was an error but we'll try the REST API approach
      console.log("Supabase client execution failed, trying REST API", error);
    } catch (clientError) {
      console.log("Error using Supabase client, trying REST API", clientError);
    }

    // Special case for CREATE TABLE - try direct table operations if possible
    if (
      sql
        .trim()
        .toUpperCase()
        .includes("CREATE TABLE IF NOT EXISTS PUBLIC.RESUMES")
    ) {
      try {
        // For resumes table specifically, try to create it using the SQL API
        console.log("Attempting to create resumes table directly");

        // Try to query the resumes table to see if it exists already
        const { data: checkData, error: checkError } = await supabase
          .from("resumes")
          .select("count")
          .limit(1);

        if (!checkError) {
          console.log("Resumes table already exists and is accessible");
          return { success: true };
        }
      } catch (directError) {
        console.log(
          "Direct table check failed, continuing with REST API",
          directError,
        );
      }
    }

    // Use REST API directly with proper URL path
    console.log(`Using REST API at ${supabaseUrl}/rest/v1/rpc/exec_sql`);
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
        // If we can't parse JSON, try to get text
        try {
          const textResponse = await response.text();
          errorData = {
            message: textResponse || "Could not parse error response",
          };
        } catch (textError) {
          errorData = { message: "Could not parse error response" };
        }
      }

      // Special case: if we're creating a table and get a duplicate table error,
      // consider this a success since the table already exists
      if (
        sql.trim().toUpperCase().includes("CREATE TABLE") &&
        (response.status === 409 ||
          (errorData &&
            typeof errorData === "object" &&
            (errorData.message?.includes("already exists") ||
              errorData.error?.includes("already exists") ||
              (typeof errorData.message === "string" &&
                errorData.message.includes("already exists")) ||
              (typeof errorData.error === "string" &&
                errorData.error.includes("already exists")))))
      ) {
        console.log("Table already exists, considering this a success");
        return { success: true };
      }

      // If the exec_sql function doesn't exist, try to create the table directly
      if (
        errorData?.details?.includes(
          "Could not find the function public.exec_sql",
        )
      ) {
        console.log(
          "exec_sql function not found, trying direct table operations",
        );

        // For CREATE TABLE operations, try to use the Supabase client directly
        if (sql.trim().toUpperCase().includes("CREATE TABLE")) {
          try {
            // Extract table name from SQL
            const tableNameMatch = sql.match(
              /CREATE TABLE IF NOT EXISTS public\.(\w+)/i,
            );
            const tableName = tableNameMatch ? tableNameMatch[1] : null;

            if (tableName) {
              // Check if the table exists by trying to query it
              const { error: queryError } = await supabase
                .from(tableName)
                .select("count")
                .limit(1);

              if (!queryError) {
                console.log(`Table ${tableName} exists, operation successful`);
                return { success: true };
              }
            }
          } catch (directOpError) {
            console.log("Direct table operation failed", directOpError);
          }
        }
      }

      // Handle 404 errors specifically
      if (response.status === 404) {
        console.error(
          "404 Not Found error executing SQL via REST API. This could indicate an issue with the API endpoint or permissions.",
          "SQL (truncated):",
          sql.substring(0, 50) + (sql.length > 50 ? "..." : ""),
          "Status:",
          response.status,
        );
        return {
          success: false,
          error: {
            message: "API endpoint not found or inaccessible",
            status: 404,
            details: errorData || "No additional error details available",
          },
        };
      }

      console.error(
        "Error executing SQL via REST API:",
        errorData,
        "Status:",
        response.status,
        "SQL (truncated):",
        sql.substring(0, 50) + (sql.length > 50 ? "..." : ""),
      );
      return {
        success: false,
        error: errorData,
        status: response.status,
        sql_preview: sql.substring(0, 50) + (sql.length > 50 ? "..." : ""),
      };
    }

    const result = await response.json();
    console.log("SQL execution successful");
    return { success: true, data: result };
  } catch (err) {
    console.error(
      "Error executing SQL:",
      err,
      "SQL (truncated):",
      sql.substring(0, 50) + (sql.length > 50 ? "..." : ""),
    );
    return {
      success: false,
      error: err,
      sql_preview: sql.substring(0, 50) + (sql.length > 50 ? "..." : ""),
    };
  }
}
