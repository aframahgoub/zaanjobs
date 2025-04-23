import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { supabase } from "./supabase";

// Check if a user is authenticated
export const isAuthenticated = async () => {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Authentication check error:", error);
    return false;
  }

  return !!data.session;
};

// Get the current user
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error("Get current user error:", error);
    return null;
  }

  return data.user;
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Sign in error:", error);
    throw error;
  }

  return data;
};

// Sign up with email and password
export const signUpWithEmail = async (
  email: string,
  password: string,
  userData?: any,
) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  });

  if (error) {
    console.error("Sign up error:", error);
    throw error;
  }

  return data;
};

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Sign out error:", error);
    throw error;
  }

  return true;
};

// Verify if a user exists in the database
export const verifyUserExists = async (userId: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Verify user exists error:", error);
    return false;
  }

  return !!data;
};

// Create a user profile in the database if it doesn't exist
export const ensureUserProfile = async (userId: string, email: string) => {
  // Check if user profile exists
  const { data: existingUser, error: checkError } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .single();

  if (checkError && checkError.code !== "PGRST116") {
    console.error("Check user profile error:", checkError);
    return false;
  }

  // If user profile doesn't exist, create it
  if (!existingUser) {
    const { error: insertError } = await supabase
      .from("users")
      .insert([{ id: userId, email, created_at: new Date().toISOString() }]);

    if (insertError) {
      console.error("Create user profile error:", insertError);
      return false;
    }
  }

  return true;
};
