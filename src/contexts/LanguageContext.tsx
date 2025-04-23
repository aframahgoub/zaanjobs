"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import enTranslations from "@/lib/lang/en.json";
import arTranslations from "@/lib/lang/ar.json";

type Language = "en" | "ar";
type Translations = typeof enTranslations;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const translations = {
  en: enTranslations,
  ar: arTranslations,
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [dir, setDir] = useState<"ltr" | "rtl">("ltr");

  useEffect(() => {
    // Check if there's a saved language preference in localStorage
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "ar")) {
      setLanguageState(savedLanguage);
    }
  }, []);

  useEffect(() => {
    // Update document direction based on language
    setDir(language === "ar" ? "rtl" : "ltr");
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
    localStorage.setItem("language", language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // Translation function
  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations[language];

    // Try to get the value from the current language
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        value = undefined;
        break;
      }
    }

    // If value is undefined or not a string, fallback to English
    if (value === undefined || typeof value !== "string") {
      value = getNestedValue(enTranslations, keys);
      if (value === undefined || typeof value !== "string") {
        return key; // Return the key itself if not found in any language
      }
    }

    return value;
  };

  // Helper function to get nested value
  const getNestedValue = (obj: any, keys: string[]): any => {
    let value = obj;
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return undefined;
      }
    }
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
