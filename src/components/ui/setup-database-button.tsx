"use client";

import { useState } from "react";
import { Button } from "./button";
import { AlertCircle, Check, Loader2 } from "lucide-react";

export function SetupDatabaseButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const setupDatabase = async () => {
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Import the supabase client and helper functions
      const { supabase, initializeDatabaseTables, initializeStorageBuckets } =
        await import("@/lib/supabase");

      // First, try to create the exec_sql function
      try {
        const createFunctionSQL = `
          DO $
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
              AS $
              DECLARE
                result JSONB;
              BEGIN
                EXECUTE sql;
                RETURN jsonb_build_object('success', true);
              EXCEPTION WHEN OTHERS THEN
                RETURN jsonb_build_object('success', false, 'error', SQLERRM, 'code', SQLSTATE);
              END;
              $;
              $FUNC$;
            END IF;
          END;
          $;

          -- Grant execute permission to authenticated and anon roles
          GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated, anon;
        `;

        await supabase.rpc("exec_sql", { sql: createFunctionSQL }).catch(() => {
          console.log("Error creating exec_sql function or it already exists");
        });
      } catch (funcError) {
        console.warn(
          "Error creating exec_sql function, continuing:",
          funcError,
        );
      }

      // Initialize storage buckets
      const storageResult = await initializeStorageBuckets();
      if (!storageResult.success) {
        console.warn("Storage initialization warning:", storageResult.error);
      }

      // Initialize database tables
      const dbResult = await initializeDatabaseTables();
      if (!dbResult.success) {
        throw new Error("Failed to initialize database tables");
      }

      setSuccess(true);
      console.log("Database setup completed successfully");
    } catch (err: any) {
      console.error("Error setting up database:", err);
      setError(
        err.message || "An error occurred while setting up the database",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 w-full max-w-md">
      <h3 className="text-lg font-semibold text-[#18515b] mb-3">
        Database Setup
      </h3>
      <p className="text-gray-600 mb-4">
        Click the button below to set up the database tables required for the
        application.
      </p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-start">
          <Check className="h-5 w-5 mr-2 mt-0.5" />
          <span>Database setup completed successfully!</span>
        </div>
      )}

      <Button
        onClick={setupDatabase}
        disabled={isLoading}
        className="bg-[#18515b] hover:bg-[#00acc1] text-white w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Setting up database...
          </>
        ) : (
          "Setup Database Tables"
        )}
      </Button>
    </div>
  );
}
