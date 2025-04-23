"use client";

import React, { useState, useEffect } from "react";
import { Resume } from "@/types/database";
import ResumeCard from "@/components/resume/ResumeCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Eye } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";
export default function CVSpecialistsPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [filteredResumes, setFilteredResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchAllResumes = async () => {
      try {
        setIsLoading(true);

        // Fetch resumes directly from Supabase
        const { data, error } = await supabase
          .from("resumes")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw new Error(error.message || "Failed to fetch resumes");
        }

        console.log("Supabase response:", data);
        setResumes(data || []);
        setFilteredResumes(data || []);
      } catch (err) {
        console.error("Error fetching resumes:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllResumes();
  }, []);

  useEffect(() => {
    // Filter resumes based on search query
    if (!resumes.length) return;

    if (!searchQuery) {
      setFilteredResumes(resumes);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = resumes.filter((resume) => {
      return (
        (resume.fullname && resume.fullname.toLowerCase().includes(query)) ||
        (resume.firstname && resume.firstname.toLowerCase().includes(query)) ||
        (resume.lastname && resume.lastname.toLowerCase().includes(query)) ||
        (resume.title && resume.title.toLowerCase().includes(query)) ||
        (resume.bio && resume.bio.toLowerCase().includes(query)) ||
        (resume.skills &&
          resume.skills.some((skill) => skill.toLowerCase().includes(query)))
      );
    });

    setFilteredResumes(results);
  }, [resumes, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the useEffect
  };

  return (
    <div className="min-h-screen bg-[#f1f8f9] py-8 px-4 md:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-[#18515b] mb-4">
          Find Beauty Professionals
        </h1>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search by name, skills, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <Button
              variant="outline"
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" /> Filters
            </Button>
            <Button type="submit" className="bg-[#18515b] hover:bg-[#00acc1]">
              Search
            </Button>
          </form>

          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Filter options would go here */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Hair Styling",
                      "Makeup",
                      "Skincare",
                      "Barber",
                      "Nails",
                    ].map((skill) => (
                      <Button
                        key={skill}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => setSearchQuery(skill)}
                      >
                        {skill}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <h2 className="text-xl font-semibold text-[#18515b] mb-6">
          Browse all beauty professionals
        </h2>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00acc1]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
            <Button
              className="mt-4 bg-[#00acc1] hover:bg-[#00acc1]/90 text-white"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        ) : filteredResumes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResumes.map((resume) => (
              <div
                key={resume.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#00acc1] flex items-center justify-center text-white text-xl font-bold overflow-hidden">
                      {resume.photo ? (
                        <img
                          src={resume.photo}
                          alt={
                            resume.fullname ||
                            `${resume.firstname} ${resume.lastname}`
                          }
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (resume.firstname?.[0] || "") +
                        (resume.lastname?.[0] || "")
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#18515b]">
                        {resume.fullname ||
                          `${resume.firstname} ${resume.lastname}`}
                      </h3>
                      <p className="text-[#00acc1]">{resume.title}</p>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        {resume.location} • {resume.yearsofexperience}{" "}
                        {Number(resume.yearsofexperience) === 1
                          ? "year"
                          : "years"}{" "}
                        exp.
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {resume.skills &&
                      resume.skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="inline-block bg-[#f1f8f9] text-[#18515b] text-xs px-2 py-1 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                  </div>

                  <p className="mt-4 text-gray-700 text-sm line-clamp-3">
                    {resume.bio}
                  </p>
                </div>

                <div className="border-t p-4">
                  <Button
                    className="w-full bg-[#00acc1] hover:bg-[#18515b] flex items-center justify-center gap-2"
                    asChild
                  >
                    <a href={`/resume/${resume.id}`}>
                      <Eye className="h-4 w-4" /> View Profile
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600">
              {resumes.length > 0
                ? "No professionals match your search criteria. Try adjusting your search."
                : "No professionals found. Check back later!"}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSearchQuery("")}
              >
                Clear search
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
