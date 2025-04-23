"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";

interface CreateAccountFormProps {
  onClose: () => void;
}

export default function CreateAccountForm({ onClose }: CreateAccountFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { t, language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // Create user in Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      // Create user profile in the database
      if (data.user) {
        const { error: userError } = await supabase.from("users").insert([
          {
            id: data.user.id,
            full_name: name,
            email: email,
            created_at: new Date().toISOString(),
            user_type: "professional", // Adding user_type field with default value
          },
        ]);

        if (userError) {
          console.error("Error creating user record:", userError);
        }
      }

      // Store session info in localStorage for immediate feedback
      localStorage.setItem(
        "authUser",
        JSON.stringify({
          id: data.user.id,
          email: data.user.email,
          name: name,
          lastLogin: new Date().toISOString(),
        }),
      );

      // Redirect to dashboard if session exists
      if (data.session) {
        window.location.href = "/dashboard";
      }

      // Close the form after successful account creation
      onClose();
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          onClick={onClose}
        >
          <X size={20} />
        </Button>

        <h2 className="text-2xl font-bold text-[#18515b] mb-6">
          {t("auth.createAccount")}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 mb-2">
              {t("auth.fullName")}
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00acc1]"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">
              {t("auth.email")}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00acc1]"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 mb-2">
              {t("auth.password")}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00acc1]"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="block text-gray-700 mb-2"
            >
              {t("auth.confirmPassword")}
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00acc1]"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#00acc1] text-white hover:bg-[#18515b]"
            disabled={isLoading}
          >
            {isLoading ? t("auth.creatingAccount") : t("auth.createAccount")}
          </Button>
        </form>
      </div>
    </div>
  );
}
