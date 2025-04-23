import { Resume, User } from "@/types/database";
import { supabase } from "./supabase";

// User API functions
export async function createUser(
  userData: Partial<User>,
): Promise<{ data: User | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from("users")
      .insert([userData])
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error creating user:", error);
    return { data: null, error };
  }
}

export async function getUserById(
  userId: string,
): Promise<{ data: User | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error fetching user:", error);
    return { data: null, error };
  }
}

// Resume API functions
export async function createResume(
  resumeData: Partial<Resume>,
): Promise<{ data: Resume | null; error: any }> {
  try {
    console.log(
      "[API] Creating resume with data:",
      JSON.stringify(resumeData, null, 2),
    );
    console.log("[API] User ID from resume data:", resumeData.user_id);

    // Validate required fields
    const requiredFields = [
      "user_id",
      "firstname",
      "lastname",
      "title",
      "bio",
      "email",
    ];
    const missingFields = requiredFields.filter((field) => !resumeData[field]);

    if (missingFields.length > 0) {
      console.error(
        `[API] Missing required fields: ${missingFields.join(", ")}`,
      );
      return {
        data: null,
        error: new Error(
          `Missing required fields: ${missingFields.join(", ")}`,
        ),
      };
    }

    // Generate a slug for the resume
    const baseSlug = (resumeData.title || "resume")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Add a random string to make the slug unique
    const randomString = Math.random().toString(36).substring(2, 8);
    const slug = `${baseSlug}-${randomString}`;

    // Ensure all required fields are present
    const completeResumeData = {
      ...resumeData,
      slug,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      views: 0,
      contacts: 0,
      // Ensure these fields are properly set
      firstname: resumeData.firstname || "",
      lastname: resumeData.lastname || "",
      fullname:
        resumeData.fullname ||
        `${resumeData.firstname || ""} ${resumeData.lastname || ""}`.trim(),
      title: resumeData.title || "",
      bio: resumeData.bio || "",
      location: resumeData.location || "",
      email: resumeData.email || "",
      phone: resumeData.phone || "",
      skills: Array.isArray(resumeData.skills) ? resumeData.skills : [],
      education: Array.isArray(resumeData.education)
        ? resumeData.education
        : [],
      experience: Array.isArray(resumeData.experience)
        ? resumeData.experience
        : [],
      socialmedia: resumeData.socialmedia || {},
      attachments: Array.isArray(resumeData.attachments)
        ? resumeData.attachments
        : [],
    };

    console.log(
      "[API] Inserting resume with complete data:",
      JSON.stringify(completeResumeData, null, 2),
    );
    console.log(
      "[API] Supabase URL:",
      process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
    );

    // Log the user_id before insertion to verify it's being passed correctly
    console.log(
      "[API] Inserting resume with user_id:",
      completeResumeData.user_id,
    );

    const { data, error } = await supabase
      .from("resumes")
      .insert([completeResumeData])
      .select()
      .single();

    if (error) {
      console.error("[API] Error inserting resume into database:", error);
      console.error("[API] Error code:", error.code);
      console.error("[API] Error message:", error.message);
      console.error("[API] Error details:", error.details);
      throw error;
    }

    console.log("[API] Resume created successfully with ID:", data?.id);
    console.log("[API] Created resume data:", JSON.stringify(data, null, 2));
    return { data, error: null };
  } catch (error) {
    console.error("[API] Error creating resume:", error);
    return { data: null, error };
  }
}

