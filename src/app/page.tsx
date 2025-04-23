"use client";

import React from "react";
import { useState, useEffect } from "react";
import SearchBar from "@/components/search/SearchBar";
import ResumeCard from "@/components/resume/ResumeCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
// Setup database button import removed

export default function HomePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/resumes");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch resumes");
        }

        setResumes(data.resumes || []);
      } catch (err) {
        console.error("Error fetching resumes:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResumes();
  }, []);
  // Mock data for resume cards
  const mockResumes = [
    {
      id: "1",
      name: "Sophia Martinez",
      photo: "",
      bio: "Experienced hair stylist with 8+ years specializing in color treatments and modern cuts. Certified in advanced coloring techniques.",
      skills: ["Hair Styling", "Color Treatments", "Modern Cuts"],
      location: "New York, NY",
    },
    {
      id: "2",
      name: "James Wilson",
      photo: "",
      bio: "Professional makeup artist with experience in fashion shows, weddings, and editorial shoots. Specializing in natural and glamour looks.",
      skills: ["Makeup Artistry", "Bridal", "Editorial"],
      location: "Los Angeles, CA",
    },
    {
      id: "3",
      name: "Emma Johnson",
      photo: "",
      bio: "Licensed esthetician with focus on skincare treatments and facial therapies. Passionate about helping clients achieve healthy skin.",
      skills: ["Facials", "Skin Analysis", "Chemical Peels"],
      location: "Chicago, IL",
    },
    {
      id: "4",
      name: "Michael Brown",
      photo: "",
      bio: "Nail technician with 5+ years experience in manicures, pedicures, and nail art. Certified in gel and acrylic applications.",
      skills: ["Manicures", "Pedicures", "Nail Art"],
      location: "Miami, FL",
    },
    {
      id: "5",
      name: "Olivia Davis",
      photo: "",
      bio: "Holistic massage therapist specializing in Swedish, deep tissue, and hot stone therapies. Focused on wellness and stress relief.",
      skills: ["Swedish Massage", "Deep Tissue", "Hot Stone"],
      location: "Seattle, WA",
    },
    {
      id: "6",
      name: "Daniel Taylor",
      photo: "",
      bio: "Barber with expertise in classic and modern men's cuts, beard grooming, and straight razor shaves. Creating precision styles since 2015.",
      skills: ["Men's Cuts", "Beard Grooming", "Straight Razor Shaves"],
      location: "Austin, TX",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f1f8f9]">
      {/* Hero Section */}
      <section className="relative bg-[#18515b] text-white py-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t("homepage.heroTitle")}
            </h1>
            <p className="text-lg md:text-xl mb-8">
              {t("homepage.heroSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="bg-[#00acc1] hover:bg-[#00acc1]/90 text-white px-6 py-2 rounded-md"
                size="lg"
              >
                {t("homepage.browseResumes")}
              </Button>
              <Button
                variant="outline"
                className="bg-white text-[#18515b] hover:bg-opacity-90 px-6 py-2 rounded-md"
                size="lg"
                onClick={() => router.push("/create-resume")}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {t("homepage.joinAsProfessional")}
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#f1f8f9] clip-path-triangle"></div>
      </section>
      {/* Search Section */}
      <section className="py-8 px-4 md:px-8 lg:px-16 -mt-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-semibold text-[#18515b] mb-4">
              {t("homepage.findPerfectProfessional")}
            </h2>
            <SearchBar />
          </div>
        </div>
      </section>
      {/* Setup Database Button removed */}
      {/* Resume Cards Section */}
      <section className="py-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold text-[#18515b]">
              {t("homepage.featuredProfessionals")}
            </h2>
            <Button variant="link" className="text-[#00acc1] flex items-center">
              {t("homepage.viewAll")} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-3 flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00acc1]"></div>
              </div>
            ) : error ? (
              <div className="col-span-3 text-center py-8">
                <p className="text-red-500">{error}</p>
                <p className="mt-4">Showing sample resumes instead</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                  {mockResumes.map((resume) => (
                    <ResumeCard
                      key={resume.id}
                      id={resume.id}
                      name={resume.fullname}
                      photoUrl={resume.photo}
                      bio={resume.bio}
                      skills={resume.skills}
                      location={resume.location}
                    />
                  ))}
                </div>
              </div>
            ) : resumes.length > 0 ? (
              resumes.map((resume) => (
                <ResumeCard
                  key={resume.id}
                  id={resume.id}
                  name={
                    resume.fullname || `${resume.firstname} ${resume.lastname}`
                  }
                  photoUrl={resume.photo}
                  bio={resume.bio}
                  skills={resume.skills}
                  title={resume.title}
                  location={resume.location}
                  hasCv={!!resume.cv_url}
                  yearsOfExperience={resume.yearsofexperience}
                />
              ))
            ) : (
              mockResumes.map((resume) => (
                <ResumeCard
                  key={resume.id}
                  id={resume.id}
                  name={resume.fullname}
                  photoUrl={resume.photo}
                  bio={resume.bio}
                  skills={resume.skills}
                  location={resume.location}
                />
              ))
            )}
          </div>

          <div className="mt-12 text-center">
            <Button className="bg-[#00acc1] hover:bg-[#00acc1]/90 text-white px-8 py-2 rounded-md">
              {t("homepage.loadMore")}
            </Button>
          </div>
        </div>
      </section>
      {/* How It Works Section */}
      <section className="py-16 px-4 md:px-8 lg:px-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#18515b] mb-12">
            {t("homepage.howItWorks")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg">
              <div className="w-16 h-16 bg-[#c3eedb] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[#18515b]">1</span>
              </div>
              <h3 className="text-xl font-semibold text-[#18515b] mb-3">
                {t("homepage.browseResumesStep")}
              </h3>
              <p className="text-gray-600">{t("homepage.browseResumesDesc")}</p>
            </div>

            <div className="text-center p-6 rounded-lg">
              <div className="w-16 h-16 bg-[#ecd8c9] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[#18515b]">2</span>
              </div>
              <h3 className="text-xl font-semibold text-[#18515b] mb-3">
                {t("homepage.viewDetailsStep")}
              </h3>
              <p className="text-gray-600">{t("homepage.viewDetailsDesc")}</p>
            </div>

            <div className="text-center p-6 rounded-lg">
              <div className="w-16 h-16 bg-[#decbfb] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[#18515b]">3</span>
              </div>
              <h3 className="text-xl font-semibold text-[#18515b] mb-3">
                {t("homepage.connectDirectlyStep")}
              </h3>
              <p className="text-gray-600">
                {t("homepage.connectDirectlyDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Join as Professional CTA */}
      <section className="py-16 px-4 md:px-8 lg:px-16 bg-[#18515b] text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            {t("homepage.areYouProfessional")}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            {t("homepage.createProfileDesc")}
          </p>
          <Button
            className="bg-[#00acc1] hover:bg-[#00acc1]/90 text-white px-8 py-6 rounded-md text-lg"
            size="lg"
            onClick={() => router.push("/create-resume")}
          >
            {t("homepage.createResumeNow")}
          </Button>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-[#f1f8f9] py-12 px-4 md:px-8 lg:px-16 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <h3 className="text-2xl font-bold text-[#18515b] mb-4">
                {t("common.appName")}
              </h3>
              <p className="text-gray-600 max-w-md">
                {t("common.appDescription")}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-[#18515b] mb-4">
                  {t("homepage.forProfessionals")}
                </h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-gray-600 hover:text-[#00acc1]">
                      {t("homepage.createAccount")}
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-600 hover:text-[#00acc1]">
                      {t("homepage.dashboard")}
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-600 hover:text-[#00acc1]">
                      {t("homepage.manageResumes")}
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-[#18515b] mb-4">
                  {t("homepage.forVisitors")}
                </h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-gray-600 hover:text-[#00acc1]">
                      {t("homepage.browseResumes")}
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-600 hover:text-[#00acc1]">
                      {t("homepage.search")}
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-600 hover:text-[#00acc1]">
                      {t("homepage.howItWorks")}
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-[#18515b] mb-4">
                  {t("homepage.company")}
                </h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-gray-600 hover:text-[#00acc1]">
                      {t("homepage.aboutUs")}
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-600 hover:text-[#00acc1]">
                      {t("homepage.contact")}
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-600 hover:text-[#00acc1]">
                      {t("homepage.privacyPolicy")}
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-600 hover:text-[#00acc1]">
                      {t("homepage.termsOfService")}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600">
            <p>
              &copy; {new Date().getFullYear()} {t("common.appName")}.{" "}
              {t("homepage.allRightsReserved")}
            </p>
          </div>
        </div>
      </footer>
      <style jsx global>{`
        .clip-path-triangle {
          clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
          transform: skewY(-2deg);
          transform-origin: top right;
        }
      `}</style>
    </div>
  );
}
