/** Generated from Supabase project schema. Regenerate via Supabase MCP generate_typescript_types or `supabase gen types`. Do not hand-edit table shapes. */

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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      audit_events: {
        Row: {
          action: string
          case_id: string | null
          created_at: string
          id: string
          metadata: Json
          resource_id: string | null
          resource_type: string
          user_id: string
        }
        Insert: {
          action: string
          case_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          resource_id?: string | null
          resource_type: string
          user_id: string
        }
        Update: {
          action?: string
          case_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          resource_id?: string | null
          resource_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "insurance_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          answer_json: Json
          case_id: string
          created_at: string
          id: string
          question: string
          user_id: string
        }
        Insert: {
          answer_json?: Json
          case_id: string
          created_at?: string
          id?: string
          question: string
          user_id: string
        }
        Update: {
          answer_json?: Json
          case_id?: string
          created_at?: string
          id?: string
          question?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "insurance_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          case_id: string
          created_at: string
          document_date: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          id: string
          mime_type: string | null
          original_filename: string
          page_count: number | null
          sha256: string | null
          status: Database["public"]["Enums"]["document_status"]
          storage_bucket: string
          storage_path: string
          uploaded_by: string
        }
        Insert: {
          case_id: string
          created_at?: string
          document_date?: string | null
          document_type?: Database["public"]["Enums"]["document_type"]
          id?: string
          mime_type?: string | null
          original_filename: string
          page_count?: number | null
          sha256?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          storage_bucket: string
          storage_path: string
          uploaded_by: string
        }
        Update: {
          case_id?: string
          created_at?: string
          document_date?: string | null
          document_type?: Database["public"]["Enums"]["document_type"]
          id?: string
          mime_type?: string | null
          original_filename?: string
          page_count?: number | null
          sha256?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          storage_bucket?: string
          storage_path?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "insurance_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          analysis_id: string | null
          case_id: string
          correction: string | null
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["feedback_kind"]
          recommendation_id: string | null
          user_id: string
        }
        Insert: {
          analysis_id?: string | null
          case_id: string
          correction?: string | null
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["feedback_kind"]
          recommendation_id?: string | null
          user_id: string
        }
        Update: {
          analysis_id?: string | null
          case_id?: string
          correction?: string | null
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["feedback_kind"]
          recommendation_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "policy_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "insurance_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      ingestions: {
        Row: {
          case_id: string
          completed_at: string | null
          created_at: string
          document_id: string
          error_code: string | null
          error_message: string | null
          id: string
          model_name: string | null
          parser_version: string | null
          processing_ms: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["ingestion_status"]
        }
        Insert: {
          case_id: string
          completed_at?: string | null
          created_at?: string
          document_id: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          model_name?: string | null
          parser_version?: string | null
          processing_ms?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["ingestion_status"]
        }
        Update: {
          case_id?: string
          completed_at?: string | null
          created_at?: string
          document_id?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          model_name?: string | null
          parser_version?: string | null
          processing_ms?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["ingestion_status"]
        }
        Relationships: [
          {
            foreignKeyName: "ingestions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "insurance_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingestions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_cases: {
        Row: {
          assigned_producer_id: string | null
          case_type: Database["public"]["Enums"]["insurance_case_type"]
          created_at: string
          display_name: string
          id: string
          owner_user_id: string
          status: Database["public"]["Enums"]["insurance_case_status"]
          updated_at: string
        }
        Insert: {
          assigned_producer_id?: string | null
          case_type: Database["public"]["Enums"]["insurance_case_type"]
          created_at?: string
          display_name: string
          id?: string
          owner_user_id: string
          status?: Database["public"]["Enums"]["insurance_case_status"]
          updated_at?: string
        }
        Update: {
          assigned_producer_id?: string | null
          case_type?: Database["public"]["Enums"]["insurance_case_type"]
          created_at?: string
          display_name?: string
          id?: string
          owner_user_id?: string
          status?: Database["public"]["Enums"]["insurance_case_status"]
          updated_at?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          case_id: string
          client_insight: string | null
          created_at: string
          id: string
          policy_id: string
          priority: Database["public"]["Enums"]["opportunity_priority"]
          producer_id: string | null
          producer_reason: string | null
          recommended_action: string | null
          status: Database["public"]["Enums"]["opportunity_status"]
          supporting_fact_ids: string[]
          title: string
          type: string
        }
        Insert: {
          case_id: string
          client_insight?: string | null
          created_at?: string
          id?: string
          policy_id: string
          priority?: Database["public"]["Enums"]["opportunity_priority"]
          producer_id?: string | null
          producer_reason?: string | null
          recommended_action?: string | null
          status?: Database["public"]["Enums"]["opportunity_status"]
          supporting_fact_ids?: string[]
          title: string
          type: string
        }
        Update: {
          case_id?: string
          client_insight?: string | null
          created_at?: string
          id?: string
          policy_id?: string
          priority?: Database["public"]["Enums"]["opportunity_priority"]
          producer_id?: string | null
          producer_reason?: string | null
          recommended_action?: string | null
          status?: Database["public"]["Enums"]["opportunity_status"]
          supporting_fact_ids?: string[]
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "insurance_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
        ]
      }
      policies: {
        Row: {
          annualized_premium: number | null
          carrier: string | null
          case_id: string
          created_at: string
          current_data_as_of: string | null
          death_benefit: number | null
          death_benefit_option: string | null
          id: string
          insured_name: string | null
          issue_age: number | null
          issue_date: string | null
          mec_status: boolean | null
          modal_premium: number | null
          no_lapse_annual_premium: number | null
          policy_number_masked: string | null
          policy_status: string | null
          premium_mode: string | null
          product: string | null
          product_type: string | null
          risk_class: string | null
          state: string | null
          tobacco_status: string | null
          updated_at: string
        }
        Insert: {
          annualized_premium?: number | null
          carrier?: string | null
          case_id: string
          created_at?: string
          current_data_as_of?: string | null
          death_benefit?: number | null
          death_benefit_option?: string | null
          id?: string
          insured_name?: string | null
          issue_age?: number | null
          issue_date?: string | null
          mec_status?: boolean | null
          modal_premium?: number | null
          no_lapse_annual_premium?: number | null
          policy_number_masked?: string | null
          policy_status?: string | null
          premium_mode?: string | null
          product?: string | null
          product_type?: string | null
          risk_class?: string | null
          state?: string | null
          tobacco_status?: string | null
          updated_at?: string
        }
        Update: {
          annualized_premium?: number | null
          carrier?: string | null
          case_id?: string
          created_at?: string
          current_data_as_of?: string | null
          death_benefit?: number | null
          death_benefit_option?: string | null
          id?: string
          insured_name?: string | null
          issue_age?: number | null
          issue_date?: string | null
          mec_status?: boolean | null
          modal_premium?: number | null
          no_lapse_annual_premium?: number | null
          policy_number_masked?: string | null
          policy_status?: string | null
          premium_mode?: string | null
          product?: string | null
          product_type?: string | null
          risk_class?: string | null
          state?: string | null
          tobacco_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "policies_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "insurance_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_analyses: {
        Row: {
          analysis_type: string
          case_id: string
          created_at: string
          id: string
          policy_id: string
          requires_current_inforce_illustration: boolean
          result_json: Json
          updated_at: string
        }
        Insert: {
          analysis_type: string
          case_id: string
          created_at?: string
          id?: string
          policy_id: string
          requires_current_inforce_illustration?: boolean
          result_json?: Json
          updated_at?: string
        }
        Update: {
          analysis_type?: string
          case_id?: string
          created_at?: string
          id?: string
          policy_id?: string
          requires_current_inforce_illustration?: boolean
          result_json?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_analyses_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "insurance_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_analyses_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_facts: {
        Row: {
          case_id: string
          confidence: number | null
          created_at: string
          document_id: string
          fact_type: Database["public"]["Enums"]["fact_type"]
          field_path: string
          id: string
          policy_id: string | null
          source_excerpt: string | null
          source_page: number | null
          value_json: Json
          verification_status: Database["public"]["Enums"]["fact_verification_status"]
        }
        Insert: {
          case_id: string
          confidence?: number | null
          created_at?: string
          document_id: string
          fact_type?: Database["public"]["Enums"]["fact_type"]
          field_path: string
          id?: string
          policy_id?: string | null
          source_excerpt?: string | null
          source_page?: number | null
          value_json: Json
          verification_status?: Database["public"]["Enums"]["fact_verification_status"]
        }
        Update: {
          case_id?: string
          confidence?: number | null
          created_at?: string
          document_id?: string
          fact_type?: Database["public"]["Enums"]["fact_type"]
          field_path?: string
          id?: string
          policy_id?: string | null
          source_excerpt?: string | null
          source_page?: number | null
          value_json?: Json
          verification_status?: Database["public"]["Enums"]["fact_verification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "policy_facts_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "insurance_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_facts_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_facts_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_ledgers: {
        Row: {
          alternate_accumulation_value: number | null
          alternate_death_benefit: number | null
          alternate_surrender_value: number | null
          annual_premium_outlay: number | null
          attained_age: number | null
          created_at: string
          document_id: string
          guaranteed_accumulation_value: number | null
          guaranteed_death_benefit: number | null
          guaranteed_surrender_value: number | null
          id: string
          illustrated_accumulation_value: number | null
          illustrated_death_benefit: number | null
          illustrated_surrender_value: number | null
          policy_id: string
          policy_year: number
        }
        Insert: {
          alternate_accumulation_value?: number | null
          alternate_death_benefit?: number | null
          alternate_surrender_value?: number | null
          annual_premium_outlay?: number | null
          attained_age?: number | null
          created_at?: string
          document_id: string
          guaranteed_accumulation_value?: number | null
          guaranteed_death_benefit?: number | null
          guaranteed_surrender_value?: number | null
          id?: string
          illustrated_accumulation_value?: number | null
          illustrated_death_benefit?: number | null
          illustrated_surrender_value?: number | null
          policy_id: string
          policy_year: number
        }
        Update: {
          alternate_accumulation_value?: number | null
          alternate_death_benefit?: number | null
          alternate_surrender_value?: number | null
          annual_premium_outlay?: number | null
          attained_age?: number | null
          created_at?: string
          document_id?: string
          guaranteed_accumulation_value?: number | null
          guaranteed_death_benefit?: number | null
          guaranteed_surrender_value?: number | null
          id?: string
          illustrated_accumulation_value?: number | null
          illustrated_death_benefit?: number | null
          illustrated_surrender_value?: number | null
          policy_id?: string
          policy_year?: number
        }
        Relationships: [
          {
            foreignKeyName: "policy_ledgers_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_ledgers_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["profile_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["profile_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["profile_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_profile_role: {
        Args: never
        Returns: Database["public"]["Enums"]["profile_role"]
      }
      document_precedence_rank: {
        Args: { p_type: Database["public"]["Enums"]["document_type"] }
        Returns: number
      }
      is_agency_admin_for_case: {
        Args: { p_case_id: string }
        Returns: boolean
      }
      is_assigned_producer: { Args: { p_case_id: string }; Returns: boolean }
      is_case_accessible: { Args: { p_case_id: string }; Returns: boolean }
      is_case_owner: { Args: { p_case_id: string }; Returns: boolean }
      is_policy_document_path_accessible: {
        Args: { object_name: string }
        Returns: boolean
      }
      is_policy_document_path_owner: {
        Args: { object_name: string }
        Returns: boolean
      }
      is_policywell_admin: { Args: never; Returns: boolean }
      supersede_policy_facts: {
        Args: {
          p_case_id: string
          p_except_fact_id?: string
          p_field_path: string
        }
        Returns: number
      }
    }
    Enums: {
      document_status:
        | "uploaded"
        | "processing"
        | "ready"
        | "failed"
        | "archived"
      document_type:
        | "application"
        | "original_illustration"
        | "inforce_illustration"
        | "annual_statement"
        | "policy_contract"
        | "amendment"
        | "underwriting_document"
        | "commercial_policy"
        | "loss_run"
        | "unknown"
      fact_type: "fact" | "calculation" | "inference"
      fact_verification_status:
        | "document_extracted"
        | "user_verified"
        | "producer_verified"
        | "superseded"
      feedback_kind: "accurate" | "needs_correction" | "not_helpful"
      ingestion_status: "queued" | "processing" | "completed" | "failed"
      insurance_case_status:
        | "created"
        | "uploading"
        | "ingesting"
        | "needs_information"
        | "ready_for_analysis"
        | "analyzing"
        | "analyzed"
        | "review_required"
        | "archived"
      insurance_case_type: "life" | "annuity" | "commercial"
      opportunity_priority: "low" | "medium" | "high" | "critical"
      opportunity_status:
        | "open"
        | "in_review"
        | "accepted"
        | "dismissed"
        | "completed"
      profile_role:
        | "consumer"
        | "producer"
        | "agency_admin"
        | "policywell_admin"
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
      document_status: [
        "uploaded",
        "processing",
        "ready",
        "failed",
        "archived",
      ],
      document_type: [
        "application",
        "original_illustration",
        "inforce_illustration",
        "annual_statement",
        "policy_contract",
        "amendment",
        "underwriting_document",
        "commercial_policy",
        "loss_run",
        "unknown",
      ],
      fact_type: ["fact", "calculation", "inference"],
      fact_verification_status: [
        "document_extracted",
        "user_verified",
        "producer_verified",
        "superseded",
      ],
      feedback_kind: ["accurate", "needs_correction", "not_helpful"],
      ingestion_status: ["queued", "processing", "completed", "failed"],
      insurance_case_status: [
        "created",
        "uploading",
        "ingesting",
        "needs_information",
        "ready_for_analysis",
        "analyzing",
        "analyzed",
        "review_required",
        "archived",
      ],
      insurance_case_type: ["life", "annuity", "commercial"],
      opportunity_priority: ["low", "medium", "high", "critical"],
      opportunity_status: [
        "open",
        "in_review",
        "accepted",
        "dismissed",
        "completed",
      ],
      profile_role: [
        "consumer",
        "producer",
        "agency_admin",
        "policywell_admin",
      ],
    },
  },
} as const
