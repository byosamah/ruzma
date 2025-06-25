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
      clients: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      freelancer_branding: {
        Row: {
          created_at: string
          freelancer_bio: string
          freelancer_name: string
          freelancer_title: string
          id: string
          logo_url: string | null
          primary_color: string
          secondary_color: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          freelancer_bio?: string
          freelancer_name?: string
          freelancer_title?: string
          id?: string
          logo_url?: string | null
          primary_color?: string
          secondary_color?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          freelancer_bio?: string
          freelancer_name?: string
          freelancer_title?: string
          id?: string
          logo_url?: string | null
          primary_color?: string
          secondary_color?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      milestones: {
        Row: {
          created_at: string
          deliverable_name: string | null
          deliverable_size: number | null
          deliverable_url: string | null
          description: string
          end_date: string | null
          id: string
          payment_proof_url: string | null
          price: number
          project_id: string
          start_date: string | null
          status: string
          title: string
          updated_at: string
          watermark_text: string | null
        }
        Insert: {
          created_at?: string
          deliverable_name?: string | null
          deliverable_size?: number | null
          deliverable_url?: string | null
          description: string
          end_date?: string | null
          id?: string
          payment_proof_url?: string | null
          price?: number
          project_id: string
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
          watermark_text?: string | null
        }
        Update: {
          created_at?: string
          deliverable_name?: string | null
          deliverable_size?: number | null
          deliverable_url?: string | null
          description?: string
          end_date?: string | null
          id?: string
          payment_proof_url?: string | null
          price?: number
          project_id?: string
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
          watermark_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_project_id: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_project_id?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_project_id?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_project_id_fkey"
            columns: ["related_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string | null
          currency: string | null
          email: string | null
          full_name: string | null
          grace_period_end: string | null
          id: string
          notification_settings: Json | null
          project_count: number | null
          storage_used: number | null
          subscription_id: string | null
          subscription_status: string | null
          updated_at: string
          user_type: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          currency?: string | null
          email?: string | null
          full_name?: string | null
          grace_period_end?: string | null
          id: string
          notification_settings?: Json | null
          project_count?: number | null
          storage_used?: number | null
          subscription_id?: string | null
          subscription_status?: string | null
          updated_at?: string
          user_type?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          currency?: string | null
          email?: string | null
          full_name?: string | null
          grace_period_end?: string | null
          id?: string
          notification_settings?: Json | null
          project_count?: number | null
          storage_used?: number | null
          subscription_id?: string | null
          subscription_status?: string | null
          updated_at?: string
          user_type?: string | null
          website?: string | null
        }
        Relationships: []
      }
      project_templates: {
        Row: {
          brief: string | null
          created_at: string
          id: string
          milestones: Json
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brief?: string | null
          created_at?: string
          id?: string
          milestones: Json
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brief?: string | null
          created_at?: string
          id?: string
          milestones?: Json
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          brief: string
          client_access_token: string
          client_email: string | null
          client_id: string | null
          created_at: string
          end_date: string | null
          id: string
          name: string
          slug: string
          start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brief: string
          client_access_token?: string
          client_email?: string | null
          client_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          slug: string
          start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brief?: string
          client_access_token?: string
          client_email?: string | null
          client_id?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          slug?: string
          start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancelled_at: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          lemon_squeezy_id: string
          product_id: string
          status: string
          updated_at: string | null
          user_id: string
          variant_id: string
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          lemon_squeezy_id: string
          product_id: string
          status: string
          updated_at?: string | null
          user_id: string
          variant_id: string
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          lemon_squeezy_id?: string
          product_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
          variant_id?: string
        }
        Relationships: []
      }
      user_plan_limits: {
        Row: {
          created_at: string
          id: string
          project_limit: number
          storage_limit_bytes: number
          updated_at: string
          user_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_limit: number
          storage_limit_bytes: number
          updated_at?: string
          user_type: string
        }
        Update: {
          created_at?: string
          id?: string
          project_limit?: number
          storage_limit_bytes?: number
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
      check_deadlines_and_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_user_limits: {
        Args: { _user_id: string; _action: string; _size?: number }
        Returns: boolean
      }
      ensure_unique_slug: {
        Args: {
          base_slug: string
          user_id_param: string
          project_id_param?: string
        }
        Returns: string
      }
      generate_slug: {
        Args: { input_text: string }
        Returns: string
      }
      get_user_limits: {
        Args: { _user_type: string }
        Returns: {
          project_limit: number
          storage_limit_bytes: number
        }[]
      }
      update_project_count: {
        Args: { _user_id: string; _count_change: number }
        Returns: undefined
      }
      update_user_storage: {
        Args: { _user_id: string; _size_change: number }
        Returns: undefined
      }
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
