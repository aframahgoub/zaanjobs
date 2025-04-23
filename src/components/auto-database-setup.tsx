"use client";

import { useEffect, useState } from "react";

export function AutoDatabaseSetup() {
  const [setupComplete, setSetupComplete] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        // Check if we've already run setup in this session
        const hasSetup = sessionStorage.getItem("db-setup-complete");
        if (hasSetup === "true") {
          console.log("Database setup already completed in this session");
          setSetupComplete(true);
          return;
        }

        console.log("Automatically setting up database...");
        const response = await fetch("/api/setup-db", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to set up database");
        }

        console.log("Database setup completed successfully");
        setSetupComplete(true);

        // Mark as complete in session storage to prevent repeated calls
        sessionStorage.setItem("db-setup-complete", "true");
      } catch (err: any) {
        console.error("Error in automatic database setup:", err);
        setError(err.message || "An error occurred during database setup");
      }
    };

    setupDatabase();
  }, []);

  // This component doesn't render anything visible
  return null;
}
