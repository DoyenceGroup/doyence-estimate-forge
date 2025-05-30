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
      activity_logs: {
        Row: {
          action: string
          created_at: string
          customer_name: string | null
          entity_id: string
          entity_type: string
          id: string
          project_name: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          customer_name?: string | null
          entity_id: string
          entity_type: string
          id?: string
          project_name?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          customer_name?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          project_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_audit_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          entity_id: string
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          entity_id: string
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      analytics_cache: {
        Row: {
          calculated_at: string
          id: string
          metric_name: string
          metric_value: Json
        }
        Insert: {
          calculated_at?: string
          id?: string
          metric_name: string
          metric_value: Json
        }
        Update: {
          calculated_at?: string
          id?: string
          metric_name?: string
          metric_value?: Json
        }
        Relationships: []
      }
      companies: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          name: string
          theme_color: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          theme_color?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          theme_color?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      company_invitations: {
        Row: {
          company_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          status: string
          token: string
        }
        Insert: {
          company_id: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          status?: string
          token: string
        }
        Update: {
          company_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_members: {
        Row: {
          company_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          company_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          company_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_notes: {
        Row: {
          author_id: string
          created_at: string | null
          customer_id: string
          id: string
          note: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          created_at?: string | null
          customer_id: string
          id?: string
          note: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          created_at?: string | null
          customer_id?: string
          id?: string
          note?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_notes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          cell_numbers: string[]
          created_at: string
          created_by: string
          emails: string[]
          id: string
          last_name: string
          lead_owner_id: string | null
          lead_source: string | null
          lead_source_description: string | null
          name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          cell_numbers?: string[]
          created_at?: string
          created_by: string
          emails?: string[]
          id?: string
          last_name: string
          lead_owner_id?: string | null
          lead_source?: string | null
          lead_source_description?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          cell_numbers?: string[]
          created_at?: string
          created_by?: string
          emails?: string[]
          id?: string
          last_name?: string
          lead_owner_id?: string | null
          lead_source?: string | null
          lead_source_description?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          company_id: string
          created_at: string | null
          created_by: string
          email: string
          id: string
          status: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          created_by: string
          email: string
          id?: string
          status?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          created_by?: string
          email?: string
          id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_address: string | null
          company_email: string | null
          company_id: string | null
          company_name: string | null
          company_role: string | null
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          logo_url: string | null
          phone_number: string | null
          profile_completed: boolean | null
          profile_photo_url: string | null
          role: string | null
          status: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          company_address?: string | null
          company_email?: string | null
          company_id?: string | null
          company_name?: string | null
          company_role?: string | null
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          logo_url?: string | null
          phone_number?: string | null
          profile_completed?: boolean | null
          profile_photo_url?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          company_address?: string | null
          company_email?: string | null
          company_id?: string | null
          company_name?: string | null
          company_role?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          logo_url?: string | null
          phone_number?: string | null
          profile_completed?: boolean | null
          profile_photo_url?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          created_by: string
          customer_id: string
          description: string | null
          id: string
          name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          customer_id: string
          description?: string | null
          id?: string
          name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          customer_id?: string
          description?: string | null
          id?: string
          name?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_impersonate_user: {
        Args: { user_id: string }
        Returns: Json
      }
      calculate_avg_users_per_company: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      calculate_total_companies: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      calculate_total_customers: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      calculate_total_users: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      check_company_membership: {
        Args: { check_company_id: string; check_user_id: string }
        Returns: boolean
      }
      check_user_company_access: {
        Args: { company_id: string }
        Returns: boolean
      }
      end_impersonation: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      generate_invitation_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_effective_user_company_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_effective_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_company_id: {
        Args: { user_uuid: string }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_company_member: {
        Args: { company_uuid: string; user_uuid: string }
        Returns: boolean
      }
      is_superuser: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_company_member: {
        Args: { company_uuid: string; user_uuid?: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          action_type: string
          entity_type: string
          entity_id: string
          details?: Json
        }
        Returns: undefined
      }
      start_impersonation: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      user_is_company_member: {
        Args: { _company_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "user" | "admin" | "superuser"
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
    Enums: {
      user_role: ["user", "admin", "superuser"],
    },
  },
} as const
