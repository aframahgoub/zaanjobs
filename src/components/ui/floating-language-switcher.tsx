"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "./button";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

export function FloatingLanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full bg-white shadow-md border-gray-200 hover:bg-gray-50 flex items-center gap-2"
          >
            <Globe size={16} />
            <span>{language === "en" ? "EN" : "AR"}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setLanguage("en")}>
            🇺🇸 English {language === "en" && "✓"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLanguage("ar")}>
            🇸🇦 العربية {language === "ar" && "✓"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
