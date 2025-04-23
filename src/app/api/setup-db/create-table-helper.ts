import { directSQL } from "./direct-sql";

// Helper function to safely execute SQL with better error handling
export async function executeSafeSql(sql: string, description: string) {
  try {
    console.log(`Executing ${description}...`);
    const result = await directSQL(sql);
    if (result.success) {
      console.log(`${description} completed successfully`);
    } else {
      console.warn(`${description} failed, but continuing:`, result.error);
    }
    return result;
  } catch (error) {
    console.error(`Error during ${description}:`, error);
    return { success: false, error };
  }
}

// Helper function to check if a table exists
export async function tableExists(tableName: string) {
  try {
    // Use a simpler query that's less likely to fail
    const checkSql = `SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = '${tableName}'
    ) AS exists;`;

    const result = await directSQL(checkSql);
    if (result.success && result.data && result.data.length > 0) {
      return { exists: result.data[0].exists, success: true };
    }

    // Fallback: try to query the table directly
    try {
      const { data, error } = await fetch(`/api/resumes?limit=1`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      }).then((res) => res.json());

      if (!error) {
        return { exists: true, success: true };
      }
    } catch (queryError) {
      console.log("Fallback table check failed", queryError);
    }

    return { exists: false, success: false };
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return { exists: false, success: false, error };
  }
}
