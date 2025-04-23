"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Loader2 } from "lucide-react";
import { signUp } from "@/lib/auth-helpers";
import { useRouter } from "next/navigation";

interface RegisterFormProps {
  onClose: () => void;
}

export default function RegisterForm({ onClose }: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

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
      const {
        user,
        session,
        error: signUpError,
      } = await signUp(email, password, name);

      if (signUpError) {
        throw signUpError;
      }

      if (!user) {
        throw new Error("Registration failed. Please try again.");
      }

      console.log("User registered successfully:", user.id);

      // Store session info in localStorage for immediate feedback
      localStorage.setItem(
        "authUser",
        JSON.stringify({
          id: user.id,
          email: user.email,
          name: name,
          lastLogin: new Date().toISOString(),
        }),
      );

      // Ensure the current language is saved in localStorage
      localStorage.setItem("language", language);

      // If session exists, user is automatically signed in
      if (session) {
        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        // Show confirmation message
        setError("Please check your email to confirm your account.");
      }

      onClose();
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      dir={dir}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
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
          Create Account
        </h2>

        {error && (
          <div
            className={`px-4 py-3 rounded mb-4 ${error.includes("check your email") ? "bg-green-100 border border-green-400 text-green-700" : "bg-red-100 border border-red-400 text-red-700"}`}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#00acc1] text-white hover:bg-[#18515b]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
