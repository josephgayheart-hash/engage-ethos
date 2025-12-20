export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          target_id: string | null
          target_type: string | null
          tenant_id: string
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
          tenant_id: string
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      beta_feedback: {
        Row: {
          admin_notes: string | null
          created_at: string
          feature_area: string
          feedback_text: string
          feedback_type: string
          id: string
          page_path: string | null
          rating: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          feature_area: string
          feedback_text: string
          feedback_type?: string
          id?: string
          page_path?: string | null
          rating?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          feature_area?: string
          feedback_text?: string
          feedback_type?: string
          id?: string
          page_path?: string | null
          rating?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beta_feedback_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      byoc_uploads: {
        Row: {
          content_text: string | null
          created_at: string
          evaluation_result: Json | null
          file_name: string
          file_size: number | null
          file_type: string | null
          id: string
          tags: string[] | null
          tenant_id: string
          user_id: string
        }
        Insert: {
          content_text?: string | null
          created_at?: string
          evaluation_result?: Json | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          tags?: string[] | null
          tenant_id: string
          user_id: string
        }
        Update: {
          content_text?: string | null
          created_at?: string
          evaluation_result?: Json | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          tags?: string[] | null
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "byoc_uploads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      content_dna_analysis: {
        Row: {
          brand_platform: Json | null
          created_at: string
          custom_instructions: string | null
          id: string
          last_analyzed_at: string | null
          profile_id: string | null
          sample_count: number
          tenant_id: string
          updated_at: string
          voice_analysis: Json
        }
        Insert: {
          brand_platform?: Json | null
          created_at?: string
          custom_instructions?: string | null
          id?: string
          last_analyzed_at?: string | null
          profile_id?: string | null
          sample_count?: number
          tenant_id: string
          updated_at?: string
          voice_analysis?: Json
        }
        Update: {
          brand_platform?: Json | null
          created_at?: string
          custom_instructions?: string | null
          id?: string
          last_analyzed_at?: string | null
          profile_id?: string | null
          sample_count?: number
          tenant_id?: string
          updated_at?: string
          voice_analysis?: Json
        }
        Relationships: [
          {
            foreignKeyName: "content_dna_analysis_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "institutional_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_dna_analysis_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      content_dna_samples: {
        Row: {
          content_text: string | null
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          id: string
          profile_id: string | null
          sample_type: string | null
          source_description: string | null
          source_type: string | null
          tenant_id: string
          title: string | null
          user_id: string
        }
        Insert: {
          content_text?: string | null
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          profile_id?: string | null
          sample_type?: string | null
          source_description?: string | null
          source_type?: string | null
          tenant_id: string
          title?: string | null
          user_id: string
        }
        Update: {
          content_text?: string | null
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          profile_id?: string | null
          sample_type?: string | null
          source_description?: string | null
          source_type?: string | null
          tenant_id?: string
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_dna_samples_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "institutional_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_dna_samples_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      email_nudges: {
        Row: {
          created_at: string
          email_count: number
          email_type: string | null
          id: string
          metadata: Json | null
          nudge_type: string
          recipient_email: string | null
          recipient_name: string | null
          sent_at: string
          status: string | null
          subject: string | null
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_count?: number
          email_type?: string | null
          id?: string
          metadata?: Json | null
          nudge_type: string
          recipient_email?: string | null
          recipient_name?: string | null
          sent_at?: string
          status?: string | null
          subject?: string | null
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_count?: number
          email_type?: string | null
          id?: string
          metadata?: Json | null
          nudge_type?: string
          recipient_email?: string | null
          recipient_name?: string | null
          sent_at?: string
          status?: string | null
          subject?: string | null
          tenant_id?: string
          user_id?: string
        }
        Relationships: []
      }
      institutional_config: {
        Row: {
          config: Json
          created_at: string
          id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "institutional_config_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      institutional_profiles: {
        Row: {
          config: Json
          created_at: string
          created_by_user_id: string | null
          id: string
          name: string
          parent_profile_id: string | null
          profile_type: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          name: string
          parent_profile_id?: string | null
          profile_type?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          name?: string
          parent_profile_id?: string | null
          profile_type?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "institutional_profiles_parent_profile_id_fkey"
            columns: ["parent_profile_id"]
            isOneToOne: false
            referencedRelation: "institutional_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institutional_profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_tokens: {
        Row: {
          created_at: string
          created_by_admin_user_id: string | null
          email: string
          expires_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          created_by_admin_user_id?: string | null
          email: string
          expires_at: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          created_by_admin_user_id?: string | null
          email?: string
          expires_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invite_tokens_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_requests: {
        Row: {
          department: string | null
          email: string
          first_name: string
          id: string
          institution_name_input: string | null
          last_name: string
          notes: string | null
          phone: string | null
          referral_source: string | null
          request_status: Database["public"]["Enums"]["onboarding_status"]
          reviewed_at: string | null
          reviewed_by_admin_user_id: string | null
          submitted_at: string
          tenant_id: string | null
          title: string | null
        }
        Insert: {
          department?: string | null
          email: string
          first_name: string
          id?: string
          institution_name_input?: string | null
          last_name: string
          notes?: string | null
          phone?: string | null
          referral_source?: string | null
          request_status?: Database["public"]["Enums"]["onboarding_status"]
          reviewed_at?: string | null
          reviewed_by_admin_user_id?: string | null
          submitted_at?: string
          tenant_id?: string | null
          title?: string | null
        }
        Update: {
          department?: string | null
          email?: string
          first_name?: string
          id?: string
          institution_name_input?: string | null
          last_name?: string
          notes?: string | null
          phone?: string | null
          referral_source?: string | null
          request_status?: Database["public"]["Enums"]["onboarding_status"]
          reviewed_at?: string | null
          reviewed_by_admin_user_id?: string | null
          submitted_at?: string
          tenant_id?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_messages: {
        Row: {
          approved: boolean | null
          audience: string | null
          channel: string
          content: string
          created_at: string
          domain: string | null
          goal: string | null
          id: string
          institutional_profile_id: string | null
          metadata: Json | null
          mode: string | null
          moment: string | null
          notes: string | null
          sender_recommendation: string | null
          tenant_id: string
          title: string
          tone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approved?: boolean | null
          audience?: string | null
          channel: string
          content: string
          created_at?: string
          domain?: string | null
          goal?: string | null
          id?: string
          institutional_profile_id?: string | null
          metadata?: Json | null
          mode?: string | null
          moment?: string | null
          notes?: string | null
          sender_recommendation?: string | null
          tenant_id: string
          title: string
          tone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approved?: boolean | null
          audience?: string | null
          channel?: string
          content?: string
          created_at?: string
          domain?: string | null
          goal?: string | null
          id?: string
          institutional_profile_id?: string | null
          metadata?: Json | null
          mode?: string | null
          moment?: string | null
          notes?: string | null
          sender_recommendation?: string | null
          tenant_id?: string
          title?: string
          tone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_messages_institutional_profile_id_fkey"
            columns: ["institutional_profile_id"]
            isOneToOne: false
            referencedRelation: "institutional_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      playground_conversations: {
        Row: {
          content_dna_id: string | null
          created_at: string
          id: string
          institutional_profile_id: string | null
          tenant_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content_dna_id?: string | null
          created_at?: string
          id?: string
          institutional_profile_id?: string | null
          tenant_id: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content_dna_id?: string | null
          created_at?: string
          id?: string
          institutional_profile_id?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playground_conversations_content_dna_id_fkey"
            columns: ["content_dna_id"]
            isOneToOne: false
            referencedRelation: "content_dna_analysis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playground_conversations_institutional_profile_id_fkey"
            columns: ["institutional_profile_id"]
            isOneToOne: false
            referencedRelation: "institutional_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playground_conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      playground_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "playground_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "playground_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          department: string | null
          email: string
          first_name: string
          id: string
          last_login_at: string | null
          last_name: string
          last_password_reset_at: string | null
          password_reset_required: boolean
          phone: string | null
          status: Database["public"]["Enums"]["user_status"]
          tenant_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          email: string
          first_name: string
          id: string
          last_login_at?: string | null
          last_name: string
          last_password_reset_at?: string | null
          password_reset_required?: boolean
          phone?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          tenant_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string
          first_name?: string
          id?: string
          last_login_at?: string | null
          last_name?: string
          last_password_reset_at?: string | null
          password_reset_required?: boolean
          phone?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          tenant_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          joined_at: string | null
          personal_message: string | null
          referee_email: string
          referee_name: string | null
          referral_type: string
          referrer_tenant_id: string
          referrer_user_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          joined_at?: string | null
          personal_message?: string | null
          referee_email: string
          referee_name?: string | null
          referral_type: string
          referrer_tenant_id: string
          referrer_user_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          joined_at?: string | null
          personal_message?: string | null
          referee_email?: string
          referee_name?: string | null
          referral_type?: string
          referrer_tenant_id?: string
          referrer_user_id?: string
          status?: string
        }
        Relationships: []
      }
      shared_templates: {
        Row: {
          approval_notes: string | null
          content: string
          created_at: string
          created_by_user_id: string | null
          ethical_guardrails: string[] | null
          id: string
          intent_statement: string | null
          maintainer: string | null
          metadata: Json | null
          owner: string | null
          placeholders: Json | null
          playbook: string | null
          required_fields: Json | null
          status: string
          tenant_id: string
          title: string
          updated_at: string
          use_cases: Json | null
          variants: Json | null
          version: string | null
        }
        Insert: {
          approval_notes?: string | null
          content: string
          created_at?: string
          created_by_user_id?: string | null
          ethical_guardrails?: string[] | null
          id?: string
          intent_statement?: string | null
          maintainer?: string | null
          metadata?: Json | null
          owner?: string | null
          placeholders?: Json | null
          playbook?: string | null
          required_fields?: Json | null
          status?: string
          tenant_id: string
          title: string
          updated_at?: string
          use_cases?: Json | null
          variants?: Json | null
          version?: string | null
        }
        Update: {
          approval_notes?: string | null
          content?: string
          created_at?: string
          created_by_user_id?: string | null
          ethical_guardrails?: string[] | null
          id?: string
          intent_statement?: string | null
          maintainer?: string | null
          metadata?: Json | null
          owner?: string | null
          placeholders?: Json | null
          playbook?: string | null
          required_fields?: Json | null
          status?: string
          tenant_id?: string
          title?: string
          updated_at?: string
          use_cases?: Json | null
          variants?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          accent_color: string | null
          created_at: string
          id: string
          institution_name: string
          logo_url: string | null
          primary_color: string | null
          status: Database["public"]["Enums"]["tenant_status"]
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          created_at?: string
          id?: string
          institution_name: string
          logo_url?: string | null
          primary_color?: string | null
          status?: Database["public"]["Enums"]["tenant_status"]
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          created_at?: string
          id?: string
          institution_name?: string
          logo_url?: string | null
          primary_color?: string | null
          status?: Database["public"]["Enums"]["tenant_status"]
          updated_at?: string
        }
        Relationships: []
      }
      tool_usage_events: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json | null
          tenant_id: string
          tool_name: string
          user_id: string
        }
        Insert: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          tenant_id: string
          tool_name: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          tenant_id?: string
          tool_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_usage_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_tenant_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      is_user_active: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user" | "approver" | "super_admin"
      onboarding_status: "submitted" | "approved" | "rejected"
      tenant_status: "active" | "inactive"
      user_status: "invited" | "pending" | "active" | "locked" | "disabled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "approver", "super_admin"],
      onboarding_status: ["submitted", "approved", "rejected"],
      tenant_status: ["active", "inactive"],
      user_status: ["invited", "pending", "active", "locked", "disabled"],
    },
  },
} as const
