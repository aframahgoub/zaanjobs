export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      beautician_profiles: {
        Row: {
          allow_contact_requests: boolean | null
          bio: string | null
          created_at: string
          experience: string | null
          id: string
          is_public: boolean | null
          location: string | null
          phone: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_contact_requests?: boolean | null
          bio?: string | null
          created_at?: string
          experience?: string | null
          id?: string
          is_public?: boolean | null
          location?: string | null
          phone?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_contact_requests?: boolean | null
          bio?: string | null
          created_at?: string
          experience?: string | null
          id?: string
          is_public?: boolean | null
          location?: string | null
          phone?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beautician_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications: {
        Row: {
          beautician_id: string
          created_at: string
          id: string
          issuer: string
          name: string
          updated_at: string
          year: string | null
        }
        Insert: {
          beautician_id: string
          created_at?: string
          id?: string
          issuer: string
          name: string
          updated_at?: string
          year?: string | null
        }
        Update: {
          beautician_id?: string
          created_at?: string
          id?: string
          issuer?: string
          name?: string
          updated_at?: string
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certifications_beautician_id_fkey"
            columns: ["beautician_id"]
            isOneToOne: false
            referencedRelation: "beautician_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_requests: {
        Row: {
          beautician_id: string
          created_at: string
          employer_id: string
          id: string
          message: string | null
          status: string
          updated_at: string
        }
        Insert: {
          beautician_id: string
          created_at?: string
          employer_id: string
          id?: string
          message?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          beautician_id?: string
          created_at?: string
          employer_id?: string
          id?: string
          message?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_requests_beautician_id_fkey"
            columns: ["beautician_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_requests_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      education: {
        Row: {
          beautician_id: string
          created_at: string
          degree: string
          id: string
          institution: string
          updated_at: string
          year: string | null
        }
        Insert: {
          beautician_id: string
          created_at?: string
          degree: string
          id?: string
          institution: string
          updated_at?: string
          year?: string | null
        }
        Update: {
          beautician_id?: string
          created_at?: string
          degree?: string
          id?: string
          institution?: string
          updated_at?: string
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "education_beautician_id_fkey"
            columns: ["beautician_id"]
            isOneToOne: false
            referencedRelation: "beautician_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employer_profiles: {
        Row: {
          company_name: string | null
          created_at: string
          description: string | null
          id: string
          industry: string | null
          location: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employer_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      languages: {
        Row: {
          beautician_id: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          beautician_id: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          beautician_id?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "languages_beautician_id_fkey"
            columns: ["beautician_id"]
            isOneToOne: false
            referencedRelation: "beautician_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_items: {
        Row: {
          beautician_id: string
          created_at: string
          id: string
          title: string | null
          type: string
          updated_at: string
          url: string
        }
        Insert: {
          beautician_id: string
          created_at?: string
          id?: string
          title?: string | null
          type: string
          updated_at?: string
          url: string
        }
        Update: {
          beautician_id?: string
          created_at?: string
          id?: string
          title?: string | null
          type?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_items_beautician_id_fkey"
            columns: ["beautician_id"]
            isOneToOne: false
            referencedRelation: "beautician_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resumes: {
        Row: {
          age: string | null
          attachments: Json | null
          bio: string
          certifications: Json | null
          contacts: number | null
          created_at: string | null
          cv_url: string | null
          education: Json | null
          educationlevel: string | null
          email: string
          experience: Json | null
          firstname: string | null
          fullname: string | null
          id: string
          lastname: string | null
          location: string
          nationality: string | null
          phone: string
          photo: string | null
          skills: string[] | null
          social_media: Json | null
          specialistprofile: string | null
          title: string
          updated_at: string | null
          user_id: string | null
          views: number | null
          website: string | null
          yearsofexperience: string | null
        }
        Insert: {
          age?: string | null
          attachments?: Json | null
          bio: string
          certifications?: Json | null
          contacts?: number | null
          created_at?: string | null
          cv_url?: string | null
          education?: Json | null
          educationlevel?: string | null
          email: string
          experience?: Json | null
          firstname?: string | null
          fullname?: string | null
          id?: string
          lastname?: string | null
          location: string
          nationality?: string | null
          phone: string
          photo?: string | null
          skills?: string[] | null
          social_media?: Json | null
          specialistprofile?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          views?: number | null
          website?: string | null
          yearsofexperience?: string | null
        }
        Update: {
          age?: string | null
          attachments?: Json | null
          bio?: string
          certifications?: Json | null
          contacts?: number | null
          created_at?: string | null
          cv_url?: string | null
          education?: Json | null
          educationlevel?: string | null
          email?: string
          experience?: Json | null
          firstname?: string | null
          fullname?: string | null
          id?: string
          lastname?: string | null
          location?: string
          nationality?: string | null
          phone?: string
          photo?: string | null
          skills?: string[] | null
          social_media?: Json | null
          specialistprofile?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          views?: number | null
          website?: string | null
          yearsofexperience?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          beautician_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
          reviewer_id: string
          updated_at: string
        }
        Insert: {
          beautician_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          reviewer_id: string
          updated_at?: string
        }
        Update: {
          beautician_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          reviewer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_beautician_id_fkey"
            columns: ["beautician_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_profiles: {
        Row: {
          beautician_id: string
          created_at: string
          employer_id: string
          id: string
        }
        Insert: {
          beautician_id: string
          created_at?: string
          employer_id: string
          id?: string
        }
        Update: {
          beautician_id?: string
          created_at?: string
          employer_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_profiles_beautician_id_fkey"
            columns: ["beautician_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_profiles_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      specializations: {
        Row: {
          beautician_id: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          beautician_id: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          beautician_id?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "specializations_beautician_id_fkey"
            columns: ["beautician_id"]
            isOneToOne: false
            referencedRelation: "beautician_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
          user_type: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
          user_type: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
