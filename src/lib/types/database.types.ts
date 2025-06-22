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
      allergens: {
        Row: {
          created_at: string | null
          describe: string | null
          id: number
          name: string
          number: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          describe?: string | null
          id?: number
          name: string
          number?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          describe?: string | null
          id?: number
          name?: string
          number?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          city: string | null
          company: string | null
          created_at: string
          dic: string | null
          email: string | null
          first_name: string | null
          ico: string | null
          id: string
          last_name: string | null
          street: string | null
          street_number: string | null
          telephone: string | null
          updated_at: string | null
          user_role: string | null
          username: string | null
          website: string | null
          zip_code: string | null
        }
        Insert: {
          city?: string | null
          company?: string | null
          created_at?: string
          dic?: string | null
          email?: string | null
          first_name?: string | null
          ico?: string | null
          id: string
          last_name?: string | null
          street?: string | null
          street_number?: string | null
          telephone?: string | null
          updated_at?: string | null
          user_role?: string | null
          username?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          city?: string | null
          company?: string | null
          created_at?: string
          dic?: string | null
          email?: string | null
          first_name?: string | null
          ico?: string | null
          id?: string
          last_name?: string | null
          street?: string | null
          street_number?: string | null
          telephone?: string | null
          updated_at?: string | null
          user_role?: string | null
          username?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      fakturoid_tokens: {
        Row: {
          access_token: string
          account_email: string | null
          account_name: string | null
          created_at: string | null
          expires_at: string
          id: string
          last_used_at: string | null
          refresh_attempts: number | null
          refresh_token: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          account_email?: string | null
          account_name?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
          last_used_at?: string | null
          refresh_attempts?: number | null
          refresh_token: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          account_email?: string | null
          account_name?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          last_used_at?: string | null
          refresh_attempts?: number | null
          refresh_token?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ingredients: {
        Row: {
          created_at: string | null
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      menu_allergens: {
        Row: {
          allergen_id: number
          created_at: string | null
          menu_id: string
          updated_at: string | null
        }
        Insert: {
          allergen_id: number
          created_at?: string | null
          menu_id: string
          updated_at?: string | null
        }
        Update: {
          allergen_id?: number
          created_at?: string | null
          menu_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_allergens_allergen_id_fkey"
            columns: ["allergen_id"]
            isOneToOne: false
            referencedRelation: "allergens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_allergens_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_ingredients: {
        Row: {
          created_at: string | null
          ingredient_id: number
          menu_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          ingredient_id: number
          menu_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          ingredient_id?: number
          menu_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_ingredients_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_variants: {
        Row: {
          created_at: string | null
          description: string
          id: string
          menu_id: string
          menu_version_id: string | null
          price: number | null
          updated_at: string | null
          variant_number: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          menu_id: string
          menu_version_id?: string | null
          price?: number | null
          updated_at?: string | null
          variant_number: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          menu_id?: string
          menu_version_id?: string | null
          price?: number | null
          updated_at?: string | null
          variant_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_variants_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_variants_menu_version_id_fkey"
            columns: ["menu_version_id"]
            isOneToOne: false
            referencedRelation: "menu_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_versions: {
        Row: {
          active: boolean | null
          created_at: string | null
          date: string | null
          id: string
          menu_id: string
          notes: string | null
          nutri: string | null
          soup: string | null
          type: string | null
          updated_at: string | null
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          date?: string | null
          id?: string
          menu_id: string
          notes?: string | null
          nutri?: string | null
          soup?: string | null
          type?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          date?: string | null
          id?: string
          menu_id?: string
          notes?: string | null
          nutri?: string | null
          soup?: string | null
          type?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_versions_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
        ]
      }
      menus: {
        Row: {
          active: boolean | null
          created_at: string | null
          date: string | null
          deleted: boolean
          id: string
          notes: string | null
          nutri: string | null
          soup: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          date?: string | null
          deleted?: boolean
          id?: string
          notes?: string | null
          nutri?: string | null
          soup?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          date?: string | null
          deleted?: boolean
          id?: string
          notes?: string | null
          nutri?: string | null
          soup?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          price: number | null
          quantity: number | null
          updated_at: string | null
          variant_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price?: number | null
          quantity?: number | null
          updated_at?: string | null
          variant_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price?: number | null
          quantity?: number | null
          updated_at?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "menu_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          currency: string | null
          customer_city: string | null
          customer_email: string | null
          customer_first_name: string | null
          customer_last_name: string | null
          customer_street: string | null
          customer_street_number: string | null
          customer_telephone: string | null
          customer_zip_code: string | null
          date: string | null
          delivery_city: string | null
          delivery_first_name: string | null
          delivery_last_name: string | null
          delivery_street: string | null
          delivery_street_number: string | null
          delivery_telephone: string | null
          delivery_zip_code: string | null
          fakturoid_data: Json | null
          id: string
          note: string | null
          order_number: string
          pay_method: string | null
          pay_state: boolean | null
          shipping_method: string | null
          state: string | null
          total_pieces: number | null
          total_price: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          customer_city?: string | null
          customer_email?: string | null
          customer_first_name?: string | null
          customer_last_name?: string | null
          customer_street?: string | null
          customer_street_number?: string | null
          customer_telephone?: string | null
          customer_zip_code?: string | null
          date?: string | null
          delivery_city?: string | null
          delivery_first_name?: string | null
          delivery_last_name?: string | null
          delivery_street?: string | null
          delivery_street_number?: string | null
          delivery_telephone?: string | null
          delivery_zip_code?: string | null
          fakturoid_data?: Json | null
          id?: string
          note?: string | null
          order_number?: string
          pay_method?: string | null
          pay_state?: boolean | null
          shipping_method?: string | null
          state?: string | null
          total_pieces?: number | null
          total_price?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          customer_city?: string | null
          customer_email?: string | null
          customer_first_name?: string | null
          customer_last_name?: string | null
          customer_street?: string | null
          customer_street_number?: string | null
          customer_telephone?: string | null
          customer_zip_code?: string | null
          date?: string | null
          delivery_city?: string | null
          delivery_first_name?: string | null
          delivery_last_name?: string | null
          delivery_street?: string | null
          delivery_street_number?: string | null
          delivery_telephone?: string | null
          delivery_zip_code?: string | null
          fakturoid_data?: Json | null
          id?: string
          note?: string | null
          order_number?: string
          pay_method?: string | null
          pay_state?: boolean | null
          shipping_method?: string | null
          state?: string | null
          total_pieces?: number | null
          total_price?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          allergies: boolean | null
          allergies_description: string | null
          avatar_url: string | null
          city: string | null
          company: string | null
          company_email: string | null
          created_at: string | null
          delivery_method: string | null
          dic: string | null
          email: string | null
          first_name: string | null
          ico: string | null
          id: string
          last_name: string | null
          payment_method: string | null
          registration_status: string | null
          street: string | null
          street_number: string | null
          table_settings_customers: Json | null
          table_settings_menus: Json | null
          table_settings_orders: Json | null
          telephone: string | null
          updated_at: string | null
          user_role: string | null
          username: string | null
          website: string | null
          zip_code: string | null
        }
        Insert: {
          allergies?: boolean | null
          allergies_description?: string | null
          avatar_url?: string | null
          city?: string | null
          company?: string | null
          company_email?: string | null
          created_at?: string | null
          delivery_method?: string | null
          dic?: string | null
          email?: string | null
          first_name?: string | null
          ico?: string | null
          id: string
          last_name?: string | null
          payment_method?: string | null
          registration_status?: string | null
          street?: string | null
          street_number?: string | null
          table_settings_customers?: Json | null
          table_settings_menus?: Json | null
          table_settings_orders?: Json | null
          telephone?: string | null
          updated_at?: string | null
          user_role?: string | null
          username?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          allergies?: boolean | null
          allergies_description?: string | null
          avatar_url?: string | null
          city?: string | null
          company?: string | null
          company_email?: string | null
          created_at?: string | null
          delivery_method?: string | null
          dic?: string | null
          email?: string | null
          first_name?: string | null
          ico?: string | null
          id?: string
          last_name?: string | null
          payment_method?: string | null
          registration_status?: string | null
          street?: string | null
          street_number?: string | null
          table_settings_customers?: Json | null
          table_settings_menus?: Json | null
          table_settings_orders?: Json | null
          telephone?: string | null
          updated_at?: string | null
          user_role?: string | null
          username?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          id: number
          key: string
          updated_at: string | null
          updated_by: string
          user_id: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: number
          key: string
          updated_at?: string | null
          updated_by: string
          user_id: string
          value: Json
        }
        Update: {
          created_at?: string
          id?: number
          key?: string
          updated_at?: string | null
          updated_by?: string
          user_id?: string
          value?: Json
        }
        Relationships: []
      }
      texts: {
        Row: {
          created_at: string
          id: number
          page: string | null
          position: string | null
          text: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          page?: string | null
          position?: string | null
          text?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          page?: string | null
          position?: string | null
          text?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      variant_allergens: {
        Row: {
          allergen_id: number
          created_at: string | null
          updated_at: string | null
          variant_id: string
        }
        Insert: {
          allergen_id: number
          created_at?: string | null
          updated_at?: string | null
          variant_id: string
        }
        Update: {
          allergen_id?: number
          created_at?: string | null
          updated_at?: string | null
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "variant_allergens_allergen_id_fkey"
            columns: ["allergen_id"]
            isOneToOne: false
            referencedRelation: "allergens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "variant_allergens_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "menu_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      variant_ingredients: {
        Row: {
          created_at: string | null
          ingredient_id: number
          updated_at: string | null
          variant_id: string
        }
        Insert: {
          created_at?: string | null
          ingredient_id: number
          updated_at?: string | null
          variant_id: string
        }
        Update: {
          created_at?: string | null
          ingredient_id?: number
          updated_at?: string | null
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "variant_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "variant_ingredients_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "menu_variants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_timestamp_columns_and_triggers: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_menu_version: {
        Args: {
          p_menu_id: string
          p_date: string
          p_soup: string
          p_active: boolean
          p_notes: string
          p_type: string
          p_nutri: string
        }
        Returns: string
      }
      create_order_with_items: {
        Args: {
          p_user_id: string
          p_created_at: string
          p_date: string
          p_customer_first_name: string
          p_customer_last_name: string
          p_customer_street: string
          p_customer_street_number: string
          p_customer_city: string
          p_customer_zip_code: string
          p_customer_telephone: string
          p_customer_email: string
          p_note: string
          p_total_pieces: number
          p_total_price: number
          p_currency: string
          p_pay_state: boolean
          p_shipping_method: string
          p_order_items: Database["public"]["CompositeTypes"]["order_item_input"][]
        }
        Returns: {
          created_at: string | null
          currency: string | null
          customer_city: string | null
          customer_email: string | null
          customer_first_name: string | null
          customer_last_name: string | null
          customer_street: string | null
          customer_street_number: string | null
          customer_telephone: string | null
          customer_zip_code: string | null
          date: string | null
          delivery_city: string | null
          delivery_first_name: string | null
          delivery_last_name: string | null
          delivery_street: string | null
          delivery_street_number: string | null
          delivery_telephone: string | null
          delivery_zip_code: string | null
          fakturoid_data: Json | null
          id: string
          note: string | null
          order_number: string
          pay_method: string | null
          pay_state: boolean | null
          shipping_method: string | null
          state: string | null
          total_pieces: number | null
          total_price: number | null
          updated_at: string | null
          user_id: string | null
        }[]
      }
      delete_menu: {
        Args: { p_menu_id: string }
        Returns: undefined
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_menu_version: {
        Args: { p_menu_id: string }
        Returns: string
      }
      get_menu_version_at_date: {
        Args: { p_menu_id: string; p_date: string }
        Returns: string
      }
      soft_delete_menu: {
        Args: { p_menu_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      order_item_input: {
        variant_id: string | null
        price: number | null
        quantity: number | null
      }
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
