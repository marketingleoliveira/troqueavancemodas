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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price: number
          product_name: string
          product_sku: string | null
          quantity: number
          variant: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price?: number
          product_name: string
          product_sku?: string | null
          quantity?: number
          variant?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price?: number
          product_name?: string
          product_sku?: string | null
          quantity?: number
          variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_cpf: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          financial_status: string | null
          fulfillment_status: string | null
          id: string
          order_date: string | null
          order_number: string
          raw_data: Json | null
          shipping: number | null
          subtotal: number | null
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_cpf?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          financial_status?: string | null
          fulfillment_status?: string | null
          id?: string
          order_date?: string | null
          order_number: string
          raw_data?: Json | null
          shipping?: number | null
          subtotal?: number | null
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_cpf?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          financial_status?: string | null
          fulfillment_status?: string | null
          id?: string
          order_date?: string | null
          order_number?: string
          raw_data?: Json | null
          shipping?: number | null
          subtotal?: number | null
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      request_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          request_id: string
          sender: Database["public"]["Enums"]["message_sender"]
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          request_id: string
          sender: Database["public"]["Enums"]["message_sender"]
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          request_id?: string
          sender?: Database["public"]["Enums"]["message_sender"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "request_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "return_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      return_request_items: {
        Row: {
          color: string | null
          created_at: string
          id: string
          notes: string | null
          price: number
          product_id: string | null
          product_image: string | null
          product_name: string
          product_sku: string | null
          reason: string
          request_id: string
          size: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          price?: number
          product_id?: string | null
          product_image?: string | null
          product_name: string
          product_sku?: string | null
          reason: string
          request_id: string
          size?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          price?: number
          product_id?: string | null
          product_image?: string | null
          product_name?: string
          product_sku?: string | null
          reason?: string
          request_id?: string
          size?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "return_request_items_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "return_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      return_requests: {
        Row: {
          created_at: string
          customer_cpf: string | null
          customer_email: string
          customer_name: string
          id: string
          notes: string | null
          order_id: string
          resolution: Database["public"]["Enums"]["request_resolution"]
          status: Database["public"]["Enums"]["request_status"]
          tracking_code: string | null
          type: Database["public"]["Enums"]["request_type"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_cpf?: string | null
          customer_email: string
          customer_name: string
          id?: string
          notes?: string | null
          order_id: string
          resolution: Database["public"]["Enums"]["request_resolution"]
          status?: Database["public"]["Enums"]["request_status"]
          tracking_code?: string | null
          type: Database["public"]["Enums"]["request_type"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_cpf?: string | null
          customer_email?: string
          customer_name?: string
          id?: string
          notes?: string | null
          order_id?: string
          resolution?: Database["public"]["Enums"]["request_resolution"]
          status?: Database["public"]["Enums"]["request_status"]
          tracking_code?: string | null
          type?: Database["public"]["Enums"]["request_type"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "user"
      message_sender: "customer" | "admin"
      request_resolution: "refund" | "voucher" | "exchange"
      request_status:
        | "pending"
        | "awaiting_shipment"
        | "received"
        | "completed"
        | "rejected"
      request_type: "exchange" | "return"
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
      app_role: ["super_admin", "admin", "user"],
      message_sender: ["customer", "admin"],
      request_resolution: ["refund", "voucher", "exchange"],
      request_status: [
        "pending",
        "awaiting_shipment",
        "received",
        "completed",
        "rejected",
      ],
      request_type: ["exchange", "return"],
    },
  },
} as const
