"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import LoginForm from "./LoginForm";
import CreateAccountForm from "./CreateAccountForm";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "./ui/language-switcher";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showCreateAccountForm, setShowCreateAccountForm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsLoggedIn(!!session);
      },
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleCloseLoginForm = () => {
    setShowLoginForm(false);
  };

  const handleCloseCreateAccountForm = () => {
    setShowCreateAccountForm(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <nav className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-50">
      <div className="container mx-auto flex  gap-4 justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-[#18515b]">
          {t("common.appName")}
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className="text-gray-600 hover:text-[#00acc1] mr-6 rtl:ml-6 rtl:mr-0"
          >
            {t("navbar.home")}
          </Link>
          <Link
            href="/cv-specialists"
            className="text-gray-600 hover:text-[#00acc1] mr-2"
          >
            {t("navbar.findProfessionals")}
          </Link>
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-[#00acc1]"
              >
                {t("navbar.dashboard")}
              </Link>
              <Link
                href="/account"
                className="text-gray-600 hover:text-[#00acc1]"
              >
                {t("navbar.accountSettings")}
              </Link>
              <Button
                variant="outline"
                className="border-[#00acc1] text-[#00acc1] hover:bg-[#f1f8f9] hover:text-[#18515b]"
                onClick={handleLogout}
              >
                {t("navbar.logout")}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="border-[#00acc1] mr-2 text-[#00acc1] hover:bg-[#f1f8f9] hover:text-[#18515b]"
                onClick={() => {
                  setShowLoginForm(true);
                  setShowCreateAccountForm(false);
                }}
              >
                {t("navbar.login")}
              </Button>
              <Button
                className="bg-[#00acc1] text-white hover:bg-[#18515b]"
                onClick={() => {
                  setShowCreateAccountForm(true);
                  setShowLoginForm(false);
                }}
              >
                {t("navbar.createAccount")}
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center space-x-4">
          <LanguageSwitcher variant="icon" />
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white py-4 px-6 absolute top-16 left-0 right-0 border-b border-gray-200 z-50">
          <div className="flex flex-col space-y-4">
            <Link
              href="/"
              className="text-gray-600 hover:text-[#00acc1] py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("navbar.home")}
            </Link>
            <Link
              href="/cv-specialists"
              className="text-gray-600 hover:text-[#00acc1] py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              {t("navbar.findProfessionals")}
            </Link>
            {isLoggedIn && (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-[#00acc1] py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("navbar.dashboard")}
                </Link>
                <Link
                  href="/account"
                  className="text-gray-600 hover:text-[#00acc1] py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("navbar.accountSettings")}
                </Link>
              </>
            )}
            {isLoggedIn ? (
              <Button
                variant="outline"
                className="border-[#00acc1] text-[#00acc1] hover:bg-[#f1f8f9] hover:text-[#18515b] w-full"
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
              >
                {t("navbar.logout")}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="border-[#00acc1] text-[#00acc1] hover:bg-[#f1f8f9] hover:text-[#18515b] w-full"
                  onClick={() => {
                    setShowLoginForm(true);
                    setShowCreateAccountForm(false);
                    setIsMenuOpen(false);
                  }}
                >
                  {t("navbar.login")}
                </Button>
                <Button
                  className="bg-[#00acc1] text-white hover:bg-[#18515b] w-full"
                  onClick={() => {
                    setShowCreateAccountForm(true);
                    setShowLoginForm(false);
                    setIsMenuOpen(false);
                  }}
                >
                  {t("navbar.createAccount")}
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Login Form */}
      {showLoginForm && <LoginForm onClose={handleCloseLoginForm} />}

      {/* Create Account Form */}
      {showCreateAccountForm && (
        <CreateAccountForm onClose={handleCloseCreateAccountForm} />
      )}
    </nav>
  );
}
