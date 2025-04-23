"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  FileText,
  BarChart,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserResumes, deleteResume } from "@/lib/api";
import { getCurrentUser, ensureUserProfile } from "@/lib/auth-helpers";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("resumes");
  const [resumes, setResumes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useLanguage();

  const fetchResumes = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { user, error: userError } = await getCurrentUser();
      if (userError || !user) {
        console.error("No authenticated user found");
        router.push("/");
        return;
      }

      await ensureUserProfile(user.id, user.email || "");

      const lastCreatedResumeId = localStorage.getItem("lastCreatedResumeId");
      const lastCreatedResumeTime = localStorage.getItem(
        "lastCreatedResumeTime",
      );

      if (lastCreatedResumeId && lastCreatedResumeTime) {
        console.log(
          "Found recently created resume in localStorage:",
          lastCreatedResumeId,
        );
        console.log("Created at:", lastCreatedResumeTime);

        const createdTime = new Date(lastCreatedResumeTime).getTime();
        const currentTime = new Date().getTime();
        const fiveMinutesInMs = 5 * 60 * 1000;

        if (currentTime - createdTime < fiveMinutesInMs) {
          console.log(
            "Resume was created recently, will check for it in the results",
          );
        } else {
          console.log("Clearing old resume creation data from localStorage");
          localStorage.removeItem("lastCreatedResumeId");
          localStorage.removeItem("lastCreatedResumeTime");
        }
      }

      console.log("Fetching resumes for user:", user.id);
      const { data, error: resumesError } = await getUserResumes(user.id);

      if (resumesError) {
        console.error("Error fetching user resumes:", resumesError);
        throw resumesError;
      }

      console.log("Resumes fetched:", data);
      if (data) {
        const formattedResumes = data.map((resume) => ({
          id: resume.id,
          title: resume.title,
          fullname:
            resume.fullname ||
            `${resume.firstname || ""} ${resume.lastname || ""}`.trim(),
          firstname: resume.firstname || "",
          lastname: resume.lastname || "",
          createdAt: resume.created_at
            ? new Date(resume.created_at).toISOString().split("T")[0]
            : "Unknown",
          updatedAt: resume.updated_at
            ? new Date(resume.updated_at).toISOString().split("T")[0]
            : "Unknown",
          views: resume.views || 0,
          contacts: resume.contacts || 0,
          skills: Array.isArray(resume.skills) ? resume.skills : [],
          photo:
            resume.photo ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${(resume.title || "resume").replace(/\s+/g, "")}`,
        }));

        if (lastCreatedResumeId) {
          const foundResume = formattedResumes.find(
            (resume) => resume.id === lastCreatedResumeId,
          );
          if (foundResume) {
            console.log(
              "Recently created resume found in fetched data:",
              foundResume,
            );
          } else {
            console.warn(
              "Recently created resume NOT found in fetched data. ID:",
              lastCreatedResumeId,
            );
          }
        }

        console.log("Formatted resumes:", formattedResumes);
        setResumes(formattedResumes);
      }
    } catch (err: any) {
      console.error("Error fetching resumes:", err);
      setError("Failed to load your resumes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();

    const autoRefreshInterval = setInterval(() => {
      console.log("Auto-refreshing resume data...");
      fetchResumes();
    }, 30000);

    return () => clearInterval(autoRefreshInterval);
  }, [router]);

  const handleDeleteResume = async (id: string) => {
    try {
      const { success, error } = await deleteResume(id);

      if (!success) {
        throw error || new Error("Failed to delete resume");
      }

      setResumes(resumes.filter((resume) => resume.id !== id));
    } catch (err: any) {
      console.error("Error deleting resume:", err);
      setError("Failed to delete resume. Please try again.");
    }
  };

  const accountStats = {
    totalViews: resumes.reduce((sum, resume) => sum + (resume.views || 0), 0),
    totalContacts: resumes.reduce(
      (sum, resume) => sum + (resume.contacts || 0),
      0,
    ),
    totalResumes: resumes.length,
    lastUpdated:
      resumes.length > 0
        ? resumes.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          )[0].updatedAt
        : "N/A",
  };

  return (
    <div className="bg-[#f1f8f9] min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[#18515b]">
            {t("dashboard.professionalDashboard")}
          </h1>
          <p className="text-gray-600 mt-2">{t("dashboard.manageResumes")}</p>
        </header>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <Tabs
          defaultValue="resumes"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="resumes" className="text-[#18515b]">
              <FileText className="mr-2 h-4 w-4" />
              {t("dashboard.yourResumes")}
            </TabsTrigger>
            <TabsTrigger value="stats" className="text-[#18515b]">
              <BarChart className="mr-2 h-4 w-4" />
              {t("dashboard.accountStatistics")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resumes" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <h2 className="text-xl font-semibold text-[#18515b] mr-2">
                  {t("dashboard.yourResumes")}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchResumes}
                  className="ml-2"
                >
                  <svg
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 2v6h-6"></path>
                    <path d="M3 12a9 9 0 0 1 15-6.7l3-3"></path>
                    <path d="M3 22v-6h6"></path>
                    <path d="M21 12a9 9 0 0 1-15 6.7l-3 3"></path>
                  </svg>
                  {t("dashboard.refresh")}
                </Button>
              </div>
              <Button
                className="bg-[#00acc1] hover:bg-[#00acc1]/90"
                onClick={() => router.push("/create-resume")}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                {t("dashboard.createNewResume")}
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00acc1]"></div>
              </div>
            ) : resumes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resumes.map((resume) => (
                  <Card
                    key={resume.id}
                    className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="bg-white pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12 border-2 border-[#00acc1]">
                            <AvatarImage src={resume.photo} alt="Profile" />
                            <AvatarFallback className="bg-[#18515b] text-white">
                              {resume.title.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg text-[#18515b]">
                              {resume.title}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              Created: {resume.createdAt} • Updated:{" "}
                              {resume.updatedAt}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 pb-2">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {resume.skills
                          .slice(0, 3)
                          .map((skill: string, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-[#c3eedb] text-[#18515b] border-none"
                            >
                              {skill}
                            </Badge>
                          ))}
                        {resume.skills.length > 3 && (
                          <Badge
                            variant="outline"
                            className="bg-gray-100 text-gray-600 border-none"
                          >
                            +{resume.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{resume.views} views</span>
                        </div>
                        <div className="flex items-center">
                          <PlusCircle className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{resume.contacts} contacts</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-gray-50 flex justify-between py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[#18515b]"
                        asChild
                      >
                        <Link href={`/resume/${resume.id}`}>
                          <Eye className="h-4 w-4 mr-1" /> Preview
                        </Link>
                      </Button>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[#00acc1]"
                          onClick={() => {
                            localStorage.setItem("resumeToEdit", resume.id);
                            router.push(`/create-resume?edit=${resume.id}`);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete your resume and remove it
                                from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-500 hover:bg-red-600"
                                onClick={() => handleDeleteResume(resume.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {t("dashboard.noResumesYet")}
                  </h3>
                  <p className="text-gray-500 text-center mb-6 max-w-md">
                    {t("dashboard.noResumesMessage")}
                  </p>
                  <Button
                    className="bg-[#00acc1] hover:bg-[#00acc1]/90"
                    onClick={() => router.push("/create-resume")}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t("dashboard.createYourFirstResume")}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#18515b]">
                    {t("dashboard.profilePerformance")}
                  </CardTitle>
                  <CardDescription>
                    {t("dashboard.overviewVisibility")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-gray-600">
                        {t("dashboard.totalProfileViews")}
                      </span>
                      <span className="font-semibold text-[#18515b]">
                        {accountStats.totalViews}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-gray-600">
                        {t("dashboard.totalContactRequests")}
                      </span>
                      <span className="font-semibold text-[#18515b]">
                        {accountStats.totalContacts}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-gray-600">
                        {t("dashboard.totalResumes")}
                      </span>
                      <span className="font-semibold text-[#18515b]">
                        {accountStats.totalResumes}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-2">
                      <span className="text-gray-600">
                        {t("dashboard.lastUpdated")}
                      </span>
                      <span className="font-semibold text-[#18515b]">
                        {accountStats.lastUpdated}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-[#18515b]">
                    {t("dashboard.quickActions")}
                  </CardTitle>
                  <CardDescription>
                    {t("dashboard.manageProfile")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    className="w-full bg-[#00acc1] hover:bg-[#00acc1]/90"
                    onClick={() => router.push("/create-resume")}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t("dashboard.createNewResume")}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-[#18515b] border-[#18515b]"
                    onClick={() => setActiveTab("resumes")}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {t("dashboard.viewAllResumes")}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