export async function getResumeById(
  id: string,
): Promise<{ data: Resume | null; error: any }> {
  try {
    // Try by UUID first
    const { data: uuidData, error: uuidError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (uuidData) {
      return { data: uuidData, error: null };
    }

    // Try by slug
    const { data: slugData, error: slugError } = await supabase
      .from("resumes")
      .select("*")
      .eq("slug", id)
      .maybeSingle();

    if (slugData) {
      return { data: slugData, error: null };
    }

    // Try by name search as last resort
    const { data: nameData, error: nameError } = await supabase
      .from("resumes")
      .select("*")
      .or(
        `firstname.ilike.%${id}%,lastname.ilike.%${id}%,fullname.ilike.%${id}%`,
      )
      .limit(1)
      .maybeSingle();

    return {
      data: nameData,
      error: nameData ? null : nameError || new Error("Resume not found"),
    };
  } catch (error) {
    console.error("Error fetching resume:", error);
    return { data: null, error };
  }
}

export async function getUserResumes(
  userId: string,
): Promise<{ data: Resume[] | null; error: any }> {
  try {
    console.log("Getting resumes for user ID:", userId);

    // First check if the resumes table exists
    const { error: tableError } = await supabase
      .from("resumes")
      .select("count")
      .limit(1);

    if (tableError) {
      console.error("Error checking resumes table:", tableError);
      if (tableError.code === "42P01") {
        // Table doesn't exist
        return { data: [], error: null }; // Return empty array instead of error
      }
    }

    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error in getUserResumes query:", error);
      return { data: null, error };
    }

    console.log(`Found ${data?.length || 0} resumes for user ${userId}`);
    return { data: data || [], error: null };
  } catch (error) {
    console.error("[API] Error fetching user resumes:", error);
    console.error(
      "[API] Error details:",
      JSON.stringify(error, Object.getOwnPropertyNames(error)),
    );
    console.log("[API] ========== GET USER RESUMES ERROR ==========");
    return { data: null, error };
  }
}

export async function updateResume(
  id: string,
  resumeData: Partial<Resume>,
): Promise<{ data: Resume | null; error: any }> {
  try {
    const updateData = {
      ...resumeData,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("resumes")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error updating resume:", error);
    return { data: null, error };
  }
}

export async function deleteResume(
  id: string,
): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await supabase.from("resumes").delete().eq("id", id);

    return { success: !error, error };
  } catch (error) {
    console.error("Error deleting resume:", error);
    return { success: false, error };
  }
}

export async function incrementResumeViews(
  id: string,
): Promise<{ success: boolean; error: any }> {
  try {
    // First get the current view count
    const { data: resume, error: fetchError } = await supabase
      .from("resumes")
      .select("views")
      .eq("id", id)
      .single();

    if (fetchError) {
      return { success: false, error: fetchError };
    }

    // Increment the view count
    const { error: updateError } = await supabase
      .from("resumes")
      .update({ views: (resume.views || 0) + 1 })
      .eq("id", id);

    return { success: !updateError, error: updateError };
  } catch (error) {
    console.error("Error incrementing resume views:", error);
    return { success: false, error };
  }
}

export async function searchResumes(
  query: string,
  filters: any = {},
): Promise<{ data: Resume[] | null; error: any }> {
  try {
    let supabaseQuery = supabase.from("resumes").select("*");

    // Apply text search if provided
    if (query) {
      supabaseQuery = supabaseQuery.or(
        `title.ilike.%${query}%,bio.ilike.%${query}%,fullname.ilike.%${query}%,skills.cs.{${query}}`,
      );
    }

    // Apply filters
    if (filters.location) {
      supabaseQuery = supabaseQuery.ilike("location", `%${filters.location}%`);
    }

    if (filters.skills && filters.skills.length > 0) {
      // For each skill, check if it's in the skills array
      filters.skills.forEach((skill: string) => {
        supabaseQuery = supabaseQuery.contains("skills", [skill]);
      });
    }

    // Order by created_at
    supabaseQuery = supabaseQuery.order("created_at", { ascending: false });

    const { data, error } = await supabaseQuery;

    return { data, error };
  } catch (error) {
    console.error("Error searching resumes:", error);
    return { data: null, error };
  }
}

// File upload functions
export async function uploadProfilePhoto(
  file: File,
  userId: string,
): Promise<{ url: string | null; error: any }> {
  try {
    console.log("Uploading profile photo for user:", userId);
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
      .from("resume_photos")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("Error uploading profile photo:", error);
      throw error;
    }

    const { data } = supabase.storage
      .from("resume_photos")
      .getPublicUrl(filePath);

    console.log("Profile photo uploaded successfully:", data.publicUrl);
    return { url: data.publicUrl, error: null };
  } catch (error) {
    console.error("Error uploading profile photo:", error);
    return { url: null, error };
  }
}

export async function uploadResumeCV(
  file: File,
  userId: string,
): Promise<{ url: string | null; error: any }> {
  try {
    const fileName = `${userId}-${Date.now()}.pdf`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
      .from("resume_cvs")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage.from("resume_cvs").getPublicUrl(filePath);

    return { url: data.publicUrl, error: null };
  } catch (error) {
    console.error("Error uploading resume CV:", error);
    return { url: null, error };
  }
}
