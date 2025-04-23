"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  Mail,
  Phone,
  ExternalLink,
  MapPin,
  Calendar,
  Loader2,
} from "lucide-react";
import { getResumeById, incrementResumeViews } from "@/lib/api";
import { Resume } from "@/types/database";
import { getCurrentUser } from "@/lib/auth-helpers";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ResumePageClient() {
  const params = useParams();
  const id = params.id as string;
  const [resume, setResume] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { t, dir } = useLanguage();

  useEffect(() => {
    // Check if user is logged in
    const checkAuthStatus = async () => {
      try {
        const { user } = await getCurrentUser();
        setIsLoggedIn(!!user);
      } catch (err) {
        console.error("Error checking auth status:", err);
        setIsLoggedIn(false);
      }
    };

    const fetchResume = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await getResumeById(id);

        if (error) {
          throw error;
        }

        if (!data) {
          notFound();
        }

        setResume(data);

        // Increment view count
        await incrementResumeViews(data.id);
      } catch (err: any) {
        console.error("Error fetching resume:", err);
        setError("Failed to load resume. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
    fetchResume();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 bg-[#f1f8f9] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#00acc1] mb-4" />
          <p className="text-[#18515b]">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="container mx-auto py-8 px-4 bg-[#f1f8f9] min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || "Resume not found"}</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild>
              <a href="/search">Back to Search</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 bg-[#f1f8f9]">
      <Card className="w-full max-w-5xl mx-auto shadow-lg">
        <CardHeader className="pb-0">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <Avatar className="w-24 h-24 border-2 border-[#00acc1]">
              <AvatarFallback className="bg-[#18515b] text-white text-xl">
                {(
                  (resume.fullname || resume.firstname || "") +
                  " " +
                  (resume.lastname || "")
                )
                  .trim()
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-3xl font-bold text-[#18515b]">
                {resume.fullname ||
                  `${resume.firstname || ""} ${resume.lastname || ""}`}
              </CardTitle>
              <CardDescription className="text-xl mt-1 text-[#00acc1]">
                {resume.title}
              </CardDescription>
              {resume.created_at && (
                <div className="text-sm text-gray-500 mt-1">
                  {t("dashboard.created")}:{" "}
                  {new Date(resume.created_at).toLocaleDateString()} •
                  {t("dashboard.updated")}:{" "}
                  {resume.updated_at
                    ? new Date(resume.updated_at).toLocaleDateString()
                    : new Date(resume.created_at).toLocaleDateString()}
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  {resume.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-1" />
                  {resume.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-1" />
                  {resume.phone}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="bg-[#18515b] hover:bg-[#00acc1]" asChild>
                <a href={`mailto:${resume.email}`}>
                  <Mail className="mr-2 h-4 w-4" /> {t("resume.contactperson")}{" "}
                  {resume.firstname ||
                    resume.fullname?.split(" ")[0] ||
                    "Professional"}
                </a>
              </Button>
              <Button
                variant="outline"
                className="border-[#00acc1] text-[#00acc1] hover:bg-[#f1f8f9]"
                onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url);
                  alert("Resume link copied to clipboard!");
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                {t("resume.share")}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="mt-6">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="about"> {t("resume.about")}</TabsTrigger>
              <TabsTrigger value="experience">
                {t("resume.experience")}
              </TabsTrigger>
              <TabsTrigger value="education">
                {t("resume.education")}
              </TabsTrigger>
              <TabsTrigger value="portfolio">
                {t("resume.portfolio")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="mt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#18515b] mb-2">
                    {t("resume.professionalSummary")}
                  </h3>
                  <p className="text-gray-700">{resume.bio}</p>

                  {resume.specialistprofile && (
                    <div className="mt-4">
                      <h4 className="text-md font-medium text-[#00acc1] mb-2">
                        {t("resume.specialistProfile")}
                      </h4>
                      <p className="text-gray-700">
                        {resume.specialistprofile}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#18515b] mb-2">
                    {t("resume.personalInformation")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resume.nationality && (
                      <div className="flex items-center">
                        <span className="font-medium mr-2">
                          {" "}
                          {t("resume.nationality")}:
                        </span>
                        <span>{resume.nationality}</span>
                      </div>
                    )}
                    {resume.age && (
                      <div className="flex items-center">
                        <span className="font-medium mr-2">
                          {" "}
                          {t("resume.age")}:
                        </span>
                        <span>{resume.age}</span>
                      </div>
                    )}
                    {resume.yearsofexperience && (
                      <div className="flex items-center">
                        <span className="font-medium mr-2">
                          {" "}
                          {t("resume.experience")}:
                        </span>
                        <span>
                          {resume.yearsofexperience}{" "}
                          {Number(resume.yearsofexperience) === 1
                            ? "year"
                            : "years"}
                        </span>
                      </div>
                    )}
                    {resume.educationlevel && (
                      <div className="flex items-center">
                        <span className="font-medium mr-2">
                          {t("resume.educationLevel")}:
                        </span>
                        <span>{resume.educationlevel}</span>
                      </div>
                    )}
                  </div>
                </div>

                {resume.skills && resume.skills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-[#18515b] mb-2">
                      {t("resume.skills")}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {resume.skills.map((skill: string, index: number) => (
                        <Badge
                          key={index}
                          className="bg-[#00acc1] hover:bg-[#18515b]"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {resume.certifications && resume.certifications.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-[#18515b] mb-2">
                      {t("resume.certifications")}
                    </h3>
                    <div className="space-y-2">
                      {resume.certifications.map((cert: any, index: number) => (
                        <div key={index} className="flex items-center">
                          <div className="w-4 h-4 rounded-full bg-[#00acc1] mr-2"></div>
                          <span className="font-medium">{cert.name}</span>
                          {cert.year && (
                            <span className="ml-2 text-sm text-gray-500">
                              ({cert.year})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-[#18515b] mb-2">
                    {t("resume.contactInformation")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 mr-2 text-[#00acc1]" />
                      <a
                        href={`mailto:${resume.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {resume.email}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 mr-2 text-[#00acc1]" />
                      <a
                        href={`tel:${resume.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {resume.phone}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-[#00acc1]" />
                      <span>{resume.location}</span>
                    </div>
                    {resume.website && (
                      <div className="flex items-center">
                        <ExternalLink className="h-5 w-5 mr-2 text-[#00acc1]" />
                        <a
                          href={
                            resume.website.startsWith("http")
                              ? resume.website
                              : `https://${resume.website}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {resume.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="experience" className="mt-6">
              <div className="space-y-6">
                {resume.experience && resume.experience.length > 0 ? (
                  resume.experience.map((exp: any, index: number) => (
                    <div
                      key={index}
                      className="border-l-2 border-[#00acc1] pl-4 pb-6"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                        <h3 className="text-lg font-semibold text-[#18515b]">
                          {exp.position}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {exp.duration ||
                            `${exp.startDate || ""} - ${exp.current ? "Present" : exp.endDate || ""}`}
                        </div>
                      </div>
                      <h4 className="text-md font-medium text-[#00acc1] mb-2">
                        {exp.company}
                      </h4>
                      {exp.location && (
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          {exp.location}
                        </div>
                      )}
                      <p className="text-gray-700">{exp.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {t("resume.noExperienceInfo")}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="education" className="mt-6">
              <div className="space-y-6">
                {resume.education && resume.education.length > 0 ? (
                  resume.education.map((edu: any, index: number) => (
                    <div
                      key={index}
                      className="border-l-2 border-[#00acc1] pl-4 pb-6"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                        <h3 className="text-lg font-semibold text-[#18515b]">
                          {edu.institution}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {edu.year}
                        </div>
                      </div>
                      <h4 className="text-md font-medium text-[#00acc1]">
                        {edu.degree}
                      </h4>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {t("resume.noEducationInfo")}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="portfolio" className="mt-6">
              <div className="space-y-6">
                {(resume.attachments && resume.attachments.length > 0) ||
                (resume.portfolio_images &&
                  resume.portfolio_images.length > 0) ? (
                  <>
                    {resume.attachments &&
                      resume.attachments.length > 0 &&
                      resume.attachments.some(
                        (att: any) => att.type === "pdf",
                      ) && (
                        <div>
                          <h3 className="text-lg font-semibold text-[#18515b] mb-4">
                            {t("resume.documents")}
                          </h3>
                          {resume.attachments
                            .filter((att: any) => att.type === "pdf")
                            .map((doc: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center p-3 border rounded-md mb-2 hover:bg-gray-50"
                              >
                                <Download className="h-5 w-5 mr-2 text-[#00acc1]" />
                                <span className="flex-1">{doc.name}</span>
                                <Button variant="outline" size="sm" asChild>
                                  <a href={doc.url} download>
                                    {t("resume.download")}
                                  </a>
                                </Button>
                              </div>
                            ))}
                        </div>
                      )}

                    <div>
                      <h3 className="text-lg font-semibold text-[#18515b] mb-4">
                        {t("resume.workSamples")}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Display portfolio images from attachments (legacy format) */}
                        {resume.attachments &&
                          resume.attachments
                            .filter((att: any) => att.type === "images")
                            .flatMap((att: any) => att.images || [])
                            .map((image: string, index: number) => (
                              <div
                                key={`attachment-${index}`}
                                className="overflow-hidden rounded-md border"
                              >
                                <img
                                  src={image}
                                  alt={`Work sample ${index + 1}`}
                                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            ))}

                        {/* Display portfolio images from the new portfolio_images field */}
                        {resume.portfolio_images &&
                          resume.portfolio_images.map(
                            (image: string, index: number) => (
                              <div
                                key={`portfolio-${index}`}
                                className="overflow-hidden rounded-md border"
                              >
                                <img
                                  src={image}
                                  alt={`Portfolio image ${index + 1}`}
                                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            ),
                          )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {t("resume.noPortfolioItems")}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" asChild>
            <a href={isLoggedIn ? "/dashboard" : "/search"}>
              {isLoggedIn
                ? t("resume.backToProfessionalDashboard")
                : t("resume.backToSearch")}
            </a>
          </Button>
          <div className="flex gap-2">
            <Button className="bg-[#18515b] hover:bg-[#00acc1]" asChild>
              <a href={`mailto:${resume.email}`}>
                <Mail className="mr-2 h-4 w-4" /> {t("resume.contactperson")}{" "}
                {resume.firstname ||
                  resume.fullname?.split(" ")[0] ||
                  "Professional"}
              </a>
            </Button>
            <Button
              variant="outline"
              className="border-[#00acc1] text-[#00acc1] hover:bg-[#f1f8f9]"
              onClick={() => {
                const url = window.location.href;
                navigator.clipboard.writeText(url);
                alert("Resume link copied to clipboard!");
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              {t("resume.share")}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
