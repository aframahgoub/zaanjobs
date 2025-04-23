"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Plus,
  Upload,
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  Calendar,
  MapPin,
  Briefcase,
  Instagram,
  Facebook,
  Youtube,
  Link as LinkIcon,
} from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import {
  getCurrentUser,
  verifyUserExists,
  ensureUserProfile,
} from "@/lib/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { createResume, getResumeById, updateResume } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from("resumes")
      .select("count")
      .limit(1);
    if (error) {
      console.error("Supabase connection check failed:", error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.error("Supabase connection check exception:", err);
    return { success: false, error: err };
  }
};

export default function CreateResumePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");
  const [portfolioImages, setPortfolioImages] = useState<File[]>([]);
  const [portfolioImagePreviews, setPortfolioImagePreviews] = useState<string[]>([]);
  const [attachments, setAttachments] =useState<Array<{ name: string, url: string }>>([]);
  const [newAttachment, setNewAttachment] = useState({ name: "", url: "" });
  const photoInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [resumeId, setResumeId] = useState<string>("");

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    title: "",
    bio: "",
    location: "",
    email: "",
    phone: "",
    website: "",
    specialistProfile: "",
    nationality: "",
    age: "",
    yearsOfExperience: "",
    educationLevel: "High school",
  });

  const [socialMedia, setSocialMedia] = useState({
    instagram: "",
    facebook: "",
    tiktok: "",
    pinterest: "",
    youtube: "",
  });

  const [education, setEducation] = useState<Array<any>>([]);

  const [certifications, setCertifications] = useState<
    Array<{ name: string; year: string }>
  >([{ name: "", year: "" }]);

  const [experience, setExperience] = useState<
    Array<{
      company: string;
      position: string;
      location: string;
      startDate: string;
      endDate: string;
      current: boolean;
      description: string;
    }>
  >([
    {
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    },
  ]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFileError("Photo file size must be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFileError("Please upload an image file");
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setFileError("CV file size must be less than 10MB");
      return;
    }

    if (file.type !== "application/pdf") {
      setFileError("Please upload a PDF file");
      return;
    }

    setCvFile(file);
  };

  const handlePortfolioImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setFileError("");
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: File[] = [];
    const newPreviews: string[] = [];

    // Convert FileList to array and process each file
    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setFileError("Portfolio image file size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setFileError("Please upload only image files for portfolio");
        return;
      }

      newImages.push(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === newImages.length) {
          setPortfolioImagePreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setPortfolioImages((prev) => [...prev, ...newImages]);
  };

  const removePortfolioImage = (index: number) => {
    setPortfolioImages((prev) => prev.filter((_, i) => i !== index));
    setPortfolioImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  useEffect(() => {
    const checkForEditMode = async () => {
      try {
        // Get edit ID from URL params
        const editId = searchParams?.get("edit");
        // Get from localStorage as fallback
        const storedEditId =
          typeof window !== "undefined"
            ? localStorage.getItem("resumeToEdit")
            : null;

        const idToEdit = editId || storedEditId;
        console.log("Checking for edit mode with ID:", idToEdit);

        if (idToEdit) {
          console.log(
            "Edit mode detected, fetching resume data for ID:",
            idToEdit,
          );
          setIsEditMode(true);
          setResumeId(idToEdit);
          setIsLoading(true);

          // Fetch resume data using the API function
          const { data: resumeData, error } = await getResumeById(idToEdit);

          if (error) {
            console.error("Error fetching resume for editing:", error);
            setError("Failed to load resume data for editing.");
            return;
          }

          if (resumeData) {
            console.log("Resume data fetched successfully:", resumeData);

            // Update form data with resume data
            setFormData({
              firstname: resumeData.firstname || "",
              lastname: resumeData.lastname || "",
              title: resumeData.title || "",
              bio: resumeData.bio || "",
              location: resumeData.location || "",
              email: resumeData.email || "",
              phone: resumeData.phone || "",
              website: resumeData.website || "",
              specialistProfile: resumeData.specialistprofile || "",
              nationality: resumeData.nationality || "",
              age: resumeData.age?.toString() || "",
              yearsOfExperience: resumeData.yearsofexperience?.toString() || "",
              educationLevel: resumeData.educationlevel || "High school",
            });

            // Set skills
            if (Array.isArray(resumeData.skills)) {
              setSkills(resumeData.skills);
            }

            // Set photo preview if available
            if (resumeData.photo) {
              setPhotoPreview(resumeData.photo);
            }

            // Set social media data if available
            if (resumeData.socialmedia) {
              setSocialMedia({
                instagram: resumeData.socialmedia.instagram || "",
                facebook: resumeData.socialmedia.facebook || "",
                tiktok: resumeData.socialmedia.tiktok || "",
                pinterest: resumeData.socialmedia.pinterest || "",
                youtube: resumeData.socialmedia.youtube || "",
              });
            }

            // Set attachments if available
            if (Array.isArray(resumeData.attachments)) {
              setAttachments(resumeData.attachments);
            }

            // Set education if available
            if (
              Array.isArray(resumeData.education) &&
              resumeData.education.length > 0
            ) {
              setEducation(resumeData.education);
            }

            // Set experience if available
            if (
              Array.isArray(resumeData.experience) &&
              resumeData.experience.length > 0
            ) {
              setExperience(resumeData.experience);
            }

            // Set certifications if available
            if (
              Array.isArray(resumeData.certifications) &&
              resumeData.certifications.length > 0
            ) {
              setCertifications(resumeData.certifications);
            }

            console.log("Resume data loaded for editing:", resumeData.id);
          }
        }
      } catch (err) {
        console.error("Error in edit mode check:", err);
        setError("Failed to initialize edit mode.");
      } finally {
        setIsLoading(false);
      }
    };

    checkForEditMode();

    // Clean up localStorage on component unmount
    return () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("resumeToEdit");
      }
    };
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setFileError("");

    try {
      const connectionCheck = await checkSupabaseConnection();
      if (!connectionCheck.success) {
        console.error("Supabase connection failed:", connectionCheck.error);
        throw new Error(
          "Database connection failed. Please check your internet connection and try again.",
        );
      }

      const user = await getCurrentUser();

      if (!user) {
        console.error("No authenticated user found");
        throw new Error(
          "You must be logged in to create a resume. Please log in and try again.",
        );
      }

      const userExists = await verifyUserExists(user.id);
      if (!userExists) {
        console.log("User not found in database, creating profile");
        await ensureUserProfile(user.id, user.email || "");
      }

      console.log("User authenticated and verified:", user.id);

      try {
        const setupResponse = await fetch("/api/setup-storage", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!setupResponse.ok) {
          console.warn("Storage setup API call failed, but continuing");
        } else {
          console.log("Storage buckets verified/created successfully");
        }
      } catch (setupError) {
        console.warn("Error calling storage setup endpoint:", setupError);
      }

      try {
        const { data: photoBucket, error: photoError } =
          await supabase.storage.getBucket("resume_photos");
        const { data: cvBucket, error: cvError } =
          await supabase.storage.getBucket("resume_cvs");

        if (photoError || cvError) {
          console.log("At least one bucket doesn't exist, creating them");

          if (photoError) {
            const { error } = await supabase.storage.createBucket(
              "resume_photos",
              {
                public: true,
                fileSizeLimit: 5242880,
              },
            );
            if (error)
              console.error("Failed to create resume_photos bucket:", error);
            else console.log("Created resume_photos bucket");
          }

          if (cvError) {
            const { error } = await supabase.storage.createBucket(
              "resume_cvs",
              {
                public: true,
                fileSizeLimit: 10485760,
              },
            );
            if (error)
              console.error("Failed to create resume_cvs bucket:", error);
            else console.log("Created resume_cvs bucket");
          }
        } else {
          console.log("Both storage buckets exist");
        }
      } catch (bucketError) {
        console.error("Storage bucket verification error:", bucketError);
      }

      let photoUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.title.replace(/\s+/g, "")}`;
      if (photoFile) {
        try {
          const photoFileName = `${user.id}-${Date.now()}-photo${photoFile.name.substring(photoFile.name.lastIndexOf("."))}`;
          const { data: photoData, error: photoError } = await supabase.storage
            .from("resume_photos")
            .upload(photoFileName, photoFile, {
              cacheControl: "3600",
              upsert: true,
            });

          if (photoError) {
            console.error("Error uploading photo:", photoError);
            throw new Error("Failed to upload photo. Please try again.");
          }

          const { data: photoUrlData } = supabase.storage
            .from("resume_photos")
            .getPublicUrl(photoFileName);

          if (photoUrlData) {
            photoUrl = photoUrlData.publicUrl;
            console.log("Photo uploaded successfully:", photoUrl);
          }
        } catch (photoUploadError) {
          console.error("Photo upload process failed:", photoUploadError);
          console.log("Using default avatar instead");
        }
      } else if (photoPreview && photoPreview.startsWith("http")) {
        // Keep existing photo URL if there's a preview but no new file
        photoUrl = photoPreview;
      }

      let cvUrl = "";
      if (cvFile) {
        try {
          const cvFileName = `${user.id}-${Date.now()}-cv.pdf`;
          const { data: cvData, error: cvError } = await supabase.storage
            .from("resume_cvs")
            .upload(cvFileName, cvFile, {
              cacheControl: "3600",
              upsert: true,
            });

          if (cvError) {
            console.error("Error uploading CV:", cvError);
            throw new Error("Failed to upload CV. Please try again.");
          }

          const { data: cvUrlData } = supabase.storage
            .from("resume_cvs")
            .getPublicUrl(cvFileName);

          if (cvUrlData) {
            cvUrl = cvUrlData.publicUrl;
            console.log("CV uploaded successfully:", cvUrl);
          }
        } catch (cvUploadError) {
          console.error("CV upload process failed:", cvUploadError);
        }
      }

      // Upload portfolio images if any
      const portfolioUrls: string[] = [];
      if (portfolioImages.length > 0) {
        try {
          for (const portfolioImage of portfolioImages) {
            const portfolioFileName = `${user.id}-${Date.now()}-portfolio-${portfolioUrls.length}${portfolioImage.name.substring(portfolioImage.name.lastIndexOf("."))}`;
            const { data: portfolioData, error: portfolioError } =
              await supabase.storage
                .from("resume_photos")
                .upload(portfolioFileName, portfolioImage, {
                  cacheControl: "3600",
                  upsert: true,
                });

            if (portfolioError) {
              console.error("Error uploading portfolio image:", portfolioError);
              continue;
            }

            const { data: portfolioUrlData } = supabase.storage
              .from("resume_photos")
              .getPublicUrl(portfolioFileName);

            if (portfolioUrlData) {
              portfolioUrls.push(portfolioUrlData.publicUrl);
              console.log(
                "Portfolio image uploaded successfully:",
                portfolioUrlData.publicUrl,
              );
            }
          }
        } catch (portfolioUploadError) {
          console.error(
            "Portfolio upload process failed:",
            portfolioUploadError,
          );
        }
      }

      const resumeData = {
        user_id: user.id,
        firstname: formData.firstname,
        lastname: formData.lastname,
        fullname: `${formData.firstname} ${formData.lastname}`.trim(),
        title: formData.title,
        bio: formData.bio,
        location: formData.location,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        specialistprofile: formData.specialistProfile,
        skills: skills.length > 0 ? skills : [],
        education: education.filter((e) => e.institution && e.degree),
        experience: experience.filter((e) => e.company && e.position),
        socialmedia: socialMedia,
        attachments: attachments,
        photo: photoUrl,
        cv_url: cvUrl,
        nationality: formData.nationality,
        age: formData.age,
        yearsofexperience: formData.yearsOfExperience,
        educationlevel: formData.educationLevel,
        certifications: certifications.filter((c) => c.name),
        portfolio_images: portfolioUrls,
      };

      const requiredFields = [
        "user_id",
        "firstname",
        "lastname",
        "title",
        "bio",
        "email",
      ];
      const missingFields = requiredFields.filter(
        (field) => !resumeData[field],
      );

      if (missingFields.length > 0) {
        console.error(`Missing required fields: ${missingFields.join(", ")}`);
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      let data;

      if (isEditMode && resumeId) {
        // Update existing resume
        console.log("Updating existing resume with ID:", resumeId);
        const { data: updatedData, error } = await updateResume(
          resumeId,
          resumeData,
        );

        if (error) {
          console.error("Error updating resume:", error);
          throw new Error(
            error.message || "Failed to update resume. Please try again.",
          );
        }

        if (!updatedData) {
          console.error("No data returned from resume update");
          throw new Error(
            "No data returned from resume update. Please try again.",
          );
        }

        console.log("Resume updated successfully with ID:", updatedData.id);
        data = updatedData;
      } else {
        // Create new resume
        console.log("Creating new resume");
        const { data: createdData, error: createError } =
          await createResume(resumeData);

        if (createError) {
          console.error("Error creating resume:", createError);
          throw new Error(
            createError.message || "Failed to create resume. Please try again.",
          );
        }

        if (!createdData) {
          console.error("No data returned from resume creation");
          throw new Error(
            "No data returned from resume creation. Please try again.",
          );
        }

        console.log("Resume created successfully with ID:", createdData.id);
        localStorage.setItem("lastCreatedResumeId", createdData.id);
        localStorage.setItem("lastCreatedResumeTime", new Date().toISOString());
        data = createdData;
      }

      console.log("Waiting for database to update");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clear localStorage after successful edit
      if (isEditMode && typeof window !== "undefined") {
        localStorage.removeItem("resumeToEdit");
        console.log(
          "Cleared resumeToEdit from localStorage after successful edit",
        );
      }

      console.log("Redirecting to dashboard");
      router.push("/dashboard");
    } catch (err: any) {
      console.error("[CREATE-RESUME] Error creating resume:", err);
      console.error("[CREATE-RESUME] Error message:", err.message);
      console.error("[CREATE-RESUME] Error stack:", err.stack);
      console.error(
        "[CREATE-RESUME] Error details:",
        JSON.stringify(err, Object.getOwnPropertyNames(err)),
      );
      console.log(
        "[CREATE-RESUME] ========== FORM SUBMISSION ERROR ==========",
      );
      setError(err.message || "Failed to create resume. Please try again.");
    } finally {
      console.log("[CREATE-RESUME] Form submission process completed");
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
            {t("createResume.back")}
          </Button>
          <h1 className="text-2xl font-bold text-[#18515b]">
            {isEditMode
              ? t("createResume.editResume")
              : t("createResume.createResume")}
          </h1>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {fileError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
            {fileError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h2 className="text-xl font-semibold text-[#18515b] mb-4">
              {t("createResume.personalInformation")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">
                  {t("createResume.firstName")} *
                </Label>
                <Input
                  id="firstname"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">{t("createResume.lastName")} *</Label>
                <Input
                  id="lastname"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="title">
                  {t("createResume.professionalTitle")} *
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder={t("createResume.makeupArtist")}
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">{t("resume.location")}</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder={t("createResume.locationExamp")}
                />
              </div>
              <div>
                <Label htmlFor="nationality">{t("resume.nationality")}</Label>
                <Input
                  id="nationality"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="age">{t("resume.age")}</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="yearsOfExperience">
                  {t("createResume.yearsOfExperience")}
                </Label>
                <Input
                  id="yearsOfExperience"
                  name="yearsOfExperience"
                  type="number"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="educationLevel">
                  {t("createResume.educationLevel")}
                </Label>
                <Select
                  value={formData.educationLevel}
                  onValueChange={(value) =>
                    setFormData({ ...formData, educationLevel: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High school">
                      {t("createResume.highSchool")}
                    </SelectItem>
                    <SelectItem value="Associate's degree">
                      {t("createResume.associateDegree")}
                    </SelectItem>
                    <SelectItem value="Bachelor's degree">
                      {t("createResume.bachelorDegree")}
                    </SelectItem>
                    <SelectItem value="Master's degree">
                      {t("createResume.masterDegree")}
                    </SelectItem>
                    <SelectItem value="Doctorate">
                      {t("createResume.doctorate")}
                    </SelectItem>
                    <SelectItem value="Vocational training">
                      {t("createResume.vocationalTraining")}
                    </SelectItem>
                    <SelectItem value="Other">
                      {t("createResume.other")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-xl font-semibold text-[#18515b] mb-4">
              {t("resume.contactInformation")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">{t("auth.email")} *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">{t("createResume.phone")} *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="website">{t("createResume.website")}</Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="e.g. https://yourportfolio.com"
                />
              </div>
              <div>
                <Label htmlFor="specialistProfile">
                  {t("createResume.specialistProfileURL")}
                </Label>
                <Input
                  id="specialistProfile"
                  name="specialistProfile"
                  value={formData.specialistProfile}
                  onChange={handleChange}
                  placeholder="e.g. https://specialist-platform.com/profile"
                />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h2 className="text-xl font-semibold text-[#18515b] mb-4">
              {t("createResume.socialMedia")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Instagram className="h-5 w-5 mr-2 text-[#18515b]" />
                <Input
                  placeholder={t("createResume.instagramURL")}
                  value={socialMedia.instagram}
                  onChange={(e) =>
                    setSocialMedia({
                      ...socialMedia,
                      instagram: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex items-center">
                <Facebook className="h-5 w-5 mr-2 text-[#18515b]" />
                <Input
                  placeholder={t("createResume.facebookURL")}
                  value={socialMedia.facebook}
                  onChange={(e) =>
                    setSocialMedia({
                      ...socialMedia,
                      facebook: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex items-center">
                <Youtube className="h-5 w-5 mr-2 text-[#18515b]" />
                <Input
                  placeholder={t("createResume.youtubeURL")}
                  value={socialMedia.youtube}
                  onChange={(e) =>
                    setSocialMedia({
                      ...socialMedia,
                      youtube: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex items-center">
                <LinkIcon className="h-5 w-5 mr-2 text-[#18515b]" />
                <Input
                  placeholder={t("createResume.tiktokURL")}
                  value={socialMedia.tiktok}
                  onChange={(e) =>
                    setSocialMedia({ ...socialMedia, tiktok: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center">
                <LinkIcon className="h-5 w-5 mr-2 text-[#18515b]" />
                <Input
                  placeholder={t("createResume.pinterestURL")}
                  value={socialMedia.pinterest}
                  onChange={(e) =>
                    setSocialMedia({
                      ...socialMedia,
                      pinterest: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <h2 className="text-xl font-semibold text-[#18515b] mb-4">
              {t("createResume.professionalBio")}
            </h2>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder={t("createResume.bioPlaceholder")}
              className="min-h-[150px]"
              required
            />
          </div>

          {/* Experience */}
          <div>
            <h2 className="text-xl font-semibold text-[#18515b] mb-4">
              {t("createResume.workExperience")}
            </h2>
            {experience.map((exp, index) => (
              <div
                key={index}
                className="mb-6 p-4 border rounded-md bg-gray-50"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor={`company-${index}`}>
                      {t("homepage.salonName")}
                    </Label>
                    <Input
                      id={`company-${index}`}
                      value={exp.company}
                      onChange={(e) => {
                        const newExperience = [...experience];
                        newExperience[index].company = e.target.value;
                        setExperience(newExperience);
                      }}
                      placeholder={t("homepage.companyOrSalon")}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`position-${index}`}>
                      {t("resume.position")}
                    </Label>
                    <Input
                      id={`position-${index}`}
                      value={exp.position}
                      onChange={(e) => {
                        const newExperience = [...experience];
                        newExperience[index].position = e.target.value;
                        setExperience(newExperience);
                      }}
                      placeholder={t("createResume.yourjobtitle")}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`location-${index}`}>
                      {t("createResume.location")}
                    </Label>
                    <Input
                      id={`location-${index}`}
                      value={exp.location}
                      onChange={(e) => {
                        const newExperience = [...experience];
                        newExperience[index].location = e.target.value;
                        setExperience(newExperience);
                      }}
                      placeholder={t("createResume.cityOrCountry")}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`startDate-${index}`}>
                      {t("createResume.startDate")}
                    </Label>
                    <Input
                      id={`startDate-${index}`}
                      value={exp.startDate}
                      onChange={(e) => {
                        const newExperience = [...experience];
                        newExperience[index].startDate = e.target.value;
                        setExperience(newExperience);
                      }}
                      placeholder="MM/YYYY"
                    />
                  </div>
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <Label htmlFor={`endDate-${index}`}>
                        {t("createResume.endDate")}
                      </Label>
                      <Input
                        id={`endDate-${index}`}
                        value={exp.endDate}
                        onChange={(e) => {
                          const newExperience = [...experience];
                          newExperience[index].endDate = e.target.value;
                          setExperience(newExperience);
                        }}
                        placeholder="MM/YYYY"
                        disabled={exp.current}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`current-${index}`}
                        checked={exp.current}
                        onChange={(e) => {
                          const newExperience = [...experience];
                          newExperience[index].current = e.target.checked;
                          setExperience(newExperience);
                        }}
                        className="h-4 w-4"
                      />
                      <Label htmlFor={`current-${index}`} className="text-sm">
                        {t("createResume.currentPosition")}
                      </Label>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor={`description-${index}`}>
                    {t("createResume.description")}
                  </Label>
                  <Textarea
                    id={`description-${index}`}
                    value={exp.description}
                    onChange={(e) => {
                      const newExperience = [...experience];
                      newExperience[index].description = e.target.value;
                      setExperience(newExperience);
                    }}
                    placeholder={t("createResume.descriptionPlaceholder")}
                    className="min-h-[100px]"
                  />
                </div>
                {experience.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4 text-red-500 border-red-200 hover:bg-red-50"
                    onClick={() => {
                      const newExperience = [...experience];
                      newExperience.splice(index, 1);
                      setExperience(newExperience);
                    }}
                  >
                    <X className="h-4 w-4 mr-1" /> {t("createResume.remove")}
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="w-full mt-2"
              onClick={() => {
                setExperience([
                  ...experience,
                  {
                    company: "",
                    position: "",
                    location: "",
                    startDate: "",
                    endDate: "",
                    current: false,
                    description: "",
                  },
                ]);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />{" "}
              {t("createResume.addAnotherExperience")}
            </Button>
          </div>

          {/* Education */}
          <div>
            <h2 className="text-xl font-semibold text-[#18515b] mb-4">
              {t("createResume.education")}
            </h2>
            {education.length === 0 && (
              <Button
                type="button"
                variant="outline"
                className="w-full mb-4"
                onClick={() => {
                  setEducation([{ institution: "", degree: "", year: "" }]);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />{" "}
                {t("createResume.addEducation")}
              </Button>
            )}
            {education.map((edu, index) => (
              <div
                key={index}
                className="mb-6 p-4 border rounded-md bg-gray-50"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor={`institution-${index}`}>
                      {t("createResume.institution")}{" "}
                    </Label>
                    <Input
                      id={`institution-${index}`}
                      value={edu.institution}
                      onChange={(e) => {
                        const newEducation = [...education];
                        newEducation[index].institution = e.target.value;
                        setEducation(newEducation);
                      }}
                      placeholder={t("createResume.institutionPlaceholder")}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`degree-${index}`}>
                      {t("resume.degreeOrCertificate")}
                    </Label>
                    <Input
                      id={`degree-${index}`}
                      value={edu.degree}
                      onChange={(e) => {
                        const newEducation = [...education];
                        newEducation[index].degree = e.target.value;
                        setEducation(newEducation);
                      }}
                      placeholder={t("createResume.degreePlaceholder")}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`year-${index}`}>
                      {t("createResume.year")}
                    </Label>
                    <Input
                      id={`year-${index}`}
                      value={edu.year}
                      onChange={(e) => {
                        const newEducation = [...education];
                        newEducation[index].year = e.target.value;
                        setEducation(newEducation);
                      }}
                      placeholder={t("createResume.yearPlaceholder")}
                    />
                  </div>
                </div>
                {education.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2 text-red-500 border-red-200 hover:bg-red-50"
                    onClick={() => {
                      const newEducation = [...education];
                      newEducation.splice(index, 1);
                      setEducation(newEducation);
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    {t("createResume.remove")}
                  </Button>
                )}
              </div>
            ))}
            {education.length > 0 && (
              <Button
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={() => {
                  setEducation([
                    ...education,
                    { institution: "", degree: "", year: "" },
                  ]);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />{" "}
                {t("createResume.addAnotherEducation")}
              </Button>
            )}
          </div>

          {/* Certifications */}
          <div>
            <h2 className="text-xl font-semibold text-[#18515b] mb-4">
              {t("createResume.certifications")}
            </h2>
            {certifications.map((cert, index) => (
              <div key={index} className="mb-4 flex gap-4">
                <div className="flex-1">
                  <Label htmlFor={`certName-${index}`}>
                    {t("createResume.certificationName")}
                  </Label>
                  <Input
                    id={`certName-${index}`}
                    value={cert.name}
                    onChange={(e) => {
                      const newCertifications = [...certifications];
                      newCertifications[index].name = e.target.value;
                      setCertifications(newCertifications);
                    }}
                    placeholder={t("createResume.CertificationPlaceholder")}
                  />
                </div>
                <div className="w-1/3">
                  <Label htmlFor={`certYear-${index}`}>
                    {t("createResume.year")}
                  </Label>
                  <Input
                    id={`certYear-${index}`}
                    value={cert.year}
                    onChange={(e) => {
                      const newCertifications = [...certifications];
                      newCertifications[index].year = e.target.value;
                      setCertifications(newCertifications);
                    }}
                    placeholder={t("createResume.certificationYear")}
                  />
                </div>
                {certifications.length > 1 && (
                  <div className="flex items-end pb-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:bg-red-50"
                      onClick={() => {
                        const newCertifications = [...certifications];
                        newCertifications.splice(index, 1);
                        setCertifications(newCertifications);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="w-full mt-2"
              onClick={() => {
                setCertifications([...certifications, { name: "", year: "" }]);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              {t("createResume.addAnotherCertification")}
            </Button>
          </div>

          {/* Portfolio */}
          <div>
            <h2 className="text-xl font-semibold text-[#18515b] mb-4">
              {t("createResume.portfolio")}
            </h2>
            <div className="mb-4">
              <Label htmlFor="portfolioImages">
                {t("createResume.portfolioImages")}
              </Label>
              <div className="mt-2 flex items-center gap-2">
                <Input
                  id="portfolioImages"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePortfolioImagesChange}
                  ref={portfolioInputRef}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => portfolioInputRef.current?.click()}
                  className="flex items-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {t("createResume.selectPortfolioImages")}
                </Button>
                <span className="text-sm text-gray-500">
                  {t("createResume.uploadPortfolioMessage")}
                </span>
              </div>
            </div>

            {portfolioImagePreviews.length > 0 && (
              <div className="mt-4">
                <h3 className="text-md font-medium text-[#00acc1] mb-2">
                  {t("createResume.portfolioPreview")}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {portfolioImagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Portfolio image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removePortfolioImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Skills */}
          <div>
            <h2 className="text-xl font-semibold text-[#18515b] mb-4">
              {t("resume.skills")}
            </h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1 bg-[#f1f8f9] text-[#18515b] hover:bg-[#e1f1f4]"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-1 rounded-full hover:bg-[#18515b] hover:text-white p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder={t("createResume.addSkill")}
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <Button
                type="button"
                onClick={addSkill}
                variant="outline"
                className="flex-shrink-0"
              >
                <Plus className="h-4 w-4 mr-1" /> {t("createResume.add")}
              </Button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full bg-[#00acc1] hover:bg-[#18515b] text-white"
              disabled={isLoading}
            >
              {isLoading
                ? isEditMode
                  ? t("createResume.savingResume")
                  : t("createResume.savingResume")
                : isEditMode
                  ? t("common.save")
                  : t("createResume.saveResume")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
