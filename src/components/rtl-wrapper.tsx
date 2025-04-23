"use client";

import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export function RTLWrapper({ children }: { children: React.ReactNode }) {
  const { setLanguage } = useLanguage();

  useEffect(() => {
    // Force Arabic language
    setLanguage("ar");
    localStorage.setItem("language", "ar");

    // Apply RTL styling
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "ar";

    // Add RTL-specific styles
    const style = document.createElement("style");
    style.textContent = `
      body { direction: rtl; text-align: right; }
      .flex { flex-direction: row-reverse; }
      .mr-1, .mr-2, .mr-4 { margin-right: 0 !important; margin-left: 0.25rem !important; }
      .ml-1, .ml-2, .ml-4 { margin-left: 0 !important; margin-right: 0.25rem !important; }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [setLanguage]);

  return (
    <div className="rtl" dir="rtl">
      {children}
    </div>
  );
}
