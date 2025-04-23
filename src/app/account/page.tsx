"use client";

import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export default function AccountPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { t } = useLanguage();

  const [userData, setUserData] = useState({
    email: "",
    fullName: "",
    userType: "professional",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        const user = await getCurrentUser();

        if (!user) {
          router.push("/");
          return;
        }

        // Get user profile data from the database
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (data) {
          setUserData({
            email: user.email || "",
            fullName: data.full_name || "",
            userType: data.user_type || "professional",
          });
        }
      } catch (err) {
        console.error("Error loading user data:", err);
        setError("Failed to load user data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const user = await getCurrentUser();

      if (!user) {
        router.push("/");
        return;
      }

      // Update user profile in the database
      const { error } = await supabase
        .from("users")
        .update({
          full_name: userData.fullName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        throw new Error(error.message);
      }

      setSuccess("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error("New passwords don't match.");
      }

      if (passwordData.newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
      }

      // Update password using Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setSuccess(t("account.passwordUpdated"));
    } catch (err) {
      console.error("Error changing password:", err);
      setError(err.message || "Failed to change password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#f1f8f9] min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t("account.backToDashboard")}
          </Button>
          <h1 className="text-2xl font-bold text-[#18515b]">
            {t("account.accountSettings")}
          </h1>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4">
            {success}
          </div>
        )}

        <div className="space-y-8">
          {/* Profile Information */}
          <div>
            <h2 className="text-xl font-semibold text-[#18515b] mb-4">
              {t("account.profileInformation")}
            </h2>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <Label htmlFor="email">{t("account.emailAddress")}</Label>
                <Input
                  id="email"
                  value={userData.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {t("account.emailCannotBeChanged")}
                </p>
              </div>

              <div>
                <Label htmlFor="fullName"> {t("account.fullName")}</Label>
                <Input
                  id="fullName"
                  value={userData.fullName}
                  onChange={(e) =>
                    setUserData({ ...userData, fullName: e.target.value })
                  }
                  placeholder={t("account.yourFullName")}
                />
              </div>

              <div>
                <Label htmlFor="userType"> {t("account.accountType")}</Label>
                <Input
                  id="userType"
                  value={
                    userData.userType === "professional"
                      ? "Beauty Professional"
                      : "Employer"
                  }
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <Button
                type="submit"
                className="bg-[#00acc1] hover:bg-[#18515b] text-white"
                disabled={isLoading}
              >
                {isLoading ? t("account.updating") : t("account.updateProfile")}
              </Button>
            </form>
          </div>

          {/* Change Password */}
          <div>
            <h2 className="text-xl font-semibold text-[#18515b] mb-4">
              {t("account.changePassword")}
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="relative">
                <Label htmlFor="currentPassword">
                  {t("account.currentPassword")}
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    placeholder={t("account.enterCurrentPassword")}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="newPassword">{t("account.newPassword")}</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder={t("account.enterNewPassword")}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">
                  {t("account.confirmNewPassword")}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder={t("account.confirmNewPassword")}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="bg-[#00acc1] hover:bg-[#18515b] text-white"
                disabled={isLoading}
              >
                {isLoading
                  ? t("account.updating")
                  : t("account.changePassword")}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
