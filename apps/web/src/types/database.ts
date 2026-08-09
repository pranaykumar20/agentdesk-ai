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
          agent_id: string | null;
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
          agent_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["knowledge_documents"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "knowledge_documents_agent_id_fkey";
            columns: ["agent_id"];
            isOneToOne: false;
            referencedRelation: "ai_agents";
            referencedColumns: ["id"];
          },
        ];
      };
      faq_items: {
        Row: {
          id: string;
          organization_id: string;
          question: string;
          answer: string;
          category: string | null;
          status: string;
          agent_id: string | null;
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
          agent_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["faq_items"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "faq_items_agent_id_fkey";
            columns: ["agent_id"];
            isOneToOne: false;
            referencedRelation: "ai_agents";
            referencedColumns: ["id"];
          },
        ];
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
      ai_agents: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          role_title: string | null;
          description: string | null;
          status: string;
          primary_language: string;
          voice: string | null;
          timezone: string | null;
          published_version_id: string | null;
          external_provider: string | null;
          external_agent_id: string | null;
          lifecycle_status: string;
          department: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          role_title?: string | null;
          description?: string | null;
          status?: string;
          primary_language?: string;
          voice?: string | null;
          timezone?: string | null;
          published_version_id?: string | null;
          external_provider?: string | null;
          external_agent_id?: string | null;
          lifecycle_status?: string;
          department?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ai_agents"]["Insert"]>;
        Relationships: [];
      };
      ai_agent_versions: {
        Row: {
          id: string;
          organization_id: string;
          agent_id: string;
          version_number: number;
          status: string;
          greeting: string | null;
          system_prompt: string | null;
          behavior: Json;
          created_by: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          agent_id: string;
          version_number: number;
          status?: string;
          greeting?: string | null;
          system_prompt?: string | null;
          behavior?: Json;
          created_by?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ai_agent_versions"]["Insert"]>;
        Relationships: [];
      };
      phone_numbers: {
        Row: {
          id: string;
          organization_id: string;
          e164: string;
          friendly_name: string | null;
          number_type: string;
          provider: string;
          provider_sid: string | null;
          status: string;
          location_id: string | null;
          recording_enabled: boolean;
          voicemail_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          e164: string;
          friendly_name?: string | null;
          number_type?: string;
          provider?: string;
          provider_sid?: string | null;
          status?: string;
          location_id?: string | null;
          recording_enabled?: boolean;
          voicemail_enabled?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["phone_numbers"]["Insert"]>;
        Relationships: [];
      };
      phone_number_assignments: {
        Row: {
          id: string;
          organization_id: string;
          phone_number_id: string;
          agent_id: string | null;
          department_id: string | null;
          team_member_id: string | null;
          assignment_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          phone_number_id: string;
          agent_id?: string | null;
          department_id?: string | null;
          team_member_id?: string | null;
          assignment_type?: string;
        };
        Update: Partial<Database["public"]["Tables"]["phone_number_assignments"]["Insert"]>;
        Relationships: [];
      };
      contacts: {
        Row: {
          id: string;
          organization_id: string;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          tags: string[];
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          tags?: string[];
          metadata?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["contacts"]["Insert"]>;
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          organization_id: string;
          contact_id: string | null;
          source: string | null;
          status: string;
          score: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          contact_id?: string | null;
          source?: string | null;
          status?: string;
          score?: number | null;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>;
        Relationships: [];
      };
      lead_activities: {
        Row: {
          id: string;
          organization_id: string;
          lead_id: string;
          activity_type: string;
          payload: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          lead_id: string;
          activity_type: string;
          payload?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["lead_activities"]["Insert"]>;
        Relationships: [];
      };
      business_policies: {
        Row: {
          id: string;
          organization_id: string;
          title: string;
          body: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          title: string;
          body: string;
          status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["business_policies"]["Insert"]>;
        Relationships: [];
      };
      org_onboarding_progress: {
        Row: {
          organization_id: string;
          current_step: number;
          completed_steps: number[];
          data: Json;
          completed_at: string | null;
          updated_at: string;
        };
        Insert: {
          organization_id: string;
          current_step?: number;
          completed_steps?: number[];
          data?: Json;
          completed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["org_onboarding_progress"]["Insert"]>;
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
