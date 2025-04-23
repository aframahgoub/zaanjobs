"use client";

import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";

export function EnvVariablesNotice() {
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    // Check if environment variables are set to placeholder values
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    if (
      supabaseUrl.includes("placeholder") ||
      supabaseKey.includes("placeholder") ||
      !supabaseUrl ||
      !supabaseKey
    ) {
      setShowNotice(true);
    }
  }, []);

  if (!showNotice) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-lg z-50">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
        <div>
          <h3 className="font-medium text-amber-800">
            Supabase Configuration Required
          </h3>
          <p className="text-sm text-amber-700 mt-1">
            Please set your Supabase URL and Anon Key in the project settings to
            enable authentication features.
          </p>
        </div>
      </div>
    </div>
  );
}
