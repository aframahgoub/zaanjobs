import { supabase } from "./supabase";
import { createUser, getUserById } from "./api";
import { User, UserType } from "@/types/database";

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  userType: UserType = "professional",
) {
  try {
    // Create the auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          user_type: userType,
        },
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error("User creation failed");

    // Create the user profile in the database
    const { data: userData, error: userError } = await createUser({
      id: data.user.id,
      email: data.user.email || email,
      full_name: fullName,
      user_type: userType,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (userError) {
      console.error("Error creating user profile:", userError);
      console.error("User error details:", JSON.stringify(userError));
      throw new Error(
        `Failed to create user profile: ${userError.message || "Unknown error"}`,
      );
    }

    return { user: data.user, session: data.session, error: null };
  } catch (error: any) {
    console.error("Sign up error:", error);
    return { user: null, session: null, error };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Update last login time
    if (data.user) {
      await supabase
        .from("users")
        .update({ last_login: new Date().toISOString() })
        .eq("id", data.user.id);
    }

    return { user: data.user, session: data.session, error: null };
  } catch (error: any) {
    console.error("Sign in error:", error);
    return { user: null, session: null, error };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true, error: null };
  } catch (error: any) {
    console.error("Sign out error:", error);
    return { success: false, error };
  }
}

export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { user: data.user, error: null };
  } catch (error: any) {
    console.error("Get current user error:", error);
    return { user: null, error };
  }
}

export async function getCurrentSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { session: data.session, error: null };
  } catch (error: any) {
    console.error("Get session error:", error);
    return { session: null, error };
  }
}

export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await getUserById(userId);
    if (error) throw error;
    return { profile: data, error: null };
  } catch (error: any) {
    console.error("Get user profile error:", error);
    return { profile: null, error };
  }
}

export async function ensureUserProfile(
  userId: string,
  email: string,
  userType: UserType = "professional",
) {
  try {
    // Check if user profile exists
    const { data: existingUser, error: checkError } = await getUserById(userId);

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Check user profile error:", checkError);
      return false;
    }

    // If user profile doesn't exist, create it
    if (!existingUser) {
      const { data: userData, error: createError } = await createUser({
        id: userId,
        email,
        user_type: userType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (createError) {
        console.error("Create user profile error:", createError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Ensure user profile error:", error);
    return false;
  }
}
