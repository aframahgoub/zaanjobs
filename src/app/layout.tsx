import { TempoInit } from "@/components/tempo-init";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import { EnvVariablesNotice } from "@/components/ui/env-variables-notice";
import { AutoDatabaseSetup } from "@/components/auto-database-setup";
import { FloatingLanguageSwitcher } from "@/components/ui/floating-language-switcher";
import { LanguageProvider } from "@/contexts/LanguageContext";
import React from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ZAANjob - Beauty Professional Resume Platform",
  description:
    "A platform connecting beauty professionals with opportunities in the beauty industry",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Script src="https://api.tempolabs.ai/proxy-asset?url=https://storage.googleapis.com/tempo-public-assets/error-handling.js" />
      <body className={inter.className + " text-[#043708]"}>
        <LanguageProvider>
          <Navbar />
          {children}
          <EnvVariablesNotice />
          <AutoDatabaseSetup />
          <TempoInit />
          <FloatingLanguageSwitcher />
        </LanguageProvider>
        <div className="w-[222px] h-[10px]"></div>
      </body>
    </html>
  );
}
