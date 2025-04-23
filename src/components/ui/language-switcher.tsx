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

export function LanguageSwitcher({
  variant = "icon",
}: {
  variant?: "icon" | "text";
}) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "icon" ? (
          <Button variant="ghost" size="icon" className="rounded-full">
            <Globe size={20} />
            <span className="sr-only">{t("navbar.language")}</span>
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <Globe size={16} />
            <span>{language === "en" ? "English" : "العربية"}</span>
          </Button>
        )}
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
  );
}
