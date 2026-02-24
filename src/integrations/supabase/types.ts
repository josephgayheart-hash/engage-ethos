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
      brand_audit_reports: {
        Row: {
          created_at: string | null
          id: string
          overall_consistency_score: number | null
          profile_id: string | null
          recommendations: Json | null
          report_date: string | null
          tenant_id: string
          top_issues: Json | null
          touchpoint_breakdown: Json | null
          touchpoints_audited: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          overall_consistency_score?: number | null
          profile_id?: string | null
          recommendations?: Json | null
          report_date?: string | null
          tenant_id: string
          top_issues?: Json | null
          touchpoint_breakdown?: Json | null
          touchpoints_audited?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          overall_consistency_score?: number | null
          profile_id?: string | null
          recommendations?: Json | null
          report_date?: string | null
          tenant_id?: string
          top_issues?: Json | null
          touchpoint_breakdown?: Json | null
          touchpoints_audited?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_audit_reports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "institutional_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_audit_reports_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_audit_touchpoints: {
        Row: {
          analysis_result: Json | null
          brand_score: number | null
          content_sample: string | null
          created_at: string | null
          id: string
          profile_id: string | null
          remediation_notes: string | null
          status: string | null
          tenant_id: string
          terminology_issues: Json | null
          touchpoint_category: string | null
          touchpoint_name: string
          touchpoint_type: string
          updated_at: string | null
          user_id: string
          voice_score: number | null
        }
        Insert: {
          analysis_result?: Json | null
          brand_score?: number | null
          content_sample?: string | null
          created_at?: string | null
          id?: string
          profile_id?: string | null
          remediation_notes?: string | null
          status?: string | null
          tenant_id: string
          terminology_issues?: Json | null
          touchpoint_category?: string | null
          touchpoint_name: string
          touchpoint_type: string
          updated_at?: string | null
          user_id: string
          voice_score?: number | null
        }
        Update: {
          analysis_result?: Json | null
          brand_score?: number | null
          content_sample?: string | null
          created_at?: string | null
          id?: string
          profile_id?: string | null
          remediation_notes?: string | null
          status?: string | null
          tenant_id?: string
          terminology_issues?: Json | null
          touchpoint_category?: string | null
          touchpoint_name?: string
          touchpoint_type?: string
          updated_at?: string | null
          user_id?: string
          voice_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_audit_touchpoints_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "institutional_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_audit_touchpoints_tenant_id_fkey"
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
      campus_photo_samples: {
        Row: {
          ai_analysis: Json | null
          ai_analyzed_at: string | null
          created_at: string
          description: string | null
          file_name: string
          file_url: string
          id: string
          is_active: boolean
          photo_category: string
          profile_id: string | null
          tenant_id: string
          user_id: string
        }
        Insert: {
          ai_analysis?: Json | null
          ai_analyzed_at?: string | null
          created_at?: string
          description?: string | null
          file_name: string
          file_url: string
          id?: string
          is_active?: boolean
          photo_category?: string
          profile_id?: string | null
          tenant_id: string
          user_id: string
        }
        Update: {
          ai_analysis?: Json | null
          ai_analyzed_at?: string | null
          created_at?: string
          description?: string | null
          file_name?: string
          file_url?: string
          id?: string
          is_active?: boolean
          photo_category?: string
          profile_id?: string | null
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campus_photo_samples_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "institutional_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campus_photo_samples_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      content_dna_adjustments: {
        Row: {
          content_dna_id: string
          created_at: string
          dimensions: Json
          id: string
          override_rules: Json
          profile_id: string | null
          section_feedback: Json
          tenant_id: string
          updated_at: string
          updated_by_user_id: string | null
        }
        Insert: {
          content_dna_id: string
          created_at?: string
          dimensions?: Json
          id?: string
          override_rules?: Json
          profile_id?: string | null
          section_feedback?: Json
          tenant_id: string
          updated_at?: string
          updated_by_user_id?: string | null
        }
        Update: {
          content_dna_id?: string
          created_at?: string
          dimensions?: Json
          id?: string
          override_rules?: Json
          profile_id?: string | null
          section_feedback?: Json
          tenant_id?: string
          updated_at?: string
          updated_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_dna_adjustments_content_dna_id_fkey"
            columns: ["content_dna_id"]
            isOneToOne: false
            referencedRelation: "content_dna_analysis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_dna_adjustments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "institutional_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_dna_adjustments_tenant_id_fkey"
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
          extracted_at: string | null
          extraction_status: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          id: string
          key_themes: string[] | null
          profile_id: string | null
          sample_type: string | null
          semantic_summary: string | null
          source_description: string | null
          source_type: string | null
          source_url: string | null
          tenant_id: string
          title: string | null
          user_id: string
        }
        Insert: {
          content_text?: string | null
          created_at?: string
          extracted_at?: string | null
          extraction_status?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          key_themes?: string[] | null
          profile_id?: string | null
          sample_type?: string | null
          semantic_summary?: string | null
          source_description?: string | null
          source_type?: string | null
          source_url?: string | null
          tenant_id: string
          title?: string | null
          user_id: string
        }
        Update: {
          content_text?: string | null
          created_at?: string
          extracted_at?: string | null
          extraction_status?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          key_themes?: string[] | null
          profile_id?: string | null
          sample_type?: string | null
          semantic_summary?: string | null
          source_description?: string | null
          source_type?: string | null
          source_url?: string | null
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
      content_dna_versions: {
        Row: {
          brand_platform: Json | null
          change_summary: string | null
          content_dna_id: string
          created_at: string
          created_by_user_id: string | null
          custom_instructions: string | null
          id: string
          profile_id: string | null
          sample_count: number
          tenant_id: string
          version_number: number
          voice_analysis: Json
        }
        Insert: {
          brand_platform?: Json | null
          change_summary?: string | null
          content_dna_id: string
          created_at?: string
          created_by_user_id?: string | null
          custom_instructions?: string | null
          id?: string
          profile_id?: string | null
          sample_count?: number
          tenant_id: string
          version_number?: number
          voice_analysis?: Json
        }
        Update: {
          brand_platform?: Json | null
          change_summary?: string | null
          content_dna_id?: string
          created_at?: string
          created_by_user_id?: string | null
          custom_instructions?: string | null
          id?: string
          profile_id?: string | null
          sample_count?: number
          tenant_id?: string
          version_number?: number
          voice_analysis?: Json
        }
        Relationships: [
          {
            foreignKeyName: "content_dna_versions_content_dna_id_fkey"
            columns: ["content_dna_id"]
            isOneToOne: false
            referencedRelation: "content_dna_analysis"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_overlay_patterns: {
        Row: {
          created_at: string
          file_name: string
          file_type: string | null
          file_url: string
          id: string
          is_active: boolean
          name: string
          profile_id: string | null
          sort_order: number | null
          source: string
          tenant_id: string
          updated_at: string
          uploaded_by_user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_type?: string | null
          file_url: string
          id?: string
          is_active?: boolean
          name: string
          profile_id?: string | null
          sort_order?: number | null
          source?: string
          tenant_id: string
          updated_at?: string
          uploaded_by_user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_type?: string | null
          file_url?: string
          id?: string
          is_active?: boolean
          name?: string
          profile_id?: string | null
          sort_order?: number | null
          source?: string
          tenant_id?: string
          updated_at?: string
          uploaded_by_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_overlay_patterns_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "institutional_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_overlay_patterns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      email_nudges: {
        Row: {
          bounced_at: string | null
          clicked_at: string | null
          created_at: string
          delivered_at: string | null
          delivery_status: string | null
          email_count: number
          email_type: string | null
          events: Json
          id: string
          last_event_at: string | null
          link_clicks: Json | null
          metadata: Json | null
          nudge_type: string
          opened_at: string | null
          provider: string | null
          provider_message_id: string | null
          recipient_email: string | null
          recipient_name: string | null
          sent_at: string
          status: string | null
          subject: string | null
          tenant_id: string
          user_id: string
        }
        Insert: {
          bounced_at?: string | null
          clicked_at?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_status?: string | null
          email_count?: number
          email_type?: string | null
          events?: Json
          id?: string
          last_event_at?: string | null
          link_clicks?: Json | null
          metadata?: Json | null
          nudge_type: string
          opened_at?: string | null
          provider?: string | null
          provider_message_id?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          sent_at?: string
          status?: string | null
          subject?: string | null
          tenant_id: string
          user_id: string
        }
        Update: {
          bounced_at?: string | null
          clicked_at?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_status?: string | null
          email_count?: number
          email_type?: string | null
          events?: Json
          id?: string
          last_event_at?: string | null
          link_clicks?: Json | null
          metadata?: Json | null
          nudge_type?: string
          opened_at?: string | null
          provider?: string | null
          provider_message_id?: string | null
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
      email_sends: {
        Row: {
          id: string
          metadata: Json | null
          sent_at: string
          status: string
          template_id: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          id?: string
          metadata?: Json | null
          sent_at?: string
          status?: string
          template_id: string
          tenant_id: string
          user_id: string
        }
        Update: {
          id?: string
          metadata?: Json | null
          sent_at?: string
          status?: string
          template_id?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_sends_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_sends_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          created_at: string
          description: string | null
          html_content: string
          id: string
          is_active: boolean
          last_sent_at: string | null
          name: string
          send_count: number | null
          subject: string
          template_key: string
          trigger_config: Json | null
          trigger_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          html_content: string
          id?: string
          is_active?: boolean
          last_sent_at?: string | null
          name: string
          send_count?: number | null
          subject: string
          template_key: string
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          html_content?: string
          id?: string
          is_active?: boolean
          last_sent_at?: string | null
          name?: string
          send_count?: number | null
          subject?: string
          template_key?: string
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      fact_book: {
        Row: {
          as_of_date: string | null
          category: string
          change_amount: string | null
          change_direction: string | null
          context: string | null
          created_at: string | null
          created_by_user_id: string | null
          display_format: string | null
          id: string
          is_highlight: boolean | null
          label: string
          previous_value: string | null
          profile_id: string | null
          sort_order: number | null
          source_document: string | null
          source_url: string | null
          subcategory: string | null
          tenant_id: string
          updated_at: string | null
          value: string
          year: string | null
        }
        Insert: {
          as_of_date?: string | null
          category: string
          change_amount?: string | null
          change_direction?: string | null
          context?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          display_format?: string | null
          id?: string
          is_highlight?: boolean | null
          label: string
          previous_value?: string | null
          profile_id?: string | null
          sort_order?: number | null
          source_document?: string | null
          source_url?: string | null
          subcategory?: string | null
          tenant_id: string
          updated_at?: string | null
          value: string
          year?: string | null
        }
        Update: {
          as_of_date?: string | null
          category?: string
          change_amount?: string | null
          change_direction?: string | null
          context?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          display_format?: string | null
          id?: string
          is_highlight?: boolean | null
          label?: string
          previous_value?: string | null
          profile_id?: string | null
          sort_order?: number | null
          source_document?: string | null
          source_url?: string | null
          subcategory?: string | null
          tenant_id?: string
          updated_at?: string | null
          value?: string
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fact_book_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "institutional_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fact_book_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
          client_status: string | null
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
          client_status?: string | null
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
          client_status?: string | null
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
      library_collection_items: {
        Row: {
          added_at: string
          added_by: string | null
          collection_id: string
          external_asset: Json | null
          id: string
          item_type: string
          message_id: string | null
          sort_order: number | null
          template_id: string | null
          tenant_id: string
        }
        Insert: {
          added_at?: string
          added_by?: string | null
          collection_id: string
          external_asset?: Json | null
          id?: string
          item_type: string
          message_id?: string | null
          sort_order?: number | null
          template_id?: string | null
          tenant_id: string
        }
        Update: {
          added_at?: string
          added_by?: string | null
          collection_id?: string
          external_asset?: Json | null
          id?: string
          item_type?: string
          message_id?: string | null
          sort_order?: number | null
          template_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "library_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_collection_items_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "personal_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_collection_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "shared_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_collection_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      library_collections: {
        Row: {
          collection_type: string
          cover_image_url: string | null
          created_at: string
          created_by: string
          created_by_name: string | null
          description: string | null
          id: string
          name: string
          status: string
          tags: string[] | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          collection_type?: string
          cover_image_url?: string | null
          created_at?: string
          created_by: string
          created_by_name?: string | null
          description?: string | null
          id?: string
          name: string
          status?: string
          tags?: string[] | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          collection_type?: string
          cover_image_url?: string | null
          created_at?: string
          created_by?: string
          created_by_name?: string | null
          description?: string | null
          id?: string
          name?: string
          status?: string
          tags?: string[] | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_collections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      library_usage_events: {
        Row: {
          action: string
          created_at: string
          id: string
          message_id: string | null
          metadata: Json | null
          template_id: string | null
          tenant_id: string
          user_id: string
          user_name: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          message_id?: string | null
          metadata?: Json | null
          template_id?: string | null
          tenant_id: string
          user_id: string
          user_name?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          message_id?: string | null
          metadata?: Json | null
          template_id?: string | null
          tenant_id?: string
          user_id?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "library_usage_events_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "personal_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_usage_events_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "shared_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_usage_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_requests: {
        Row: {
          agency_name: string | null
          agency_website: string | null
          department: string | null
          email: string
          estimated_client_count: number | null
          first_name: string
          id: string
          institution_name_input: string | null
          last_name: string
          notes: string | null
          phone: string | null
          referral_source: string | null
          request_status: Database["public"]["Enums"]["onboarding_status"]
          request_type: string
          reviewed_at: string | null
          reviewed_by_admin_user_id: string | null
          submitted_at: string
          tenant_id: string | null
          title: string | null
        }
        Insert: {
          agency_name?: string | null
          agency_website?: string | null
          department?: string | null
          email: string
          estimated_client_count?: number | null
          first_name: string
          id?: string
          institution_name_input?: string | null
          last_name: string
          notes?: string | null
          phone?: string | null
          referral_source?: string | null
          request_status?: Database["public"]["Enums"]["onboarding_status"]
          request_type?: string
          reviewed_at?: string | null
          reviewed_by_admin_user_id?: string | null
          submitted_at?: string
          tenant_id?: string | null
          title?: string | null
        }
        Update: {
          agency_name?: string | null
          agency_website?: string | null
          department?: string | null
          email?: string
          estimated_client_count?: number | null
          first_name?: string
          id?: string
          institution_name_input?: string | null
          last_name?: string
          notes?: string | null
          phone?: string | null
          referral_source?: string | null
          request_status?: Database["public"]["Enums"]["onboarding_status"]
          request_type?: string
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
      outreach_history: {
        Row: {
          body: string
          bounced_at: string | null
          clicked_at: string | null
          created_at: string | null
          created_by_user_id: string | null
          delivered_at: string | null
          delivery_status: string | null
          events: Json | null
          from_email: string | null
          from_name: string | null
          html_body: string | null
          id: string
          last_event_at: string | null
          opened_at: string | null
          prospect_id: string | null
          provider: string | null
          provider_message_id: string | null
          sent_at: string | null
          subject: string | null
          to_email: string | null
          to_name: string | null
          type: string
        }
        Insert: {
          body: string
          bounced_at?: string | null
          clicked_at?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          delivered_at?: string | null
          delivery_status?: string | null
          events?: Json | null
          from_email?: string | null
          from_name?: string | null
          html_body?: string | null
          id?: string
          last_event_at?: string | null
          opened_at?: string | null
          prospect_id?: string | null
          provider?: string | null
          provider_message_id?: string | null
          sent_at?: string | null
          subject?: string | null
          to_email?: string | null
          to_name?: string | null
          type: string
        }
        Update: {
          body?: string
          bounced_at?: string | null
          clicked_at?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          delivered_at?: string | null
          delivery_status?: string | null
          events?: Json | null
          from_email?: string | null
          from_name?: string | null
          html_body?: string | null
          id?: string
          last_event_at?: string | null
          opened_at?: string | null
          prospect_id?: string | null
          provider?: string | null
          provider_message_id?: string | null
          sent_at?: string | null
          subject?: string | null
          to_email?: string | null
          to_name?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "outreach_history_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "sales_prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_messages: {
        Row: {
          approved: boolean | null
          audience: string | null
          channel: string
          channel_drafts: Json | null
          channels: string[] | null
          cohort: Json | null
          content: string
          cover_image_url: string | null
          created_at: string
          created_by_name: string | null
          domain: string | null
          external_assets: Json | null
          goal: string | null
          id: string
          institutional_profile_id: string | null
          metadata: Json | null
          mode: string | null
          moment: string | null
          notes: string | null
          remixed_from: Json | null
          sender_recommendation: string | null
          source: string | null
          submitted_at: string | null
          submitted_to_library: boolean
          tags: string[] | null
          tenant_id: string
          title: string
          tone: string | null
          updated_at: string
          user_id: string
          versions: Json
        }
        Insert: {
          approved?: boolean | null
          audience?: string | null
          channel: string
          channel_drafts?: Json | null
          channels?: string[] | null
          cohort?: Json | null
          content: string
          cover_image_url?: string | null
          created_at?: string
          created_by_name?: string | null
          domain?: string | null
          external_assets?: Json | null
          goal?: string | null
          id?: string
          institutional_profile_id?: string | null
          metadata?: Json | null
          mode?: string | null
          moment?: string | null
          notes?: string | null
          remixed_from?: Json | null
          sender_recommendation?: string | null
          source?: string | null
          submitted_at?: string | null
          submitted_to_library?: boolean
          tags?: string[] | null
          tenant_id: string
          title: string
          tone?: string | null
          updated_at?: string
          user_id: string
          versions?: Json
        }
        Update: {
          approved?: boolean | null
          audience?: string | null
          channel?: string
          channel_drafts?: Json | null
          channels?: string[] | null
          cohort?: Json | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          created_by_name?: string | null
          domain?: string | null
          external_assets?: Json | null
          goal?: string | null
          id?: string
          institutional_profile_id?: string | null
          metadata?: Json | null
          mode?: string | null
          moment?: string | null
          notes?: string | null
          remixed_from?: Json | null
          sender_recommendation?: string | null
          source?: string | null
          submitted_at?: string | null
          submitted_to_library?: boolean
          tags?: string[] | null
          tenant_id?: string
          title?: string
          tone?: string | null
          updated_at?: string
          user_id?: string
          versions?: Json
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
      playbook_kits: {
        Row: {
          best_practices: string[] | null
          category: string
          created_at: string | null
          description: string | null
          id: string
          institution_types: string[] | null
          is_active: boolean | null
          journey_template: Json | null
          kit_key: string
          message_templates: Json | null
          name: string
          research_notes: string | null
          target_audiences: string[] | null
          target_cohorts: string[] | null
          updated_at: string | null
        }
        Insert: {
          best_practices?: string[] | null
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          institution_types?: string[] | null
          is_active?: boolean | null
          journey_template?: Json | null
          kit_key: string
          message_templates?: Json | null
          name: string
          research_notes?: string | null
          target_audiences?: string[] | null
          target_cohorts?: string[] | null
          updated_at?: string | null
        }
        Update: {
          best_practices?: string[] | null
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          institution_types?: string[] | null
          is_active?: boolean | null
          journey_template?: Json | null
          kit_key?: string
          message_templates?: Json | null
          name?: string
          research_notes?: string | null
          target_audiences?: string[] | null
          target_cohorts?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
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
      rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          identifier: string
          request_count: number
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          identifier: string
          request_count?: number
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          identifier?: string
          request_count?: number
          window_start?: string
        }
        Relationships: []
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
      sales_prospects: {
        Row: {
          brand_launch_date: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contact_title: string | null
          created_by_user_id: string | null
          discovered_at: string | null
          extracted_contacts: Json | null
          id: string
          linkedin_url: string | null
          notes: string | null
          source_article_title: string | null
          source_article_url: string | null
          status: string | null
          university_name: string
          updated_at: string | null
          url: string
        }
        Insert: {
          brand_launch_date?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_title?: string | null
          created_by_user_id?: string | null
          discovered_at?: string | null
          extracted_contacts?: Json | null
          id?: string
          linkedin_url?: string | null
          notes?: string | null
          source_article_title?: string | null
          source_article_url?: string | null
          status?: string | null
          university_name: string
          updated_at?: string | null
          url: string
        }
        Update: {
          brand_launch_date?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_title?: string | null
          created_by_user_id?: string | null
          discovered_at?: string | null
          extracted_contacts?: Json | null
          id?: string
          linkedin_url?: string | null
          notes?: string | null
          source_article_title?: string | null
          source_article_url?: string | null
          status?: string | null
          university_name?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string
          endpoint: string | null
          event_type: string
          id: string
          identifier: string | null
          metadata: Json | null
          severity: string
        }
        Insert: {
          created_at?: string
          endpoint?: string | null
          event_type: string
          id?: string
          identifier?: string | null
          metadata?: Json | null
          severity?: string
        }
        Update: {
          created_at?: string
          endpoint?: string | null
          event_type?: string
          id?: string
          identifier?: string | null
          metadata?: Json | null
          severity?: string
        }
        Relationships: []
      }
      shared_templates: {
        Row: {
          approval_notes: string | null
          change_history: Json
          college_name: string | null
          content: string
          cover_image_url: string | null
          created_at: string
          created_by_name: string | null
          created_by_user_id: string | null
          department_name: string | null
          ethical_guardrails: string[] | null
          external_assets: Json | null
          guidelines: string | null
          id: string
          institutional_profile_id: string | null
          intent_statement: string | null
          maintainer: string | null
          metadata: Json | null
          owner: string | null
          placeholders: Json | null
          playbook: string | null
          required_fields: Json | null
          source: string | null
          status: string
          tags: string[] | null
          tenant_id: string
          title: string
          updated_at: string
          use_cases: Json | null
          variants: Json | null
          version: string | null
        }
        Insert: {
          approval_notes?: string | null
          change_history?: Json
          college_name?: string | null
          content: string
          cover_image_url?: string | null
          created_at?: string
          created_by_name?: string | null
          created_by_user_id?: string | null
          department_name?: string | null
          ethical_guardrails?: string[] | null
          external_assets?: Json | null
          guidelines?: string | null
          id?: string
          institutional_profile_id?: string | null
          intent_statement?: string | null
          maintainer?: string | null
          metadata?: Json | null
          owner?: string | null
          placeholders?: Json | null
          playbook?: string | null
          required_fields?: Json | null
          source?: string | null
          status?: string
          tags?: string[] | null
          tenant_id: string
          title: string
          updated_at?: string
          use_cases?: Json | null
          variants?: Json | null
          version?: string | null
        }
        Update: {
          approval_notes?: string | null
          change_history?: Json
          college_name?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          created_by_name?: string | null
          created_by_user_id?: string | null
          department_name?: string | null
          ethical_guardrails?: string[] | null
          external_assets?: Json | null
          guidelines?: string | null
          id?: string
          institutional_profile_id?: string | null
          intent_statement?: string | null
          maintainer?: string | null
          metadata?: Json | null
          owner?: string | null
          placeholders?: Json | null
          playbook?: string | null
          required_fields?: Json | null
          source?: string | null
          status?: string
          tags?: string[] | null
          tenant_id?: string
          title?: string
          updated_at?: string
          use_cases?: Json | null
          variants?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_templates_institutional_profile_id_fkey"
            columns: ["institutional_profile_id"]
            isOneToOne: false
            referencedRelation: "institutional_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      story_bank: {
        Row: {
          campaigns: string[] | null
          created_at: string | null
          created_by_user_id: string | null
          id: string
          is_approved: boolean | null
          is_featured: boolean | null
          narrative: string
          profile_id: string | null
          programs: string[] | null
          pull_quote: string | null
          source_description: string | null
          source_url: string | null
          story_type: string
          subject_image_url: string | null
          subject_name: string | null
          subject_role: string | null
          tenant_id: string
          themes: string[] | null
          title: string
          updated_at: string | null
          usage_contexts: string[] | null
        }
        Insert: {
          campaigns?: string[] | null
          created_at?: string | null
          created_by_user_id?: string | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          narrative: string
          profile_id?: string | null
          programs?: string[] | null
          pull_quote?: string | null
          source_description?: string | null
          source_url?: string | null
          story_type: string
          subject_image_url?: string | null
          subject_name?: string | null
          subject_role?: string | null
          tenant_id: string
          themes?: string[] | null
          title: string
          updated_at?: string | null
          usage_contexts?: string[] | null
        }
        Update: {
          campaigns?: string[] | null
          created_at?: string | null
          created_by_user_id?: string | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          narrative?: string
          profile_id?: string | null
          programs?: string[] | null
          pull_quote?: string | null
          source_description?: string | null
          source_url?: string | null
          story_type?: string
          subject_image_url?: string | null
          subject_name?: string | null
          subject_role?: string | null
          tenant_id?: string
          themes?: string[] | null
          title?: string
          updated_at?: string | null
          usage_contexts?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "story_bank_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "institutional_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_bank_tenant_id_fkey"
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
          agency_contact_email: string | null
          agency_website: string | null
          client_limit: number | null
          created_at: string
          id: string
          institution_name: string
          logo_url: string | null
          primary_color: string | null
          status: Database["public"]["Enums"]["tenant_status"]
          tenant_type: Database["public"]["Enums"]["tenant_type"]
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          agency_contact_email?: string | null
          agency_website?: string | null
          client_limit?: number | null
          created_at?: string
          id?: string
          institution_name: string
          logo_url?: string | null
          primary_color?: string | null
          status?: Database["public"]["Enums"]["tenant_status"]
          tenant_type?: Database["public"]["Enums"]["tenant_type"]
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          agency_contact_email?: string | null
          agency_website?: string | null
          client_limit?: number | null
          created_at?: string
          id?: string
          institution_name?: string
          logo_url?: string | null
          primary_color?: string | null
          status?: Database["public"]["Enums"]["tenant_status"]
          tenant_type?: Database["public"]["Enums"]["tenant_type"]
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
      user_drafts: {
        Row: {
          cover_image_url: string | null
          created_at: string
          draft_data: Json
          draft_type: string
          id: string
          institutional_profile_id: string | null
          tenant_id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          draft_data?: Json
          draft_type: string
          id?: string
          institutional_profile_id?: string | null
          tenant_id: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          draft_data?: Json
          draft_type?: string
          id?: string
          institutional_profile_id?: string | null
          tenant_id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_drafts_institutional_profile_id_fkey"
            columns: ["institutional_profile_id"]
            isOneToOne: false
            referencedRelation: "institutional_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_drafts_tenant_id_fkey"
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
      check_rate_limit: {
        Args: {
          p_endpoint: string
          p_identifier: string
          p_max_requests?: number
          p_window_seconds?: number
        }
        Returns: boolean
      }
      get_user_tenant_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_agency_admin: { Args: { _user_id: string }; Returns: boolean }
      is_agency_member: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      is_user_active: { Args: { _user_id: string }; Returns: boolean }
      search_content_samples: {
        Args: {
          p_limit?: number
          p_profile_id?: string
          p_search_query?: string
          p_tenant_id: string
          p_themes?: string[]
        }
        Returns: {
          content_text: string
          id: string
          key_themes: string[]
          relevance_score: number
          sample_type: string
          semantic_summary: string
          title: string
        }[]
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "user"
        | "approver"
        | "super_admin"
        | "agency_admin"
        | "agency_user"
      onboarding_status: "submitted" | "approved" | "rejected"
      tenant_status: "active" | "inactive"
      tenant_type: "university" | "agency"
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
      app_role: [
        "admin",
        "user",
        "approver",
        "super_admin",
        "agency_admin",
        "agency_user",
      ],
      onboarding_status: ["submitted", "approved", "rejected"],
      tenant_status: ["active", "inactive"],
      tenant_type: ["university", "agency"],
      user_status: ["invited", "pending", "active", "locked", "disabled"],
    },
  },
} as const
