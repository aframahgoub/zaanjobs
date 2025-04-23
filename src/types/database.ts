export type UserType = "professional" | "employer" | "admin";

export interface User {
  id: string;
  email: string;
  full_name?: string;
  user_type: UserType;
  created_at: string;
  updated_at?: string;
  last_login?: string;
}

export interface Resume {
  id: string;
  user_id: string;
  firstname: string;
  lastname: string;
  fullname: string;
  title: string;
  bio: string;
  specialistprofile?: string;
  location: string;
  email: string;
  phone: string;
  website?: string;
  skills: string[];
  education: Education[];
  experience: Experience[];
  socialmedia: SocialMedia;
  attachments: Attachment[];
  certifications: Certification[];
  photo?: string;
  cv_url?: string;
  nationality?: string;
  age?: string;
  yearsofexperience?: string;
  educationlevel?: string;
  created_at: string;
  updated_at: string;
  views: number;
  contacts: number;
  slug: string;
}

export interface Education {
  institution: string;
  degree: string;
  year: string;
}

export interface Experience {
  company: string;
  position: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  duration?: string;
  description: string;
}

export interface SocialMedia {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  pinterest?: string;
  youtube?: string;
}

export interface Attachment {
  name: string;
  url: string;
  type?: string;
  images?: string[];
}

export interface Certification {
  name: string;
  year?: string;
}
