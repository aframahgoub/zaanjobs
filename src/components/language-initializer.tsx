"use client";

import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export function LanguageInitializer({
  language = "ar",
}: {
  language?: "en" | "ar";
}) {
  const { setLanguage } = useLanguage();

  useEffect(() => {
    setLanguage(language);
  }, [language, setLanguage]);

  return null;
}
