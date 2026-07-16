/**
 * Hand-maintained Supabase Database types for Phase A.
 * Replace with `supabase gen types typescript` once the remote project is linked.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "OWNER" | "ADMIN" | "MANAGER" | "AGENT" | "VIEWER";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          industry: string | null;
          timezone: string;
          onboarding_step: number;
          onboarding_completed_at: string | null;
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          industry?: string | null;
          timezone?: string;
          onboarding_step?: number;
          onboarding_completed_at?: string | null;
          stripe_customer_id?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
        Relationships: [];
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: UserRole;
          status: string;
          invited_email: string | null;
          invited_at: string | null;
          joined_at: string | null;
          last_active_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role?: UserRole;
          status?: string;
          invited_email?: string | null;
          invited_at?: string | null;
          joined_at?: string | null;
          last_active_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["organization_members"]["Insert"]>;
        Relationships: [];
      };
      organization_settings: {
        Row: {
          organization_id: string;
          business_email: string | null;
          business_phone: string | null;
          website: string | null;
          currency: string;
          date_format: string;
          language: string;
          preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          organization_id: string;
          business_email?: string | null;
          business_phone?: string | null;
          website?: string | null;
          currency?: string;
          date_format?: string;
          language?: string;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["organization_settings"]["Insert"]>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          organization_id: string;
          plan_key: string;
          status: string;
          stripe_subscription_id: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          minutes_included: number;
          minutes_used: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          plan_key?: string;
          status?: string;
          stripe_subscription_id?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          minutes_included?: number;
          minutes_used?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Insert"]>;
        Relationships: [];
      };
      calls: {
        Row: {
          id: string;
          organization_id: string;
          contact_id: string | null;
          lead_id: string | null;
          phone_number_id: string | null;
          agent_id: string | null;
          direction: string;
          status: string;
          disposition: string | null;
          from_number: string | null;
          to_number: string | null;
          started_at: string | null;
          ended_at: string | null;
          duration_seconds: number | null;
          external_call_id: string | null;
          external_provider: string | null;
          sentiment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      call_transcripts: {
        Row: {
          id: string;
          organization_id: string;
          call_id: string;
          speaker: string;
          content: string;
          started_at_ms: number | null;
          ended_at_ms: number | null;
          sort_order: number;
          created_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      call_summaries: {
        Row: {
          id: string;
          organization_id: string;
          call_id: string;
          summary: string | null;
          key_topics: Json;
          insights: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      appointments: {
        Row: {
          id: string;
          organization_id: string;
          contact_id: string | null;
          service_id: string | null;
          provider_member_id: string | null;
          location_id: string | null;
          status: string;
          starts_at: string;
          ends_at: string;
          source: string | null;
          external_calendar_id: string | null;
          created_by_ai: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          contact_id?: string | null;
          service_id?: string | null;
          provider_member_id?: string | null;
          location_id?: string | null;
          status?: string;
          starts_at: string;
          ends_at: string;
          source?: string | null;
          external_calendar_id?: string | null;
          created_by_ai?: boolean;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["appointments"]["Insert"]>;
        Relationships: [];
      };
      knowledge_documents: {
        Row: {
          id: string;
          organization_id: string;
          source_id: string | null;
          title: string;
          status: string;
          storage_path: string | null;
          mime_type: string | null;
          byte_size: number | null;
          category: string | null;
          view_count: number;
          helpful_rate: number | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          source_id?: string | null;
          title: string;
          status?: string;
          storage_path?: string | null;
          mime_type?: string | null;
          byte_size?: number | null;
          category?: string | null;
          view_count?: number;
          helpful_rate?: number | null;
          updated_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["knowledge_documents"]["Insert"]>;
        Relationships: [];
      };
      faq_items: {
        Row: {
          id: string;
          organization_id: string;
          question: string;
          answer: string;
          category: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          question: string;
          answer: string;
          category?: string | null;
          status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["faq_items"]["Insert"]>;
        Relationships: [];
      };
      daily_analytics: {
        Row: {
          id: string;
          organization_id: string;
          day: string;
          metrics: Json;
          created_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      call_events: {
        Row: {
          id: string;
          organization_id: string;
          call_id: string;
          event_type: string;
          payload: Json;
          occurred_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      webhook_events: {
        Row: {
          id: string;
          provider: string;
          idempotency_key: string;
          event_type: string | null;
          payload: Json;
          status: string;
          error_message: string | null;
          processed_at: string | null;
          created_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_org_member: {
        Args: { org_id: string };
        Returns: boolean;
      };
      has_org_role: {
        Args: { org_id: string; allowed_roles: string[] };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type OrganizationMember = Database["public"]["Tables"]["organization_members"]["Row"];
export type OrganizationSettings = Database["public"]["Tables"]["organization_settings"]["Row"];
