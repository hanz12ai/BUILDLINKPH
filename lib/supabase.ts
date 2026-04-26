import { createBrowserClient } from '@supabase/ssr';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'client' | 'engineer'
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role: 'client' | 'engineer'
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'client' | 'engineer'
        }
        Relationships: []
      }
      engineer_profiles: {
        Row: {
          id: string
          user_id: string
          headline: string | null
          bio: string | null
          province: string | null
          city: string | null
          hourly_rate: number | null
          is_available: boolean
          years_experience: number | null
          prc_verified: boolean
          prc_document_url: string | null
          prc_doc_url: string | null
          prc_verified_at: string | null
          avatar_url: string | null
          specializations: string[] | null
          skills: string[] | null
        }
        Insert: {
          id?: string
          user_id: string
          headline?: string | null
          bio?: string | null
          province?: string | null
          city?: string | null
          hourly_rate?: number | null
          is_available?: boolean
          years_experience?: number | null
          prc_verified?: boolean
          prc_document_url?: string | null
          prc_doc_url?: string | null
          prc_verified_at?: string | null
          avatar_url?: string | null
          specializations?: string[] | null
          skills?: string[] | null
        }
        Update: {
          id?: string
          user_id?: string
          headline?: string | null
          bio?: string | null
          province?: string | null
          city?: string | null
          hourly_rate?: number | null
          is_available?: boolean
          years_experience?: number | null
          prc_verified?: boolean
          prc_document_url?: string | null
          prc_doc_url?: string | null
          prc_verified_at?: string | null
          avatar_url?: string | null
          specializations?: string[] | null
          skills?: string[] | null
        }
        Relationships: []
      }
      portfolio_items: {
        Row: {
          id: number
          engineer_id: string
          title: string
          description: string | null
          image_url: string
          created_at: string
        }
        Insert: {
          id?: number
          engineer_id: string
          title: string
          description?: string | null
          image_url: string
          created_at?: string
        }
        Update: {
          id?: number
          engineer_id?: string
          title?: string
          description?: string | null
          image_url?: string
          created_at?: string
        }
        Relationships: []
      }
      job_posts: {
        Row: {
          id: number
          client_id: string
          title: string
          description: string
          project_type: string[]
          discipline: string[]
          work_type: string[]
          province: string
          city: string | null
          target_date: string | null
          deadline: string | null
          duration: string | null
          budget_min: number | null
          budget_max: number | null
          prc_required: boolean | null
          status: 'active' | 'closed' | 'draft'
          created_at: string
        }
        Insert: {
          id?: number
          client_id: string
          title: string
          description: string
          project_type: string[]
          discipline: string[]
          work_type: string[]
          province: string
          city?: string | null
          target_date?: string | null
          deadline?: string | null
          duration?: string | null
          budget_min?: number | null
          budget_max?: number | null
          prc_required?: boolean | null
          status?: 'active' | 'closed' | 'draft'
          created_at?: string
        }
        Update: {
          id?: number
          client_id?: string
          title?: string
          description?: string
          project_type?: string[]
          discipline?: string[]
          work_type?: string[]
          province?: string
          city?: string | null
          target_date?: string | null
          deadline?: string | null
          duration?: string | null
          budget_min?: number | null
          budget_max?: number | null
          prc_required?: boolean | null
          status?: 'active' | 'closed' | 'draft'
          created_at?: string
        }
        Relationships: []
      }
      job_attachments: {
        Row: {
          id: number
          job_id: string | null
          file_name: string
          file_url: string
          file_size: string | null
          file_type: string | null
        }
        Insert: {
          id?: number
          job_id?: string | null
          file_name: string
          file_url: string
          file_size?: string | null
          file_type?: string | null
        }
        Update: {
          id?: number
          job_id?: string | null
          file_name?: string
          file_url?: string
          file_size?: string | null
          file_type?: string | null
        }
        Relationships: []
      }
      applications: {
        Row: {
          id: number
          job_id: number
          engineer_id: string
          cover_note: string
          proposed_rate: number | null
          cv_url: string | null
          status: 'pending' | 'viewed' | 'shortlisted' | 'hired' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: number
          job_id: number
          engineer_id: string
          cover_note: string
          proposed_rate?: number | null
          cv_url?: string | null
          status?: 'pending' | 'viewed' | 'shortlisted' | 'hired' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: number
          job_id?: number
          engineer_id?: string
          cover_note?: string
          proposed_rate?: number | null
          cv_url?: string | null
          status?: 'pending' | 'viewed' | 'shortlisted' | 'hired' | 'rejected'
          created_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: number
          job_id: string | null
          sender_id: string
          receiver_id: string
          content: string
          is_read: boolean
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: number
          job_id?: string | null
          sender_id: string
          receiver_id: string
          content: string
          is_read?: boolean
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          job_id?: string | null
          sender_id?: string
          receiver_id?: string
          content?: string
          is_read?: boolean
          sent_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: number
          job_id: number
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment: string
          tags: string[] | null
          rating_communication: number | null
          rating_professionalism: number | null
          rating_quality: number | null
          rating_timeliness: number | null
          created_at: string
        }
        Insert: {
          id?: number
          job_id: number
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment: string
          tags?: string[] | null
          rating_communication?: number | null
          rating_professionalism?: number | null
          rating_quality?: number | null
          rating_timeliness?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          job_id?: number
          reviewer_id?: string
          reviewee_id?: string
          rating?: number
          comment?: string
          tags?: string[] | null
          rating_communication?: number | null
          rating_professionalism?: number | null
          rating_quality?: number | null
          rating_timeliness?: number | null
          created_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: number
          user_id: string
          type: string
          message: string
          link: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          type: string
          message: string
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          type?: string
          message?: string
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
        Relationships: []
      }
      cost_estimates: {
        Row: {
          id: number
          user_id: string | null
          floor_area: number
          floors: number
          quality: string
          region: string
          include_fees: boolean
          min_cost: number
          max_cost: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id?: string | null
          floor_area: number
          floors: number
          quality: string
          region: string
          include_fees: boolean
          min_cost: number
          max_cost: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string | null
          floor_area?: number
          floors?: number
          quality?: string
          region?: string
          include_fees?: boolean
          min_cost?: number
          max_cost?: number
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_engineers: {
        Args: {
          p_specialization?: string[] | null
          p_province?: string | null
          p_city?: string | null
          p_min_experience?: number | null
          p_min_rate?: number | null
          p_max_rate?: number | null
          p_prc_verified?: boolean | null
          p_sort?: string
          p_limit?: number
          p_offset?: number
        }
        Returns: any[]
      }
      get_job_details: {
        Args: { p_job_id: string | number }
        Returns: any[]
      }
      increment_job_views: {
        Args: { p_job_id: string }
        Returns: void
      }
      increment_profile_views: {
        Args: { profile_id: string }
        Returns: void
      }
      [key: string]: any
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

/**
 * CLIENT-SIDE Supabase Client Wrapper
 * 
 * USE THIS FILE IN:
 * - Client components (components with "use client" directive)
 * - Pages handling user interactivity or client-side hooks
 * 
 * DO NOT USE IN:
 * - Server Components
 * - API / Route handlers
 */
export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};