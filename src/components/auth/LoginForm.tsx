"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Loader2 } from "lucide-react";
import { signIn } from "@/lib/auth-helpers";
import { useRouter } from "next/navigation";

interface LoginFormProps {
  onClose: () => void;
}

export default function LoginForm({ onClose }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const {
        user,
        session,
        error: signInError,
      } = await signIn(email, password);

      if (signInError) {
        throw signInError;
      }

      if (!user || !session) {
        throw new Error("Login failed. Please check your credentials.");
      }

      console.log("User authenticated successfully:", user.id);

      // Store session info in localStorage for immediate feedback
      localStorage.setItem(
        "authUser",
        JSON.stringify({
          id: user.id,
          email: user.email,
          lastLogin: new Date().toISOString(),
        }),
      );

      // Ensure the current language is saved in localStorage
      localStorage.setItem("language", language);

      // Redirect to dashboard
      router.push("/dashboard");
      onClose();
    } catch (err: any) {
      console.error("Login error:", err);
      setError(
        err.message || "Failed to login. Please check your credentials.",
      );
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

        <h2 className="text-2xl font-bold text-[#18515b] mb-6">Login</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <Button
            type="submit"
            className="w-full bg-[#00acc1] text-white hover:bg-[#18515b]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>

          <div className="text-center text-sm text-gray-600">
            <a href="#" className="text-[#00acc1] hover:underline">
              Forgot password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
