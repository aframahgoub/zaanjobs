"use client";

import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

interface Skill {
  name: string;
}

interface ResumeCardProps {
  id: string;
  name: string;
  photoUrl?: string;
  bio: string;
  skills?: string[] | Skill[];
  title?: string;
  hasCv?: boolean;
  yearsOfExperience?: string | number;
  location?: string;
}

const ResumeCard = ({
  id = "1",
  name = "Jane Doe",
  photoUrl,
  bio = "Experienced beauty professional with over 5 years in the industry specializing in hair styling, makeup, and skincare treatments.",
  skills = [{ name: "Hair Styling" }, { name: "Makeup" }, { name: "Skincare" }],
  title = "Beauty Professional",
  hasCv = false,
  yearsOfExperience = "5",
  location = "New York, NY",
}: ResumeCardProps) => {
  const { t } = useLanguage();

  // Truncate bio to a reasonable length for card display
  const truncatedBio = bio.length > 120 ? `${bio.substring(0, 120)}...` : bio;

  // Convert skills to consistent format
  const normalizedSkills = skills.map((skill) =>
    typeof skill === "string" ? { name: skill } : skill,
  );

  // Display only the first 3 skills
  const displaySkills = normalizedSkills.slice(0, 3);
  const hasMoreSkills = normalizedSkills.length > 3;

  return (
    <Card className="w-full max-w-[350px] h-[400px] flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white">
      <CardContent className="p-6 flex-grow">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-16 w-16 border-2 border-[#00acc1]">
            <AvatarFallback className="bg-[#18515b] text-white text-lg">
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg text-[#18515b]">{name}</h3>
            <p className="text-sm text-[#00acc1]">{title}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <span>{location}</span>
              {yearsOfExperience && (
                <span>
                  • {yearsOfExperience}{" "}
                  {Number(yearsOfExperience) === 1
                    ? t("resume.year")
                    : t("resume.years")}{" "}
                  {t("search.exp")}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {displaySkills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-[#f1f8f9] text-[#18515b] border-[#00acc1]"
                >
                  {skill.name}
                </Badge>
              ))}
              {hasMoreSkills && (
                <Badge
                  variant="outline"
                  className="bg-[#f1f8f9] text-[#18515b] border-[#00acc1]"
                >
                  +{normalizedSkills.length - 3}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">{truncatedBio}</p>
      </CardContent>

      <CardFooter className="p-4 pt-0 border-t border-gray-100">
        <Link href={`/resume/${id}`} className="w-full">
          <Button
            className="w-full bg-[#00acc1] hover:bg-[#18515b] text-white"
            variant="default"
          >
            <Eye className="mr-2 h-4 w-4" />
            {t("common.view")}{" "}
            {hasCv ? t("resume.fullResume") : t("resume.profile")}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ResumeCard;
