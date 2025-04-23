"use client";

import { useState } from "react";
import { ClientWrapper } from "@/components/ui/client-wrapper";
import { Search, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useLanguage } from "@/contexts/LanguageContext";
interface SearchBarProps {
  onSearch?: (searchParams: SearchParams) => void;
}

interface SearchParams {
  query: string;
  location?: string;
  experience?: string;
  skills?: string[];
}

export default function SearchBar({ onSearch = () => {} }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const { t } = useLanguage();
  const handleSearch = () => {
    onSearch({
      query: searchQuery,
      location,
      experience,
      skills,
    });
  };

  const clearFilters = () => {
    setLocation("");
    setExperience("");
    setSkills([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder={t("search.searchkeyowrds")}
            className="pl-10 pr-4 py-2 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {searchQuery && (
            <ClientWrapper onClick={() => setSearchQuery("")}>
              <button className="absolute inset-y-0 right-0 flex items-center pr-3">
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </ClientWrapper>
          )}
        </div>

        <div className="flex gap-2">
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 border-gray-300"
              >
                <Filter className="h-4 w-4" />
                <span>{t("search.filters")} </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <div className="space-y-4">
                <h3 className="font-medium text-sm">Filter Results</h3>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="City or region"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Experience Level</Label>
                  <Select value={experience} onValueChange={setExperience}>
                    <SelectTrigger id="experience">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">
                        Entry Level (0-2 years)
                      </SelectItem>
                      <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                      <SelectItem value="senior">Senior (6+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Popular Skills</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Hair Styling",
                      "Makeup",
                      "Nails",
                      "Skincare",
                      "Massage",
                      "Esthetics",
                    ].map((skill) => (
                      <ClientWrapper
                        key={skill}
                        onClick={() => {
                          if (skills.includes(skill)) {
                            setSkills(skills.filter((s) => s !== skill));
                          } else {
                            setSkills([...skills, skill]);
                          }
                        }}
                      >
                        <Button
                          variant={
                            skills.includes(skill) ? "default" : "outline"
                          }
                          size="sm"
                          className={
                            skills.includes(skill)
                              ? "bg-[#00acc1] text-white"
                              : ""
                          }
                        >
                          {skill}
                        </Button>
                      </ClientWrapper>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <ClientWrapper onClick={clearFilters}>
                    <Button variant="outline" size="sm">
                      Clear All
                    </Button>
                  </ClientWrapper>
                  <ClientWrapper
                    onClick={() => {
                      handleSearch();
                      setShowFilters(false);
                    }}
                  >
                    <Button
                      size="sm"
                      className="bg-[#18515b] hover:bg-[#00acc1]"
                    >
                      Apply Filters
                    </Button>
                  </ClientWrapper>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <ClientWrapper onClick={handleSearch}>
            <Button className="bg-[#18515b] hover:bg-[#00acc1]">
              {" "}
              {t("navbar.search")}
            </Button>
          </ClientWrapper>
        </div>
      </div>

      {/* Active filters display */}
      {(location || experience || skills.length > 0) && (
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-sm text-gray-500">Active filters:</span>
          {location && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100">
              Location: {location}
              <ClientWrapper onClick={() => setLocation("")}>
                <X className="h-3 w-3 ml-1 cursor-pointer" />
              </ClientWrapper>
            </span>
          )}
          {experience && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100">
              Experience:{" "}
              {experience === "entry"
                ? "Entry Level"
                : experience === "mid"
                  ? "Mid Level"
                  : "Senior"}
              <ClientWrapper onClick={() => setExperience("")}>
                <X className="h-3 w-3 ml-1 cursor-pointer" />
              </ClientWrapper>
            </span>
          )}
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100"
            >
              {skill}
              <ClientWrapper
                onClick={() => setSkills(skills.filter((s) => s !== skill))}
              >
                <X className="h-3 w-3 ml-1 cursor-pointer" />
              </ClientWrapper>
            </span>
          ))}
          {(location || experience || skills.length > 0) && (
            <ClientWrapper onClick={clearFilters}>
              <button className="text-xs text-[#00acc1] hover:underline">
                Clear all
              </button>
            </ClientWrapper>
          )}
        </div>
      )}
    </div>
  );
}
